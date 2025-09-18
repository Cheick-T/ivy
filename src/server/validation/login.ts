import {z} from "zod";

export const loginSchema = z.object({
    username : z.coerce.string().min(2, "Username is required"),
    password : z.coerce.string().min(8, "Password must be at least 6 characters long"),
})


export type LoginInput = z.infer<typeof loginSchema>;