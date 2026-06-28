import { Router, helpers } from 'oak';
import fetchMedia from '../../utils/fetchMedia.ts';

export default {
    append(app: Router, userAgent: string, clientId: string) {
        app.get('/stream/:username', async (ctx) => {
            try {
                const { username, quality, proxy, url } = helpers.getQuery(
                    ctx,
                    {
                        mergeParams: true,
                    }
                );

                if (username == 'urlproxy') {
                    if (!url || url.length < 1) {
                        ctx.response.status = 400;
                        ctx.response.body = { invalid: true };
                        return;
                    }

                    const req = await fetch(url, {
                        method: 'GET',
                        headers: {
                            'User-Agent': userAgent,
                            Referer: 'https://player.twitch.tv',
                            Origin: 'https://player.twitch.tv',
                            'Client-ID': clientId,
                        },
                    });

                    if (req.status !== 200) {
                        ctx.response.status = 400;
                        ctx.response.body = { invalid: true };
                        return;
                    }
                    ctx.response.headers.append(
                        'Access-Control-Allow-Origin',
                        '*'
                    );
                    ctx.response.headers.append(
                        'Cache-Control',
                        'max-age=3600'
                    );
                    ctx.response.status = req.status;
                    ctx.response.body = req.body;
                    return;
                }

                const mediaFetch = await fetchMedia(
                    username.toLowerCase(),
                    false,
                    Boolean(proxy)
                );

                if (mediaFetch.valid == false) {
                    ctx.response.status = 400;
                    ctx.response.body = { invalid: true };
                    return;
                }
                const media: {
                        artist: string;
                        title: string;
                        file: string;
                    } = mediaFetch.data.filter((x) =>
                        x.title.includes(quality || '1280x720')
                    )[0],
                    req = await fetch(media.file, {
                        method: 'GET',
                        headers: {
                            'User-Agent': userAgent,
                            Referer: 'https://player.twitch.tv',
                            Origin: 'https://player.twitch.tv',
                            'Client-ID': clientId,
                        },
                    });

                if (req.status !== 200) {
                    ctx.response.status = 400;
                    ctx.response.body = { invalid: true };
                    return;
                }
                ctx.response.headers.append('Access-Control-Allow-Origin', '*');
                ctx.response.headers.append(
                    'Content-Type',
                    'application/x-mpegURL'
                );
                ctx.response.status = req.status;
                ctx.response.body = req.body;
            } catch (err) {
                console.log(err);
                ctx.response.status = 400;
                ctx.response.body = 'err';
                return;
            }
        });
    },
};
