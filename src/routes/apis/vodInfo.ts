import { Router, Response, Request } from 'express';
import { fetchAvatar } from '../../utils/fetchStreamInfo';
import {
    fetchCommentByOffset,
    fetchName,
    fetchVodMetadata,
} from '../../utils/fetchVodInfo';
import { fetchVods } from '../../utils/fetchVodList';

export default {
    append(app: Router) {
        // VOD details
        app.get('/api/vodinfo/:id', async (req: Request, res: Response) => {
            try {
                const { id } = req.params,
                    vodInfo = await fetchVodMetadata(id);

                if (vodInfo.valid == false)
                    return res.status(400).json({ invalid: true });

                const loginName = await fetchName(id);

                if (loginName.valid == false)
                    return res.status(400).json({ invalid: true });

                const avatar = await fetchAvatar(loginName.data);

                if (avatar.valid == false)
                    return res.status(400).json({ invalid: true });

                res.setHeader('Cache-Control', 'max-age=3600');
                res.json({
                    game: vodInfo.data.game,
                    avatar: avatar.data,
                    title: vodInfo.data.title,
                    username: vodInfo.data.user,
                    loginName: loginName.data,
                });
            } catch (err) {
                console.log(err);
                return res.status(400).send('err');
            }
        });
        // VOD comments
        app.get(
            '/api/vodinfo/comments/:id/:offset',
            async (req: Request, res: Response) => {
                try {
                    const { id, offset } = req.params,
                        comments = await fetchCommentByOffset(id, offset);

                    if (comments.valid == false)
                        return res.status(400).json({ invalid: true });

                    res.setHeader('Cache-Control', 'max-age=3600');
                    res.json(comments);
                } catch (err) {
                    console.log(err);
                    return res.status(400).send('err');
                }
            }
        );
        // VOD list
        app.get('/api/vods/:username/:filter/:limit', async (req, res) => {
            const { username, limit, filter } = req.params,
                vodList = await fetchVods(
                    username.toLowerCase(),
                    Number(limit),
                    filter
                );

            if (vodList.valid == false)
                return res.status(400).json({ invalid: true });

            res.setHeader('Cache-Control', 'max-age=1800');
            res.json({
                vods: vodList.data,
            });
        });
    },
};
