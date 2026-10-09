import Fastify from "fastify";
import rateLimit from "@fastify/rate-limit";
import cors from "@fastify/cors"
import cookies from "@fastify/cookie"

import { authRoutes } from "./routes/auth.js";
import { userRoutes } from "./routes/user.js";

const app = Fastify({ logger: true });

await app.register(cors, {
  origin: process.env.FRONTEND_ORIGIN,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  credentials: true
})

await app.register(cookies)

await app.register(rateLimit, {
  max: 100,
  timeWindow: "1 minute"
});

app.register(authRoutes, {
  prefix: "/auth"
});

// app.register(userRoutes, {
//   prefix: "/users"
// });

app.get("/", async () => {
  return {
    message: "Lif API"
  };
});

try {
  await app.listen({
    port: Number(process.env.PORT ?? 3000),
    host: "0.0.0.0"
  });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}