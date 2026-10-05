import { createHmac, timingSafeEqual } from "node:crypto";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "../db/index.js";
import { usersTable } from "../db/schema.js";
import { loginDto } from "../dtos/auth.js";
import { createUserDto } from "../dtos/user.js";
import { User } from "../models/user.js";
import { createUser } from "./user.js";

const tokenLifetimeSeconds = 60 * 60 * 24 * 7;

function createAuthToken(user: User) {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET não está configurado");
    }

    const issuedAt = Math.floor(Date.now() / 1000);
    const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
    const payload = Buffer.from(JSON.stringify({
        sub: String(user.id),
        iat: issuedAt,
        exp: issuedAt + tokenLifetimeSeconds
    })).toString("base64url");
    const signingInput = `${header}.${payload}`;
    const signature = createHmac("sha256", secret)
        .update(signingInput)
        .digest("base64url");

    return `${signingInput}.${signature}`;
}

export async function signup(data: z.infer<typeof createUserDto>) {
    return createUser(data);
}

export async function login(data: z.infer<typeof loginDto>) {
    const user = await db
        .select()
        .from(usersTable)
        .where("email" in data
            ? eq(usersTable.email, data.email)
            : eq(usersTable.username, data.username))
        .limit(1)
        .then(users => users[0]);

    if (!user || !(await bcrypt.compare(data.password, user.password))) {
        return null;
    }

    const authenticatedUser = new User(
        user.id,
        user.username,
        user.name,
        user.email,
        user.password,
        user.createdAt
    );

    return {
        user: authenticatedUser,
        token: createAuthToken(authenticatedUser)
    };
}

export async function getAuthenticatedUser(token: string | undefined) {
    if (!token) return null;

    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET não está configurado");
    }

    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [header, payload, signature] = parts;
    if (!header || !payload || !signature) return null;

    const signingInput = `${header}.${payload}`;
    const expectedSignature = createHmac("sha256", secret)
        .update(signingInput)
        .digest();

    let actualSignature: Buffer;
    try {
        actualSignature = Buffer.from(signature, "base64url");
    } catch {
        return null;
    }

    if (
        actualSignature.length !== expectedSignature.length ||
        !timingSafeEqual(actualSignature, expectedSignature)
    ) {
        return null;
    }

    let tokenHeader: { alg?: string };
    let claims: { sub?: string; exp?: number };
    try {
        tokenHeader = JSON.parse(Buffer.from(header, "base64url").toString());
        claims = JSON.parse(Buffer.from(payload, "base64url").toString());
    } catch {
        return null;
    }

    const userId = Number(claims.sub);
    if (
        tokenHeader.alg !== "HS256" ||
        !Number.isSafeInteger(userId) ||
        userId <= 0 ||
        typeof claims.exp !== "number" ||
        claims.exp <= Math.floor(Date.now() / 1000)
    ) {
        return null;
    }

    const user = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.id, userId))
        .limit(1)
        .then(users => users[0]);

    if (!user) return null;

    return new User(
        user.id,
        user.username,
        user.name,
        user.email,
        user.password,
        user.createdAt
    );
}

export { tokenLifetimeSeconds };
