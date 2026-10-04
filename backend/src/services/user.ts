import { z } from "zod";
import bcrypt from "bcrypt";
import { eq, or } from "drizzle-orm";

import { db } from "../db";
import { usersTable } from "../db/schema";
import { createUserDto } from "../dtos/user";
import { User } from "../models/user";

export async function getUsers() {
    const users = await db
        .select()
        .from(usersTable);

    return users;
}

export async function getUserById(id: number) {
    const user = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.id, id))
        .limit(1)
        .then(users => users[0])

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

export async function createUser(
    data: z.infer<typeof createUserDto>
) {
    const existingUser = await db.select()
        .from(usersTable)
        .where(or(
            eq(usersTable.email, data.email),
            eq(usersTable.username, data.username)
        ))
        .limit(1)
        .then(users => users[0])

    if (existingUser) return null;

    const passwordHash = await bcrypt.hash(data.password, 10);

    const insertedUser = await db.insert(usersTable)
        .values({
            username: data.username,
            name: data.name,
            email: data.email,
            password: passwordHash
        })
        .returning()
        .then(users => users[0]);

    if (!insertedUser) {
        throw new Error("Não foi possível criar o usuário");
    }

    return new User(
        insertedUser.id,
        insertedUser.username,
        insertedUser.name,
        insertedUser.email,
        insertedUser.password,
        insertedUser.createdAt
    );
}