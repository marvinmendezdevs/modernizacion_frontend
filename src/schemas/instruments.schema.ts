import { z } from "zod";

// 1. Esquema para las Opciones (ej: Bajo, Medio, Alto)
// Coincide con: { "valor": 1, "etiqueta": "Bajo" }
export const OpcionSchema = z.object({
    valor: z.number().nullable(), // Puede ser null para "N/A"
    etiqueta: z.string(),
});

// 2. Esquema para las Preguntas individuales
export const PreguntaSchema = z.object({
    id_pregunta: z.number(),
    texto: z.string(),
    tipo_respuesta: z.string(), // Ej: "escala"
    requerida: z.boolean(),
    opciones: z.array(OpcionSchema),
});

// 3. Esquema para los Indicadores (Agrupan preguntas, ej: "AMBIENTE DE APRENDIZAJE")
export const IndicadorSchema = z.object({
    id_indicador: z.number(),
    nombre_indicador: z.string(),
    mostrar_titulo: z.boolean(),
    preguntas: z.array(PreguntaSchema),
});

// 4. Esquema para las Secciones (Nivel superior, ej: "CULTURA DEL AULA")
export const SeccionSchema = z.object({
    id_seccion: z.string(), // En tu JSON viene como string "1", "2"
    nombre_seccion: z.string(),
    mostrar_titulo: z.boolean(),
    indicadores: z.array(IndicadorSchema),
});

// 5. Esquema del contenido JSON (lo que guardas en la columna 'schema' de la BD)
export const InstrumentContentSchema = z.array(SeccionSchema);

// 6. Esquema completo de la tabla 'instrument' (opcional, por si manejas el objeto completo)
export const InstrumentTableSchema = z.object({
    id: z.number().optional(),
    title: z.string(),
    slug: z.string(),
    type: z.string(),
    schema: InstrumentContentSchema, // Aquí validamos el JSON interno
});

export const DiagnosticResponseSchema = z.record(
  // Key: Será el string "pregunta-ID"
  z.string(), 
  z.union([z.string(), z.number(), z.null()]).optional()
);
