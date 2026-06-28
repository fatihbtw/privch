import ExpressServer from 'express';
import router from './router';
import eta from 'eta';
import { wsServer } from './routes/proxy/chat';

const app = ExpressServer();

app.disable('x-powered-by');

app.engine('eta', eta.renderFile);
eta.configure({
    views: process.cwd() + '/templates',
    cache: true,
    autoEscape: true,
});
app.set('view engine', 'eta');
app.set('view cache', true);
app.set('views', process.cwd() + '/templates');

app.use((_, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', '*');
    next();
});
app.use(ExpressServer.static(process.cwd() + '/public'));
app.use(router);

const server = app.listen(3000, () => {
    console.log('Server started at port 3000');
});

server.on('upgrade', (request, socket, head) => {
    wsServer.handleUpgrade(request, socket, head, (socket) => {
        wsServer.emit('connection', socket, request);
    });
});
