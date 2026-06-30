import { Component, createSignal, Show } from 'solid-js';
import {
    FiMenu,
    FiHome,
    FiCompass,
    FiHeart,
    FiSettings,
    FiGithub,
    FiMoon,
    FiSun,
} from 'solid-icons/fi';
import { useNavigate } from '@solidjs/router';

const THEME_KEY = 'privch_theme';

const navBar: Component<{ isHome: boolean }> = ({ isHome }) => {
    const navigate = useNavigate(),
        [theme, setTheme] = createSignal(
            localStorage.getItem(THEME_KEY) || 'dracula'
        );

    function toggleTheme() {
        const next = theme() === 'dracula' ? 'light' : 'dracula';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem(THEME_KEY, next);
        setTheme(next);
    }

    return (
        <>
            <a
                class="btn btn-ghost btn-circle fixed bottom-4 right-4 z-40"
                href="https://github.com/fatihbtw/privch"
                target="_blank"
                rel="noopener noreferrer"
                title="GitHub"
            >
                <FiGithub size={22} />
            </a>
            <Show when={isHome == true}>
                <div class="navbar backdrop-blur-md">
                    <div class="navbar-start">
                        <div class="dropdown">
                            <label tabIndex={0} class="btn btn-ghost lg:hidden">
                                <FiMenu />
                            </label>
                            <ul
                                tabIndex={0}
                                class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52 text-lg"
                            >
                                <li>
                                    <a href="/explore">
                                        <FiCompass /> Explore
                                    </a>
                                </li>
                                <li>
                                    <a href="/favorites">
                                        <FiHeart /> Favorites
                                    </a>
                                </li>
                                <li>
                                    <a href="/settings">
                                        <FiSettings /> Settings
                                    </a>
                                </li>
                                <li>
                                    <button onclick={toggleTheme}>
                                        {theme() === 'dracula' ? (
                                            <FiSun />
                                        ) : (
                                            <FiMoon />
                                        )}{' '}
                                        Theme
                                    </button>
                                </li>
                            </ul>
                        </div>
                        <a class="btn btn-ghost normal-case text-lg" href="/">
                            <FiHome /> Privch
                        </a>
                    </div>
                    <div class="navbar-end hidden lg:flex h-2">
                        <ul class="menu menu-horizontal px-1 text-lg">
                            <li>
                                <a href="/explore">
                                    <FiCompass />
                                </a>
                            </li>
                            <li>
                                <a href="/favorites">
                                    <FiHeart />
                                </a>
                            </li>
                            <li>
                                <a href="/settings">
                                    <FiSettings />
                                </a>
                            </li>
                            <li>
                                <button onclick={toggleTheme}>
                                    {theme() === 'dracula' ? <FiSun /> : <FiMoon />}
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
            </Show>
            <Show when={isHome == false}>
                {/* desktop */}
                <div class="hidden md:flex lg:flex">
                    <div class="navbar backdrop-blur-md">
                        <div class="navbar-start">
                            <div class="dropdown">
                                <label
                                    tabIndex={0}
                                    class="btn btn-ghost lg:hidden"
                                >
                                    <FiMenu />
                                </label>
                                <ul
                                    tabIndex={0}
                                    class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52 text-lg"
                                >
                                    <li>
                                        <a href="/explore">
                                            <FiCompass /> Explore
                                        </a>
                                    </li>
                                    <li>
                                        <a href="/favorites">
                                            <FiHeart /> Favorites
                                        </a>
                                    </li>
                                    <li>
                                        <a href="/settings">
                                            <FiSettings /> Settings
                                        </a>
                                    </li>
                                    <li>
                                        <button onclick={toggleTheme}>
                                            {theme() === 'dracula' ? (
                                            <FiSun />
                                        ) : (
                                            <FiMoon />
                                        )}{' '}
                                        Theme
                                        </button>
                                    </li>
                                </ul>
                            </div>
                            <a
                                class="btn btn-ghost normal-case text-lg"
                                href="/"
                            >
                                <FiHome /> Privch
                            </a>
                        </div>
                        <div class="navbar-end hidden lg:flex h-2">
                            <ul class="menu menu-horizontal px-1 text-lg">
                                <li>
                                    <a href="/explore">
                                        <FiCompass />
                                    </a>
                                </li>
                                <li>
                                    <a href="/favorites">
                                        <FiHeart />
                                    </a>
                                </li>
                                <li>
                                    <a href="/settings">
                                        <FiSettings />
                                    </a>
                                </li>
                                <li>
                                    <button onclick={toggleTheme}>
                                        {theme() === 'dracula' ? <FiSun /> : <FiMoon />}
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                {/* mobile */}
                <div class="md:hidden lg:hidden fixed z-30">
                    <div class="btm-nav">
                        <button onclick={() => navigate('/')}>
                            <FiHome />
                        </button>
                        <button onclick={() => navigate('/explore')}>
                            <FiCompass />
                        </button>
                        <button onclick={() => navigate('/favorites')}>
                            <FiHeart />
                        </button>
                        <button onclick={() => navigate('/settings')}>
                            <FiSettings />
                        </button>
                        <button onclick={toggleTheme}>
                            {theme() === 'dracula' ? <FiSun /> : <FiMoon />}
                        </button>
                    </div>
                </div>
            </Show>
        </>
    );
};

export default navBar;
