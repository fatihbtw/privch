import { AccessTokenRes, PlaybackAccessToken } from '../types/acessToken.ts';

const clientId = Deno.env.get('CLIENTID') || 'kimne78kx3ncx6brgo4mv6wki5h1ko',
    userAgent =
        Deno.env.get('USERAGENT') ||
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36',
    graphQlQuery =
        'query PlaybackAccessToken_Template($login: String!, $isLive: Boolean!, $vodID: ID!, $isVod: Boolean!, $playerType: String!) {          streamPlaybackAccessToken(channelName: $login, params: {platform: "web", playerBackend: "mediaplayer", playerType: $playerType}) @include(if: $isLive) {                value                signature                __typename          }          videoPlaybackAccessToken(id: $vodID, params: {platform: "web", playerBackend: "mediaplayer", playerType: $playerType}) @include(if: $isVod) {                value                signature                __typename          }    }';

export default async function fetchAcessToken(
    mediaId: string,
    vod: boolean
): Promise<{
    valid: boolean;
    data?: AccessTokenRes | PlaybackAccessToken;
    type?: 'vod' | 'stream';
}> {
    try {
        const req = await fetch('https://gql.twitch.tv/gql', {
            method: 'POST',
            body: JSON.stringify({
                query: graphQlQuery,
                variables: {
                    isLive: vod == true ? false : true,
                    login: vod == true ? '' : mediaId,
                    isVod: vod ? mediaId : false,
                    vodID: vod == true ? mediaId : '',
                    playerType: 'site',
                },
            }),
            headers: {
                'User-Agent': userAgent,
                Referer: 'https://www.twitch.tv/',
                Origin: 'https://www.twitch.tv/',
                'Client-ID': clientId,
            },
        });
        if (req.status !== 200) return { valid: false };

        const { data } = await req.json();

        return {
            valid: true,
            data: data,
            type: data['videoPlaybackAccessToken'] ? 'vod' : 'stream',
        };
    } catch (err) {
        console.log(err);
        return {
            valid: false,
        };
    }
}
