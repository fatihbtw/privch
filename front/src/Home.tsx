import { Component, createSignal } from 'solid-js';
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
        redirect = useNavigate();

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
            <div class="flex mt-32 justify-center items-center">
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
