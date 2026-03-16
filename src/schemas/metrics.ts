import z from "zod";

export const metrics = z.object({
    id: z.number(),
    dateReported: z.date(),
    type: z.string(),
    json: z.json(),
    category: z.string(),
});

export const dataMetrics = z.object({
  id: z.string(),
  dateReported: z.coerce.date(),
  type: z.string(),
  json: z.string(),
  category: z.string(),
});

export const metricsResponseSchema = z.object({
  metrics: z.array(dataMetrics),
});