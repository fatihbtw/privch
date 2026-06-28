import { Component, For, Show, createResource } from 'solid-js';
import axios from 'axios';

interface SuggestedChannel {
    login: string;
    displayName: string;
    avatar: string;
    viewers: number;
    title: string;
}

const StreamSuggestions: Component<{ username: string }> = (props) => {
    const [suggestions] = createResource(
        () => props.username,
        async (username) => {
            const req = await axios.get(`/api/suggestions/${username}`, {
                validateStatus: () => true,
            });
            if (req.status !== 200) return [] as SuggestedChannel[];
            return req.data.data as SuggestedChannel[];
        }
    );

    return (
        <div class="flex flex-col gap-2 w-full">
            <h2 class="text-xl">Vorschläge</h2>
            <Show when={!suggestions.loading}>
                <For each={suggestions()}>
                    {(channel) => (
                        <a
                            href={`/${channel.login}`}
                            class="flex items-center gap-2 p-2 rounded-md hover:bg-base-200"
                        >
                            <img
                                class="w-10 h-10 rounded-full"
                                src={channel.avatar}
                            />
                            <div class="overflow-hidden">
                                <div class="truncate font-medium">
                                    {channel.displayName}
                                </div>
                                <div class="text-sm text-base-content/60">
                                    {channel.viewers.toLocaleString()} Zuschauer
                                </div>
                            </div>
                        </a>
                    )}
                </For>
            </Show>
        </div>
    );
};

export default StreamSuggestions;
