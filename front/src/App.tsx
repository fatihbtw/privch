import type { Component } from 'solid-js';
import { Route, Routes } from '@solidjs/router';
import { lazy, onCleanup, onMount } from 'solid-js';
import axios from 'axios';

import Home from './Home';
import { t } from './utils/i18n';

// lazy load /:username, /videos/:id, /:username/:slug
const Stream = lazy(() => import('./Stream')),
    Clips = lazy(() => import('./Clips')),
    Vod = lazy(() => import('./Vod')),
    Favorites = lazy(() => import('./Favorites')),
    Settings = lazy(() => import('./Settings')),
    Explore = lazy(() => import('./Explore'));

const NOTIFY_POLL_MS = 60000;
const LIVE_STATE_KEY = 'privch_live_state';

const App: Component = () => {
    onMount(() => {
        const baseUrl = window.location.origin;

        async function pollFavorites() {
            if (localStorage.getItem('privch_notifications') !== 'true')
                return;
            if (
                typeof Notification === 'undefined' ||
                Notification.permission !== 'granted'
            )
                return;

            const favorites: string[] = JSON.parse(
                localStorage.getItem('favorites') || '[]'
            );
            if (favorites.length === 0) return;

            const prevState: Record<string, boolean> = JSON.parse(
                    localStorage.getItem(LIVE_STATE_KEY) || '{}'
                ),
                nextState: Record<string, boolean> = {};

            for (const ch of favorites) {
                try {
                    const res = await axios.get(
                            `${baseUrl}/api/user/${ch}`
                        ),
                        data = res.data?.data;

                    nextState[ch] = data?.live === true;

                    if (nextState[ch] && prevState[ch] !== true) {
                        new Notification(
                            `${data.displayName} ${t('notifications.live')}`,
                            {
                                body: data.description ?? '',
                                icon: data.avatar
                                    ? `${baseUrl}/api/proxy?url=${btoa(
                                          data.avatar
                                      )}`
                                    : undefined,
                        });
                    }
                } catch {
                    nextState[ch] = prevState[ch] ?? false;
                }
            }

            localStorage.setItem(LIVE_STATE_KEY, JSON.stringify(nextState));
        }

        pollFavorites();
        const interval = setInterval(pollFavorites, NOTIFY_POLL_MS);
        onCleanup(() => clearInterval(interval));
    });

    return (
        <>
            <Routes>
                <Route path="/" component={Home} />
                <Route path="/explore" component={Explore} />
                <Route path="/favorites" component={Favorites} />
                <Route path="/settings" component={Settings} />
                <Route path="/:username" component={Stream} />
                <Route path="/:username/clip/:slug" component={Clips} />
                <Route path="/videos/:id" component={Vod} />
            </Routes>
        </>
    );
};

export default App;
