import axios from 'axios';

const clientId = process.env.CLIENTID || 'kimne78kx3ncx6brgo4mv6wki5h1ko',
    userAgent =
        process.env.USERAGENT ||
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36';

interface ResponseObj {
    data: {
        user: {
            id: number;
            clips: {
                edges: {
                    node: {
                        id: string;
                        slug: string;
                        title: string;
                        viewCount: number;
                        curator: {
                            login: string;
                            displayName: string;
                        } | null;
                        game: {
                            name: string;
                        } | null;
                        thumbnailURL: string;
                        createdAt: string;
                        durationSeconds: number;
                    };
                }[];
            };
        } | null;
    };
}

export async function fetchClips(
    username: string,
    filter: string,
    limit: number
): Promise<{
    valid: boolean;
    data?: {
        author: string;
        slug: string;
        title: string;
        viewCount: number;
        thumbnailURL: string;
        createdAt: string;
        durationSeconds: number;
        game: string;
    }[];
}> {
    try {
        const req = await axios.post(
            'https://gql.twitch.tv/gql',
            {
                operationName: 'ClipsCards__User',
                variables: {
                    login: username,
                    limit: limit,
                    criteria: {
                        filter: filter,
                    },
                },
                extensions: {
                    persistedQuery: {
                        version: 1,
                        sha256Hash:
                            'b73ad2bfaecfd30a9e6c28fada15bd97032c83ec77a0440766a56fe0bd632777',
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

        const clipList = (req.data as ResponseObj).data.user.clips.edges.map(
            (clip) => {
                return {
                    author:
                        clip.node.curator !== null
                            ? clip.node.curator.displayName
                                ? clip.node.curator.displayName
                                : clip.node.curator.login
                            : '',
                    slug: clip.node.slug,
                    title: clip.node.title,
                    viewCount: clip.node.viewCount,
                    thumbnailURL: clip.node.thumbnailURL,
                    createdAt: clip.node.createdAt,
                    durationSeconds: clip.node.durationSeconds,
                    game: clip.node.game == null ? '' : clip.node.game.name,
                };
            }
        );
        return {
            valid: true,
            data: clipList,
        };
    } catch (err) {
        console.log(err);
        return { valid: false };
    }
}
