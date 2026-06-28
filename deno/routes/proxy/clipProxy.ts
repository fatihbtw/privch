import { Router, helpers } from 'oak';

export default {
    append(app: Router, userAgent: string, clientId: string) {
        app.get('/clipproxy', async (ctx) => {
            try {
                const { media, sig, token } = helpers.getQuery(ctx, {
                        mergeParams: true,
                    }),
                    req = await fetch(
                        `${media}?sig=${sig}&token=${encodeURIComponent(
                            token
                        )}`,
                        {
                            method: 'GET',
                            headers: {
                                'User-Agent': userAgent,
                                Referer: 'https://player.twitch.tv',
                                Origin: 'https://player.twitch.tv',
                                'Client-ID': clientId,
                            },
                        }
                    );
                if (req.status !== 200) {
                    ctx.response.status = 400;
                    ctx.response.body = { invalid: true };
                    return;
                }

                ctx.response.headers.append('Access-Control-Allow-Origin', '*');
                ctx.response.headers.append('Cache-Control', 'max-age=3600');
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
