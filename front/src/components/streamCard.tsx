import { Component, Show } from 'solid-js';
import { t } from '../utils/i18n';

export interface StreamCardData {
    login: string;
    displayName: string;
    thumbnail: string;
    viewers: number;
    game: string | null;
    title?: string;
}

const StreamCard: Component<{ stream: StreamCardData; compact?: boolean }> = (
    props
) => {
    const baseUrl = window.location.origin;

    return (
        <a
            href={`/${props.stream.login}`}
            class="group rounded-xl overflow-hidden bg-base-200 hover:bg-base-300 ring-1 ring-base-content/5 hover:ring-primary/40 transition-all"
        >
            <figure class="relative aspect-video overflow-hidden">
                <img
                    class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    src={`${baseUrl}/api/proxy?url=${btoa(
                        props.stream.thumbnail
                    )}`}
                    alt={props.stream.displayName}
                    loading="lazy"
                />
                <span class="absolute top-2 left-2 rounded bg-error px-1.5 py-0.5 text-xs font-bold uppercase text-error-content">
                    {t('common.live')}
                </span>
                <span class="absolute bottom-2 left-2 rounded bg-black/70 px-1.5 py-0.5 text-xs text-white">
                    {props.stream.viewers.toLocaleString()}{' '}
                    {t('suggestions.viewers')}
                </span>
            </figure>
            <div class={props.compact ? 'p-2' : 'p-3'}>
                <div
                    class={`font-semibold truncate ${
                        props.compact ? 'text-sm' : ''
                    }`}
                >
                    {props.stream.displayName}
                </div>
                <Show when={!props.compact && props.stream.title}>
                    <div class="text-sm text-base-content/60 truncate">
                        {props.stream.title}
                    </div>
                </Show>
                <Show when={props.stream.game}>
                    <div class="text-xs text-base-content/50 truncate mt-0.5">
                        {props.stream.game}
                    </div>
                </Show>
            </div>
        </a>
    );
};

export default StreamCard;
