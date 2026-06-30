import { Component, Show, createSignal } from 'solid-js';
import axios from 'axios';
import { clipsApiResponse } from './utils/types';
import Nav from './components/nav';
import { A, useParams } from '@solidjs/router';
import formatTimeAgo from './utils/formatTimeAgo';
import { t } from './utils/i18n';

const Clips: Component = () => {
    const instanceBaseUrl = window.location.origin,
        { username, slug } = useParams(),
        [isValid, setClipStatus] = createSignal<boolean>(),
        [clipData, setClipData] = createSignal<clipsApiResponse>(),
        [isReady, setReadyStatus] = createSignal<boolean>(false);

    (async () => {
        const req = await axios.get(
                `${instanceBaseUrl}/api/clipinfo/${username}/${slug}`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    validateStatus(status) {
                        return true;
                    },
                }
            ),
            data = req.data as clipsApiResponse;

        if (data.invalid == true) {
            setClipStatus(false);
            setReadyStatus(true);
            return;
        }
        setClipData(data);
        setClipStatus(true);
        setReadyStatus(true);
    })();

    return (
        <>
            <Nav isHome={false} />
            <Show when={isReady() == false}>
                <div class="flex justify-center items-center h-screen flex-col">
                    <span class="loading loading-spinner text-secondary"></span>
                    {t('common.loading')}
                </div>
            </Show>
            <Show when={isReady() == true}>
                <Show when={isValid() == false}>
                    <title>{t('clips.notFoundTitle')}</title>
                    <div class="container max-auto my-auto px-5 py-10">
                        <div class="border border-base-200 rounded-lg p-6 mt-3 ml-5">
                            <h1 class="font-semibold text-2xl">
                                {t('clips.notFoundTitle')}
                            </h1>
                            <p>{t('clips.notFoundDesc')}</p>
                        </div>
                    </div>
                </Show>
                <Show when={isValid() == true}>
                    <title>Clip {clipData()?.metadata!.title}</title>
                    <div class="container max-auto my-auto px-5 py-10">
                        <div class="flex justify-center">
                            <div class="rounded-md w-auto sm:w-1/2">
                                <video
                                    class="h-auto w-auto"
                                    controls
                                    src={`${instanceBaseUrl}${
                                        clipData()?.media![0]?.src
                                    }`}
                                />
                                <div>
                                    <a
                                        class="text-indigo-400"
                                        href={`${instanceBaseUrl}/${username}/clip/${slug}?embed=true`}
                                    >
                                        {t('clips.embeddedLink')}
                                    </a>
                                    <br />
                                    <span class="italic">
                                        {t('clips.created')}{' '}
                                        {formatTimeAgo(
                                            clipData()?.metadata!.date!
                                        )}
                                    </span>
                                    <h2 class="font-semibold text-xl">
                                        {clipData()?.metadata!.title}
                                    </h2>
                                    <span class="text-indigo-400">
                                        {clipData()?.metadata!.game}
                                    </span>
                                    <br />
                                    <span>
                                        {t('clips.by')}{' '}
                                        {clipData()?.metadata!.author} -{' '}
                                        {clipData()?.metadata!.views}{' '}
                                        {t('clips.views')}
                                    </span>
                                    <br />
                                    <A
                                        class="flex flex-row"
                                        href={`/${username}`}
                                    >
                                        <img
                                            class="w-8 rounded-full"
                                            id="avatar"
                                            src={`${instanceBaseUrl}/api/urlproxy?url=${clipData()
                                                ?.metadata!.avatar!}`}
                                        />
                                        <span class="ml-1">{username}</span>
                                    </A>
                                </div>
                            </div>
                        </div>
                    </div>
                </Show>
            </Show>
        </>
    );
};

export default Clips;
