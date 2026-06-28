import { Router, Response, Request } from 'express';
import fetchChannelEmoteList from '../../utils/fetchEmotes';

export default {
    append(app: Router) {
        app.get(
            '/api/emotes/:username',
            async (req: Request, res: Response) => {
                const { username } = req.params,
                    emoteList = await fetchChannelEmoteList(username);

                if (emoteList.error !== null) {
                    return res.status(400).json(emoteList.error);
                }

                res.setHeader('Cache-Control', 'max-age=3600, public');
                res.json({
                    data: emoteList.data,
                });
            }
        );
    },
};
