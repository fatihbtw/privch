import { Router, Response, Request } from 'express';
import { fetchClipMedia, fetchClipMetadata } from '../../utils/fetchClipData';
import { fetchClips } from '../../utils/fetchClipList';

export default {
    append(app: Router) {
        // Clip info
        app.get(
            '/api/clipinfo/:username/:id',
            async (req: Request, res: Response) => {
                const { username, id } = req.params,
                    metadata = await fetchClipMetadata(
                        username.toLowerCase(),
                        id
                    ),
                    media = await fetchClipMedia(id);
                if (metadata.valid == false || media.valid == false)
                    return res.status(400).json({ invalid: true });

                res.setHeader('Cache-Control', 'max-age=3600');
                res.json({
                    metadata: metadata.data,
                    media: media.data,
                });
            }
        );
        // Clips list
        app.get('/api/clips/:username/:filter/:limit', async (req, res) => {
            const { username, filter, limit } = req.params,
                clipList = await fetchClips(
                    username.toLowerCase(),
                    filter,
                    Number(limit)
                );

            if (clipList.valid == false)
                return res.status(400).json({ invalid: true });

            res.json({ clips: clipList.data });
        });
    },
};
