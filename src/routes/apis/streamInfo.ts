import { Router, Response, Request } from 'express';
import {
    fetchAvatar,
    fetchCategoryInfo,
    fetchSuggestedChannels,
    fetchTitle,
    fetchTrendingStreams,
    fetchViewCount,
} from '../../utils/fetchStreamInfo';
import { fetchStreamerInfo } from '../../utils/fetchStreamerInfo';

export default {
    append(app: Router) {
        // Stream info
        app.get(
            '/api/streaminfo/:username',
            async (req: Request, res: Response) => {
                try {
                    const { username }: { username?: string } = req.params,
                        categoryInfo = await fetchCategoryInfo(
                            username.toLowerCase()
                        ),
                        avatar = await fetchAvatar(username.toLowerCase()),
                        title = await fetchTitle(username.toLowerCase());

                    if (
                        categoryInfo.valid == false ||
                        avatar.valid == false ||
                        title.valid == false
                    )
                        return res.status(400).json({ invalid: true });

                    const viewsCount = await fetchViewCount(
                        categoryInfo.data.userid
                    );

                    if (viewsCount.valid == false)
                        return res.status(400).json({ invalid: true });

                    res.json({
                        views: viewsCount.data,
                        game: categoryInfo.data.gamename,
                        avatar: avatar.data,
                        title: title.data,
                    });
                } catch (err) {
                    console.log(err);
                    return res.status(400).send('err');
                }
            }
        );
        // Suggested channels (same category as the current streamer)
        app.get(
            '/api/suggestions/:username',
            async (req: Request, res: Response) => {
                try {
                    const { username }: { username?: string } = req.params,
                        categoryInfo = await fetchCategoryInfo(
                            username.toLowerCase()
                        );

                    if (categoryInfo.valid == false)
                        return res.status(400).json({ invalid: true });

                    const suggestions = await fetchSuggestedChannels(
                        categoryInfo.data.gamename,
                        username
                    );

                    if (suggestions.valid == false)
                        return res.status(400).json({ invalid: true });

                    res.setHeader('Cache-Control', 'max-age=60');
                    res.json({ data: suggestions.data });
                } catch (err) {
                    console.log(err);
                    return res.status(400).send('err');
                }
            }
        );
        // Trending streams (Explore page)
        app.get('/api/trending', async (req: Request, res: Response) => {
            const limit = Math.min(
                Math.max(Number(req.query.limit) || 20, 1),
                50
            );
            const trending = await fetchTrendingStreams(limit);

            if (trending.valid == false)
                return res.status(400).json({ invalid: true });

            res.setHeader('Cache-Control', 'max-age=60');
            res.json({ invalid: false, streams: trending.data });
        });
        // Streamer info
        app.get('/api/streamer/:username', async (req, res) => {
            const { username } = req.params,
                streamerInfo = await fetchStreamerInfo(username.toLowerCase());

            if (streamerInfo.valid == false)
                return res.status(400).json({ invalid: true });

            res.setHeader('Cache-Control', 'max-age=3600');
            res.json(streamerInfo.data);
        });
    },
};
