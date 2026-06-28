import axios from 'axios';
import genDeviceID from './generateGqlDeviceID';
import genericResponseObject from '../types/genericResponseObject';
import {
    AboutPanelUserInfo,
    ChannelShellInfo,
    StreamMetadataInfo,
} from '../types/userInfo';

const clientId = process.env.CLIENTID || 'kimne78kx3ncx6brgo4mv6wki5h1ko',
    userAgent =
        process.env.USERAGENT ||
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36';

export default async function fetchUserInfo(username: string): Promise<
    genericResponseObject<{
        id: string;
        description: string;
        displayName: string;
        avatar: string;
        banner: string;
        followers: number;
        socialMedias: {
            id: string;
            name: string;
            title: string;
            url: string;
        }[];
        live: boolean;
    }>
> {
    const deviceId = genDeviceID(),
        headers = {
            'User-Agent': userAgent,
            Referer: 'https://www.twitch.tv/',
            Origin: 'https://www.twitch.tv/',
            'Client-ID': clientId,
            'Device-ID': deviceId,
            'X-Device-ID': deviceId,
        },
        aboutPanelReq = await axios.post(
            'https://gql.twitch.tv/gql',
            {
                operationName: 'ChannelRoot_AboutPanel',
                variables: {
                    channelLogin: username,
                    skipSchedule: true,
                },
                extensions: {
                    persistedQuery: {
                        sha256Hash:
                            '6089531acef6c09ece01b440c41978f4c8dc60cb4fa0124c9a9d3f896709b6c6',
                        version: 1,
                    },
                },
            },
            {
                headers: headers,
                validateStatus: () => true,
            }
        );

    if (
        aboutPanelReq.status !== 200 ||
        !(aboutPanelReq.data as AboutPanelUserInfo).data.user
    ) {
        return {
            error: {
                status: aboutPanelReq.status,
                message: 'ChannelRoot_AboutPanel failed',
            },
            data: null,
        };
    }

    const aboutPanelData: AboutPanelUserInfo = aboutPanelReq.data,
        streamMetadataReq = await axios.post(
            'https://gql.twitch.tv/gql',
            {
                operationName: 'StreamMetadata',
                variables: {
                    channelLogin: username,
                },
                extensions: {
                    persistedQuery: {
                        sha256Hash:
                            'a647c2a13599e5991e175155f798ca7f1ecddde73f7f341f39009c14dbf59962',
                        version: 1,
                    },
                },
            },
            {
                headers: headers,
                validateStatus: () => true,
            }
        );
    if (
        streamMetadataReq.status !== 200 ||
        !(streamMetadataReq.data as StreamMetadataInfo).data.user
    ) {
        return {
            error: {
                status: streamMetadataReq.status,
                message: 'StreamMetadata failed',
            },
            data: null,
        };
    }

    const streamMetadataData: StreamMetadataInfo = streamMetadataReq.data,
        channelShellReq = await axios.post(
            'https://gql.twitch.tv/gql',
            {
                operationName: 'ChannelShell',
                variables: {
                    login: username,
                },
                extensions: {
                    persistedQuery: {
                        version: 1,
                        sha256Hash:
                            '580ab410bcd0c1ad194224957ae2241e5d252b2c5173d8e0cce9d32d5bb14efe',
                    },
                },
            },
            {
                headers: headers,
                validateStatus: () => true,
            }
        );

    if (
        channelShellReq.status !== 200 ||
        (channelShellReq.data as ChannelShellInfo).data.userOrError.reason ||
        (channelShellReq.data as ChannelShellInfo).data.userOrError
            .userDoesNotExist
    ) {
        return {
            error: {
                status: channelShellReq.status,
                message: 'ChannelShell failed',
            },
            data: null,
        };
    }

    const channelShellData: ChannelShellInfo = channelShellReq.data;

    return {
        error: null,
        data: {
            id: aboutPanelData.data.user.id,
            description: aboutPanelData.data.user.description,
            displayName: aboutPanelData.data.user.displayName,
            avatar: aboutPanelData.data.user.profileImageURL,
            banner: channelShellData.data.userOrError.bannerImageURL,
            followers: aboutPanelData.data.user.followers.totalCount,
            socialMedias: aboutPanelData.data.user.channel.socialMedias,
            live: streamMetadataData.data.user.stream !== null,
        },
    };
}
