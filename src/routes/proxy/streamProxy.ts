import { Router, Response, Request } from 'express';
import fetchStreamMedia from '../../utils/fetchStreamMedia';

export default {
    append(app: Router) {
        app.get('/stream/:username', async (req: Request, res: Response) => {
            try {
                const media = await fetchStreamMedia(
                    String(req.params.username).toLowerCase(),
                    Number(req.query.quality || 720)
                );

                if (media.error !== false) {
                    res.status(500).json({
                        error: true,
                        data: media.data,
                    });
                    return;
                }

                res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
                res.send(media.data);
            } catch (err) {
                res.status(500).json({
                    error: true,
                    data: null,
                    message: err.message,
                });
            }
        });
    },
};
