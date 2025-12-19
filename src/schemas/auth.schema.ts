import z from "zod";

export const LoginSchema = z.object({
  email: z.string(),
  password: z.string(),
});

export const LoginResponseSchema = z.object({
  message: z.string(),
  role: z.string(),
  token: z.string(),
});

export const RoleSchema = z.object({
  id: z.number(),
  name: z.string(),
});

export const InfoTutor = z.object({
  id: z.number(),
  type: z.string(),
});

export const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string(),
  username: z.string(),
  telephone: z.string(),
  dui: z.string(),
  roleId: z.number(),
  createdAt: z.string(),
  role: RoleSchema,
  infoTutores: InfoTutor
});

export const InfoTutorCountSchema = z.object({
  districts: z.object({
    id: z.number(),
    district: z.string(),
  }),
  type: z.number(),
})

export const InfoTutorCountResponseSchema = UserSchema.extend({
  countDiagnostico: z.number(),
  countObservaciones: z.number(),
  countRetroalimentaciones: z.number(),
  infoTutores: InfoTutorCountSchema,
});