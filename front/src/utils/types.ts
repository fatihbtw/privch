export interface streamStatusResponse {
    invalid?: boolean;
    views?: number;
    game?: string;
    avatar?: string;
    title?: string;
}

export interface vodsResponse {
    invalid?: boolean;
    vods?: {
        id: string;
        previewThumbnailURL: string;
        game: string;
        publishedAt: string;
        title: string;
        viewCount: number;
        lengthSeconds: number;
    }[];
}

export interface streamerMetadataResponse {
    invalid?: boolean;
    displayName?: string;
    description?: string;
    profileImageURL?: string;
    bannerImageURL?: string;
    socialMedias?: {
        name: string;
        title: string;
        url: string;
    }[];
}

export interface clipsResponse {
    invalid?: boolean;
    clips?: {
        author: string;
        slug: string;
        title: string;
        viewCount: number;
        thumbnailURL: string;
        createdAt: string;
        durationSeconds: number;
        game: number;
    }[];
}

export interface clipsApiResponse {
    invalid?: boolean;
    metadata?: {
        author: string;
        avatar: string;
        title: string;
        views: number;
        date: string;
        game: number;
    };
    media?: {
        quality: string;
        src: string;
        originalURL: string;
    }[];
}

export interface vodsApiResponse {
    invalid?: boolean;
    game?: string;
    avatar?: string;
    username?: string;
    loginName?: string;
    title?: string;
}

export interface vodCommentsApiResponse {
    valid: boolean;
    invalid?: boolean;
    data?: {
        offset: number;
        username: string;
        message: string;
        color: string;
    }[];
}

export interface vodCommentsDataApiResponse {
    offset: number;
    username: string;
    message: string;
    emote?: boolean;
    color: string;
}

export interface parsedMessageObject {
    '@badge-info'?: string;
    badges?: string;
    color?: string;
    'display-name'?: string;
    //emotes?: string;
    emotes?: boolean;
    'first-msg'?: string;
    flags?: string;
    id?: string;
    mod?: string; // 0 || 1
    'returning-chatter'?: string;
    'room-id'?: string;
    subscriber?: string; // 0 || 1
    'tmi-sent-ts'?: string;
    turbo?: string;
    'user-id'?: string;
    'user-type'?: string;
    message?: string;
}
