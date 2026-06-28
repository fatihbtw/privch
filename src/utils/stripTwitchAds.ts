// Twitch stitches ad segments directly into the live HLS playlist, marking
// the start with #EXT-X-DATERANGE CLASS="twitch-stitched-ad" and the end
// with #EXT-X-DISCONTINUITY. Older streams instead just tag the ad
// segment's EXTINF title with "Amazon". Drop both.
const AD_DATERANGE = /CLASS="twitch-stitched-ad"/i,
    AD_TITLE = /Amazon/i;

export default function stripTwitchAds(playlist: string): string {
    const lines = playlist.split('\n'),
        out: string[] = [];
    // 'normal' content, 'ad-entering' just saw the DATERANGE marker and is
    // waiting to consume the discontinuity that opens the ad break, 'in-ad'
    // drops everything until the discontinuity that closes it.
    let mode: 'normal' | 'ad-entering' | 'in-ad' = 'normal',
        skipNextLine = false;

    for (const line of lines) {
        if (skipNextLine) {
            skipNextLine = false;
            continue;
        }

        if (mode === 'normal') {
            if (
                line.startsWith('#EXT-X-DATERANGE') &&
                AD_DATERANGE.test(line)
            ) {
                mode = 'ad-entering';
                continue;
            }
            if (line.startsWith('#EXTINF') && AD_TITLE.test(line)) {
                skipNextLine = true;
                continue;
            }
            out.push(line);
            continue;
        }

        if (mode === 'ad-entering') {
            mode = 'in-ad';
            if (line.startsWith('#EXT-X-DISCONTINUITY')) continue;
            // no opening discontinuity present, this line is already ad
            // content; fall through to the in-ad handling below.
        }

        if (line.startsWith('#EXT-X-DISCONTINUITY')) {
            mode = 'normal';
            out.push(line);
        }
    }

    return out.join('\n');
}

if (require.main === module) {
    const assert = require('assert');

    const withAdBreak = [
        '#EXTM3U',
        '#EXTINF:2.002,live',
        'seg1.ts',
        '#EXT-X-DATERANGE:ID="stitched-ad-1",CLASS="twitch-stitched-ad",DURATION=4.0',
        '#EXT-X-DISCONTINUITY',
        '#EXTINF:2.0,live',
        'ad1.ts',
        '#EXTINF:2.0,live',
        'ad2.ts',
        '#EXT-X-DISCONTINUITY',
        '#EXTINF:2.002,live',
        'seg2.ts',
    ].join('\n');

    const stripped = stripTwitchAds(withAdBreak);
    assert.ok(!stripped.includes('ad1.ts'));
    assert.ok(!stripped.includes('ad2.ts'));
    assert.ok(stripped.includes('seg1.ts'));
    assert.ok(stripped.includes('seg2.ts'));

    const legacy = [
        '#EXTM3U',
        '#EXTINF:2.002,live',
        'seg1.ts',
        '#EXTINF:2.0,Amazon',
        'ad1.ts',
        '#EXTINF:2.002,live',
        'seg2.ts',
    ].join('\n');

    const strippedLegacy = stripTwitchAds(legacy);
    assert.ok(!strippedLegacy.includes('ad1.ts'));
    assert.ok(strippedLegacy.includes('seg1.ts'));
    assert.ok(strippedLegacy.includes('seg2.ts'));

    console.log('stripTwitchAds: all checks passed');
}
