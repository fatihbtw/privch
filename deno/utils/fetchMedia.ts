import playlistParser from 'playlist-parser';
import { AccessTokenRes, PlaybackAccessToken } from '../types/acessToken.ts';
import fetchAccessToken from './fetchAccessToken.ts';

const clientId = Deno.env.get('CLIENTID') || 'kimne78kx3ncx6brgo4mv6wki5h1ko',
    userAgent =
        Deno.env.get('USERAGENT') ||
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36',
    M3U = playlistParser.M3U;

export default async function fetchMedia(
    mediaID: string,
    isVod: boolean,
    proxy: boolean
): Promise<{
    valid: boolean;
    data?: { artist: string; file: string; title: string }[];
}> {
    try {
        if (isVod == true) {
            const accessToken = await fetchAccessToken(mediaID, true);

            if (accessToken.valid == false) return { valid: false };
            const queryObj: { [key: string]: string | boolean | number } = {
                    acmb: 'e30=',
                    allow_source: true,
                    p: Math.floor(Math.random() * 99999) + 1,
                    cdm: 'wv',
                    transcode_mode: 'cbr_v1',
                    supported_codecs: 'avc1',
                    player_version: '1.19.0',
                    player_base: 'mediaplayer',
                    reassignments_supported: true,
                    playlist_include_framerate: true,
                    player_backend: 'mediaplayer',
                    token: accessToken.data.videoPlaybackAccessToken.value,
                    sig: accessToken.data.videoPlaybackAccessToken.signature,
                },
                queryString = Object.keys(queryObj)
                    .map((k) => {
                        return `${encodeURIComponent(k)}=${encodeURIComponent(
                            queryObj[k]
                        )}`;
                    })
                    .join('&'),
                headers: { [key: string]: string } = {
                    'User-Agent': userAgent,
                    Referer: 'https://player.twitch.tv',
                    Origin: 'https://player.twitch.tv',
                    'Client-ID': clientId,
                };
            if (proxy == true)
                headers['X-Donate-To'] = 'https://ttv.lol/donate';

            const req = await fetch(
                proxy
                    ? `https://api.ttv.lol/vod/${encodeURIComponent(
                          mediaID + '?' + queryString
                      )}`
                    : `https://usher.ttvnw.net/vod/${mediaID}.m3u8?${queryString}`,
                {
                    headers: headers,
                    method: 'GET',
                }
            );

            if (req.status !== 200) return { valid: false };

            const data = await req.text(),
                parsed: {
                    artist: string;
                    title: string;
                    file: string;
                }[] = (
                    M3U.parse(data) as {
                        artist: string;
                        title: string;
                        file: string;
                    }[]
                ).filter((x) => x !== undefined);
            return {
                valid: true,
                data: parsed,
            };
        } else {
            const queryObj: { [key: string]: string | number | boolean } = {
                    acmb: 'e30=',
                    allow_source: true,
                    p: Math.floor(Math.random() * 99999) + 1,
                    cdm: 'wv',
                    transcode_mode: 'cbr_v1',
                    supported_codecs: 'avc1',
                    player_version: '1.19.0',
                    player_base: 'mediaplayer',
                    reassignments_supported: true,
                    playlist_include_framerate: true,
                    player_backend: 'mediaplayer',
                },
                headers: { [key: string]: string } = {
                    'User-Agent': userAgent,
                    Referer: 'https://player.twitch.tv',
                    Origin: 'https://player.twitch.tv',
                    'Client-ID': clientId,
                };

            if (proxy == false) {
                const accessToken = await fetchAccessToken(mediaID, false);

                if (accessToken.valid == false) return { valid: false };

                queryObj['token'] =
                    accessToken.data.streamPlaybackAccessToken.value;
                queryObj['sig'] =
                    accessToken.data.streamPlaybackAccessToken.signature;
            }

            if (proxy == true)
                headers['X-Donate-To'] = 'https://ttv.lol/donate';

            const queryString = Object.keys(queryObj)
                    .map((k) => {
                        return `${encodeURIComponent(k)}=${encodeURIComponent(
                            queryObj[k]
                        )}`;
                    })
                    .join('&'),
                req = await fetch(
                    proxy
                        ? `https://api.ttv.lol/playlist/${mediaID}.m3u8${encodeURIComponent(
                              '?allow_source=true'
                          )}`
                        : `https://usher.ttvnw.net/api/channel/hls/${mediaID}.m3u8?${queryString}`,
                    {
                        headers: headers,
                        method: 'GET',
                    }
                );

            if (req.status !== 200) return { valid: false };

            const data = await req.text(),
                parsed: {
                    artist: string;
                    title: string;
                    file: string;
                }[] = (
                    M3U.parse(data) as {
                        artist: string;
                        title: string;
                        file: string;
                    }[]
                ).filter((x) => x !== undefined);

            return {
                valid: true,
                data: parsed,
            };
        }
    } catch (err) {
        console.log(err);
        return { valid: false };
    }
}
