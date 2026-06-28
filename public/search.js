const clipRegex = /(.+)?twitch\.tv\/\w+\/clip\/[\w-]+/,
    streamRegex = /(.+)?twitch\.tv\/(.+)/,
    vodRegex = /(.+)?twitch\.tv\/videos\/(\d+)/,
    twitchDomainRegex = /(.+)?twitch\.tv/;

function _search() {
    const input = document.getElementById('media-txt').value;

    if (input.length == 0) return;

    const resSelect = document.getElementById('media-res'),
        resVal = resSelect.options[resSelect.selectedIndex].text,
        useProxy = document.getElementById('proxy').checked,
        queryParams = `?${resVal == 'Resolution' ? '' : `?quality=${resVal}&`}${
            useProxy ? 'proxy=true' : ''
        }`;

    if (
        input.match(clipRegex) ||
        input.match(streamRegex) ||
        input.match(vodRegex)
    ) {
        window.location.href = `${input.replace(
            twitchDomainRegex,
            ''
        )}${queryParams}`;
    } else {
        if (!Number.isNaN(Number(input))) {
            window.location.href = `/videos/${input}${queryParams}`;
        } else {
            window.location.href = `/${input}${queryParams}`;
        }
    }
}
