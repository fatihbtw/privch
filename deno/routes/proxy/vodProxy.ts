import { Router, helpers } from 'oak';
import fetchMedia from '../../utils/fetchMedia.ts';

export default {
    append(
        app: Router,
        userAgent: string,
        clientId: string,
        Cache: { [key: string]: string }
    ) {
        app.get('/vod/:id/:end?', async (ctx) => {
            try {
                const { id, end, quality, proxy } = helpers.getQuery(ctx, {
                    mergeParams: true,
                });

                ctx.response.headers.append('Access-Control-Allow-Origin', '*');

                const cacheID = quality
                    ? proxy
                        ? `${id}-${quality}-${proxy}`
                        : `${id}-${quality}`
                    : proxy
                    ? `${id}-${proxy}`
                    : `${id}`;

                if (end?.endsWith('.ts')) {
                    if (!(cacheID in Cache)) {
                        ctx.response.status = 403;
                        ctx.response.body = 'Unknow';
                        return;
                    }

                    const req = await fetch(`${Cache[`${cacheID}`]}${end}`, {
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

                    ctx.response.status = req.status;
                    ctx.response.body = req.body;
                    return;
                }

                const mediaFetch = await fetchMedia(id, true, Boolean(proxy));

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
                )[0];

                // set or refresh urls
                Cache[cacheID] = `${media.file.match(/https\:\/\/(.*)\//)[0]}`;

                const req = await fetch(media.file, {
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
                    'Content-Type',
                    'application/x-mpegURL'
                );
                ctx.response.status = req.status;
                ctx.response.body = req.body;
                return;
            } catch (err) {
                console.log(err);
                ctx.response.status = 400;
                ctx.response.body = 'err';
                return;
            }
        });
    },
};
