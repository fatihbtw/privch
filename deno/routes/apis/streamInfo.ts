import { Router, helpers } from 'oak';
import {
    fetchCategoryInfo,
    fetchAvatar,
    fetchTitle,
    fetchViewCount,
} from '../../utils/fetchStreamInfo.ts';
import { fetchStreamerInfo } from '../../utils/fetchStreamerInfo.ts';

export default {
    append(app: Router) {
        // Stream Info
        app.get('/api/streaminfo/:username', async (ctx) => {
            try {
                const { username } = helpers.getQuery(ctx, {
                        mergeParams: true,
                    }),
                    categoryInfo = await fetchCategoryInfo(
                        username.toLowerCase()
                    ),
                    avatar = await fetchAvatar(username.toLowerCase()),
                    title = await fetchTitle(username.toLowerCase());

                if (
                    categoryInfo.valid == false ||
                    avatar.valid == false ||
                    title.valid == false
                ) {
                    ctx.response.status = 400;
                    ctx.response.body = { invalid: true };
                    return;
                }

                const viewsCount = await fetchViewCount(
                    categoryInfo.data.userid
                );

                if (viewsCount.valid == false) {
                    ctx.response.status = 400;
                    ctx.response.body = { invalid: true };
                    return;
                }

                ctx.response.status = 200;
                ctx.response.body = {
                    views: viewsCount.data,
                    game: categoryInfo.data.gamename,
                    avatar: avatar.data,
                    title: title.data,
                };
            } catch (err) {
                console.log(err);
                ctx.response.status = 400;
                ctx.response.body = 'err';
                return;
            }
        });
        // Streamer info
        app.get('/api/streamer/:username', async (ctx) => {
            try {
                const { username } = helpers.getQuery(ctx, {
                        mergeParams: true,
                    }),
                    streamerInfo = await fetchStreamerInfo(
                        username.toLowerCase()
                    );

                if (streamerInfo.valid == false) {
                    ctx.response.status = 400;
                    ctx.response.body = { invalid: true };
                    return;
                }

                ctx.response.headers.append('Cache-Control', 'max-age=3600');
                ctx.response.status = 200;
                ctx.response.body = streamerInfo.data;
            } catch (err) {
                console.log(err);
                ctx.response.status = 400;
                ctx.response.body = 'err';
                return;
            }
        });
    },
};
