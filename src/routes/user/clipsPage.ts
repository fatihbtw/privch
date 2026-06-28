import { Router, Response, Request } from 'express';
import { fetchClipMedia, fetchClipMetadata } from '../../utils/fetchClipData';
import { join } from 'path';

export default {
    append(app: Router, baseUrl: string) {
        app.get('/:username/clip/:id', async (req, res) => {
            const { quality, embed } = req.query;

            if (Boolean(embed) == true) {
                const { username, id } = req.params,
                    media = await fetchClipMedia(id),
                    metadata = await fetchClipMetadata(
                        username.toLowerCase(),
                        id
                    );

                res.setHeader('Cache-Control', 'max-age=1200');

                if (media.valid !== true || metadata.valid !== true) {
                    res.render('clip', {
                        invalid: true,
                    });
                    return;
                }
                const mediaByQuality =
                    media.data.find((x) => x.quality == quality) ||
                    media.data[0];

                res.render('clip', {
                    invalid: false,
                    src: mediaByQuality.src,
                    username: username.toLowerCase(),
                    slug: id,
                    metadata: metadata.data,
                    base_url: baseUrl,
                });
            } else res.sendFile(join(process.cwd(), 'public', 'index.html'));
        });
    },
};
