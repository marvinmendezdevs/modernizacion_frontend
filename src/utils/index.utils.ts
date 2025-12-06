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