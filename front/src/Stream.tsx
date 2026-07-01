import {
    Component,
    For,
    Show,
    createEffect,
    createSignal,
    lazy,
    onCleanup,
} from 'solid-js';
import { useSearchParams, useParams } from '@solidjs/router';
import axios from 'axios';
import Hls from 'hls.js';
import { FiMaximize, FiMinimize } from 'solid-icons/fi';
import Nav from './components/nav';
import FavBtn from './components/favCh';
import LiveMetadata from './components/liveMetadata';
import QualitySelector, {
    QualityLevelOption,
} from './components/qualitySelector';
import StreamSuggestions from './components/streamSuggestions';
import {
    clipsResponse,
    streamStatusResponse,
    streamerMetadataResponse,
    vodsResponse,
} from './utils/types';
import VodsContainer from './components/vodsContainer';
import { applyStoredVolume } from './utils/playerVolume';
import { t } from './utils/i18n';

const ClipsContainer = lazy(() => import('./components/clipsContainer')),
    StreamChat = lazy(() => import('./components/streamChat'));

const Stream: Component = () => {
    const instanceBaseUrl = window.location.origin,
        [{ ...queryParams }, setQueryParams] = useSearchParams(),
        { ...params } = useParams(),
        [isLive, setLiveStatus] = createSignal(false),
        [streamMetadata, setStreamMetadata] =
            createSignal<streamStatusResponse>(),
        [visibleTab, setVisibleTab] = createSignal(''),
        [visibleTabData, setVisibleTabData] = createSignal<
            vodsResponse | clipsResponse
        >(),
        [streamerMetadata, setStreamerMetadata] =
            createSignal<streamerMetadataResponse>(),
        [videosFilter, setVideosFilter] = createSignal('ARCHIVE'),
        [clipsFilter, setClipsFilter] = createSignal('LAST_DAY'),
        [isHlsSupported, setHlsSuportStatus] = createSignal(true),
        [isReady, setReadyStatus] = createSignal<boolean>(false),
        [isVodlistReady, setVodlistReadyStatus] = createSignal(false),
        [isCliplistReady, setCliplistReadyStatus] = createSignal(false),
        [qualityLevels, setQualityLevels] = createSignal<
            (QualityLevelOption & { name: string; levelIndex: number })[]
        >([]),
        [currentQuality, setCurrentQuality] = createSignal(0),
        [theaterMode, setTheaterMode] = createSignal(false),
        audioOnly = localStorage.getItem('privch_audio_only') === 'true',
        showSuggestions =
            localStorage.getItem('privch_show_suggestions') !== 'false',
        queryLimit = 100,
        queryString =
            '?' +
            Object.keys(queryParams)
                .map((key) => {
                    return `${key}=${queryParams[key]}`;
                })
                .join('&'),
        streamUrl = `${instanceBaseUrl}/api/stream/${params.username}${queryString}`,
        base64encode = (content: string) => btoa(content);
    let hlsInstance: Hls,
        videoRef!: HTMLVideoElement,
        chatScroll!: HTMLDivElement;

    if (!Hls.isSupported()) setHlsSuportStatus(false);

    const initHlsStream = () => {
        if (Hls.isSupported()) {
            hlsInstance = new Hls({
                maxBufferLength: 16,
                maxBufferSize: 64 * 1024 * 1024,
                maxMaxBufferLength: 32,
                backBufferLength: 2,
                liveSyncDuration: 2,
                manifestLoadingMaxRetry: Infinity,
                manifestLoadingRetryDelay: 500,
                xhrSetup: (xhr, url) => {
                    if (url !== streamUrl) {
                        xhr.open(
                            'GET',
                            `${instanceBaseUrl}/api/proxy?url=${base64encode(
                                url
                            )}`
                        );
                    } else xhr.open('GET', url);
                },
            });

            const retry = () => {
                hlsInstance.attachMedia(videoRef);
                hlsInstance.loadSource(streamUrl);
                hlsInstance.startLoad();
            };

            hlsInstance.attachMedia(videoRef);
            applyStoredVolume(videoRef);

            // ponytail: Media Session hints help mobile browsers keep
            // audio-only playback alive in the background; full reliable
            // backgrounding would need a native wrapper.
            if ('mediaSession' in navigator) {
                navigator.mediaSession.metadata = new MediaMetadata({
                    title: params.username,
                    artist: 'Twineo',
                });
            }

            hlsInstance.on(Hls.Events.MEDIA_ATTACHED, () =>
                hlsInstance.loadSource(streamUrl)
            );
            hlsInstance.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
                const levels = data.levels
                    .map((lvl, levelIndex) => {
                        const name = lvl.attrs?.VIDEO ?? `${lvl.height}p`,
                            isSource = name === 'chunked',
                            fps = lvl.attrs?.['FRAME-RATE']
                                ? Math.round(
                                      parseFloat(lvl.attrs['FRAME-RATE'])
                                  )
                                : null,
                            label = isSource
                                ? `Source${
                                      lvl.height
                                          ? ` (${lvl.height}p${
                                                fps && fps > 30 ? fps : ''
                                            })`
                                          : ''
                                  }`
                                : `${lvl.height}p${fps && fps > 30 ? fps : ''}`;

                        return {
                            label,
                            isSource,
                            name,
                            height: lvl.height ?? 0,
                            levelIndex,
                        };
                    })
                    .sort((a, b) => {
                        if (a.isSource !== b.isSource)
                            return a.isSource ? -1 : 1;
                        return b.height - a.height;
                    });

                setQualityLevels(levels);

                const preferred = localStorage.getItem('privch_quality'),
                    preferredIndex = levels.findIndex(
                        (l) => l.name === preferred
                    ),
                    sourceIndex = levels.findIndex((l) => l.isSource),
                    startIndex =
                        preferredIndex !== -1
                            ? preferredIndex
                            : sourceIndex !== -1
                            ? sourceIndex
                            : 0,
                    level = levels[startIndex];

                if (level) {
                    hlsInstance.currentLevel = level.levelIndex;
                    setCurrentQuality(startIndex);
                }

                videoRef.play();
            });
            hlsInstance.on(Hls.Events.ERROR, function (_, data) {
                if (data.fatal) {
                    switch (data.type) {
                        case Hls.ErrorTypes.NETWORK_ERROR:
                            console.log('Network error. Retrying..');
                            retry();
                            break;
                        case Hls.ErrorTypes.MEDIA_ERROR:
                            console.log('Media error. Retrying..');
                            hlsInstance.recoverMediaError();
                            break;
                    }
                }
            });
        }
    };

    onCleanup(() => {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });

    const selectQuality = (index: number) => {
        const level = qualityLevels()[index];
        if (!level || !hlsInstance) return;

        hlsInstance.currentLevel = level.levelIndex;
        setCurrentQuality(index);
        localStorage.setItem('privch_quality', level.name);
    };

    const fetchStreamerInfo = async () => {
        const req = await axios.get(
                `${instanceBaseUrl}/api/streaminfo/${params.username}`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    validateStatus(status) {
                        return true;
                    },
                }
            ),
            data = req.data as streamStatusResponse;

        if (data.invalid == true) {
            setLiveStatus(false);
            const streamerMetadataReq = await axios.get(
                    `${instanceBaseUrl}/api/streamer/${params.username}`,
                    {
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        validateStatus(status) {
                            return true;
                        },
                    }
                ),
                streamerMetadataRes =
                    streamerMetadataReq.data as streamerMetadataResponse;

            if (streamerMetadataRes.invalid !== true) {
                setStreamerMetadata(streamerMetadataRes);
                setVisibleTab('videos');
                setVodlistReadyStatus(true);
                setReadyStatus(true);
            }
        } else {
            setStreamMetadata(data);
            setLiveStatus(true);
            setReadyStatus(true);
        }
    };

    // initial request
    fetchStreamerInfo();

    // updating metadata every 1 minute
    setInterval(async () => {
        if (isLive() == true) {
            console.log('[Log] Updating stream metadata.');
            const req = await axios.get(
                    `${instanceBaseUrl}/api/streaminfo/${params.username}`,
                    {
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        validateStatus(status) {
                            return true;
                        },
                    }
                ),
                data = req.data as streamStatusResponse;

            if (data.invalid !== true) {
                setStreamMetadata(data);
            }
        }
    }, 60000);

    // tabs handler
    createEffect(async () => {
        if (visibleTab() == 'videos') {
            const req = await axios.get(
                    `${instanceBaseUrl}/api/vods/${
                        params.username
                    }/${videosFilter()}/${queryLimit}`
                ),
                data = req.data as vodsResponse;

            if (data.invalid !== true) {
                setVisibleTabData(data);
            }
        }
        if (visibleTab() == 'clips') {
            const req = await axios.get(
                    `${instanceBaseUrl}/api/clips/${
                        params.username
                    }/${clipsFilter()}/${queryLimit}`
                ),
                data = req.data as clipsResponse;

            if (data.invalid !== true) {
                setVisibleTabData(data);
                setCliplistReadyStatus(true);
            }
        }
    });

    // handle hls stream
    createEffect(() => {
        if (isReady() == true && isLive() == true) {
            initHlsStream();
        }
    });

    return (
        <>
            <Nav isHome={false} />
            <Show when={isReady() == false}>
                <div class="flex justify-center items-center h-screen flex-col">
                    <span class="loading loading-spinner text-secondary"></span>
                    {t('common.loading')}
                </div>
            </Show>
            <Show when={isReady() == true}>
                <title>{params.username}</title>
                <Show when={isLive() == false || isHlsSupported() == false}>
                    <Show when={isHlsSupported() == false}>
                        <div class="container mx-auto my-auto px-10 py-2">
                            <div class="border p-2 rounded-md shadow-md border-base-200">
                                {t('stream.noHls')}
                            </div>
                        </div>
                    </Show>
                    <div class="container mx-auto my-auto p-10">
                        <div>
                            <div
                                class="bg-cover bg-center h-40"
                                style={{
                                    'background-image': `url('${instanceBaseUrl}/api/proxy?url=${base64encode(
                                        streamerMetadata()?.bannerImageURL!
                                    )}')`,
                                }}
                            >
                                <div class="container mx-auto flex flex-col space-y-2 items-center justify-center h-full">
                                    <img
                                        class="rounded-full overflow-hidden h-24 w-24"
                                        src={`${instanceBaseUrl}/api/proxy?url=${base64encode(
                                            streamerMetadata()?.profileImageURL!
                                        )}`}
                                    />
                                    <FavBtn username={params.username} />
                                </div>
                            </div>
                        </div>
                        <div class="container mx-auto mt-2 mb-2 bg-neutral-focus p-2 rounded-md shadow-sm">
                            <div class="flex items-center justify-center">
                                {streamerMetadata()?.description}
                            </div>
                            <div class="flex flex-col md:flex-row items-center justify-center md:space-x-2 space-x-1">
                                <For each={streamerMetadata()?.socialMedias}>
                                    {(item) => (
                                        <a
                                            class="no-underline text-secondary capitalize item"
                                            href={item.url}
                                        >
                                            {item.title}
                                        </a>
                                    )}
                                </For>
                            </div>
                        </div>
                        <div>
                            <div class="tabs mt-2">
                                <a
                                    class={`tab ${
                                        visibleTab() == 'videos'
                                            ? 'tab-active'
                                            : ''
                                    }`}
                                    onclick={() => setVisibleTab('videos')}
                                >
                                    {t('stream.videos')}
                                </a>
                                <a
                                    class={`tab ${
                                        visibleTab() == 'clips'
                                            ? 'tab-active'
                                            : ''
                                    }`}
                                    onclick={() => setVisibleTab('clips')}
                                >
                                    {t('stream.clips')}
                                </a>
                            </div>
                            <div class="mt-2">
                                <Show when={visibleTab() == 'videos'}>
                                    <VodsContainer
                                        setFilter={setVideosFilter}
                                        tabData={visibleTabData}
                                        queryString={queryString}
                                        instanceBaseUrl={instanceBaseUrl}
                                        ready={isVodlistReady}
                                    />
                                </Show>
                                <Show when={visibleTab() == 'clips'}>
                                    <ClipsContainer
                                        setFilter={setClipsFilter}
                                        streamer={String(
                                            params.username
                                        ).toLowerCase()}
                                        tabData={visibleTabData}
                                        instanceBaseUrl={instanceBaseUrl}
                                        ready={isCliplistReady}
                                    />
                                </Show>
                            </div>
                        </div>
                    </div>
                </Show>
                <Show when={isLive() == true}>
                    <div
                        class={
                            theaterMode()
                                ? 'w-full px-2 md:py-5'
                                : 'container md:py-5'
                        }
                    >
                        <div class="flex justify-center items-start gap-2">
                            <Show when={!theaterMode() && showSuggestions}>
                                <div class="hidden lg:block w-1/5">
                                    <StreamSuggestions
                                        username={params.username}
                                    />
                                </div>
                            </Show>
                            <div
                                class={
                                    theaterMode()
                                        ? 'flex flex-col w-full gap-2'
                                        : 'flex flex-col md:flex-row md:gap-2'
                                }
                            >
                                <div
                                    class={
                                        theaterMode()
                                            ? 'w-full'
                                            : 'w-full md:w-3/4 md:h-auto'
                                    }
                                >
                                    <Show when={!audioOnly}>
                                        <video ref={videoRef} controls />
                                    </Show>
                                    <Show when={audioOnly}>
                                        <audio
                                            ref={(el) =>
                                                (videoRef =
                                                    el as unknown as HTMLVideoElement)
                                            }
                                            controls
                                            class="w-full"
                                        />
                                    </Show>
                                    <div class="flex justify-end items-center gap-2 mt-1">
                                        <button
                                            class="btn btn-sm btn-ghost"
                                            title={t('stream.theaterMode')}
                                            onclick={() =>
                                                setTheaterMode(!theaterMode())
                                            }
                                        >
                                            {theaterMode() ? (
                                                <FiMinimize />
                                            ) : (
                                                <FiMaximize />
                                            )}
                                        </button>
                                        <Show when={qualityLevels().length > 0}>
                                            <QualitySelector
                                                levels={qualityLevels()}
                                                current={currentQuality()}
                                                onSelect={selectQuality}
                                            />
                                        </Show>
                                    </div>
                                    <div class="p-1">
                                        <LiveMetadata
                                            title={streamMetadata()?.title!}
                                            views={streamMetadata()?.views!}
                                            game={streamMetadata()?.game!}
                                            avatar={`${instanceBaseUrl}/api/proxy?url=${base64encode(
                                                streamMetadata()?.avatar!
                                            )}`}
                                            username={params.username}
                                        />
                                    </div>
                                </div>
                                <div
                                    class={
                                        theaterMode()
                                            ? 'w-full'
                                            : 'w-full md:w-2/4'
                                    }
                                >
                                    <div
                                        class="border border-base-200 rounded-md shadow-md p-4 flex flex-col resize overflow-auto"
                                        style={{
                                            'min-width': '280px',
                                            'min-height': '200px',
                                            width: '100%',
                                            height: '24rem',
                                        }}
                                    >
                                        <h2 class="text-xl shrink-0">
                                            {t('stream.chat')}
                                        </h2>
                                        <div
                                            class="mt-3 flex-1 min-h-0 overflow-auto break-words"
                                            style={{
                                                'scrollbar-width': 'thin',
                                            }}
                                            ref={chatScroll}
                                        >
                                            <StreamChat
                                                username={params.username.toLowerCase()}
                                                scroll={chatScroll}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Show>
            </Show>
        </>
    );
};

export default Stream;
