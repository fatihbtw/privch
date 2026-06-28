import axios from 'axios';

const clientId = process.env.CLIENTID || 'kimne78kx3ncx6brgo4mv6wki5h1ko',
    userAgent =
        process.env.USERAGENT ||
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
        const req = await axios.post(
            'https://gql.twitch.tv/gql',
            {
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
            },
            {
                headers: {
                    'User-Agent': userAgent,
                    Referer: 'https://www.twitch.tv/',
                    Origin: 'https://www.twitch.tv/',
                    'Client-ID': clientId,
                },
                validateStatus: () => true,
            }
        );
        if (
            req.status !== 200 ||
            req.data.errors !== undefined ||
            req.data.data.clip == undefined
        )
            return { valid: false };
        const token: {
                signature: string;
                value: string;
            } = req.data.data.clip.playbackAccessToken,
            mediaURLS: QualityURLS[] = req.data.data.clip.videoQualities.map(
                (media: {
                    frameRate: number;
                    quality: string;
                    sourceURL: string;
                }) => {
                    return {
                        quality: media.quality,
                        src: `/clipproxy/${encodeURIComponent(
                            media.sourceURL
                        )}/${token.signature}/${encodeURIComponent(
                            token.value
                        )}`,
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
    } catch (err) {
        console.log(err);
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
        const req = await axios.post(
            'https://gql.twitch.tv/gql',
            {
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
            },
            {
                headers: {
                    'User-Agent': userAgent,
                    Referer: 'https://www.twitch.tv/',
                    Origin: 'https://www.twitch.tv/',
                    'Client-ID': clientId,
                },
                validateStatus: () => true,
            }
        );
        if (
            req.status !== 200 ||
            req.data.errors !== undefined ||
            req.data.data.clip.broadcaster == null
        )
            return { valid: false };

        return {
            valid: true,
            data: {
                avatar: req.data.data.user.profileImageURL,
                date: req.data.data.clip.createdAt,
                title: req.data.data.clip.title,
                views: req.data.data.clip.viewCount,
                author: req.data.data.clip.curator.displayName,
                game: req.data.data.clip.game.displayName,
            },
        };
    } catch (err) {
        console.log(err);
        return { valid: false };
    }
}
