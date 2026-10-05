import { z } from "zod";

import { createUserDto } from "./user.js";

export const loginDto = z.union([
    z.object({
        email: z.email(),
        password: createUserDto.shape.password
    }),
    z.object({
        username: z.string().min(1),
        password: createUserDto.shape.password
    })
]);
