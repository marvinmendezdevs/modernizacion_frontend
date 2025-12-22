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
