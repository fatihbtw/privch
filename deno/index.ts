import { Application } from 'oak';
import router from './router.ts';

const app = new Application();

app.use(router.routes());
app.use(router.allowedMethods());

app.addEventListener('listen', ({ port }) => {
    console.log(`Server started at port ${port}`);
});

await app.listen({
    port: Number(Deno.env.get('PORT')) || 3000,
});
