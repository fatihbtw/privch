import { Router, helpers, send } from 'oak';
import { render as ETARender } from 'eta';
import {
    fetchClipMedia,
    fetchClipMetadata,
} from '../../utils/fetchClipData.ts';

export default {
    append(
        app: Router,
        render: typeof ETARender,
        appversion: string,
        baseUrl: string | undefined,
        templatesPath: string
    ) {
        app.get('/:username/clip/:id', async (ctx) => {
            const { username, id, quality, embed } = helpers.getQuery(ctx, {
                mergeParams: true,
            });
            if (Boolean(embed) == true) {
                const media = await fetchClipMedia(id),
                    metadata = await fetchClipMetadata(
                        username.toLowerCase(),
                        id
                    );

                ctx.response.headers.append('Cache-Control', 'max-age=1200');

                if (media.valid !== true || metadata.valid !== true) {
                    ctx.response.body = render(
                        await Deno.readTextFile(templatesPath + '/clip.eta'),
                        {
                            appversion,
                            invalid: true,
                        }
                    );
                    return;
                }
                const mediaByQuality =
                    media.data.find((x) => x.quality == quality) ||
                    media.data[0];

                ctx.response.body = render(
                    await Deno.readTextFile(templatesPath + '/clip.eta'),
                    {
                        appversion,
                        invalid: false,
                        src: mediaByQuality.src,
                        username: username.toLowerCase(),
                        slug: id,
                        base_url: baseUrl,
                        metadata: metadata.data,
                    }
                );
            } else {
                await send(ctx, 'index.html', {
                    root: `${Deno.cwd()}/public`,
                });
            }
        });
    },
};
