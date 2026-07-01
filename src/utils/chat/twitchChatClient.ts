import EventEmitter from 'events';
import { WebSocket } from 'ws';

export class TwitchChatProxy extends EventEmitter {
    private ws: WebSocket;
    private readonly url = 'wss://irc-ws.chat.twitch.tv:443';
    private streamers: string[] = [];
    private connected: boolean;

    constructor() {
        super();
        this.connect();
    }

    private messageHandler(message: String) {
        this.emit('message', message);
    }

    private connect() {
        this.ws = new WebSocket(this.url);

        this.ws.onerror = (event) => {
            console.error(`Twitch chat connection error: ${event.message}`);
        };

        // reconnect whenever the connection drops or fails to open,
        // with a delay so a Twitch outage can't busy-loop us
        this.ws.onclose = () => {
            this.ws = null;
            this.connected = false;
            setTimeout(() => this.connect(), 5000);
        };

        this.ws.onmessage = (data) => {
            // a single frame can carry several IRC lines
            for (const line of data.data.toString().split('\r\n')) {
                if (line.length === 0) continue;

                // twitch drops connections that don't answer keepalive pings
                if (line.startsWith('PING')) {
                    this.ws?.send(line.replace('PING', 'PONG'));
                    continue;
                }

                this.messageHandler(line);
            }
        };

        // tell twitch to give us everything
        this.ws.onopen = () => {
            this.ws.send('CAP REQ :twitch.tv/membership');
            this.ws.send('CAP REQ :twitch.tv/tags');
            this.ws.send('CAP REQ :twitch.tv/commands');

            // guest credentials
            this.ws.send('PASS none');
            this.ws.send('NICK justinfan333333333333');

            // if the connection ended abruptly,
            // we want to rejoin all of the streamers
            // to send to the clients
            for (const streamer of this.streamers) {
                this.ws.send(`JOIN #${streamer}`);
            }

            this.connected = true;
        };
    }

    public addStreamer(streamerName: string): void {
        if (this.streamers.includes(streamerName)) {
            return;
        }

        // always track the streamer; if we're currently reconnecting,
        // onopen replays the JOINs from this list
        this.streamers.push(streamerName);
        if (this.connected) {
            this.ws?.send(`JOIN #${streamerName}`);
        }
    }

    public removeStreamer(streamerName: string): void {
        const index = this.streamers.indexOf(streamerName);

        if (index >= 0) {
            this.streamers.splice(index, 1);
            if (this.connected) {
                this.ws?.send(`PART #${streamerName}`);
            }
        }
    }
}
