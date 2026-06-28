const clientId = Deno.env.get('CLIENTID') || 'kimne78kx3ncx6brgo4mv6wki5h1ko',
    userAgent =
        Deno.env.get('USERAGENT') ||
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36';

interface QualityURLS {
    quality: string;
    src: string;
    originalURL: string;
}

export async function fetchClipMedia(
    slug: string
): Promise<{ valid: boolean; data?: QualityURLS[] }> {
    try {
        const req = await fetch('https://gql.twitch.tv/gql', {
            method: 'POST',
            body: JSON.stringify({
                operationName: 'VideoAccessToken_Clip',
                variables: {
                    slug: slug,
                },
                extensions: {
                    persistedQuery: {
                        version: 1,
                        sha256Hash:
                            '36b89d2507fce29e5ca551df756d27c1cfe079e2609642b4390aa4c35796eb11',
                    },
                },
            }),
            headers: {
                'User-Agent': userAgent,
                Referer: 'https://www.twitch.tv/',
                Origin: 'https://www.twitch.tv/',
                'Client-ID': clientId,
            },
        });

        if (req.status !== 200) return { valid: false };

        const { data } = await req.json();

        if (data.errors !== undefined || data.clip == undefined)
            return { valid: false };

        const token: {
                signature: string;
                value: string;
            } = data.clip.playbackAccessToken,
            mediaURLS: QualityURLS[] = data.clip.videoQualities.map(
                (media: {
                    frameRate: number;
                    quality: string;
                    sourceURL: string;
                }) => {
                    return {
                        quality: media.quality,
                        src: `/clipproxy?media=${media.sourceURL}&sig=${
                            token.signature
                        }&token=${encodeURIComponent(token.value)}`,
                        originalURL: `${media.sourceURL}?sig=${
                            token.signature
                        }&token=${encodeURIComponent(token.value)}`,
                    } as QualityURLS;
                }
            );
        return {
            valid: true,
            data: mediaURLS,
        };
    } catch (error) {
        console.log(error);
        return { valid: false };
    }
}

export async function fetchClipMetadata(
    channel: string,
    slug: string
): Promise<{
    valid: boolean;
    data?: {
        game: string;
        author: string;
        avatar: string;
        title: string;
        views: number;
        date: string;
    };
}> {
    try {
        const req = await fetch('https://gql.twitch.tv/gql', {
            method: 'POST',
            body: JSON.stringify({
                operationName: 'ClipMetadata',
                variables: {
                    channelLogin: channel,
                    clipSlug: slug,
                },
                extensions: {
                    persistedQuery: {
                        version: 1,
                        sha256Hash:
                            'ab70572e66f164789c87936a8291fd15e29adc2cea0114b02e60f17d60d6d154',
                    },
                },
            }),
            headers: {
                'User-Agent': userAgent,
                Referer: 'https://www.twitch.tv/',
                Origin: 'https://www.twitch.tv/',
                'Client-ID': clientId,
            },
        });

        if (req.status !== 200) return { valid: false };

        const { data } = await req.json();

        if (data.errors !== undefined || data.clip.broadcaster == null)
            return { valid: false };

        return {
            valid: true,
            data: {
                avatar: data.user.profileImageURL,
                date: data.clip.createdAt,
                title: data.clip.title,
                views: data.clip.viewCount,
                author: data.clip.curator.displayName,
                game: data.clip.game.displayName,
            },
        };
    } catch (err) {
        console.log(err);
        return { valid: false };
    }
}
