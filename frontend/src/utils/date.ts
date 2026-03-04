export const formatShortDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'numeric' });
};

export const formatShortDateTime = (dateString: string): string => {
    return new Date(dateString).toLocaleString('cs-CZ', {
        day: 'numeric',
        month: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

export const formatShortTime = (dateString: string): string => {
    return new Date(dateString).toLocaleTimeString('cs-CZ', {
        hour: '2-digit',
        minute: '2-digit',
    });
};

export const toInputDateTimeString = (dateString?: string | null): string => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export const toIsoString = (dateString: string): string | null => {
    if (!dateString) return null;
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;

    const iso = date.toISOString();
    return iso.split('.')[0] + 'Z';
};

export const calculateDuration = (start: string, end: string): string => {
    const startDate = new Date(start);
    const endDate = new Date(end);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return "";

    const diffMs = endDate.getTime() - startDate.getTime();
    if (diffMs < 0) return "Neplatný časový úsek";

    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const days = Math.floor(diffHours / 24);
    const hours = diffHours % 24;

    if (days > 0) {
        return `${days} dní a ${hours} hodin`;
    }
    return `${hours} hodin`;
};
