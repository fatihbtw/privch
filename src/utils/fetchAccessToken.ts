import axios from 'axios';
import {
    AccessTokenRes,
    AccessTokenResponse,
    PlaybackAccessToken,
} from '../types/accessToken';
import genDeviceID from './generateGqlDeviceID';

const clientId = process.env.CLIENTID || 'kimne78kx3ncx6brgo4mv6wki5h1ko',
    userAgent =
        process.env.USERAGENT ||
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36',
    graphQlQuery = (platform: string) =>
        `query PlaybackAccessToken_Template($login: String!, $isLive: Boolean!, $vodID: ID!, $isVod: Boolean!, $playerType: String!) {          streamPlaybackAccessToken(channelName: $login, params: {platform: "${platform}", playerBackend: "mediaplayer", playerType: $playerType}) @include(if: $isLive) {                value                signature                __typename          }          videoPlaybackAccessToken(id: $vodID, params: {platform: "web", playerBackend: "mediaplayer", playerType: $playerType}) @include(if: $isVod) {                value                signature                __typename          }    }`;

export async function fetchAcessTokenWithOptions(options: {
    mediaID: string;
    isVod: boolean;
    playerType: string;
    platform: string;
}): Promise<{
    error: boolean;
    data: AccessTokenResponse | null;
}> {
    const deviceId = genDeviceID(),
        req = await axios.post(
            'https://gql.twitch.tv/gql',
            {
                query: graphQlQuery(options.platform),
                variables: {
                    isLive: options.isVod == true ? false : true,
                    login: options.isVod == true ? '' : options.mediaID,
                    isVod: options.isVod,
                    vodID: options.isVod == true ? options.mediaID : '',
                    playerType: options.playerType,
                },
            },
            {
                headers: {
                    'User-Agent': userAgent,
                    Referer: 'https://www.twitch.tv/',
                    Origin: 'https://www.twitch.tv/',
                    'Client-ID': clientId,
                    'Device-ID': deviceId,
                    'X-Device-ID': deviceId,
                },
                validateStatus: () => true,
            }
        ),
        data: AccessTokenResponse = req.data;

    if (req.status !== 200 || typeof data.errors !== 'undefined') {
        return {
            error: true,
            data: null,
        };
    }

    if (
        (options.isVod && !data.data.videoPlaybackAccessToken) ||
        (!options.isVod && !data.data.streamPlaybackAccessToken)
    ) {
        return {
            error: true,
            data: null,
        };
    }

    return {
        error: false,
        data: data,
    };
}

export default async function fetchAcessToken(
    mediaId: string,
    vod: boolean
): Promise<{
    valid: boolean;
    data?: AccessTokenRes | PlaybackAccessToken;
    type?: 'vod' | 'stream';
}> {
    return axios
        .post(
            'https://gql.twitch.tv/gql',
            {
                query: graphQlQuery('web'),
                variables: {
                    isLive: vod == true ? false : true,
                    login: vod == true ? '' : mediaId,
                    isVod: vod ? mediaId : false,
                    vodID: vod == true ? mediaId : '',
                    playerType: 'site',
                },
            },
            {
                headers: {
                    'User-Agent': userAgent,
                    Referer: 'https://www.twitch.tv/',
                    Origin: 'https://www.twitch.tv/',
                    'Client-ID': clientId,
                },
                validateStatus: () => true,
            }
        )
        .then((res) => {
            if (res.status !== 200) {
                return { valid: false };
            }

            return {
                valid: true,
                data: res.data,
                type: res.data['videoPlaybackAccessToken'] ? 'vod' : 'stream',
            };
        });
}
