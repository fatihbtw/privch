export default function formatTime(seconds: number) {
    const h = Math.floor(seconds / 3600),
        min = Math.floor((seconds % 3600) / 60),
        sec = seconds % 60;
    let parsedStr = '';

    if (h > 0) parsedStr += `${h}h `;
    if (min > 0) parsedStr += `${min}m `;
    if (sec > 0) parsedStr += `${sec}s`;

    return parsedStr.trim();
}
