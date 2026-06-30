import { Component, createSignal, For, Show } from 'solid-js';
import axios from 'axios';
import Nav from './components/nav';
import { useNavigate } from '@solidjs/router';
import { t } from './utils/i18n';

const clipRegex = /(.+)?twitch\.tv\/\w+\/clip\/[\w-]+/,
    streamRegex = /(.+)?twitch\.tv\/(.+)/,
    vodRegex = /(.+)?twitch\.tv\/videos\/(\d+)/,
    twitchDomainRegex = /(.+)?twitch\.tv/;

interface TrendingStream {
    login: string;
    displayName: string;
    thumbnail: string;
    viewers: number;
    game: string | null;
}

const Home: Component = () => {
    const [inputVal, setInputVal] = createSignal(''),
        [selectedRes, setRes] = createSignal(''),
        [useProxy, setProxyStatus] = createSignal(false),
        [favoritesReady, setFavoritesReady] = createSignal(false),
        [favoritesList, setFavoritesList] = createSignal<
            { displayName: string; avatar: string; live: boolean }[]
        >([]),
        [trendingReady, setTrendingReady] = createSignal(false),
        [trending, setTrending] = createSignal<TrendingStream[]>([]),
        redirect = useNavigate(),
        baseUrl = window.location.origin,
        showFavorites = localStorage.getItem('privch_homepage') === 'favorites',
        favoriteLogins: string[] = showFavorites
            ? JSON.parse(localStorage.getItem('favorites') || '[]')
            : [];

    if (favoriteLogins.length > 0) {
        (async () => {
            const results = await Promise.all(
                favoriteLogins.map(async (ch) => {
                    const res = await axios.get(`${baseUrl}/api/user/${ch}`, {
                        validateStatus: () => true,
                    });
                    return res.data?.error == null ? res.data.data : null;
                })
            );

            setFavoritesList(
                results
                    .filter(
                        (
                            ch
                        ): ch is {
                            displayName: string;
                            avatar: string;
                            live: boolean;
                        } => ch != null
                    )
                    .sort((a, b) => Number(b.live) - Number(a.live))
            );
            setFavoritesReady(true);
        })();
    }

    (async () => {
        const res = await axios.get(`${baseUrl}/api/trending?limit=12`, {
            validateStatus: () => true,
        });

        if (res.status === 200 && res.data?.invalid !== true) {
            setTrending(res.data.streams);
        }
        setTrendingReady(true);
    })();

    function handleSearch() {
        if (inputVal().length < 1) return;
        let queryArgs: { [key: string]: string | boolean } = {};

        if (selectedRes().length > 1) queryArgs['quality'] = selectedRes();

        const resultQuery =
            '?' +
            Object.keys(queryArgs)
                .map((key) => {
                    return `${key}=${queryArgs[key]}`;
                })
                .join('&');

        if (
            inputVal().match(clipRegex) ||
            inputVal().match(streamRegex) ||
            inputVal().match(vodRegex)
        ) {
            redirect(
                `${inputVal().replace(twitchDomainRegex, '')}${resultQuery}`,
                {
                    replace: false,
                    scroll: true,
                }
            );
        } else if (!Number.isNaN(Number(inputVal()))) {
            redirect(`/videos/${inputVal()}${resultQuery}`, {
                replace: false,
                scroll: true,
            });
        } else
            redirect(`/${inputVal()}${resultQuery}`, {
                replace: false,
                scroll: true,
            });
    }

    return (
        <>
            <Nav isHome={false} />
            <title>Privch - Home</title>
            <Show when={showFavorites && favoriteLogins.length > 0}>
                <div class="container mx-auto px-10 mt-10">
                    <h2 class="text-lg font-semibold mb-2">
                        {t('home.yourFavorites')}
                    </h2>
                    <Show when={!favoritesReady()}>
                        <span class="loading loading-spinner loading-sm text-secondary"></span>
                    </Show>
                    <Show when={favoritesReady()}>
                        <div class="flex flex-wrap gap-2">
                            <For each={favoritesList()}>
                                {(channel) => (
                                    <a
                                        href={`/${channel.displayName}`}
                                        class="flex items-center gap-2 bg-base-200 hover:bg-base-300 rounded-full pl-1 pr-3 py-1"
                                    >
                                        <img
                                            class="rounded-full w-8 h-8"
                                            src={`${baseUrl}/api/proxy?url=${btoa(
                                                channel.avatar
                                            )}`}
                                        />
                                        <span>{channel.displayName}</span>
                                        <span
                                            class={`badge badge-sm ${
                                                channel.live
                                                    ? 'badge-error'
                                                    : 'badge-ghost'
                                            }`}
                                        >
                                            {channel.live
                                                ? t('common.live')
                                                : t('common.offline')}
                                        </span>
                                    </a>
                                )}
                            </For>
                        </div>
                    </Show>
                </div>
            </Show>
            <div
                class={`flex justify-center items-center ${
                    showFavorites && favoriteLogins.length > 0
                        ? 'mt-10'
                        : 'mt-32'
                }`}
            >
                <div class="m-auto">
                    <div class="form-control w-full max-w-xs">
                        <label class="label">
                            <span class="label-text">
                                {t('home.searchLabel')}
                            </span>
                        </label>
                        <input
                            type="text"
                            placeholder={t('home.placeholder')}
                            class="input input-bordered w-full max-w-xs"
                            value={inputVal()}
                            onInput={(e) => setInputVal(e.currentTarget.value)}
                        />
                        <details class="mt-2 rounded-md border border-base-200 px-4 py-2">
                            <summary>{t('home.advanced')}</summary>
                            <select
                                onchange={(e) => setRes(e.target.value)}
                                class="select select-bordered w-full max-w-xs mt-1"
                            >
                                <option disabled selected>
                                    {t('home.resolution')}
                                </option>
                                <option value="1080">1920x1080</option>
                                <option value="720">1280x720</option>
                                <option value="480">852x480</option>
                                <option value="360">640x360</option>
                                <option value="160">284x160</option>
                            </select>
                        </details>

                        <button
                            class="btn btn-secondary mt-2"
                            onClick={handleSearch}
                        >
                            {t('home.searchButton')}
                        </button>
                    </div>
                </div>
            </div>
            <Show when={trendingReady() && trending().length > 0}>
                <div class="container mx-auto px-10 mt-16 mb-16">
                    <div class="flex items-center justify-between mb-3">
                        <h2 class="text-lg font-semibold">
                            {t('home.trendingNow')}
                        </h2>
                        <a
                            href="/explore"
                            class="text-sm text-secondary hover:underline"
                        >
                            {t('home.seeAll')}
                        </a>
                    </div>
                    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        <For each={trending()}>
                            {(stream) => (
                                <a
                                    href={`/${stream.login}`}
                                    class="bg-base-200 hover:bg-base-300 rounded-md overflow-hidden"
                                >
                                    <div
                                        class="bg-cover bg-center h-24"
                                        style={{
                                            'background-image': `url('${baseUrl}/api/proxy?url=${btoa(
                                                stream.thumbnail
                                            )}')`,
                                        }}
                                    />
                                    <div class="p-2">
                                        <div class="text-sm font-semibold truncate">
                                            {stream.displayName}
                                        </div>
                                        <div class="flex justify-between items-center text-xs text-base-content/60 mt-1">
                                            <span class="truncate">
                                                {stream.game ?? ''}
                                            </span>
                                            <span class="badge badge-error badge-xs shrink-0">
                                                {stream.viewers.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </a>
                            )}
                        </For>
                    </div>
                </div>
            </Show>
        </>
    );
};

export default Home;
