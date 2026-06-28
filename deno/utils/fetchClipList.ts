const clientId = Deno.env.get('CLIENTID') || 'kimne78kx3ncx6brgo4mv6wki5h1ko',
    userAgent =
        Deno.env.get('USERAGENT') ||
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
        const req = await fetch('https://gql.twitch.tv/gql', {
            method: 'POST',
            body: JSON.stringify({
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
            }),
            headers: {
                'User-Agent': userAgent,
                Referer: 'https://www.twitch.tv/',
                Origin: 'https://www.twitch.tv/',
                'Client-ID': clientId,
            },
        });

        if (req.status !== 200) return { valid: false };

        const { data }: ResponseObj = await req.json();

        if (data.user == null) return { valid: false };

        const clipList = data.user.clips.edges.map((clip) => {
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
        });
        return {
            valid: true,
            data: clipList,
        };
    } catch (err) {
        console.log(err);
        return { valid: false };
    }
}
