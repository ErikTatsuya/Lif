import type { FastifyReply, FastifyRequest } from "fastify";

import { loginDto } from "../dtos/auth.js";
import { createUserDto } from "../dtos/user.js";
import { UserResponse } from "../responses/user.js";
import {
    getAuthenticatedUser,
    login,
    signup,
    tokenLifetimeSeconds
} from "../services/auth.js";

const authCookieName = "auth_token";

export async function signupController(
    req: FastifyRequest,
    res: FastifyReply
) {
    const result = createUserDto.safeParse(req.body);

    if (!result.success) {
        return res.status(400).send({
            error: result.error.issues
        });
    }

    const user = await signup(result.data);
    if (!user) {
        return res.status(409).send({
            error: "Email ou username já está em uso"
        });
    }

    const userResponse = new UserResponse(
        user.id,
        user.username,
        user.name,
        user.email,
        user.createdAt
    );

    return res.status(201).send({ user: userResponse });
}

export async function loginController(
    req: FastifyRequest,
    res: FastifyReply
) {
    const result = loginDto.safeParse(req.body);

    if (!result.success) {
        return res.status(400).send({
            error: result.error.issues
        });
    }

    const authentication = await login(result.data);
    if (!authentication) {
        return res.status(401).send({
            error: "Email/username ou senha inválidos"
        });
    }

    const secureCookie = process.env.NODE_ENV === "production" ? "; Secure" : "";
    res.header(
        "Set-Cookie",
        `${authCookieName}=${authentication.token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${tokenLifetimeSeconds}${secureCookie}`
    );

    const userResponse = new UserResponse(
        authentication.user.id,
        authentication.user.username,
        authentication.user.name,
        authentication.user.email,
        authentication.user.createdAt
    );

    return res.send({ user: userResponse });
}

export async function signoutController(
    _req: FastifyRequest,
    res: FastifyReply
) {
    const secureCookie = process.env.NODE_ENV === "production" ? "; Secure" : "";
    res.header(
        "Set-Cookie",
        `${authCookieName}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT${secureCookie}`
    );

    return res.send({ message: "Logout realizado com sucesso" });
}

export async function getMeController(
    req: FastifyRequest,
    res: FastifyReply
) {
    const authCookie = req.headers.cookie
        ?.split(";")
        .map(cookie => cookie.trim())
        .find(cookie => cookie.startsWith(`${authCookieName}=`));
    const token = authCookie?.slice(authCookieName.length + 1);
    const user = await getAuthenticatedUser(token);

    if (!user) {
        return res.status(401).send({
            error: "Autenticação inválida"
        });
    }

    const userResponse = new UserResponse(
        user.id,
        user.username,
        user.name,
        user.email,
        user.createdAt
    );

    return res.send({ user: userResponse });
}
