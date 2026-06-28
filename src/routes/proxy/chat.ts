import { TwitchChatServer } from '../../utils/chat/twitchChatServer';
import ws from 'ws';

const twitchChatServer = new TwitchChatServer();
export const wsServer = new ws.Server({ noServer: true });
twitchChatServer.startWebSocketServer(wsServer);
