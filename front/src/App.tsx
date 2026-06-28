import type { Component } from 'solid-js';
import { Route, Routes } from '@solidjs/router';
import { lazy } from 'solid-js';

import Home from './Home';

// lazy load /:username, /videos/:id, /:username/:slug
const Stream = lazy(() => import('./Stream')),
    Clips = lazy(() => import('./Clips')),
    Vod = lazy(() => import('./Vod')),
    Favorites = lazy(() => import('./Favorites')),
    Settings = lazy(() => import('./Settings'));

const App: Component = () => {
    return (
        <>
            <Routes>
                <Route path="/" component={Home} />
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
