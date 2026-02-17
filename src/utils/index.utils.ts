type Category = 'Alto' | 'Medio' | 'Bajo';

export default class Env {
    private static get(key: string) {
        const value = import.meta.env[key];

        if (!value) {
            throw new Error('Error inespertado');
        }

        return value;
    }

    static readonly VITE_APP_NAME = Env.get('VITE_APP_NAME');
    static readonly VITE_BASE_URL = Env.get('VITE_BASE_URL');

}

export const cleanSearchTerm = (str: string) => {
    if (!str || typeof str !== 'string') return '';

    return str
        .trim() // 1. Quita espacios al inicio y final
        .toLowerCase() // 2. Todo a minúsculas
        .normalize("NFD") // 3. Descompone caracteres (ej: 'ñ' -> 'n' + '~')
        .replace(/[\u0300-\u036f]/g, "") // 4. Elimina los diacríticos (acentos, tildes)
        .replace(/[^a-z0-9\s]/g, "") // 5. (Opcional) Elimina todo lo que NO sea letra, número o espacio
        .replace(/\s+/g, " "); // 6. Convierte múltiples espacios en uno solo ("hola   mundo" -> "hola mundo")
};

export const getCategoryFromScore = (score: number): Category => {
    // Si el score es mayor o igual a 8, es Alto
    if (score >= 8) {
        return 'Alto';
    }

    // Si no es Alto, pero es mayor o igual a 6, es Medio
    if (score >= 6) {
        return 'Medio';
    }

    // Cualquier cosa menor a 6 es Bajo
    return 'Bajo';
};

export const formatDate = (date: string) => {
    const formatDate = new Date(date);

    return new Intl.DateTimeFormat('es-SV', {
        year: 'numeric',
        month: 'long',
        day: '2-digit'
    }).format(formatDate);
}

export const getHours = (date: string) => {
    const formatDate = new Date(date);

    return new Intl.DateTimeFormat('es-SV', {
        hour: '2-digit',
        minute: '2-digit'
    }).format(formatDate);
}


type SchoolAnswers = Record<string, string | null | undefined>;

export function percentYes(rows: SchoolAnswers[], key: string): number {
    if (!rows?.length) return 0;

    return rows.filter(r => {
        const v = (r?.[key] ?? "").toString().trim().toLowerCase();
        return v === "si";
    }).length;
}

export const validDUI = (value: string): boolean => {
    if (!/^\d{9}$/.test(value)) return false;

    const body = value.slice(0, 8);
    const dv = Number(value[8]);

    let sum = 0;
    for (let i = 0; i < 8; i++) {
        sum += Number(body[i]) * (9 - i);
    }

    const expected = (10 - (sum % 10)) % 10;
    return dv === expected;
};

export const calculatePercentage = (total: number, access: number) => {
    if (total === 0) return "0.00";
    return ((access / total) * 100).toFixed(2);
}

export const formatNumber = (quantity: string | number) => {
    return Intl.NumberFormat("es-SV", {
        style: "decimal"
    }).format(Number(quantity));
}
export const formatFullDate = (iso: string) => {
  const date = new Date(iso);

  const text = date.toLocaleDateString("es-ES", {
    timeZone: "UTC",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return text.replace(/^./, (c) => c.toUpperCase());
};
