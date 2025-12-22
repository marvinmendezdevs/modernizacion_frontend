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
  typeVehicle: z.string(),
  vehicle: z.boolean,
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
  infoTutores: InfoTutor,
  verified: z.boolean(),
});

export const DistrictShema = z.object({
  id: z.number(),
  district: z.string(),
  department: z.string(),
});

export const InfoTutorCountSchema = z.object({
  districts: DistrictShema,
  type: z.number(),
})

export const InfoTutorCountResponseSchema = UserSchema.extend({
  countDiagnostico: z.number(),
  countObservaciones: z.number(),
  countRetroalimentaciones: z.number(),
  infoTutores: InfoTutorCountSchema,
});