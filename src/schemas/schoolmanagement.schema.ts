import z from "zod";
import { SchoolSchema } from "./school.schema";

export const SchoolByMonitorSchema = z.object({
    id: z.number(),
    monitorId: z.number(),
    schoolCode: z.number(),
    createdAt: z.string(),
    school: SchoolSchema
});