import Fastify from "fastify";
import rateLimit from "@fastify/rate-limit";

import { authRoutes } from "./routes/auth";
import { userRoutes } from "./routes/user";

const app = Fastify({ logger: true });

const start = async () => {
  await app.register(rateLimit, {
    max: 100,
    timeWindow: "1 minute"
  });

  app.register(authRoutes, {
    prefix: "/auth"
  });

  app.register(userRoutes, {
    prefix: "/users"
  });

  await app.listen({
    port: 3000
  });
};

start().catch((err) => {
  app.log.error(err);
  process.exit(1);
});