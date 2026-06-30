import { Component, createSignal, For, Show } from 'solid-js';
import axios from 'axios';
import Nav from './components/nav';
import { useNavigate } from '@solidjs/router';

const clipRegex = /(.+)?twitch\.tv\/\w+\/clip\/[\w-]+/,
    streamRegex = /(.+)?twitch\.tv\/(.+)/,
    vodRegex = /(.+)?twitch\.tv\/videos\/(\d+)/,
    twitchDomainRegex = /(.+)?twitch\.tv/;

const Home: Component = () => {
    const [inputVal, setInputVal] = createSignal(''),
        [selectedRes, setRes] = createSignal(''),
        [useProxy, setProxyStatus] = createSignal(false),
        [favoritesReady, setFavoritesReady] = createSignal(false),
        [favoritesList, setFavoritesList] = createSignal<
            { displayName: string; avatar: string; live: boolean }[]
        >([]),
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
                    <h2 class="text-lg font-semibold mb-2">Deine Favoriten</h2>
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
                                            {channel.live ? 'Live' : 'Offline'}
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
                            <span class="label-text">Search</span>
                        </label>
                        <input
                            type="text"
                            placeholder="URL, name, vod, clip..."
                            class="input input-bordered w-full max-w-xs"
                            value={inputVal()}
                            onInput={(e) => setInputVal(e.currentTarget.value)}
                        />
                        <details class="mt-2 rounded-md border border-base-200 px-4 py-2">
                            <summary>Advanced</summary>
                            <select
                                onchange={(e) => setRes(e.target.value)}
                                class="select select-bordered w-full max-w-xs mt-1"
                            >
                                <option disabled selected>
                                    Resolution
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
                            Search
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Home;
