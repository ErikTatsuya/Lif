import type { FastifyInstance } from "fastify";


import { getTodaysEventController } from "../controllers/daytron.js";

export async function daytronRoutes(app: FastifyInstance) {
    app.get("/", getTodaysEventController)
}