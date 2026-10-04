import Fastify from "fastify";
import { userRoutes } from "./routes/user";

const fastify = Fastify({ logger: true });

fastify.register(userRoutes, {
  prefix: "/users"
});

fastify.listen({
  port: 3000
});