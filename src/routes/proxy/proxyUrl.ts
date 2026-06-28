import axios from 'axios';
import { Router, Request, Response } from 'express';
import stripTwitchAds from '../../utils/stripTwitchAds';

export default {
    append(app: Router, userAgent: string, clientId: string) {
        app.get('/proxy', async (req: Request, res: Response) => {
            try {
                const { url } = req.query;

                if (!url) {
                    res.status(400).send('No url provided.');
                    return;
                }

                const decodedUrl = Buffer.from(String(url), 'base64').toString(
                        'utf8'
                    ),
                    isPlaylist = /\.m3u8(\?|$)/.test(decodedUrl),
                    headers = {
                        'User-Agent': userAgent,
                        Referer: 'https://www.twitch.tv',
                        Origin: 'https://www.twitch.tv',
                        'Client-ID': clientId,
                    };

                if (isPlaylist) {
                    const playlistReq = await axios.get(decodedUrl, {
                        responseType: 'text',
                        headers,
                        validateStatus: () => true,
                    });

                    if (playlistReq.status !== 200) {
                        res.status(playlistReq.status).send(
                            'Error fetching resource'
                        );
                        return;
                    }

                    res.setHeader(
                        'Content-Type',
                        'application/vnd.apple.mpegurl'
                    );
                    res.status(200).send(
                        stripTwitchAds(String(playlistReq.data))
                    );
                    return;
                }

                const urlReq = await axios.get(decodedUrl, {
                    responseType: 'stream',
                    headers,
                    validateStatus: () => true,
                });

                if (urlReq.status !== 200) {
                    res.setHeader(
                        'Content-Type',
                        String(
                            urlReq.headers['content-type'] ||
                                urlReq.headers['Content-Type']
                        )
                    );
                    res.status(urlReq.status).send('Error fetching resource');
                    return;
                }
                if (
                    urlReq.headers['Cache-Control'] !== undefined ||
                    urlReq.headers['cache-control'] !== undefined
                ) {
                    res.setHeader(
                        'Cache-Control',
                        String(
                            urlReq.headers['Cache-Control'] ||
                                urlReq.headers['cache-control']
                        )
                    );
                }
                res.setHeader(
                    'Content-Type',
                    String(
                        urlReq.headers['content-type'] ||
                            urlReq.headers['Content-Type']
                    )
                );
                res.status(urlReq.status);
                urlReq.data.pipe(res);
            } catch (err) {
                res.status(500).json({
                    error: true,
                    message: err.message,
                });
            }
        });
    },
};
