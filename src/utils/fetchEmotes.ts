import axios from 'axios';
import fetchUserInfo from './fetchUserInfo';
import { ChannelEmotes } from '../types/emotesResponse';
import genericResponseObject from '../types/genericResponseObject';

const clientId = process.env.CLIENTID || 'kimne78kx3ncx6brgo4mv6wki5h1ko',
    userAgent =
        process.env.USERAGENT ||
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36';

export default async function fetchChannelEmoteList(username: string): Promise<
    genericResponseObject<
        {
            id: string;
            token: string;
            url: string;
        }[]
    >
> {
    const userInfo = await fetchUserInfo(username);

    if (userInfo.error !== null) {
        return {
            error: userInfo.error,
            data: null,
        };
    }

    const listReq = await axios.post(
            `https://gql.twitch.tv/gql`,
            {
                operationName:
                    'EmotePicker_EmotePicker_UserSubscriptionProducts',
                variables: {
                    channelOwnerID: userInfo.data.id,
                },
                extensions: {
                    persistedQuery: {
                        version: 1,
                        sha256Hash:
                            '71b5f829a4576d53b714c01d3176f192cbd0b14973eb1c3d0ee23d5d1b78fd7e',
                    },
                },
            },
            {
                headers: {
                    'User-Agent': userAgent,
                    Referer: 'https://m.twitch.tv/',
                    Origin: 'https://m.twitch.tv/',
                    'Client-ID': clientId,
                },
                validateStatus: () => true,
            }
        ),
        listData: ChannelEmotes = listReq.data;

    if (
        listReq.status !== 200 ||
        listData.data.channel == null ||
        listData.data.user == null
    ) {
        return {
            error: {
                status: listReq.status,
                message: 'Invalid user',
            },
            data: null,
        };
    }

    const fullEmoteList = [];

    if (listData.data.channel.localEmoteSets !== null) {
        listData.data.channel.localEmoteSets.map((es) =>
            es.emotes.map((e) => {
                fullEmoteList.push({ id: e.id, token: e.token });
            })
        );
    }

    if (listData.data.user.subscriptionProducts !== null) {
        listData.data.user.subscriptionProducts.map((sub) =>
            sub.emotes.map((em) => {
                fullEmoteList.push({
                    id: em.id,
                    token: em.token,
                });
            })
        );
    }

    const proxiedEmoteList = fullEmoteList.map((em) => {
        return {
            id: em.id,
            token: em.token,
            url: `/api/proxy?url=${Buffer.from(
                `https://static-cdn.jtvnw.net/emoticons/v2/${em.id}/static/dark/2.0`
            ).toString('base64')}`,
        };
    });

    return {
        error: null,
        data: proxiedEmoteList,
    };
}
