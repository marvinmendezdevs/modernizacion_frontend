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