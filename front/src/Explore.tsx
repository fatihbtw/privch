import { Component, createSignal, For, Show } from 'solid-js';
import axios from 'axios';
import Nav from './components/nav';

const Explore: Component = () => {
    const [isReady, setIsReady] = createSignal(false),
        [isAvailable, setAvailable] = createSignal(true),
        [streams, setStreams] = createSignal<
            {
                login: string;
                displayName: string;
                avatar: string;
                thumbnail: string;
                viewers: number;
                title: string;
                game: string | null;
            }[]
        >([]),
        baseUrl = window.location.origin;

    (async () => {
        const res = await axios.get(`${baseUrl}/api/trending?limit=24`, {
            validateStatus: () => true,
        });

        if (res.status === 200 && res.data?.invalid !== true) {
            setStreams(res.data.streams);
        } else {
            setAvailable(false);
        }
        setIsReady(true);
    })();

    return (
        <div>
            <Nav isHome={false} />
            <title>Privch - Explore</title>
            <div class="container mx-auto px-10 py-2 mb-16 md:mb-10">
                <h1 class="text-2xl font-bold mb-4">Entdecken</h1>

                <Show when={isReady() == false}>
                    <div class="flex justify-center items-center h-64">
                        <span class="loading loading-spinner text-secondary"></span>
                    </div>
                </Show>

                <Show when={isReady() == true && isAvailable() == false}>
                    <p class="text-base-content/60">
                        Trending-Streams sind gerade nicht verfügbar.
                    </p>
                </Show>

                <Show when={isReady() == true && isAvailable() == true}>
                    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        <For each={streams()}>
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
                </Show>
            </div>
        </div>
    );
};

export default Explore;
