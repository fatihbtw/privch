export interface AccessTokenFull {
    data: {
        streamPlaybackAccessToken: {
            // JSON.stringify format
            value: {
                adblock: boolean;
                authorization: {
                    forbidden: boolean;
                    reason: string;
                };
                blackout_enabled: boolean;
                channel: string;
                channel_id: number;
                chansub: {
                    restricted_bitrates: []; // type?
                    view_until: number;
                };
                ci_gb: boolean;
                geoblock_reason: string;
                device_id: null; // probably a number or string
                expires: number;
                extended_history_allowed: boolean;
                game: string;
                hide_ads: boolean;
                https_required: boolean;
                mature: boolean;
                partner: boolean;
                platform: string;
                player_type: string;
                private: {
                    allowed_to_view: boolean;
                };
                privileged: boolean;
                role: string;
                server_ads: boolean;
                show_ads: boolean;
                subscriber: boolean;
                turbo: boolean;
                user_id: null | string | number; // idk,
                user_ip: string;
                version: number;
            };
            signature: string;
            __typename: string | 'PlaybackAccessToken';
        };
    };
    extensions: {
        durationMilliseconds: number;
        requestID: string;
        v: number;
    };
}

export interface AccessTokenRes {
    data: {
        streamPlaybackAccessToken: {
            value: string;
            signature: string;
            __typename: string | 'PlaybackAccessToken';
        };
    };
    extensions: {
        durationMilliseconds: number;
        requestID: string;
        v: number;
    };
}

export interface PlaybackAccessToken {
    data: {
        videoPlaybackAccessToken: {
            value: string;
            signature: string;
            __typename: string | 'PlaybackAccessToken';
        };
    };
    extensions: {
        durationMilliseconds: number;
        requestID: string;
        v: number;
    };
}

export interface AccessTokenValue {
    adblock: boolean;
    authorization: {
        forbidden: boolean;
        reason: string;
    };
    blackout_enabled: boolean;
    channel: string;
    channel_id: number;
    chansub: {
        restricted_bitrates: []; // type?
        view_until: number;
    };
    ci_gb: boolean;
    geoblock_reason: string;
    device_id: null; // probably a number or string
    expires: number;
    extended_history_allowed: boolean;
    game: string;
    hide_ads: boolean;
    https_required: boolean;
    mature: boolean;
    partner: boolean;
    platform: string;
    player_type: string;
    private: {
        allowed_to_view: boolean;
    };
    privileged: boolean;
    role: string;
    server_ads: boolean;
    show_ads: boolean;
    subscriber: boolean;
    turbo: boolean;
    user_id: null | string | number; // idk,
    user_ip: string;
    version: number;
}
