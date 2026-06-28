import { Router, Request, Response } from 'express';
import fetchUserInfo from '../../utils/fetchUserInfo';

export default {
    append(app: Router) {
        app.get('/user/:username', async (req: Request, res: Response) => {
            const data = await fetchUserInfo(
                String(req.params.username).toLowerCase()
            );

            if (data.error !== null) {
                return res.status(500).json(data);
            }

            res.json(data);
        });
    },
};
