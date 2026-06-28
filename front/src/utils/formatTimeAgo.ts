export default function formatTimeAgo(dateString: string) {
    const date = Date.parse(dateString) - Date.now(),
        sec = Math.abs(Math.floor(date / 1000)),
        min = Math.abs(Math.floor(sec / 60)),
        hours = Math.abs(Math.floor(min / 60)),
        days = Math.abs(Math.floor(hours / 24));
    return `${days} days, ${hours % 24} hours, ${min % 60} minutes, and ${
        sec % 60
    } seconds ago`;
}
