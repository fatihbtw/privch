import { Router, send } from 'oak';
import { render, configure } from 'eta';
// Apis
import vodInfo from './routes/apis/vodInfo.ts';
import streamInfo from './routes/apis/streamInfo.ts';
import clipsInfo from './routes/apis/clipsInfo.ts';
// Proxy
import vodProxy from './routes/proxy/vodProxy.ts';
import streamProxy from './routes/proxy/streamProxy.ts';
import clipProxy from './routes/proxy/clipProxy.ts';
import urlProxy from './routes/proxy/urlProxy.ts';
// User
import vodsPage from './routes/user/vodsPage.ts';
import streamPage from './routes/user/streamPage.ts';
import clipsPage from './routes/user/clipsPage.ts';

const router = new Router(),
    clientId = Deno.env.get('CLIENTID') || 'kimne78kx3ncx6brgo4mv6wki5h1ko',
    userAgent =
        Deno.env.get('USERAGENT') ||
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36',
    Cache: { [key: string]: string } = {},
    appversion = '0.2.8',
    root = `${Deno.cwd()}/public`,
    templatesPath = `${Deno.cwd()}/templates`,
    baseUrl = Deno.env.get('INSTANCE_URL') || undefined;

configure({
    cache: true,
    views: templatesPath,
    autoEscape: true,
});

router.get('/', async (ctx) => {
    await send(ctx, 'index.html', {
        root: `${Deno.cwd()}/public`,
    });
});

clipsInfo.append(router);
streamInfo.append(router);
vodInfo.append(router);

vodProxy.append(router, userAgent, clientId, Cache);
streamProxy.append(router, userAgent, clientId);
clipProxy.append(router, userAgent, clientId);
urlProxy.append(router, userAgent, clientId);

clipsPage.append(router, render, appversion, baseUrl, templatesPath);
streamPage.append(router);
vodsPage.append(router);

// static files
router.get('/:file', async (ctx) => {
    if (ctx.request.url.pathname.match(/\.(css|js|svg|woff|woff2|png)$/)) {
        await ctx.send({ root });
    }
});

router.get('/assets/:file', async (ctx) => {
    if (ctx.request.url.pathname.match(/\.(css|js|svg|woff|woff2|png)$/)) {
        await ctx.send({ root });
    }
});

export default router;
