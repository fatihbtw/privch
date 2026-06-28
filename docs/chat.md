## Using twitch chat

Chat web socket is located at `wss://irc-ws.chat.twitch.tv/`

### How to join

After connecting, you'll need to send some raw (plain text) messages first

1. `CAP REQ :twitch.tv/tags twitch.tv/commands twitch.tv/membership`
2. `PASS SCHMOOPIIE`
3. `NICK justinfan35233`
4. `USER justinfan35233 8 * :justinfan35233`
> It seems that this username and pass is not random.. idk
5. `JOIN #<streamer>`

### Messages

This is an example of a chat message:

```
@badge-info=<eg. subscriber/<int>>;badges=<eg. subscriber/<int>>;client-nonce=<string>;color=<hex_color>;display-name=<display_name>;emotes=;first-msg=0;flags=;id=<msg_id>;mod=<0/1 boolean>;returning-chatter=0;room-id=<streamer_id>;subscriber=<0/1 boolean>;tmi-sent-ts=<time_ms>;turbo=0;user-id=<id>;user-type= :<display_name_lowecase>!<display_name_lowecase>@<display_name_lowecase>.tmi.twitch.tv PRIVMSG #<streamer_name> :<text_message>
```

#### Regex

```js
// badges
/@badge-info=(.*?);/gm
/badges=(.*?);/gm

// color
/color=(.*?);/gm

// display name
/display-name=(.*?);/gm

// mod
/mod=(.*?);/gm

// sub
/subscriber=(.*?);/gm

// message
/streamer_name>\ :(.*?)$/gm
// eg. /foo\ :(.*?)$/gm
```