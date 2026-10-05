import type { FastifyInstance } from "fastify";

import {
    getMeController,
    loginController,
    signoutController,
    signupController
} from "../controllers/auth.js";

export async function authRoutes(app: FastifyInstance) {
  app.get("/me", getMeController);
  app.post("/signup", {
    config: {
      rateLimit: {
        max: 5,
        timeWindow: "1 minute"
      }
    }
  }, signupController);
  app.post("/login", {
    config: {
      rateLimit: {
        max: 5,
        timeWindow: "1 minute"
      }
    }
  }, loginController);
  app.post("/signout", {
    config: {
      rateLimit: {
        max: 5,
        timeWindow: "1 minute"
      }
    }
  }, signoutController);
}