import type z from "zod";
import {
  dataMetrics,
  metrics,
  metricsInfo,
  metricsResponseSchema,
} from "@/schemas/metrics";

export type MetricsInfo = z.infer<typeof metricsInfo>;
export type Metrics = z.infer<typeof metrics>;
export type MetricData = z.infer<typeof dataMetrics>;
export type MetricsUpdate = z.infer<typeof metricsResponseSchema>;