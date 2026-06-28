//@ts-ignore
import { Parser } from 'm3u8-parser';
import { createSignal, Component, Setter, createEffect, Show } from 'solid-js';
import axios from 'axios';

interface EventType extends MessageEvent<any> {
    data: {
        type: 'totalSegments' | 'progess' | 'failedSegments' | 'result';
        blobs?: Blob[];
        segment?: string;
        total?: number;
    };
}

interface WorkerEventType extends MessageEvent<any> {
    data: {
        type: 'start';
        m3u8: any;
        vodid: string;
        queryString: string;
        instanceBaseUrl: string;
    };
}

const DownloadVods: Component<{
    id: string;
    queryString: string;
    title: string;
    streamer: string;
}> = ({ id, queryString, title, streamer }) => {
    const instanceBaseUrl = window.location.origin,
        [downloadedSegments, setDownloadedSegments] = createSignal(0),
        [failedSegments, setFailedSegments] = createSignal(0),
        [totalSegments, setTotalSegments] = createSignal(0),
        [downloadStarted, setDowloadStarted] = createSignal(false),
        createWorker = (fn: Function) => {
            const blob = new Blob([`self.onmessage = ${fn.toString()}`], {
                type: 'application/javascript',
            });
            return new Worker(URL.createObjectURL(blob));
        },
        calcAproxSize = (totalSegments: number) => {
            // each segment have around 4.5 mb
            return Math.floor((4.5 * totalSegments) / 1024);
        },
        filename = `${title}-${streamer}-${id}.ts`;

    function startDownload() {
        const worker = createWorker((event: WorkerEventType) => {
            if (event.data.type == 'start') {
                console.log('Starting download..');

                const playlist = event.data.m3u8;

                self.postMessage({
                    type: 'totalSegments',
                    total: playlist.segments.length,
                });

                const blobs: Blob[] = [],
                    segUrls: string[] = playlist.segments.map(
                        (seg: { uri: string }) =>
                            `${event.data.instanceBaseUrl}${seg.uri}`
                    ),
                    downloadSeg = (url: string) => {
                        return fetch(url)
                            .then((res) => res.arrayBuffer())
                            .catch((err) => {
                                console.error('Error downloading segment', err);
                                self.postMessage({
                                    type: 'failedSegments',
                                });
                                return null;
                            });
                    },
                    // Wait for one segment to finish downloading before downloading other
                    downloadSync = (index: number) => {
                        if (index > segUrls.length) {
                            console.log('Download finished');
                            self.postMessage({
                                type: 'result',
                                blobs: blobs,
                            });
                            return;
                        }
                        downloadSeg(segUrls[index]).then((buff) => {
                            if (buff) {
                                blobs.push(new Blob([buff]));
                            }

                            self.postMessage({
                                type: 'progess',
                            });

                            downloadSync(index + 1);
                        });
                    };

                downloadSync(0);
            }
        });

        createEffect(async () => {
            axios
                .get(`${instanceBaseUrl}/api/vod/${id}${queryString}`)
                .then((res) => res.data)
                .then((m3u8) => {
                    const parser = new Parser();
                    parser.push(m3u8);
                    parser.end();

                    worker.postMessage({
                        type: 'start',
                        m3u8: parser.manifest,
                        vodid: id,
                        queryString: queryString,
                        instanceBaseUrl: instanceBaseUrl,
                    });

                    setDowloadStarted(true);

                    worker.onmessage = (event: EventType) => {
                        switch (event.data.type) {
                            case 'totalSegments':
                                setTotalSegments(event.data.total!);
                                break;
                            case 'progess':
                                setDownloadedSegments((prev) => prev + 1);
                                break;
                            case 'failedSegments':
                                setFailedSegments((prev) => prev + 1);
                                break;
                            case 'result':
                                if (
                                    event.data.blobs &&
                                    event.data.blobs.length > 0
                                ) {
                                    const downloadLink =
                                        document.createElement('a');
                                    downloadLink.href = URL.createObjectURL(
                                        new Blob(event.data.blobs!, {
                                            type: 'video/mp2t',
                                        })
                                    );
                                    downloadLink.download = filename;
                                    downloadLink.click();
                                }
                                break;
                        }
                    };
                });
        });
    }

    return (
        <div>
            <div>
                <div>
                    File: <code class="text-sm">{filename}</code>
                </div>
                <div>Size: ~ {calcAproxSize(totalSegments())} GB</div>
                <progress
                    class="progress progress-info w-full"
                    value={downloadedSegments()}
                    max={totalSegments()}
                ></progress>
                <Show when={downloadStarted() == true}>
                    <div class="text-sm text-info">
                        {downloadedSegments()} of {totalSegments()}
                    </div>
                    <div class="text-sm text-error">
                        {failedSegments()} failed
                    </div>
                </Show>
            </div>
            <Show when={downloadStarted() == false}>
                <div class="mt-1">
                    <button class="btn btn-info btn-sm" onclick={startDownload}>
                        Start download
                    </button>
                </div>
            </Show>
        </div>
    );
};

export default DownloadVods;
