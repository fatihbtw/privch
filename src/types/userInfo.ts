export interface AboutPanelUserInfo {
    data: {
        user: {
            id: string;
            description: string;
            displayName: string;
            profileImageURL: string;
            followers: {
                totalCount: number;
            };
            channel: {
                id: string;
                socialMedias: {
                    id: string;
                    name: string;
                    title: string;
                    url: string;
                }[];
            };
        } | null;
    };
}

export interface StreamMetadataInfo {
    data: {
        user: {
            stream: {
                id: string;
                type: string;
                createdAt: string;
                game: {
                    id: string;
                    name: string;
                };
            } | null;
        } | null;
    };
}

export interface ChannelShellInfo {
    data: {
        userOrError: {
            userDoesNotExist?: string;
            reason?: string;
            stream?: {
                id: string;
                viewersCount: number;
            };
            bannerImageURL?: string;
        };
    };
}
