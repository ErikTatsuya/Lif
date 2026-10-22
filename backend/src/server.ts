import Fastify from "fastify";
import rateLimit from "@fastify/rate-limit";
import cors from "@fastify/cors";
import cookies from "@fastify/cookie";

import { appConfig } from "./config/environment.js";
import { authRoutes } from "./routes/auth.js";
import { userRoutes } from "./routes/user.js";
import { daytronRoutes } from "./routes/daytron.js";
import { qleteRoutes } from "./routes/qlete.js";

const app = Fastify({ logger: true });

await app.register(cors, {
  origin: appConfig.frontendUrl,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  credentials: true
});

await app.register(cookies);

await app.register(rateLimit, {
  max: 100,
  timeWindow: "1 minute"
});

app.register(authRoutes, {
  prefix: "/auth"
});

app.register(daytronRoutes, {
  prefix: "/daytron"
});

app.register(qleteRoutes, {
  prefix: "/qlete"
});

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