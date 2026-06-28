import { Router, Response, Request } from 'express';
import { join } from 'path';

export default {
    append(app: Router) {
        app.get('/:username', async (req, res) => {
            res.sendFile(join(process.cwd(), 'public', 'index.html'));
        });
    },
};
