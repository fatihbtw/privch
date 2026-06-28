import { Component, For } from 'solid-js';

export interface QualityLevelOption {
    label: string;
    isSource: boolean;
}

const qualitySelector: Component<{
    levels: QualityLevelOption[];
    current: number;
    onSelect: (index: number) => void;
}> = (props) => {
    return (
        <div class="dropdown dropdown-top dropdown-end">
            <label tabIndex={0} class="btn btn-ghost btn-sm">
                {props.levels[props.current]?.label ?? 'Quality'}
            </label>
            <ul
                tabIndex={0}
                class="dropdown-content menu bg-base-200 rounded-box w-40 p-2 shadow z-50"
            >
                <For each={props.levels}>
                    {(level, i) => (
                        <li>
                            <button
                                class={i() === props.current ? 'active' : ''}
                                onclick={() => props.onSelect(i())}
                            >
                                {level.label}
                                {level.isSource && (
                                    <span class="badge badge-xs badge-primary ml-1">
                                        Max
                                    </span>
                                )}
                            </button>
                        </li>
                    )}
                </For>
            </ul>
        </div>
    );
};

export default qualitySelector;
