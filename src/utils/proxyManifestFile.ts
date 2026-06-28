export function proxyManifestUrls(
    m3u8String: string,
    proxyUrl: string
): string {
    return m3u8String
        .trim()
        .split('\n')
        .map((line) => {
            if (line.startsWith('#') || !line.trim()) return line;

            return `${proxyUrl}${line}`;
        })
        .join('\n');
}

export function proxyManifestUrlsBase64(
    m3u8String: string,
    proxyUrl: string
): string {
    return m3u8String
        .trim()
        .split('\n')
        .map((line) => {
            if (line.startsWith('#') || !line.trim()) return line;

            return `${proxyUrl}${Buffer.from(line).toString('base64')}`;
        })
        .join('\n');
}

export function proxyVodManifestBase64(
    m3u8String: string,
    proxyUrl: string,
    sourceUrl: string
): string {
    return m3u8String
        .trim()
        .split('\n')
        .map((line) => {
            if (line.startsWith('#') || !line.trim()) return line;

            return `${proxyUrl}${Buffer.from(`${sourceUrl}${line}`).toString(
                'base64'
            )}`;
        })
        .join('\n');
}
