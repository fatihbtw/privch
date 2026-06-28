import axios from 'axios';

const clientId = process.env.CLIENTID || 'kimne78kx3ncx6brgo4mv6wki5h1ko',
    userAgent =
        process.env.USERAGENT ||
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36';

export async function fetchName(
    vodId: string
): Promise<{ valid: boolean; data?: string }> {
    try {
        const req = await axios.post(
            'https://gql.twitch.tv/gql',
            {
                operationName: 'VodChannelLoginQuery',
                variables: {
                    videoID: vodId,
                },
                extensions: {
                    persistedQuery: {
                        version: 1,
                        sha256Hash:
                            '0c5feea4dad2565508828f16e53fe62614edf015159df4b3bca33423496ce78e',
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
        if (req.status !== 200 || req.data.data.video == null)
            return { valid: false };
        return {
            valid: true,
            data: req.data.data.video.owner.login,
        };
    } catch (err) {
        console.log(err);
        return { valid: false };
    }
}

export async function fetchVodMetadata(vodId: string): Promise<{
    valid: boolean;
    data?: {
        game: string;
        user: string;
        title: string;
    };
}> {
    try {
        const req = await axios.post(
            'https://gql.twitch.tv/gql',
            {
                operationName: 'ComscoreStreamingQuery',
                variables: {
                    channel: '',
                    clipSlug: '',
                    isClip: false,
                    isLive: false,
                    isVodOrCollection: true,
                    vodID: vodId,
                },
                extensions: {
                    persistedQuery: {
                        version: 1,
                        sha256Hash:
                            'e1edae8122517d013405f237ffcc124515dc6ded82480a88daef69c83b53ac01',
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
        if (req.status !== 200 || req.data.data.video == null)
            return { valid: false };
        return {
            valid: true,
            data: {
                game: req.data.data.video.game.name,
                user: req.data.data.video.owner.displayName,
                title: req.data.data.video.title,
            },
        };
    } catch (err) {
        console.log(err);
        return { valid: false };
    }
}

export async function fetchCommentByOffset(
    vodId: string,
    second: number | string
): Promise<{
    valid: boolean;
    data?: {
        offset: number;
        username: string;
        message: string;
        color: string | null;
    };
}> {
    try {
        const req = await axios.post(
            'https://gql.twitch.tv/gql',
            {
                operationName: 'VideoCommentsByOffsetOrCursor',
                variables: {
                    videoID: vodId,
                    contentOffsetSeconds: Number(second),
                },
                extensions: {
                    persistedQuery: {
                        version: 1,
                        sha256Hash:
                            'b70a3591ff0f4e0313d126c6a1502d79a1c02baebb288227c582044aa76adf6a',
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
        if (req.status !== 200 || req.data.data.video == null)
            return { valid: false };

        const comments = req.data.data.video.comments.edges
            .map((x) => {
                if (x.node.commenter == null) return null;
                else {
                    return {
                        offset: x.node.contentOffsetSeconds,
                        username: x.node.commenter.displayName,
                        message: x.node.message.fragments[0].text,
                        color: x.node.message.userColor || '#FFFFF',
                    };
                }
            })
            .filter((x) => x !== null);
        return {
            valid: true,
            data: comments,
        };
    } catch (err) {
        console.log(err);
        return { valid: false };
    }
}
