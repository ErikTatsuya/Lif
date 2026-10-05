import type { FastifyRequest, FastifyReply } from "fastify";

import { createUserDto } from "../dtos/user.js";
import { UserResponse } from "../responses/user.js";
import { getUsers, getUserById, createUser } from "../services/user.js";

export async function getUsersController(
    req: FastifyRequest,
    res: FastifyReply
) {
    const users = await getUsers()
    const userResponses = users.map(user => new UserResponse(
        user.id,
        user.username,
        user.name,
        user.email,
        user.createdAt
    ));

    return res.send({ users: userResponses })
}

export async function getUserByIdController(
    req: FastifyRequest<{
        Params: {
            id: string;
        };
    }>,
    res: FastifyReply
) {
    const id = Number(req.params.id)
    const user = await getUserById(id);

    if (!user) {
        return res.status(404).send({
            error: "Usuário não encontrado"
        });
    }

    const userResponse: UserResponse = {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
    };

    return res.send({ user: userResponse });
}

export async function createUserController(
    req: FastifyRequest,
    res: FastifyReply
) {
    const result = createUserDto.safeParse(req.body);

    if (!result.success) {
        return res.status(400).send({
            error: result.error.issues
        });
    }

    const user = await createUser(result.data);
    if (!user) {
        return res.status(409).send({
            error: "Email ou username já está em uso"
        });
    }

    const userResponse: UserResponse = {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
    };

    return res.send({ user: userResponse });
}