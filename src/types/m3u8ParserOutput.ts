export default interface ParsedOutput {
    segments: {
        title: string;
        duration: number;
        uri: string;
    }[];
    playlists: {
        attributes: {
            VIDEO: string;
            RESOLUTION: {
                width: number;
                height: number;
            };
        };
        uri: string;
    }[];
    targetDuration?: number;
}
