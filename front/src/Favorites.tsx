import { Component, createSignal, For, Show } from 'solid-js';
import axios from 'axios';

import Nav from './components/nav';
import { VsSync } from 'solid-icons/vs';

const FavoritesPage: Component = () => {
    const [isReady, setIsReady] = createSignal(false),
        [isPopupClosed, closePopup] = createSignal(true),
        [emptyList, setEmptyList] = createSignal<boolean>(false),
        [channelsMetadata, setChannelsMetadata] = createSignal<
            {
                description: string;
                displayName: string;
                avatar: string;
                banner: string;
                live: boolean;
            }[]
        >([]),
        [importVal, setImportVal] = createSignal(''),
        baseUrl = window.location.origin;

    function getFavs(): string[] {
        const items = localStorage.getItem('favorites');
        if (items == null) return [];
        return JSON.parse(items);
    }

    function exportBase64Channels() {
        return localStorage.getItem('favorites') !== null
            ? btoa(localStorage.getItem('favorites')!)
            : '';
    }

    function importFavs() {
        const content = importVal();
        if (content.length > 1) {
            const decoded = atob(content);
            localStorage.setItem('favorites', decoded);
            window.location.reload();
        }
    }

    (async () => {
        const channels = getFavs();

        if (channels.length == 0) {
            setEmptyList(true);
            setIsReady(true);
            return;
        }

        channels.forEach(async (ch) => {
            const infoReq = await axios.get(`${baseUrl}/api/user/${ch}`);

            if (infoReq.status == 200) {
                const infoData: {
                    error: {} | null;
                    data: {
                        description: string;
                        displayName: string;
                        avatar: string;
                        banner: string;
                        live: boolean;
                    };
                } = infoReq.data;

                if (infoData.error == null) {
                    setChannelsMetadata((prev) => [...prev, infoData.data]);
                }
            }
        });

        setIsReady(true);
    })();
    return (
        <div>
            <Nav isHome={false} />

            <Show when={isReady() == false}>
                <div class="flex justify-center items-center h-screen flex-col">
                    <span class="loading loading-spinner text-secondary"></span>
                    Loading..
                </div>
            </Show>
            <div class="container mx-auto my-auto px-10 py-2 mb-16 md:mb-10">
                <div
                    class={`${
                        isPopupClosed() == true ? 'hidden' : 'visible'
                    } fixed inset-0 flex items-center justify-center z-50`}
                >
                    <div class="fixed inset-0 bg-black opacity-50"></div>

                    <div class="bg-base-100 p-8 rounded shadow-lg z-10">
                        <h3 class="font-semibold text-lg">Export / Import</h3>
                        <div class="mt-1">
                            <Show when={exportBase64Channels() !== ''}>
                                <div class="mb-1">
                                    <h3 class="font-semibold text-lg">
                                        Your favorites code
                                    </h3>
                                    <input
                                        class="input input-bordered w-full max-w-xs"
                                        type="text"
                                        value={exportBase64Channels()}
                                    />
                                </div>
                            </Show>
                            <div>
                                <h3 class="font-semibold text-lg">
                                    Import favorites code
                                </h3>
                                <Show when={importVal().length > 1}>
                                    <p class="italic text-warning mb-1">
                                        This will overwrite your previous
                                        favorites!
                                    </p>
                                </Show>
                                <input
                                    class="input input-bordered w-full max-w-xs"
                                    type="text"
                                    value={importVal()}
                                    onInput={(e) =>
                                        setImportVal(e.currentTarget.value)
                                    }
                                />
                            </div>
                        </div>
                        <div class="space-x-2">
                            <Show when={importVal().length > 1}>
                                <button
                                    class="mt-4 btn btn-success"
                                    onclick={() => importFavs()}
                                >
                                    Import
                                </button>
                            </Show>
                            <button
                                class="mt-4 btn btn-secondary"
                                onclick={() => closePopup(true)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>

                <div class="flex justify-end items-end flex-row">
                    <button
                        class="mt-4 btn btn-neutral btn-sm"
                        onclick={() => closePopup(false)}
                    >
                        <VsSync /> Import / Export
                    </button>
                </div>
                <Show when={isReady() == true && emptyList() == true}>
                    <div>You don't have any channels in your favorites</div>
                </Show>
                <Show when={isReady() == true && emptyList() == false}>
                    <div class="mt-2">
                        <For each={channelsMetadata()}>
                            {(channel, i) => (
                                <a href={`/${channel.displayName}`}>
                                    <div
                                        class="bg-cover bg-center rounded-md mb-2"
                                        style={{
                                            'background-image': `url('${baseUrl}/api/proxy?url=${btoa(
                                                channel.banner
                                            )}')`,
                                        }}
                                    >
                                        <div class="flex flex-col w-full lg:flex-row space-x-1 md:space-x-4 bg-base-100 p-4 rounded-md bg-opacity-50 backdrop-blur-md">
                                            <div class="flex flex-col space-y-2 items-center justify-center">
                                                <img
                                                    class="rounded-full w-20"
                                                    src={`${baseUrl}/api/proxy?url=${btoa(
                                                        channel.avatar
                                                    )}`}
                                                />
                                            </div>
                                            <div>
                                                <div>
                                                    <h2 class="text-lg font-semibold drop-shadow-md">
                                                        {channel.displayName}{' '}
                                                        {channel.live ? (
                                                            <span class="badge badge-error ml-1">
                                                                Live
                                                            </span>
                                                        ) : (
                                                            <></>
                                                        )}
                                                    </h2>
                                                </div>
                                                <p class="drop-shadow-lg">
                                                    {channel.description}
                                                </p>
                                            </div>
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

export default FavoritesPage;
