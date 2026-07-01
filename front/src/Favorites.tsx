import { Component, createSignal, For, Show } from 'solid-js';
import axios from 'axios';

import Nav from './components/nav';
import { VsSync } from 'solid-icons/vs';
import { t } from './utils/i18n';

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
            <Nav />
            <title>Privch - {t('nav.favorites')}</title>

            <Show when={isReady() == false}>
                <div class="flex justify-center items-center h-screen flex-col">
                    <span class="loading loading-spinner text-primary"></span>
                    {t('common.loading')}
                </div>
            </Show>
            <div class="container mx-auto my-auto px-4 md:px-10 py-4 mb-24 md:mb-10">
                <div class={`modal ${isPopupClosed() ? '' : 'modal-open'}`}>
                    <div class="modal-box">
                        <h3 class="font-bold text-lg">
                            {t('favorites.exportImport')}
                        </h3>
                        <div class="mt-2 space-y-3">
                            <Show when={exportBase64Channels() !== ''}>
                                <div class="form-control">
                                    <label class="label">
                                        <span class="label-text font-semibold">
                                            {t('favorites.yourCode')}
                                        </span>
                                    </label>
                                    <input
                                        class="input input-bordered w-full"
                                        type="text"
                                        readonly
                                        value={exportBase64Channels()}
                                        onclick={(e) =>
                                            e.currentTarget.select()
                                        }
                                    />
                                </div>
                            </Show>
                            <div class="form-control">
                                <label class="label">
                                    <span class="label-text font-semibold">
                                        {t('favorites.importCode')}
                                    </span>
                                </label>
                                <input
                                    class="input input-bordered w-full"
                                    type="text"
                                    value={importVal()}
                                    onInput={(e) =>
                                        setImportVal(e.currentTarget.value)
                                    }
                                />
                                <Show when={importVal().length > 1}>
                                    <p class="text-sm text-warning mt-1">
                                        {t('favorites.importWarning')}
                                    </p>
                                </Show>
                            </div>
                        </div>
                        <div class="modal-action">
                            <Show when={importVal().length > 1}>
                                <button
                                    class="btn btn-success"
                                    onclick={() => importFavs()}
                                >
                                    {t('favorites.import')}
                                </button>
                            </Show>
                            <button
                                class="btn"
                                onclick={() => closePopup(true)}
                            >
                                {t('favorites.close')}
                            </button>
                        </div>
                    </div>
                    <div
                        class="modal-backdrop"
                        onclick={() => closePopup(true)}
                    />
                </div>

                <div class="flex justify-between items-center mb-4">
                    <h1 class="text-2xl font-bold">{t('nav.favorites')}</h1>
                    <button
                        class="btn btn-ghost btn-sm"
                        onclick={() => closePopup(false)}
                    >
                        <VsSync /> {t('favorites.exportImport')}
                    </button>
                </div>
                <Show when={isReady() == true && emptyList() == true}>
                    <div class="text-base-content/60">
                        {t('favorites.empty')}
                    </div>
                </Show>
                <Show when={isReady() == true && emptyList() == false}>
                    <div class="space-y-3">
                        <For each={channelsMetadata()}>
                            {(channel) => (
                                <a
                                    href={`/${channel.displayName}`}
                                    class="block rounded-xl overflow-hidden ring-1 ring-base-content/5 hover:ring-primary/40 transition-all"
                                >
                                    <div
                                        class="bg-cover bg-center"
                                        style={{
                                            'background-image': `url('${baseUrl}/api/proxy?url=${btoa(
                                                channel.banner
                                            )}')`,
                                        }}
                                    >
                                        <div class="flex flex-col lg:flex-row items-center gap-3 lg:gap-4 bg-base-100/70 p-4 backdrop-blur-md">
                                            <img
                                                class={`rounded-full w-20 h-20 object-cover shrink-0 ${
                                                    channel.live
                                                        ? 'ring-2 ring-error ring-offset-2 ring-offset-base-100'
                                                        : ''
                                                }`}
                                                src={`${baseUrl}/api/proxy?url=${btoa(
                                                    channel.avatar
                                                )}`}
                                            />
                                            <div class="text-center lg:text-left">
                                                <h2 class="text-lg font-semibold drop-shadow-md">
                                                    {channel.displayName}
                                                    <Show when={channel.live}>
                                                        <span class="badge badge-error ml-2 align-middle">
                                                            {t('common.live')}
                                                        </span>
                                                    </Show>
                                                </h2>
                                                <p class="drop-shadow-lg text-base-content/80">
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
