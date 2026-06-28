import { Router, Response, Request } from 'express';
import fetchVodMedia from '../../utils/fetchVodMedia';

export default {
    append(app: Router) {
        // VOD proxy
        app.get('/vod/:id', async (req: Request, res: Response) => {
            try {
                const { id } = req.params,
                    { quality }: { quality?: string } = req.query,
                    media = await fetchVodMedia(
                        String(id),
                        Number(quality || 720)
                    );

                if (media.error !== false) {
                    res.status(500).json({
                        error: true,
                        data: null,
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
                return;
            }
        });
    },
};
