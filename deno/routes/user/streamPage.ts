import { Router, helpers, send } from 'oak';

export default {
    append(app: Router) {
        app.get('/:username', async (ctx) => {
            const { username } = helpers.getQuery(ctx, {
                mergeParams: true,
            });

            if (!username.match(/^[a-zA-Z0-9]+$/)) {
                return;
            }

            await send(ctx, 'index.html', {
                root: `${Deno.cwd()}/public`,
            });
        });
    },
};
