import { z } from "zod"

export const createUserDto = z.object({
    username: z.string().min(1),
    name: z.string().min(1),
    email: z.email(),
    password: z.string().min(8).max(255)
});