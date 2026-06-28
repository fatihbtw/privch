import axios from 'axios';

const clientId = process.env.CLIENTID || 'kimne78kx3ncx6brgo4mv6wki5h1ko',
    userAgent =
        process.env.USERAGENT ||
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36';

interface ChannelShellResponseObj {
    data: {
        userOrError: {
            userDoesNotExist: string | undefined;
            id: number;
            displayName: string;
            profileImageURL: string;
            bannerImageURL: string;
        };
    };
}
interface HomeOfflineCarouselResponseObj {
    data: {
        user: {
            description: string;
            channel: {
                socialMedias: {
                    name: string;
                    title: string;
                    url: string;
                }[];
            };
        } | null;
    };
}

export async function fetchStreamerInfo(username: string): Promise<{
    valid: boolean;
    data?: {
        displayName: string;
        description: string;
        profileImageURL: string;
        bannerImageURL: string;
        socialMedias: {
            name: string;
            title: string;
            url: string;
        }[];
    };
}> {
    try {
        const ChannelShellReq = await axios.post(
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
                    headers: {
                        'User-Agent': userAgent,
                        Referer: 'https://www.twitch.tv/',
                        Origin: 'https://www.twitch.tv/',
                        'Client-ID': clientId,
                    },
                    validateStatus: () => true,
                }
            ),
            HomeOfflineReq = await axios.post(
                'https://gql.twitch.tv/gql',
                {
                    operationName: 'HomeOfflineCarousel',
                    variables: {
                        channelLogin: username,
                        includeTrailerUpsell: false,
                        trailerUpsellVideoID: '',
                    },
                    extensions: {
                        persistedQuery: {
                            version: 1,
                            sha256Hash:
                                '84e25789b04ac4dcaefd673cfb4259d39d03c6422838d09a4ed2aaf9b67054d8',
                        },
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
            );
        if (
            ChannelShellReq.status !== 200 ||
            HomeOfflineReq.status !== 200 ||
            typeof (ChannelShellReq.data as ChannelShellResponseObj).data
                .userOrError.userDoesNotExist == 'string' ||
            (HomeOfflineReq.data as HomeOfflineCarouselResponseObj).data.user ==
                null
        )
            return { valid: false };
        const ChannelShellData: ChannelShellResponseObj = ChannelShellReq.data,
            HomeOfflineCarouselData: HomeOfflineCarouselResponseObj =
                HomeOfflineReq.data;

        return {
            valid: true,
            data: {
                displayName: ChannelShellData.data.userOrError.displayName,
                description: HomeOfflineCarouselData.data.user.description,
                profileImageURL:
                    ChannelShellData.data.userOrError.profileImageURL,
                bannerImageURL:
                    ChannelShellData.data.userOrError.bannerImageURL,
                socialMedias:
                    HomeOfflineCarouselData.data.user.channel.socialMedias.map(
                        (x) => {
                            // removing __typename
                            return {
                                name: x.name,
                                title: x.title,
                                url: x.url,
                            };
                        }
                    ),
            },
        };
    } catch (err) {
        console.log(err);
        return { valid: false };
    }
}
