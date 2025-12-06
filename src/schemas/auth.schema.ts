import z from "zod";

export const LoginSchema = z.object({
    email: z.string(),
    password: z.string(),
});

export const LoginResponseSchema = z.object({
    message: z.string(),
    token: z.string(),
});

export const RoleSchema = z.object({
  id: z.number(),
  name: z.string(),
});

export const UserSchema = z.object({
  name: z.string(),
  email: z.string(),
  username: z.string(),
  telephone: z.string(),
  dui: z.string(),
  roleId: z.number(),
  createAt: z.string(),
  role: RoleSchema,
});