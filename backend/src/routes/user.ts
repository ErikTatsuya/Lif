import type { FastifyInstance } from "fastify";
import { getUserByIdController, createUserController, getUsersController } from "../controllers/user.js";

export async function userRoutes(app: FastifyInstance) {
    // app.post("/", createUserController);
    app.get("/:id", getUserByIdController);
    app.get("/", getUsersController);
}