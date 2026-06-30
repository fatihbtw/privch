import { Component, createMemo, createSignal, For, Show } from 'solid-js';
import axios from 'axios';
import Nav from './components/nav';
import { t } from './utils/i18n';
import { FiRefreshCw } from 'solid-icons/fi';

interface TrendingStream {
    login: string;
    displayName: string;
    avatar: string;
    thumbnail: string;
    viewers: number;
    title: string;
    game: string | null;
}

const Explore: Component = () => {
    const [isReady, setIsReady] = createSignal(false),
        [isAvailable, setAvailable] = createSignal(true),
        [isRefreshing, setIsRefreshing] = createSignal(false),
        [streams, setStreams] = createSignal<TrendingStream[]>([]),
        [selectedCategory, setSelectedCategory] = createSignal<
            string | null
        >(null),
        baseUrl = window.location.origin;

    // ponytail: categories are derived from the already-fetched trending
    // batch (no extra request) - this lists categories currently trending,
    // not Twitch's full category directory.
    const categories = createMemo(() => {
        const counts = new Map<string, number>();
        streams().forEach((s) => {
            if (!s.game) return;
            counts.set(s.game, (counts.get(s.game) ?? 0) + 1);
        });
        return [...counts.entries()].sort((a, b) => b[1] - a[1]);
    });

    const filteredStreams = createMemo(() =>
        selectedCategory()
            ? streams().filter((s) => s.game === selectedCategory())
            : streams()
    );

    async function load() {
        setIsRefreshing(true);
        // cache-busting param: /api/trending is sent with Cache-Control:
        // max-age=60 so the browser would otherwise serve a stale response
        // when the user explicitly asks for fresh data.
        const res = await axios.get(
            `${baseUrl}/api/trending?limit=30&_=${Date.now()}`,
            { validateStatus: () => true }
        );

        if (res.status === 200 && res.data?.invalid !== true) {
            setStreams(res.data.streams);
            setAvailable(true);
        } else {
            setAvailable(false);
        }
        setIsReady(true);
        setIsRefreshing(false);
    }

    load();

    return (
        <div>
            <Nav isHome={false} />
            <title>Privch - {t('explore.title')}</title>
            <div class="container mx-auto px-10 py-2 mb-16 md:mb-10">
                <div class="flex items-center justify-between mb-4">
                    <h1 class="text-2xl font-bold">{t('explore.title')}</h1>
                    <button
                        class="btn btn-sm btn-ghost"
                        title={t('explore.refresh')}
                        disabled={isRefreshing()}
                        onclick={() => {
                            setSelectedCategory(null);
                            load();
                        }}
                    >
                        <FiRefreshCw
                            class={isRefreshing() ? 'animate-spin' : ''}
                        />
                    </button>
                </div>

                <Show when={isReady() == false}>
                    <div class="flex justify-center items-center h-64">
                        <span class="loading loading-spinner text-secondary"></span>
                    </div>
                </Show>

                <Show when={isReady() == true && isAvailable() == false}>
                    <p class="text-base-content/60">
                        {t('explore.unavailable')}
                    </p>
                </Show>

                <Show when={isReady() == true && isAvailable() == true}>
                    <div class="flex gap-4 items-start">
                        <div class="hidden lg:block w-48 shrink-0">
                            <h2 class="text-xs font-semibold text-base-content/60 mb-2 uppercase tracking-wide">
                                {t('explore.categories')}
                            </h2>
                            <ul class="menu menu-sm bg-base-200 rounded-box p-2">
                                <li>
                                    <button
                                        class={
                                            selectedCategory() === null
                                                ? 'active'
                                                : ''
                                        }
                                        onclick={() =>
                                            setSelectedCategory(null)
                                        }
                                    >
                                        <span class="truncate flex-1 text-left">
                                            {t('explore.allCategories')}
                                        </span>
                                        <span class="badge badge-sm">
                                            {streams().length}
                                        </span>
                                    </button>
                                </li>
                                <For each={categories()}>
                                    {([game, count]) => (
                                        <li>
                                            <button
                                                class={
                                                    selectedCategory() ===
                                                    game
                                                        ? 'active'
                                                        : ''
                                                }
                                                onclick={() =>
                                                    setSelectedCategory(game)
                                                }
                                            >
                                                <span class="truncate flex-1 text-left">
                                                    {game}
                                                </span>
                                                <span class="badge badge-sm">
                                                    {count}
                                                </span>
                                            </button>
                                        </li>
                                    )}
                                </For>
                            </ul>
                        </div>
                        <div class="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            <For each={filteredStreams()}>
                                {(stream) => (
                                    <a
                                        href={`/${stream.login}`}
                                        class="bg-base-200 hover:bg-base-300 rounded-md overflow-hidden"
                                    >
                                        <div
                                            class="bg-cover bg-center h-32"
                                            style={{
                                                'background-image': `url('${baseUrl}/api/proxy?url=${btoa(
                                                    stream.thumbnail
                                                )}')`,
                                            }}
                                        />
                                        <div class="p-2">
                                            <div class="font-semibold truncate">
                                                {stream.displayName}
                                            </div>
                                            <div class="text-sm text-base-content/60 truncate">
                                                {stream.title}
                                            </div>
                                            <div class="flex justify-between items-center text-xs text-base-content/60 mt-1">
                                                <span class="truncate">
                                                    {stream.game ?? ''}
                                                </span>
                                                <span class="badge badge-error badge-sm shrink-0">
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
            </div>
        </div>
    );
};

export default Explore;
