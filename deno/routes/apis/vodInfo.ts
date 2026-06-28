import { Router, helpers } from 'oak';
import { fetchAvatar } from '../../utils/fetchStreamInfo.ts';
import {
    fetchCommentByOffset,
    fetchVodMetadata,
} from '../../utils/fetchVodInfo.ts';
import { fetchVods } from '../../utils/fetchVodList.ts';

export default {
    append(app: Router) {
        // VOD info
        app.get('/api/vodinfo/:id', async (ctx) => {
            try {
                const { id } = helpers.getQuery(ctx, { mergeParams: true }),
                    vodInfo = await fetchVodMetadata(id);

                if (vodInfo.valid == false) {
                    ctx.response.status = 400;
                    ctx.response.body = { invalid: true };
                    return;
                }

                const avatar = await fetchAvatar(vodInfo.data.user);

                if (avatar.valid == false) {
                    ctx.response.status = 400;
                    ctx.response.body = { invalid: true };
                    return;
                }

                ctx.response.headers.append('Cache-Control', 'max-age=3600');
                ctx.response.status = 200;
                ctx.response.body = {
                    game: vodInfo.data.game,
                    avatar: avatar.data,
                    title: vodInfo.data.title,
                    username: vodInfo.data.user,
                };
            } catch (err) {
                console.log(err);
                ctx.response.status = 400;
                ctx.response.body = 'err';
                return;
            }
        });
        // VOD comments
        app.get('/api/vodinfo/comments/:id/:offset', async (ctx) => {
            try {
                const { id, offset } = helpers.getQuery(ctx, {
                        mergeParams: true,
                    }),
                    comments = await fetchCommentByOffset(id, offset);

                if (comments.valid == false) {
                    ctx.response.status = 400;
                    ctx.response.body = { invalid: true };
                    return;
                }

                ctx.response.headers.append('Cache-Control', 'max-age=3600');
                ctx.response.status = 200;
                ctx.response.body = comments;
            } catch (err) {
                console.log(err);
                ctx.response.status = 400;
                ctx.response.body = 'err';
                return;
            }
        });
        // VOD list
        app.get('/api/vods/:username/:filter/:limit', async (ctx) => {
            try {
                const { username, limit, filter } = helpers.getQuery(ctx, {
                        mergeParams: true,
                    }),
                    vodList = await fetchVods(
                        username.toLowerCase(),
                        Number(limit),
                        filter
                    );

                if (vodList.valid == false) {
                    ctx.response.status = 400;
                    ctx.response.body = { invalid: true };
                    return;
                }

                ctx.response.headers.append('Cache-Control', 'max-age=1800');
                ctx.response.status = 200;
                ctx.response.body = {
                    vods: vodList.data,
                };
            } catch (err) {
                console.log(err);
                ctx.response.status = 400;
                ctx.response.body = 'err';
                return;
            }
        });
    },
};
