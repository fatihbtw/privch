import { Component, onCleanup, createSignal, For } from 'solid-js';
import dompurify from 'dompurify';
import { parsedMessageObject } from '../utils/types';
import ModImg from '../../assets/mod.png';
import SubImg from '../../assets/sub.png';
import axios from 'axios';
import genericResponseObject from '../../../src/types/genericResponseObject';

function parseMessage(content: string) {
    const valPairs = content.split(';'),
        res: { [key: string]: string } = {};

    valPairs.forEach((p) => {
        const [key, val] = p.split('='),
            keyTrim = key.trim(),
            valTrim = val.trim();

        if (keyTrim == 'user-type') {
            res['message'] = valTrim.split(' :')[1].trim();
        } else res[keyTrim] = valTrim;
    });
    return res as unknown as parsedMessageObject;
}

const StreamChat: Component<{ username: string; scroll: HTMLDivElement }> = ({
    username,
    scroll,
}) => {
    const [messages, setMessages] = createSignal<parsedMessageObject[]>([]);
    let socket: WebSocket;

    function sanitizeEvalMessage(content: string) {
        return <span innerHTML={dompurify.sanitize(content)}></span>;
    }

    const initWSConnection = (
        emoteList: {
            id: string;
            token: string;
            url: string;
        }[]
    ) => {
        console.log(`[Log] Loaded ${emoteList.length} emotes.`);

        let protocol;
        if (location.protocol !== 'https:') {
            protocol = 'ws://';
        } else {
            protocol = 'wss://';
        }

        socket = new WebSocket(protocol + window.location.host);

        socket.onopen = () => {
            console.log('[Log] WebSocket: connected');
            socket.send(`JOIN ${username}`);
        };

        socket.onclose = () => {
            console.log('[Log] WebSocket closed, retrying.');
            socket.close();
            initWSConnection(emoteList);
        };

        socket.onmessage = (event) => {
            if (event.data === 'OK') return;

            const parsedMsgEvent = parseMessage(event.data);
            let parsedMsg = parsedMsgEvent;

            if (parsedMsg?.message && parsedMsg.message.length > 1) {
                if (emoteList.length > 0) {
                    const hasEmote = emoteList.some((em) =>
                        parsedMsg.message?.includes(em.token)
                    );
                    if (hasEmote) {
                        const emoteByToken = emoteList.filter((em) =>
                            parsedMsg.message?.includes(em.token)
                        );

                        parsedMsg.emotes = true;
                        emoteByToken.map((em) => {
                            parsedMsg.message = parsedMsg.message?.replace(
                                new RegExp(`${em?.token}`, 'g'),
                                `<img class="inline-flex items-center" src="${em?.url}" alt="${em.token}" height="20" width="20" />`
                            );
                        });
                    }
                }
                const length = messages().length;
                if (length > 1000) {
                    setMessages([
                        ...messages().splice(0, length - 1000),
                        parsedMsg,
                    ]);
                }
                setMessages((prev) => [...prev, parsedMsg]);
            }
            scroll.scrollTop = scroll.scrollHeight;
        };
    };

    onCleanup(() => {
        if (socket && socket.readyState == WebSocket.OPEN) socket.close();
    });

    (async () => {
        const emoteListReq = await axios.get(`/api/emotes/${username}`),
            emoteListData: genericResponseObject<
                {
                    id: string;
                    token: string;
                    url: string;
                }[]
            > = emoteListReq.data;
        initWSConnection(emoteListData.data || []);
    })();

    return (
        <>
            <For each={messages()}>
                {(item) => (
                    <div>
                        {item.mod == '1' && (
                            <img
                                class="inline-block w-[18px] h-auto m-1"
                                src={ModImg}
                            />
                        )}
                        {item.subscriber == '1' && (
                            <img
                                class="inline-block w-[18px] h-auto m-2"
                                src={SubImg}
                            />
                        )}
                        <span
                            style={{
                                color: `${item.color || '#FFFF'}`,
                            }}
                        >
                            {item['display-name']}
                        </span>
                        :{' '}
                        {item.emotes === true ? (
                            sanitizeEvalMessage(item.message!)
                        ) : (
                            <span>{item.message}</span>
                        )}
                    </div>
                )}
            </For>
        </>
    );
};

export default StreamChat;
