import Fastify from "fastify";
import { authRoutes } from "./routes/auth";
// import { userRoutes } from "./routes/user";

const fastify = Fastify({ logger: true });

fastify.register(authRoutes, {
  prefix: "/auth"
});

// fastify.register(userRoutes, {
//   prefix: "/users"
// });

fastify.listen({
  port: 3000
});