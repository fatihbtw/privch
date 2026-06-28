import axios from 'axios';
import { Router, Response, Request } from 'express';

export default {
    append(app: Router, userAgent: string, clientId: string) {
        // Clip proxy
        app.get(
            '/clipproxy/:media/:sig/:token',
            async (req: Request, res: Response) => {
                try {
                    const { media, sig, token } = req.params,
                        pipereq = await axios.get(
                            `${decodeURIComponent(
                                media
                            )}?sig=${sig}&token=${encodeURIComponent(token)}`,
                            {
                                responseType: 'stream',
                                headers: {
                                    'User-Agent': userAgent,
                                    Referer: 'https://player.twitch.tv',
                                    Origin: 'https://player.twitch.tv',
                                    'Client-ID': clientId,
                                },
                                validateStatus: () => true,
                            }
                        );
                    if (pipereq.status !== 200)
                        return res.status(400).json({ invalid: true });

                    res.setHeader('Access-Control-Allow-Origin', '*');
                    res.setHeader('Cache-Control', 'max-age=3600');

                    pipereq.data.pipe(res);
                } catch (err) {
                    console.log(err);
                    return res.status(400).send('err');
                }
            }
        );
    },
};
