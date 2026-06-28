import { Accessor, Component, For, Setter, Show } from 'solid-js';
import { clipsResponse } from '../utils/types';
import formatTime from '../utils/formatTime';
import formatDate from '../utils/formatDate';
import { A } from '@solidjs/router';

const ClipsContainer: Component<{
    tabData: Accessor<clipsResponse | undefined>;
    ready: Accessor<boolean>;
    setFilter: Setter<string>;
    streamer: string;
    instanceBaseUrl: string;
}> = ({ tabData, setFilter, streamer, instanceBaseUrl, ready }) => {
    const base64encode = (content: string) => btoa(content);
    return (
        <div>
            <div class="flex justify-end">
                <select
                    onchange={(e) => setFilter(e.target.value)}
                    class="select select-bordered select-sm"
                >
                    <option value="LAST_DAY">Last Day</option>
                    <option value="LAST_WEEK">Last Week</option>
                    <option value="LAST_MONTH">Last Month</option>
                    <option value="ALL_TIME">All Time</option>
                </select>
            </div>
            <div class="mt-3 mb-32">
                <Show when={ready() == false}>
                    <div class="flex justify-center items-center flex-col">
                        <span class="loading loading-spinner text-secondary"></span>
                    </div>
                </Show>
                <Show when={ready() == true}>
                    {tabData()?.clips?.length! < 1 ? (
                        <div class="flex justify-center items-center flex-col p-2">
                            <span class="italic">
                                Nothing here. Maybe try another filter?
                            </span>
                        </div>
                    ) : (
                        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            <For each={tabData()?.clips}>
                                {(item) => (
                                    <A
                                        class="card card-compact w-72 h-full bg-base-100 shadow-md"
                                        href={`/${streamer}/clip/${item.slug}`}
                                    >
                                        <figure>
                                            <img
                                                src={`${instanceBaseUrl}/api/proxy?url=${base64encode(
                                                    item.thumbnailURL
                                                )}`}
                                            />
                                        </figure>
                                        <div class="card-body">
                                            <h2 class="card-title font-semibold">
                                                {item.title}
                                            </h2>
                                            <p>
                                                {formatDate(item.createdAt)} -{' '}
                                                {formatTime(
                                                    item.durationSeconds
                                                )}
                                                <br />
                                                {item.viewCount} Views
                                                <br />
                                                By {item.author}
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

export default ClipsContainer;
