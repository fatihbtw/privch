import axios from 'axios';
import { Router, Response, Request } from 'express';

export default {
    append(app: Router, userAgent: string, clientId: string) {
        app.get('/api/urlproxy', async (req, res) => {
            try {
                const { url }: { url?: string } = req.query;

                if (!url || url.length < 1)
                    return res.status(400).json({ invalid: true });

                const fetchFile = await axios.get(url, {
                    responseType: 'stream',
                    headers: {
                        'User-Agent': userAgent,
                        Referer: 'https://player.twitch.tv',
                        Origin: 'https://player.twitch.tv',
                        'Client-ID': clientId,
                    },
                    validateStatus: () => true,
                });

                if (fetchFile.status !== 200)
                    return res.status(400).json({ invalid: true });

                res.setHeader('Cache-Control', 'max-age=3600');
                fetchFile.data.pipe(res);
            } catch (err) {
                console.log(err);
                return res.status(400).send('err');
            }
        });
    },
};
