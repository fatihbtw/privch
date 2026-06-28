import { Router, helpers } from 'oak';
import {
    fetchClipMedia,
    fetchClipMetadata,
} from '../../utils/fetchClipData.ts';
import { fetchClips } from '../../utils/fetchClipList.ts';

export default {
    append(app: Router) {
        // Clip info
        app.get('/api/clipinfo/:username/:id', async (ctx) => {
            try {
                const { id, username } = helpers.getQuery(ctx, {
                        mergeParams: true,
                    }),
                    metadata = await fetchClipMetadata(
                        username.toLowerCase(),
                        id
                    ),
                    media = await fetchClipMedia(id);

                if (metadata.valid == false || media.valid == false) {
                    ctx.response.status = 400;
                    ctx.response.body = { invalid: true };
                    return;
                }

                ctx.response.status = 200;
                ctx.response.headers.append('Cache-Control', 'max-age=3600');
                ctx.response.body = {
                    metadata: metadata.data,
                    media: media.data,
                };
            } catch (err) {
                console.log(err);
                ctx.response.status = 400;
                ctx.response.body = 'err';
                return;
            }
        });
        // Clip list
        app.get('/api/clips/:username/:filter/:limit', async (ctx) => {
            try {
                const { username, filter, limit } = helpers.getQuery(ctx, {
                        mergeParams: true,
                    }),
                    clipList = await fetchClips(
                        username.toLowerCase(),
                        filter,
                        Number(limit)
                    );

                if (clipList.valid == false) {
                    ctx.response.status = 400;
                    ctx.response.body = { invalid: true };
                    return;
                }

                ctx.response.status = 200;
                ctx.response.body = { clips: clipList.data };
            } catch (err) {
                console.log(err);
                ctx.response.status = 400;
                ctx.response.body = 'err';
                return;
            }
        });
    },
};
