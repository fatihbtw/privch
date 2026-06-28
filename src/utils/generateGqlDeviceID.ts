// https://github.com/cleanlock/VideoAdBlockForTwitch/blob/145921a822e830da62d39e36e8aafb8ef22c7be6/chrome/remove_video_ads.js#L721
export default function genDeviceID(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789',
        charsLenght = chars.length;
    let result = '';

    for (let i = 0; i < 32; i++) {
        result += chars.charAt(Math.floor(Math.random() * charsLenght));
    }

    return result;
}
