//@ts-ignore
import { Parser } from 'm3u8-parser';
import axios from 'axios';
import { fetchAcessTokenWithOptions } from './fetchAccessToken';
import { MobileStreamAccessTokenResponse } from '../types/accessToken';
import m3u8ParsedOutput from '../types/m3u8ParserOutput';
import genDeviceID from './generateGqlDeviceID';

const clientId = process.env.CLIENTID || 'kimne78kx3ncx6brgo4mv6wki5h1ko',
    userAgent =
        process.env.USERAGENT ||
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36';

function hasAds(m3u8Data: string): boolean {
    const parser = new Parser(),
        adAmazonTitleRegex = /Amazon/i;

    parser.push(m3u8Data);
    parser.end();

    const manifest: m3u8ParsedOutput = parser.manifest,
        adSegments:
            | {
                  title: string;
                  duration: number;
                  uri: string;
              }[]
            | [] = manifest.segments.filter((seg) =>
            adAmazonTitleRegex.test(seg.title)
        );

    return adSegments.length >= 1 ? true : false;
}

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

async function fetchAccessTokenMobile(username: string): Promise<{
    error: boolean;
    data?: {
        token: string;
        sig: string;
    };
}> {
    const deviceId = genDeviceID(),
        req = await axios.post(
            'https://gql.twitch.tv/gql',
            {
                query: 'query StreamPlayer_Query(\n  $login: String!\n  $playerType: String!\n  $platform: String!\n  $skipPlayToken: Boolean!\n) {\n  ...StreamPlayer_token\n}\n\nfragment StreamPlayer_token on Query {\n  user(login: $login) {\n    login\n    stream @skip(if: $skipPlayToken) {\n      playbackAccessToken(params: {platform: $platform, playerType: $playerType}) {\n        signature\n        value\n        expiresAt\n        authorization {\n          isForbidden\n          forbiddenReasonCode\n        }\n      }\n      id\n      __typename\n    }\n    id\n    __typename\n  }\n}\n',
                variables: {
                    login: username,
                    playerType: 'pulsar',
                    platform: 'mobile_web',
                    skipPlayToken: false,
                },
            },
            {
                headers: {
                    'User-Agent': userAgent,
                    Referer: 'https://m.twitch.tv/',
                    Origin: 'https://m.twitch.tv/',
                    'Client-Id': clientId,
                    'Device-Id': deviceId,
                },
                validateStatus: () => true,
            }
        ),
        data: MobileStreamAccessTokenResponse = req.data;
    if (
        req.status !== 200 ||
        data.data === null ||
        data.data.user.stream === null
    )
        return {
            error: true,
            data: null,
        };

    return {
        error: false,
        data: {
            token: data.data.user.stream.playbackAccessToken.value,
            sig: data.data.user.stream.playbackAccessToken.signature,
        },
    };
}

export default async function fetchStreamMedia(
    streamer: string,
    quality: number
): Promise<{ error: boolean; data: string | null }> {
    let accessToken = await fetchAccessTokenMobile(streamer);

    if (accessToken.error == true) return { error: true, data: null };

    const queryObj = {
            player_type: 'pulsar',
            player_backend: 'mediaplayer',
            playlist_include_framerate: 'true',
            allow_source: true,
            transcode_mode: 'cbr_v1',
            cdm: 'wv',
            player_version: '1.22.0',
            token: accessToken.data.token,
            sig: accessToken.data.sig,
        },
        queryString = () =>
            Object.keys(queryObj)
                .map((k) => {
                    return `${encodeURIComponent(k)}=${encodeURIComponent(
                        queryObj[k]
                    )}`;
                })
                .join('&'),
        headers = {
            'User-Agent': userAgent,
            Referer: 'https://m.twitch.tv',
            Origin: 'https://m.twitch.tv',
            Accept: 'application/x-mpegURL, application/vnd.apple.mpegurl, application/json, text/plain',
        },
        m3u8Req = await axios.get(
            `https://usher.ttvnw.net/api/channel/hls/${streamer}.m3u8?${queryString()}`,
            {
                headers: headers,
                validateStatus: () => true,
            }
        );

    if (m3u8Req.status !== 200) {
        return {
            error: true,
            data: null,
        };
    }

    return {
        error: false,
        data: m3u8Req.data,
    };
}
