import z from "zod";

export const metrics = z.object({
    id: z.number(),
    dateReported: z.date(),
    type: z.string(),
    json: z.json(),
    category: z.string(),
});