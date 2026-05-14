import {
  getSeccionClasses,
  getTeacherInfo,
} from "@/services/dashboard.services";
import { formatFullDate } from "@/utils/index.utils";
import { useQuery } from "@tanstack/react-query";
import {
  Users,
  BookOpen,
  Calendar,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import type { DashboardRecord } from "@/types/dashboard.types";

type MateriaNombre = "Matemática" | "Lenguaje";

type Indicador = {
  valor: number;
  total: number;
};

type Materia = {
  nombre: MateriaNombre;
  docentesAccesos: Indicador;
  estudiantesAccesos: Indicador;
  clasesEfectivas: Indicador;
};

type ClaseItem = {
  grupo: number;
  totalClases: number;
  totalDocentes: number;
  accesosDocentes: number;
  clasesEfectivas: number;
  totalEstudiantes: number;
  accesosEstudiantes: number;
};

type IndicadoresItem = {
  grupo: number;
  clasesTotales: number;
  totalDocentes: number;
  accesosDocentes: number;
  clasesEfectivas: number;
  totalEstudiantes: number;
  accesosEstudiantes: number;
};

type DetailItem = {
  grupo: number;
  tasaPresenciaDocente: number;
  tasaPresenciaDocenteTotal: number;
  tasaPresenciaEstudiante: number;
  tasaPresenciaEstudianteTotal: number;
  logroAcademico: number;
  logroAcademicoTotal: number;
  recursosDigitales: number;
  recursosDigitalesTotal: number;
  tasaAccesosDocentesASecciones?: number;
  tasaAccesosDocentesASeccionesTotal?: number;
};

type GradoItem = {
  grado: number;
  clasesTotales: number;
  clasesEfectivas: number;
};

type SeccionesJson = {
  clases?: {
    grados?: GradoItem[];
    Indicadores?: IndicadoresItem[];
    details?: DetailItem[];
    Lenguaje?: ClaseItem[];
    Matematica?: ClaseItem[];
  };
  remediacion?: unknown;
  refuerzo?: unknown;
};

type MetricsRecord = {
  id: number;
  dateReported: string;
  type: string;
  category: string;
  json: SeccionesJson;
};

type ApiResponse = {
  last: MetricsRecord | null;
  cumulative: MetricsRecord[];
};

type SubtypeBlock = {
  docentes: DashboardRecord[];
  secciones: DashboardRecord[];
  estudiantes: DashboardRecord[];
};

type DashboardJsonApi = {
  clases: SubtypeBlock;
};

type DashboardReportApi = {
  id: number;
  category: string;
  dateReported: string;
  type: string;
  json: DashboardJsonApi;
};

type TeacherInfoResponse = {
  last: DashboardReportApi | null;
  cumulative: DashboardReportApi[];
};

type LineChartItem = {
  fecha: string;
  accesosDocentes: number;
  accesosEstudiantes: number;
  clasesEfectivas: number;
};

type ViewMode = "Diario" | "Acumulado";

type SeccionesData = {
  clases: {
    grados: GradoItem[];
    Indicadores: IndicadoresItem[];
    details: DetailItem[];
    Lenguaje: ClaseItem[];
    Matematica: ClaseItem[];
  };
  remediacion: unknown;
  refuerzo: unknown;
};

const EMPTY_CLASES = {
  Lenguaje: [] as ClaseItem[],
  Matematica: [] as ClaseItem[],
  Indicadores: [] as IndicadoresItem[],
  details: [] as DetailItem[],
  grados: [] as GradoItem[],
};

function normalizeDate(date?: string | null) {
  if (!date) return "";
  return date.slice(0, 10);
}

function calcularVariacionPorcentual(anterior: number, actual: number) {
  if (anterior === 0) return 0;
  return ((actual - anterior) / anterior) * 100;
}

function calcularPorcentaje(valor: number, total: number) {
  if (total === 0) return 0;
  return (valor / total) * 100;
}

function sumarClaseItems(items: ClaseItem[]): ClaseItem {
  return items.reduce(
    (acc, item) => ({
      grupo: 0,
      totalClases: acc.totalClases + (item.totalClases ?? 0),
      totalDocentes: acc.totalDocentes + (item.totalDocentes ?? 0),
      accesosDocentes: acc.accesosDocentes + (item.accesosDocentes ?? 0),
      clasesEfectivas: acc.clasesEfectivas + (item.clasesEfectivas ?? 0),
      totalEstudiantes: acc.totalEstudiantes + (item.totalEstudiantes ?? 0),
      accesosEstudiantes:
        acc.accesosEstudiantes + (item.accesosEstudiantes ?? 0),
    }),
    {
      grupo: 0,
      totalClases: 0,
      totalDocentes: 0,
      accesosDocentes: 0,
      clasesEfectivas: 0,
      totalEstudiantes: 0,
      accesosEstudiantes: 0,
    },
  );
}

function sumarDetailItems(items: DetailItem[]): DetailItem {
  return items.reduce(
    (acc, item) => ({
      grupo: 0,
      tasaPresenciaDocente:
        acc.tasaPresenciaDocente + (item.tasaPresenciaDocente ?? 0),
      tasaPresenciaDocenteTotal:
        acc.tasaPresenciaDocenteTotal + (item.tasaPresenciaDocenteTotal ?? 0),
      tasaPresenciaEstudiante:
        acc.tasaPresenciaEstudiante + (item.tasaPresenciaEstudiante ?? 0),
      tasaPresenciaEstudianteTotal:
        acc.tasaPresenciaEstudianteTotal +
        (item.tasaPresenciaEstudianteTotal ?? 0),
      logroAcademico: acc.logroAcademico + (item.logroAcademico ?? 0),
      logroAcademicoTotal:
        acc.logroAcademicoTotal + (item.logroAcademicoTotal ?? 0),
      recursosDigitales: acc.recursosDigitales + (item.recursosDigitales ?? 0),
      recursosDigitalesTotal:
        acc.recursosDigitalesTotal + (item.recursosDigitalesTotal ?? 0),
      tasaAccesosDocentesASecciones:
        (acc.tasaAccesosDocentesASecciones ?? 0) + (item.tasaAccesosDocentesASecciones ?? 0),
      tasaAccesosDocentesASeccionesTotal:
        (acc.tasaAccesosDocentesASeccionesTotal ?? 0) +
        (item.tasaAccesosDocentesASeccionesTotal ?? 0),
    }),
    {
      grupo: 0,
      tasaPresenciaDocente: 0,
      tasaPresenciaDocenteTotal: 0,
      tasaPresenciaEstudiante: 0,
      tasaPresenciaEstudianteTotal: 0,
      logroAcademico: 0,
      logroAcademicoTotal: 0,
      recursosDigitales: 0,
      recursosDigitalesTotal: 0,
      tasaAccesosDocentesASecciones: 0,
      tasaAccesosDocentesASeccionesTotal: 0,
    },
  );
}

function construirResumenDetails(items: DetailItem[]) {
  const detail = sumarDetailItems(items);

  const presenciaDocente = calcularPorcentaje(
    detail.tasaPresenciaDocente,
    detail.tasaPresenciaDocenteTotal,
  );

  const presenciaEstudiante = calcularPorcentaje(
    detail.tasaPresenciaEstudiante,
    detail.tasaPresenciaEstudianteTotal,
  );

  const logroAcademico = calcularPorcentaje(
    detail.logroAcademico,
    detail.logroAcademicoTotal,
  );

  const recursosDigitales = calcularPorcentaje(
    detail.recursosDigitales,
    detail.recursosDigitalesTotal,
  );

  const accesosSecciones = calcularPorcentaje(
    detail.tasaAccesosDocentesASecciones ?? 0,
    detail.tasaAccesosDocentesASeccionesTotal ?? 0,
  );

  const promedioClasesEfectivas =
    (presenciaDocente +
      presenciaEstudiante +
      logroAcademico +
      recursosDigitales) /
    4;

  return {
    valores: {
      tasaPresenciaDocente: detail.tasaPresenciaDocente,
      tasaPresenciaDocenteTotal: detail.tasaPresenciaDocenteTotal,
      tasaPresenciaEstudiante: detail.tasaPresenciaEstudiante,
      tasaPresenciaEstudianteTotal: detail.tasaPresenciaEstudianteTotal,
      logroAcademico: detail.logroAcademico,
      logroAcademicoTotal: detail.logroAcademicoTotal,
      recursosDigitales: detail.recursosDigitales,
      recursosDigitalesTotal: detail.recursosDigitalesTotal,
      tasaAccesosDocentesASecciones: detail.tasaAccesosDocentesASecciones ?? 0,
      tasaAccesosDocentesASeccionesTotal: detail.tasaAccesosDocentesASeccionesTotal ?? 0,
    },
    porcentajes: {
      presenciaDocente,
      presenciaEstudiante,
      logroAcademico,
      recursosDigitales,
      accesosSecciones,
    },
    promedioClasesEfectivas,
  };
}

function getPreviousDateRange(start: string, end: string) {
  if (!start || !end) return null;

  const startDate = new Date(`${start}T00:00:00`);
  const endDate = new Date(`${end}T00:00:00`);

  const diffDays =
    Math.round((endDate.getTime() - startDate.getTime()) / 86400000) + 1;

  const totalDays = Math.max(diffDays, 1);

  const previousEndDate = new Date(startDate);
  previousEndDate.setDate(startDate.getDate() - 1);

  const previousStartDate = new Date(previousEndDate);
  previousStartDate.setDate(previousEndDate.getDate() - totalDays + 1);

  return {
    start: previousStartDate.toLocaleDateString("sv-SE"),
    end: previousEndDate.toLocaleDateString("sv-SE"),
  };
}

function isRecordInRange(record: MetricsRecord, start: string, end: string) {
  const recordDate = normalizeDate(record.dateReported);
  return recordDate >= start && recordDate <= end;
}

function emptySeccionesData(): SeccionesData {
  return {
    clases: {
      grados: EMPTY_CLASES.grados,
      Indicadores: EMPTY_CLASES.Indicadores,
      details: EMPTY_CLASES.details,
      Lenguaje: EMPTY_CLASES.Lenguaje,
      Matematica: EMPTY_CLASES.Matematica,
    },
    remediacion: null,
    refuerzo: null,
  };
}

function buildDataFromJson(source?: SeccionesJson | null): SeccionesData {
  return {
    clases: {
      grados: source?.clases?.grados ?? EMPTY_CLASES.grados,
      Indicadores: source?.clases?.Indicadores ?? EMPTY_CLASES.Indicadores,
      details: source?.clases?.details ?? EMPTY_CLASES.details,
      Lenguaje: source?.clases?.Lenguaje ?? EMPTY_CLASES.Lenguaje,
      Matematica: source?.clases?.Matematica ?? EMPTY_CLASES.Matematica,
    },
    remediacion: source?.remediacion ?? null,
    refuerzo: source?.refuerzo ?? null,
  };
}

function sumarGradoItemsPorGrado(items: GradoItem[]): GradoItem[] {
  const map = new Map<number, GradoItem>();

  items.forEach((item) => {
    const current = map.get(item.grado) ?? {
      grado: item.grado,
      clasesTotales: 0,
      clasesEfectivas: 0,
    };

    map.set(item.grado, {
      grado: item.grado,
      clasesTotales: current.clasesTotales + (item.clasesTotales ?? 0),
      clasesEfectivas: current.clasesEfectivas + (item.clasesEfectivas ?? 0),
    });
  });

  return Array.from(map.values()).sort((a, b) => a.grado - b.grado);
}

function sumarIndicadoresItemsPorGrupo(
  items: IndicadoresItem[],
): IndicadoresItem[] {
  const map = new Map<number, IndicadoresItem>();

  items.forEach((item) => {
    const current = map.get(item.grupo) ?? {
      grupo: item.grupo,
      clasesTotales: 0,
      totalDocentes: 0,
      accesosDocentes: 0,
      clasesEfectivas: 0,
      totalEstudiantes: 0,
      accesosEstudiantes: 0,
    };

    map.set(item.grupo, {
      grupo: item.grupo,
      clasesTotales: current.clasesTotales + (item.clasesTotales ?? 0),
      totalDocentes: current.totalDocentes + (item.totalDocentes ?? 0),
      accesosDocentes: current.accesosDocentes + (item.accesosDocentes ?? 0),
      clasesEfectivas: current.clasesEfectivas + (item.clasesEfectivas ?? 0),
      totalEstudiantes: current.totalEstudiantes + (item.totalEstudiantes ?? 0),
      accesosEstudiantes:
        current.accesosEstudiantes + (item.accesosEstudiantes ?? 0),
    });
  });

  return Array.from(map.values()).sort((a, b) => a.grupo - b.grupo);
}

function sumarClaseItemsPorGrupo(items: ClaseItem[]): ClaseItem[] {
  const map = new Map<number, ClaseItem>();

  items.forEach((item) => {
    const current = map.get(item.grupo) ?? {
      grupo: item.grupo,
      totalClases: 0,
      totalDocentes: 0,
      accesosDocentes: 0,
      clasesEfectivas: 0,
      totalEstudiantes: 0,
      accesosEstudiantes: 0,
    };

    map.set(item.grupo, {
      grupo: item.grupo,
      totalClases: current.totalClases + (item.totalClases ?? 0),
      totalDocentes: current.totalDocentes + (item.totalDocentes ?? 0),
      accesosDocentes: current.accesosDocentes + (item.accesosDocentes ?? 0),
      clasesEfectivas: current.clasesEfectivas + (item.clasesEfectivas ?? 0),
      totalEstudiantes: current.totalEstudiantes + (item.totalEstudiantes ?? 0),
      accesosEstudiantes:
        current.accesosEstudiantes + (item.accesosEstudiantes ?? 0),
    });
  });

  return Array.from(map.values()).sort((a, b) => a.grupo - b.grupo);
}

function sumarDetailItemsPorGrupo(items: DetailItem[]): DetailItem[] {
  const map = new Map<number, DetailItem>();

  items.forEach((item) => {
    const current = map.get(item.grupo) ?? {
      grupo: item.grupo,
      tasaPresenciaDocente: 0,
      tasaPresenciaDocenteTotal: 0,
      tasaPresenciaEstudiante: 0,
      tasaPresenciaEstudianteTotal: 0,
      logroAcademico: 0,
      logroAcademicoTotal: 0,
      recursosDigitales: 0,
      recursosDigitalesTotal: 0,
      tasaAccesosDocentesASecciones: 0,
      tasaAccesosDocentesASeccionesTotal: 0,
    };

    map.set(item.grupo, {
      grupo: item.grupo,
      tasaPresenciaDocente:
        current.tasaPresenciaDocente + (item.tasaPresenciaDocente ?? 0),
      tasaPresenciaDocenteTotal:
        current.tasaPresenciaDocenteTotal +
        (item.tasaPresenciaDocenteTotal ?? 0),
      tasaPresenciaEstudiante:
        current.tasaPresenciaEstudiante + (item.tasaPresenciaEstudiante ?? 0),
      tasaPresenciaEstudianteTotal:
        current.tasaPresenciaEstudianteTotal +
        (item.tasaPresenciaEstudianteTotal ?? 0),
      logroAcademico: current.logroAcademico + (item.logroAcademico ?? 0),
      logroAcademicoTotal:
        current.logroAcademicoTotal + (item.logroAcademicoTotal ?? 0),
      recursosDigitales:
        current.recursosDigitales + (item.recursosDigitales ?? 0),
      recursosDigitalesTotal:
        current.recursosDigitalesTotal + (item.recursosDigitalesTotal ?? 0),
      tasaAccesosDocentesASecciones:
        (current.tasaAccesosDocentesASecciones ?? 0) +
        (item.tasaAccesosDocentesASecciones ?? 0),
      tasaAccesosDocentesASeccionesTotal:
        (current.tasaAccesosDocentesASeccionesTotal ?? 0) +
        (item.tasaAccesosDocentesASeccionesTotal ?? 0),
    });
  });

  return Array.from(map.values()).sort((a, b) => a.grupo - b.grupo);
}

function sumTotals(
  items: DashboardRecord[],
  groups: number[],
  field: "total" | "access" | "demo",
) {
  return items
    .filter((item) => groups.includes(item.group))
    .reduce((acc, item) => acc + (item[field] ?? 0), 0);
}

function buildAccumulatedData(records: MetricsRecord[]): SeccionesData {
  if (records.length === 0) return emptySeccionesData();

  return {
    clases: {
      grados: sumarGradoItemsPorGrado(
        records.flatMap((record) => record.json?.clases?.grados ?? []),
      ),
      Indicadores: sumarIndicadoresItemsPorGrupo(
        records.flatMap((record) => record.json?.clases?.Indicadores ?? []),
      ),
      details: sumarDetailItemsPorGrupo(
        records.flatMap((record) => record.json?.clases?.details ?? []),
      ),
      Lenguaje: sumarClaseItemsPorGrupo(
        records.flatMap((record) => record.json?.clases?.Lenguaje ?? []),
      ),
      Matematica: sumarClaseItemsPorGrupo(
        records.flatMap((record) => record.json?.clases?.Matematica ?? []),
      ),
    },
    remediacion: null,
    refuerzo: null,
  };
}

function buildLineChartItem(
  label: string,
  data: SeccionesData,
  grupos: number[],
  teacherData?: DashboardReportApi | null,
): LineChartItem {
  const lenguaje = sumarClaseItems(
    data.clases.Lenguaje.filter((item) => grupos.includes(item.grupo)),
  );

  const matematica = sumarClaseItems(
    data.clases.Matematica.filter((item) => grupos.includes(item.grupo)),
  );

  const accesosDocentes = teacherData
    ? sumTotals(teacherData.json.clases.docentes, grupos, "access")
    : (lenguaje.accesosDocentes ?? 0) + (matematica.accesosDocentes ?? 0);

  const accesosEstudiantes = teacherData
    ? sumTotals(teacherData.json.clases.estudiantes, grupos, "access")
    : (lenguaje.accesosEstudiantes ?? 0) + (matematica.accesosEstudiantes ?? 0);

  return {
    fecha: label,
    accesosDocentes,
    accesosEstudiantes,
    clasesEfectivas:
      (lenguaje.clasesEfectivas ?? 0) + (matematica.clasesEfectivas ?? 0),
  };
}

function SeccionesClasesDashboard() {
  const [gruposSeleccionados, setGruposSeleccionados] = useState<string[]>([
    "Grupo 1",
    "Grupo 2",
  ]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedStartDate, setSelectedStartDate] = useState<string>("");
  const [selectedEndDate, setSelectedEndDate] = useState<string>("");
  const [viewMode, setViewMode] = useState<ViewMode>("Diario");

  const { data, isLoading, isError } = useQuery<ApiResponse>({
    queryKey: ["dashboard-secciones", selectedDate],
    queryFn: () => getSeccionClasses(selectedDate),
    retry: false,
    refetchOnWindowFocus: false,
  });

  const lastReportedDate = data?.last?.dateReported?.slice(0, 10) || "";
  const effectiveSelectedDate = selectedDate || lastReportedDate;
  const cumulative = data?.cumulative;

  const rangeDates = useMemo(() => {
    const end = new Date().toLocaleDateString("sv-SE");
    const start = new Date();
    start.setDate(start.getDate() - 60);

    return { start: start.toLocaleDateString("sv-SE"), end };
  }, []);

  const { data: teacherInfoData } = useQuery<TeacherInfoResponse>({
    queryKey: ["dashboard", rangeDates.start, rangeDates.end],
    queryFn: () => getTeacherInfo(rangeDates.start, rangeDates.end),
    retry: false,
    refetchOnWindowFocus: false,
  });

  const orderedRecords = useMemo<MetricsRecord[]>(() => {
    if (!Array.isArray(cumulative)) return [];

    return [...cumulative].sort(
      (a, b) =>
        new Date(b.dateReported).getTime() - new Date(a.dateReported).getTime(),
    );
  }, [cumulative]);

  const teacherRecords = useMemo<DashboardReportApi[]>(() => {
    if (!teacherInfoData) return [];

    return [
      ...(teacherInfoData.last ? [teacherInfoData.last] : []),
      ...(teacherInfoData.cumulative ?? []),
    ].sort(
      (a, b) =>
        new Date(b.dateReported).getTime() - new Date(a.dateReported).getTime(),
    );
  }, [teacherInfoData]);

  const lastReportDate = useMemo(() => {
    if (orderedRecords.length === 0) return "Sin registros";
    return formatFullDate(orderedRecords[0].dateReported);
  }, [orderedRecords]);

  const effectiveStartDate = selectedStartDate || effectiveSelectedDate;
  const effectiveEndDate = selectedEndDate || effectiveSelectedDate;

  const currentDateRange = useMemo(() => {
    if (!effectiveStartDate || !effectiveEndDate) return null;

    if (effectiveStartDate > effectiveEndDate) {
      return {
        start: effectiveEndDate,
        end: effectiveStartDate,
      };
    }

    return {
      start: effectiveStartDate,
      end: effectiveEndDate,
    };
  }, [effectiveStartDate, effectiveEndDate]);

  const previousDateRange = useMemo(() => {
    if (!currentDateRange) return null;

    return getPreviousDateRange(currentDateRange.start, currentDateRange.end);
  }, [currentDateRange]);

  const sourceRecord = useMemo<MetricsRecord | null>(() => {
    if (viewMode !== "Diario") return null;
    if (orderedRecords.length === 0) return null;

    const matchedRecord = orderedRecords.find(
      (record) => normalizeDate(record.dateReported) === effectiveSelectedDate,
    );

    return matchedRecord ?? null;
  }, [orderedRecords, effectiveSelectedDate, viewMode]);

  const previousRecord = useMemo<MetricsRecord | null>(() => {
    if (viewMode !== "Diario") return null;
    if (!sourceRecord || orderedRecords.length === 0) return null;

    const currentIndex = orderedRecords.findIndex(
      (record) => record.id === sourceRecord.id,
    );

    if (currentIndex === -1) return null;

    return orderedRecords[currentIndex + 1] ?? null;
  }, [sourceRecord, orderedRecords, viewMode]);

  const currentRangeRecords = useMemo(() => {
    if (viewMode !== "Acumulado" || !currentDateRange) return [];

    return orderedRecords.filter((record) =>
      isRecordInRange(record, currentDateRange.start, currentDateRange.end),
    );
  }, [orderedRecords, currentDateRange, viewMode]);

  const previousRangeRecords = useMemo(() => {
    if (viewMode !== "Acumulado" || !previousDateRange) return [];

    return orderedRecords.filter((record) =>
      isRecordInRange(record, previousDateRange.start, previousDateRange.end),
    );
  }, [orderedRecords, previousDateRange, viewMode]);

  const currentData = useMemo<SeccionesData>(() => {
    if (viewMode === "Acumulado") {
      return buildAccumulatedData(currentRangeRecords);
    }

    return buildDataFromJson(sourceRecord?.json ?? null);
  }, [viewMode, currentRangeRecords, sourceRecord]);

  const previousData = useMemo<SeccionesData>(() => {
    if (viewMode === "Acumulado") {
      return buildAccumulatedData(previousRangeRecords);
    }

    return buildDataFromJson(previousRecord?.json ?? null);
  }, [viewMode, previousRangeRecords, previousRecord]);

  const hasData = useMemo(() => {
    return (
      currentData.clases.Lenguaje.length > 0 ||
      currentData.clases.Matematica.length > 0 ||
      currentData.clases.Indicadores.length > 0 ||
      currentData.clases.details.length > 0
    );
  }, [currentData]);

  const gruposDisponibles = useMemo(() => {
    const grupos = new Set<number>();

    currentData.clases.Lenguaje.forEach((item) => grupos.add(item.grupo));
    currentData.clases.Matematica.forEach((item) => grupos.add(item.grupo));
    currentData.clases.Indicadores.forEach((item) => grupos.add(item.grupo));
    currentData.clases.details.forEach((item) => grupos.add(item.grupo));

    return Array.from(grupos)
      .sort((a, b) => a - b)
      .map((grupo) => `Grupo ${grupo}`);
  }, [currentData]);

  const gruposActivosResolved = useMemo(() => {
    if (!hasData && gruposDisponibles.length === 0) return ["Grupo 1"];

    const validos = gruposSeleccionados.filter((grupo) =>
      gruposDisponibles.includes(grupo),
    );

    if (validos.length > 0) return validos;

    return gruposDisponibles.length > 0 ? gruposDisponibles : ["Grupo 1"];
  }, [gruposSeleccionados, gruposDisponibles, hasData]);

  const etiquetaGrupoActiva = useMemo(() => {
    if (gruposActivosResolved.length > 1) return "Todos";
    return gruposActivosResolved[0] ?? "Grupo 1";
  }, [gruposActivosResolved]);

  const gruposNumerosActivos = useMemo(() => {
    return gruposActivosResolved.map((grupo) =>
      Number(grupo.replace("Grupo ", "")),
    );
  }, [gruposActivosResolved]);

  const toggleGrupo = (grupo: string) => {
    setGruposSeleccionados((prev) => {
      if (prev.includes(grupo)) {
        const next = prev.filter((item) => item !== grupo);
        return next.length > 0 ? next : [grupo];
      }

      return [...prev, grupo].sort();
    });
  };

  const materiasResumen = useMemo((): Materia[] => {
    if (!hasData) {
      return [
        {
          nombre: "Lenguaje",
          docentesAccesos: { valor: 0, total: 0 },
          estudiantesAccesos: { valor: 0, total: 0 },
          clasesEfectivas: { valor: 0, total: 0 },
        },
        {
          nombre: "Matemática",
          docentesAccesos: { valor: 0, total: 0 },
          estudiantesAccesos: { valor: 0, total: 0 },
          clasesEfectivas: { valor: 0, total: 0 },
        },
      ];
    }

    const lenguajeItems = currentData.clases.Lenguaje.filter((item) =>
      gruposNumerosActivos.includes(item.grupo),
    );

    const matematicaItems = currentData.clases.Matematica.filter((item) =>
      gruposNumerosActivos.includes(item.grupo),
    );

    const lenguaje = sumarClaseItems(lenguajeItems);
    const matematica = sumarClaseItems(matematicaItems);

    return [
      {
        nombre: "Lenguaje",
        docentesAccesos: {
          valor: lenguaje.accesosDocentes,
          total: lenguaje.totalDocentes,
        },
        estudiantesAccesos: {
          valor: lenguaje.accesosEstudiantes,
          total: lenguaje.totalEstudiantes,
        },
        clasesEfectivas: {
          valor: lenguaje.clasesEfectivas,
          total: lenguaje.totalClases,
        },
      },
      {
        nombre: "Matemática",
        docentesAccesos: {
          valor: matematica.accesosDocentes,
          total: matematica.totalDocentes,
        },
        estudiantesAccesos: {
          valor: matematica.accesosEstudiantes,
          total: matematica.totalEstudiantes,
        },
        clasesEfectivas: {
          valor: matematica.clasesEfectivas,
          total: matematica.totalClases,
        },
      },
    ];
  }, [hasData, currentData, gruposNumerosActivos]);

  const detailsResumen = useMemo(() => {
    const detailItems = currentData.clases.details.filter((item) =>
      gruposNumerosActivos.includes(item.grupo),
    );

    return construirResumenDetails(detailItems).valores;
  }, [currentData, gruposNumerosActivos]);

  const detailsPorcentajes = useMemo(() => {
    const detailItems = currentData.clases.details.filter((item) =>
      gruposNumerosActivos.includes(item.grupo),
    );

    return construirResumenDetails(detailItems).porcentajes;
  }, [currentData, gruposNumerosActivos]);

  const mostrarTasaAccesosSecciones = useMemo(() => {
    return currentData.clases.details
      .filter((item) => gruposNumerosActivos.includes(item.grupo))
      .some(
        (item) =>
          Object.prototype.hasOwnProperty.call(
            item,
            "tasaAccesosDocentesASecciones",
          ) &&
          Object.prototype.hasOwnProperty.call(
            item,
            "tasaAccesosDocentesASeccionesTotal",
          ),
      );
  }, [currentData, gruposNumerosActivos]);

  const variaciones = useMemo(() => {
    const lenguajeActual = sumarClaseItems(
      currentData.clases.Lenguaje.filter((item) =>
        gruposNumerosActivos.includes(item.grupo),
      ),
    );

    const lenguajeAnterior = sumarClaseItems(
      previousData.clases.Lenguaje.filter((item) =>
        gruposNumerosActivos.includes(item.grupo),
      ),
    );

    const matematicaActual = sumarClaseItems(
      currentData.clases.Matematica.filter((item) =>
        gruposNumerosActivos.includes(item.grupo),
      ),
    );

    const matematicaAnterior = sumarClaseItems(
      previousData.clases.Matematica.filter((item) =>
        gruposNumerosActivos.includes(item.grupo),
      ),
    );

    return {
      Lenguaje: {
        docentes: calcularVariacionPorcentual(
          lenguajeAnterior.accesosDocentes,
          lenguajeActual.accesosDocentes,
        ),
        estudiantes: calcularVariacionPorcentual(
          lenguajeAnterior.accesosEstudiantes,
          lenguajeActual.accesosEstudiantes,
        ),
        clases: calcularVariacionPorcentual(
          lenguajeAnterior.clasesEfectivas,
          lenguajeActual.clasesEfectivas,
        ),
      },
      Matemática: {
        docentes: calcularVariacionPorcentual(
          matematicaAnterior.accesosDocentes,
          matematicaActual.accesosDocentes,
        ),
        estudiantes: calcularVariacionPorcentual(
          matematicaAnterior.accesosEstudiantes,
          matematicaActual.accesosEstudiantes,
        ),
        clases: calcularVariacionPorcentual(
          matematicaAnterior.clasesEfectivas,
          matematicaActual.clasesEfectivas,
        ),
      },
    };
  }, [currentData, previousData, gruposNumerosActivos]);

  const clasesEfectivasResumen = useMemo(() => {
    const currentDetailItems = currentData.clases.details.filter((item) =>
      gruposNumerosActivos.includes(item.grupo),
    );

    const previousDetailItems = previousData.clases.details.filter((item) =>
      gruposNumerosActivos.includes(item.grupo),
    );

    const currentResumen = construirResumenDetails(currentDetailItems);
    const previousResumen = construirResumenDetails(previousDetailItems);

    const porcentajeActual = currentResumen.promedioClasesEfectivas;
    const porcentajeAnterior = previousResumen.promedioClasesEfectivas;

    const variacion = calcularVariacionPorcentual(
      porcentajeAnterior,
      porcentajeActual,
    );

    return {
      porcentaje: porcentajeActual,
      variacion,
    };
  }, [currentData, previousData, gruposNumerosActivos]);

  const lineChartData = useMemo<LineChartItem[]>(() => {
    if (!orderedRecords.length) return [];

    const ultimosCinco = [...orderedRecords]
      .slice(0, 5)
      .sort(
        (a, b) =>
          new Date(a.dateReported).getTime() -
          new Date(b.dateReported).getTime(),
      );

    return ultimosCinco.map((record) => {
      const matchedTeacher = teacherRecords.find(
        (teacherRecord) =>
          normalizeDate(teacherRecord.dateReported) ===
          normalizeDate(record.dateReported),
      );

      return buildLineChartItem(
        formatFullDate(record.dateReported),
        buildDataFromJson(record.json),
        gruposNumerosActivos,
        matchedTeacher,
      );
    });
  }, [orderedRecords, gruposNumerosActivos, teacherRecords]);

  if (isLoading) {
    return (
      <p className="text-xs text-slate-800 flex justify-center items-center gap-1 p-3">
        <span className="h-5 w-5 block rounded-full border-2 border-gray-300 border-t-indigo-600 animate-spin"></span>
        Cargando información...
      </p>
    );
  }

  if (isError) {
    return (
      <p className="text-xs text-red-600 flex justify-center items-center p-3">
        Ocurrió un error al cargar la información.
      </p>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm md:p-8 my-5">
        <div className="mb-3 flex gap-2 justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-3xl">
              Secciones (clases)
            </h1>

            <p className="max-w-2xl text-sm leading-6 text-slate-500 md:text-base">
              Accesos de docentes y estudiantes, clases efectivas y variación
              por materia.
            </p>
          </div>

          <div className="flex mt-3">
            <p className="text-xs bg-green-600 p-1 rounded-lg text-green-900">
              <span className="font-semibold">Reciente:</span>{" "}
              <span className="text-white font-light">{lastReportDate}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-end items-center gap-2 text-xs my-5">
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-1 shadow-sm w-full md:w-auto">
          <button
            type="button"
            onClick={() => setViewMode("Diario")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
              viewMode === "Diario"
                ? "bg-indigo-600 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Diario
          </button>

          <button
            type="button"
            onClick={() => setViewMode("Acumulado")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
              viewMode === "Acumulado"
                ? "bg-indigo-600 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Acumulado
          </button>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-2 shadow-sm w-full md:w-auto">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <Calendar size={16} />
          </div>

          {viewMode === "Diario" ? (
            <input
              type="date"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs"
              value={effectiveSelectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1 text-[11px] font-semibold text-slate-700">
                Fecha inicio
                <input
                  type="date"
                  className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-normal text-slate-700"
                  value={effectiveStartDate}
                  onChange={(e) => setSelectedStartDate(e.target.value)}
                />
              </label>

              <label className="flex flex-col gap-1 text-[11px] font-semibold text-slate-700">
                Fecha fin
                <input
                  type="date"
                  className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-normal text-slate-700"
                  value={effectiveEndDate}
                  onChange={(e) => setSelectedEndDate(e.target.value)}
                />
              </label>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2 shadow-sm w-full md:w-auto">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <Users size={16} />
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {gruposDisponibles.length > 0 ? (
              gruposDisponibles.map((grupo) => (
                <label
                  key={grupo}
                  className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={gruposActivosResolved.includes(grupo)}
                    onChange={() => toggleGrupo(grupo)}
                    className="h-4 w-4 rounded border-slate-300"
                  />
                  <span>{grupo}</span>
                </label>
              ))
            ) : (
              <label className="flex items-center gap-2 text-xs font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked
                  readOnly
                  className="h-4 w-4 rounded border-slate-300"
                />
                <span>Grupo 1</span>
              </label>
            )}
          </div>
        </div>
      </div>

      {!hasData ? (
        <p className="border-l-2 border-green-700 text-green-700 p-2 bg-green-50 text-center">
          {viewMode === "Diario"
            ? "No hay datos para la fecha seleccionada."
            : "No hay datos para el rango de fechas seleccionado."}
        </p>
      ) : (
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-slate-700">
                  <BookOpen size={16} />
                  <p className="text-sm font-medium">Clases efectivas</p>
                </div>
                {clasesEfectivasResumen.variacion > 0 ? (
                  <p className="flex gap-2 items-center text-xs font-medium text-green-700">
                    <TrendingUp size={16} />
                    Variación: {clasesEfectivasResumen.variacion.toFixed(1)}%
                  </p>
                ) : (
                  <p className="flex gap-2 items-center text-xs font-medium text-red-700">
                    <TrendingDown size={16} />
                    Variación: {clasesEfectivasResumen.variacion.toFixed(1)}%
                  </p>
                )}
              </div>
              <p className="mt-2 font-bold text-indigo-600 text-5xl">
                {Math.min(clasesEfectivasResumen.porcentaje, 100).toFixed(2)}%
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {mostrarTasaAccesosSecciones && (
              <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                <p className="text-sm font-medium text-slate-500">
                  Tasa de secciones ejecutadas.
                </p>
                <p className="mt-2 font-bold text-indigo-600 text-5xl">
                  {Math.round(
                    Math.min(detailsPorcentajes.accesosSecciones, 100),
                  )}
                  %
                </p>
                <p className="mt-3 text-lg text-gray-500 font-semibold">
                  {detailsResumen.tasaAccesosDocentesASecciones.toLocaleString("en-US")}{" "}
                  <span>
                    de{" "}
                    {detailsResumen.tasaAccesosDocentesASeccionesTotal.toLocaleString(
                      "en-US",
                    )}
                  </span>
                </p>
              </div>
            )}
            <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <p className="text-sm font-medium text-slate-500">
                Tasa de presencia de docentes unicos
              </p>
              <p className="mt-2 font-bold text-indigo-600 text-5xl">
                {Math.round(Math.min(detailsPorcentajes.presenciaDocente, 100))}
                %
              </p>
              <p className="mt-3 text-lg text-gray-500 font-semibold">
                {detailsResumen.tasaPresenciaDocente.toLocaleString("en-US")}{" "}
                <span>
                  de{" "}
                  {detailsResumen.tasaPresenciaDocenteTotal.toLocaleString(
                    "en-US",
                  )}
                </span>
              </p>
            </div>

            <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <p className="text-sm font-medium text-slate-500">
                Tasa de presencia de estudiantes
              </p>
              <p className="mt-2 font-bold text-indigo-600 text-5xl">
                {Math.round(
                  Math.min(detailsPorcentajes.presenciaEstudiante, 100),
                )}
                %
              </p>
              <p className="mt-3 text-lg text-gray-500 font-semibold">
                {detailsResumen.tasaPresenciaEstudiante.toLocaleString("en-US")}{" "}
                <span>
                  de{" "}
                  {detailsResumen.tasaPresenciaEstudianteTotal.toLocaleString(
                    "en-US",
                  )}
                </span>
              </p>
            </div>

            <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <p className="text-sm font-medium text-slate-500">
                Nivel de logro académico
              </p>
              <p className="mt-2 font-bold text-green-700 text-5xl">
                {Math.round(Math.min(detailsPorcentajes.logroAcademico, 100))}%
              </p>
              <p className="mt-3 text-lg text-gray-500 font-semibold">
                {detailsResumen.logroAcademico.toLocaleString("en-US")}{" "}
                <span>
                  de{" "}
                  {detailsResumen.logroAcademicoTotal.toLocaleString("en-US")}
                </span>
              </p>
            </div>

            <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <p className="text-sm font-medium text-slate-500">
                Uso de recursos digitales
              </p>
              <p className="mt-2 font-bold text-green-700 text-5xl">
                {Math.round(
                  Math.min(detailsPorcentajes.recursosDigitales, 100),
                )}
                %
              </p>
              <p className="mt-3 text-lg text-gray-500 font-semibold">
                {detailsResumen.recursosDigitales.toLocaleString("en-US")}{" "}
                <span>
                  de{" "}
                  {detailsResumen.recursosDigitalesTotal.toLocaleString(
                    "en-US",
                  )}
                </span>
              </p>
            </div>
          </div>

          <div className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-200 md:p-6">
            <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  Resumen por materia
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {`Visualización correspondiente a ${etiquetaGrupoActiva}.`}
                </p>
              </div>

              <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600">
                {etiquetaGrupoActiva}
              </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
              {materiasResumen.map((materia) => {
                const porcentajeDocentes =
                  materia.docentesAccesos.total > 0
                    ? (materia.docentesAccesos.valor /
                        materia.docentesAccesos.total) *
                      100
                    : 0;

                const porcentajeEstudiantes =
                  materia.estudiantesAccesos.total > 0
                    ? (materia.estudiantesAccesos.valor /
                        materia.estudiantesAccesos.total) *
                      100
                    : 0;

                const variacionMateria = variaciones[materia.nombre];

                return (
                  <div
                    key={materia.nombre}
                    className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white">
                          <BookOpen size={18} />
                        </div>

                        <h3 className="text-xl font-semibold text-slate-900">
                          {materia.nombre}
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                          Indicadores principales de la materia
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-3 mt-6">
                      <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2 text-slate-700">
                            <Users size={16} />
                            <p className="text-sm font-medium">Docentes</p>
                          </div>
                          {variacionMateria.docentes > 0 ? (
                            <p className="flex gap-2 items-center text-xs font-medium text-green-700">
                              <TrendingUp size={16} />
                              Variación: {variacionMateria.docentes.toFixed(1)}%
                            </p>
                          ) : (
                            <p className="flex gap-2 items-center text-xs font-medium text-red-700">
                              <TrendingDown size={16} />
                              Variación: {variacionMateria.docentes.toFixed(1)}%
                            </p>
                          )}
                        </div>

                        <p className="mt-3 text-2xl font-bold text-slate-900">
                          <span className="text-gray-500 text-xl">
                            {materia.docentesAccesos.valor.toLocaleString(
                              "en-US",
                            )}
                          </span>{" "}
                          /{" "}
                          {materia.docentesAccesos.total.toLocaleString(
                            "en-US",
                          )}
                        </p>

                        <div className="flex items-center justify-center mt-4 gap-2">
                          <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
                            <div
                              className="h-2.5 rounded-full bg-indigo-600"
                              style={{
                                width: `${Math.min(porcentajeDocentes, 100)}%`,
                              }}
                            />
                          </div>
                          <p className="text-gray-500 text-sm font-semibold">
                            {Math.round(Math.min(porcentajeDocentes, 100))}%
                          </p>
                        </div>
                      </div>

                      <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2 text-slate-700">
                            <Users size={16} />
                            <p className="text-sm font-medium">Estudiantes</p>
                          </div>
                          {variacionMateria.estudiantes > 0 ? (
                            <p className="flex gap-2 items-center text-xs font-medium text-green-700">
                              <TrendingUp size={16} />
                              Variación:{" "}
                              {variacionMateria.estudiantes.toFixed(1)}%
                            </p>
                          ) : (
                            <p className="flex gap-2 items-center text-xs font-medium text-red-700">
                              <TrendingDown size={16} />
                              Variación:{" "}
                              {variacionMateria.estudiantes.toFixed(1)}%
                            </p>
                          )}
                        </div>

                        <p className="mt-3 text-2xl font-bold text-slate-900">
                          <span className="text-gray-500 text-xl">
                            {materia.estudiantesAccesos.valor.toLocaleString(
                              "en-US",
                            )}
                          </span>{" "}
                          /{" "}
                          {materia.estudiantesAccesos.total.toLocaleString(
                            "en-US",
                          )}
                        </p>

                        <div className="flex items-center justify-center mt-4 gap-2">
                          <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
                            <div
                              className="h-2.5 rounded-full bg-indigo-600"
                              style={{
                                width: `${Math.min(
                                  porcentajeEstudiantes,
                                  100,
                                )}%`,
                              }}
                            />
                          </div>
                          <p className="text-gray-500 text-sm font-semibold">
                            {Math.round(Math.min(porcentajeEstudiantes, 100))}%
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-200 md:p-6">
            <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-4xl font-semibold text-slate-900">
                  Comportamiento de Clases Efectivas
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {`Tendencia de los últimos 5 días para ${etiquetaGrupoActiva.toLowerCase()}.`}
                </p>
              </div>

              <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600">
                Últimos 5 días
              </div>
            </div>

            {lineChartData.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
                No hay datos suficientes para mostrar la información.
              </div>
            ) : (
              <div className="h-[340px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={lineChartData}
                    margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="fecha" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="clasesEfectivas"
                      name="Clases efectivas"
                      fill="#ea580c"
                      radius={[10, 10, 0, 0]}
                      barSize={55}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default SeccionesClasesDashboard;
