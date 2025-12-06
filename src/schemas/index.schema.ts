import z from "zod";

export const ErrorResponseApiSchema = z.object({
    message: z.string(),
})