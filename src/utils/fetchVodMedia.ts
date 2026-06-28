//@ts-ignore
import { Parser } from 'm3u8-parser';
import axios from 'axios';
import { fetchAcessTokenWithOptions } from './fetchAccessToken';
import { proxyVodManifestBase64 } from './proxyManifestFile';
import m3u8ParsedOutput from '../types/m3u8ParserOutput';

const clientId = process.env.CLIENTID || 'kimne78kx3ncx6brgo4mv6wki5h1ko',
    userAgent =
        process.env.USERAGENT ||
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36';

function findPlaylistByQuality(
    manifest: string,
    quality: number
): {
    attributes: {
        VIDEO: string;
        RESOLUTION: {
            width: number;
            height: number;
        };
    };
    uri: string;
} {
    const parser = new Parser();

    parser.push(manifest);
    parser.end();

    const manifestParsed: m3u8ParsedOutput = parser.manifest;

    return manifestParsed.playlists.find(
        (playlist) => playlist.attributes.RESOLUTION.height == quality
    );
}

export default async function fetchVodMedia(
    vodId: string,
    quality: number
): Promise<{
    error: boolean;
    data: string | null;
}> {
    const accessToken = await fetchAcessTokenWithOptions({
        isVod: true,
        mediaID: vodId,
        platform: 'web',
        playerType: 'site',
    });

    if (accessToken.error == true) {
        return {
            error: true,
            data: null,
        };
    }

    const queryObj = {
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
            token: accessToken.data.data.videoPlaybackAccessToken.value,
            sig: accessToken.data.data.videoPlaybackAccessToken.signature,
        },
        headers = {
            'User-Agent': userAgent,
            Referer: 'https://player.twitch.tv',
            Origin: 'https://player.twitch.tv',
            'Client-ID': clientId,
        },
        queryString = Object.keys(queryObj)
            .map((k) => {
                return `${encodeURIComponent(k)}=${encodeURIComponent(
                    queryObj[k]
                )}`;
            })
            .join('&'),
        playlistReq = await axios.get(
            `https://usher.ttvnw.net/vod/${vodId}.m3u8?${queryString}`,
            {
                headers: headers,
                validateStatus: () => true,
            }
        );

    if (playlistReq.status !== 200) {
        return {
            error: true,
            data: null,
        };
    }

    const selectedPlaylist = findPlaylistByQuality(playlistReq.data, quality),
        cdnUrl = selectedPlaylist.uri.split('index-dvr.m3u8')[0],
        resManifest = await axios.get(selectedPlaylist.uri, {
            headers: headers,
            validateStatus: () => true,
        });

    if (resManifest.status !== 200) {
        return {
            error: true,
            data: null,
        };
    }

    return {
        error: false,
        data: proxyVodManifestBase64(
            resManifest.data,
            '/api/proxy?url=',
            cdnUrl
        ),
    };
}
