import type { FastifyInstance } from "fastify";
import { getUserByIdController, createUserController, getUsersController } from "../controllers/user";

export async function userRoutes(fastify: FastifyInstance) {
    fastify.post("/", createUserController);
    fastify.get("/:id", getUserByIdController);
    fastify.get("/", getUsersController);
}