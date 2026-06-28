const chat = document.getElementById('chat'),
    queryParams = `?${
        quality !== 'undefined' && quality.length > 1
            ? `quality=${window.quality}&`
            : 'quality=1280x720&'
    }proxy=${window.proxy ? window.proxy : false}`;

if (Hls.isSupported()) {
    const video = document.getElementById('stream'),
        streamURL = `${window.location.origin}/stream/${username}${queryParams}`,
        hls = new Hls({
            // lowLatencyMode: true,
            maxBufferLength: 16,
            maxBufferSize: 64 * 1024 * 1024,
            maxMaxBufferLength: 32,
            backBufferLength: 2,
            liveSyncDuration: 2,
            manifestLoadingMaxRetry: Infinity,
            manifestLoadingRetryDelay: 500,
            xhrSetup: (xhr, url) => {
                if (url !== streamURL) {
                    xhr.open(
                        'GET',
                        `${window.location.origin}/stream/urlproxy?url=${url}`
                    );
                } else xhr.open('GET', url);
            },
        }),
        retryStream = () => {
            hls.attachMedia(video);
            hls.loadSource(streamURL);
            hls.startLoad();
        };
    hls.attachMedia(video);
    hls.on(Hls.Events.MEDIA_ATTACHED, function () {
        hls.loadSource(streamURL);
    });
    hls.on(Hls.Events.MANIFEST_PARSED, function () {
        video.play();
    });
    // based on https://github.com/videojs/video.js/issues/3725#issuecomment-410523448
    hls.on(Hls.Events.ERROR, function (event, data) {
        if (data.fatal) {
            switch (data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                    console.log('Network error. Retrying..');
                    retryStream();
                    break;
                case Hls.ErrorTypes.MEDIA_ERROR:
                    console.log('Media error. Retrying..');
                    hls.recoverMediaError();
                    break;
            }
        }
    });
} else alert('Your browser do not support HLS');

console.log('Connecting to chat');
const ws = new WebSocket('wss://irc-ws.chat.twitch.tv/');
ws.onopen = () => {
    ws.send('CAP REQ :twitch.tv/tags twitch.tv/commands twitch.tv/membership');
    ws.send('PASS SCHMOOPIIE');
    ws.send('NICK justinfan35233');
    ws.send('USER justinfan35233 8 * :justinfan35233');

    ws.send(`JOIN #${username}`);
};
ws.onclose = () => {
    console.log('Websocket closed');

    const warn = document.createElement('div');
    warn.innerText = '⚠ Chat error: Websocket closed';

    chat.appendChild(warn);
};
ws.onmessage = (msg) => {
    let data = msg.data;
    if (data == null) return;
    const name = data
            .match(/display-name=(.*?);/g)[0]
            .replace(/display-name=/, '')
            .replace(/;/, ''),
        message = data
            .match(new RegExp(`${username}\ :(.*?)$`, 'gm'))[0]
            .replace(/.*:/, ''),
        color = data.match(/#([a-fA-F0-9]{3,6})/)[0],
        chatmsg = document.createElement('div'),
        chatuser = document.createElement('span'),
        chatcontent = document.createElement('span');

    // username and color
    chatuser.innerText = name + ': ';
    chatuser.style.color = color || 'white';

    // message content
    chatcontent.innerText = message;

    // append message
    chatmsg.appendChild(chatuser);
    chatmsg.appendChild(chatcontent);

    chatmsg.classList = 'mt-1 mb-1';
    chat.appendChild(chatmsg);

    chat.scrollTop = chat.scrollHeight;
};

// fetch info
// updating every 1 minute
async function fetchMetadata() {
    const streamer = document.getElementById('streamer'),
        avatar = document.getElementById('avatar'),
        category = document.getElementById('category'),
        title = document.getElementById('title'),
        views = document.getElementById('views');
    let metadata = await fetch(
        `${window.location.origin}/api/streaminfo/${window.username}`
    );
    if (metadata.status !== 200) return;

    metadata = await metadata.json();

    streamer.innerText = window.username;
    avatar.src = `/stream/urlproxy?url=${metadata.avatar}`;
    category.innerText = metadata.game;
    title.innerText = metadata.title;
    views.innerText = `👤 ${metadata.views}`;
}

(async () => {
    console.log('Fetching metadata');
    await fetchMetadata();
})();

setInterval(async () => {
    console.log('Updating metadata');
    await fetchMetadata();
}, 60000);
