export default interface genericResponseObject<T> {
    error: {
        status?: number;
        message?: string;
    } | null;
    data: T | null;
}
