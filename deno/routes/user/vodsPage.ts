import { Router, send } from 'oak';

export default {
    append(app: Router) {
        app.get('/videos/:id', async (ctx) => {
            await send(ctx, 'index.html', {
                root: `${Deno.cwd()}/public`,
            });
        });
    },
};
