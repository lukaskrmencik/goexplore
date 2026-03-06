export const getImageUrl = (path: string | null | undefined): string | null => {
    if (!path) return null;

    if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("blob:")) {
        return path;
    }

    const baseUrl = import.meta.env.VITE_API_URL;
    const cleanBaseUrl = baseUrl.endsWith("/api") ? baseUrl.slice(0, -4) : baseUrl;

    return `${cleanBaseUrl}/storage/${path}`;
};
