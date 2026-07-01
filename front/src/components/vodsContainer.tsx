import { Accessor, Component, For, Setter, Show } from 'solid-js';
import { vodsResponse } from '../utils/types';
import formatTime from '../utils/formatTime';
import formatDate from '../utils/formatDate';
import { A } from '@solidjs/router';
import { t } from '../utils/i18n';

const VodsContainer: Component<{
    tabData: Accessor<vodsResponse | undefined>;
    ready: Accessor<boolean>;
    setFilter: Setter<string>;
    queryString: string;
    instanceBaseUrl: string;
}> = ({ tabData, setFilter, queryString, instanceBaseUrl, ready }) => {
    const base64encode = (content: string) => btoa(content);
    return (
        <div>
            <div class="flex justify-end">
                <select
                    onchange={(e) => setFilter(e.target.value)}
                    class="select select-bordered select-sm"
                >
                    <option value="ARCHIVE">{t('filters.archives')}</option>
                    <option value="UPLOAD">{t('filters.uploads')}</option>
                    <option value="HIGHLIGHT">{t('filters.highlights')}</option>
                    <option value="ALL">{t('filters.all')}</option>
                </select>
            </div>
            <div class="mt-3 mb-32">
                <Show when={ready() == false}>
                    <div class="flex justify-center items-center flex-col">
                        <span class="loading loading-spinner text-secondary"></span>
                    </div>
                </Show>
                <Show when={ready() == true}>
                    {tabData()?.vods?.length! < 1 ? (
                        <div class="flex justify-center items-center flex-col p-2">
                            <span class="italic">
                                {t('filters.emptyResult')}
                            </span>
                        </div>
                    ) : (
                        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            <For each={tabData()?.vods}>
                                {(item) => (
                                    <A
                                        class="card card-compact w-72 h-full bg-base-100 shadow-md"
                                        href={`/videos/${item.id}${queryString}`}
                                    >
                                        <figure>
                                            <img
                                                src={`${instanceBaseUrl}/api/proxy?url=${base64encode(
                                                    item.previewThumbnailURL
                                                )}`}
                                            />
                                        </figure>
                                        <div class="card-body">
                                            <h2 class="card-title font-semibold">
                                                {item.title}
                                            </h2>
                                            <p>
                                                {formatDate(item.publishedAt)} -{' '}
                                                {formatTime(item.lengthSeconds)}
                                                <br />
                                                <span class="text-indigo-400">
                                                    {item.game}
                                                </span>
                                            </p>
                                        </div>
                                    </A>
                                )}
                            </For>
                        </div>
                    )}
                </Show>
            </div>
        </div>
    );
};

export default VodsContainer;
