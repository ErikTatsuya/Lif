import Fastify from "fastify";
import rateLimit from "@fastify/rate-limit";

import { authRoutes } from "./routes/auth";
import { userRoutes } from "./routes/user";

const app = Fastify({ logger: true });

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

app.listen({
  port: 3000
});