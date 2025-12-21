import type { SchoolByMonitorSchema } from "@/schemas/schoolmanagement.schema";
import type z from "zod";

export type SchoolByMonitorType = z.infer<typeof SchoolByMonitorSchema>