import type { dataMetrics, metricsResponseSchema } from "@/schemas/metrics";
import type { metrics } from "@/services/metrisc.services";
import type z from "zod";

export type metricsInfo = z.infer<typeof metrics>
export type metricData = z.infer<typeof dataMetrics>
export type metricsUpdate = z.infer<typeof metricsResponseSchema>

