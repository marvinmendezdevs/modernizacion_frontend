import z from "zod";

export const LoginSchema = z.object({
    email: z.string(),
    password: z.string(),
});

export const LoginResponseSchema = z.object({
    message: z.string(),
    token: z.string(),
});

export const UserSchema = z.object({
    name: z.string(),
    jobTitle: z.string(),
})