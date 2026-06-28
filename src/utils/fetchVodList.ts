import axios from 'axios';

const clientId = process.env.CLIENTID || 'kimne78kx3ncx6brgo4mv6wki5h1ko',
    userAgent =
        process.env.USERAGENT ||
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36';

interface ResponseObj {
    data: {
        user: {
            videos: {
                edges: {
                    node: {
                        game: {
                            name: string;
                        } | null;
                        id: string;
                        previewThumbnailURL: string;
                        publishedAt: string;
                        title: string;
                        viewCount: number;
                        lengthSeconds: number;
                    };
                }[];
            };
        } | null;
    };
}
export async function fetchVods(
    username: string,
    limit: number,
    filter: string
): Promise<{
    valid: boolean;
    data?: {
        id: string;
        previewThumbnailURL: string;
        game: string;
        publishedAt: string;
        title: string;
        viewCount: number;
        lengthSeconds: number;
    }[];
}> {
    try {
        const req = await axios.post(
            'https://gql.twitch.tv/gql',
            {
                operationName: 'FilterableVideoTower_Videos',
                variables: {
                    limit: limit,
                    channelOwnerLogin: username,
                    broadcastType: filter == 'ALL' ? null : filter,
                    videoSort: 'TIME',
                },
                extensions: {
                    persistedQuery: {
                        version: 1,
                        sha256Hash:
                            'a937f1d22e269e39a03b509f65a7490f9fc247d7f83d6ac1421523e3b68042cb',
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

        if (req.status !== 200 || (req.data as ResponseObj).data.user == null)
            return { valid: false };

        const vodList = (req.data as ResponseObj).data.user.videos.edges.map(
            (vod) => {
                return {
                    id: vod.node.id,
                    previewThumbnailURL: vod.node.previewThumbnailURL,
                    game: vod.node.game == null ? '' : vod.node.game.name,
                    publishedAt: vod.node.publishedAt,
                    title: vod.node.title,
                    viewCount: vod.node.viewCount,
                    lengthSeconds: vod.node.lengthSeconds,
                };
            }
        );

        return {
            valid: true,
            data: vodList,
        };
    } catch (err) {
        console.log(err);
        return { valid: false };
    }
}
