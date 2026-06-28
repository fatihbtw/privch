import { randomUUID } from 'crypto';
import { TwitchChatProxy } from './twitchChatClient';
import ws from 'ws';

interface ExtWebSocket extends ws {
    id?: string;
}

export class TwitchChatServer {
    private clients: { [k: string]: ExtWebSocket[] };
    private chatProxy: TwitchChatProxy;

    constructor() {
        this.clients = {};
        this.chatProxy = new TwitchChatProxy();
        this.chatProxy.on('message', this.messageHandler);
    }

    get getClients() {
        return this.clients;
    }

    public async startWebSocketServer(server: ws.Server): Promise<void> {
        server.on('connection', (ws: ws) => {
            const socket = ws as ExtWebSocket;
            socket.on(
                'message',
                this.handleWebSocketMessage.bind(this, socket)
            );
            socket.on('close', this.handleWebSocketClose.bind(this, socket));
        });
    }

    private messageHandler = (message: String) => {
        let split = message.split(' ');
        if (split.length < 4 || split[2] !== 'PRIVMSG') return;
        let streamer = split[3].replace('#', '');

        let clientsToSend;
        if (!this.clients || !this.clients[streamer]) {
            clientsToSend = [];
        } else {
            clientsToSend = this.clients[streamer];
        }

        for (let client of clientsToSend) {
            client.send(message);
        }
    };

    private async handleWebSocketMessage(
        socket: ExtWebSocket,
        message: string
    ) {
        const data = message.toString();
        const splitted = data.split(' ');

        if (splitted.length < 2 || splitted[0] !== 'JOIN') {
            socket.close();
            return;
        }

        const streamersToJoin = splitted[1].split(',');
        if (streamersToJoin.length > 1) {
            socket.close();
            return;
        }

        const id = randomUUID();
        for (let streamer of streamersToJoin) {
            this.chatProxy.addStreamer(streamer);

            if (this.clients[streamer]) {
                this.clients[streamer].push(socket);
            } else {
                this.clients[streamer] = [socket];
            }
        }

        socket.id = id;
        socket.send('OK');
    }

    private handleWebSocketClose(socket: ExtWebSocket) {
        if (socket.id) {
            // Remove the socket from the list of clients following each streamer
            Object.entries(this.clients).forEach(([streamer, sockets]) => {
                this.clients[streamer] = sockets.filter((s) => s !== socket);
                if (this.clients[streamer].length === 0) {
                    // No more clients following this streamer, remove it from the chat
                    this.chatProxy.removeStreamer(streamer);
                    delete this.clients[streamer];
                }
            });
        }
    }
}
