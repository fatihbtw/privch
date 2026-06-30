const VOLUME_KEY = 'privch_volume';

export function applyStoredVolume(media: HTMLMediaElement) {
    const saved = parseFloat(localStorage.getItem(VOLUME_KEY) || '1');
    media.volume = Number.isNaN(saved) ? 1 : saved;
    media.addEventListener('volumechange', () => {
        localStorage.setItem(VOLUME_KEY, String(media.volume));
    });
}
