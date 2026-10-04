import type { FastifyInstance } from "fastify";

import {
    getMeController,
    loginController,
    signoutController,
    signupController
} from "../controllers/auth";

export async function authRoutes(fastify: FastifyInstance) {
    fastify.get("/me", getMeController);
    fastify.post("/signup", signupController);
    fastify.post("/login", loginController);
    fastify.post("/signout", signoutController);
}
