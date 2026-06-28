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

            this.ws.onclose = () => {
                this.ws = null;
                this.connected = false;
                this.connect();
            };

            this.ws.onmessage = (data) => {
                this.messageHandler(data.data.toString());
            };
        };
    }

    public addStreamer(streamerName: string): void {
        if (!this.connected || this.streamers.includes(streamerName)) {
            return;
        }

        this.streamers.push(streamerName);
        this.ws?.send(`JOIN #${streamerName}`);
    }

    public removeStreamer(streamerName: string): void {
        if (!this.connected) {
            return;
        }

        const index = this.streamers.indexOf(streamerName);

        if (index >= 0) {
            this.streamers.splice(index, 1);
            this.ws?.send(`PART #${streamerName}`);
        }
    }
}
