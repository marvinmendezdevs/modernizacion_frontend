import type { metrics } from "@/services/metrisc.services";
import type z from "zod";

export type metricsInfo = z.infer<typeof metrics>
