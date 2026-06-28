export default function formatDate(date: string) {
    return new Date(date).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}
