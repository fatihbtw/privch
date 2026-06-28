import { Component, Show } from 'solid-js';
import {
    FiMenu,
    FiHome,
    FiHeart,
    FiSettings,
    FiGithub,
} from 'solid-icons/fi';
import { useNavigate } from '@solidjs/router';

const navBar: Component<{ isHome: boolean }> = ({ isHome }) => {
    const navigate = useNavigate();
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
                                    <a href="/favorites">
                                        <FiHeart /> Favorites
                                    </a>
                                </li>
                                <li>
                                    <a href="/settings">
                                        <FiSettings /> Settings
                                    </a>
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
                                <a href="/favorites">
                                    <FiHeart />
                                </a>
                            </li>
                            <li>
                                <a href="/settings">
                                    <FiSettings />
                                </a>
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
                                        <a href="/favorites">
                                            <FiHeart /> Favorites
                                        </a>
                                    </li>
                                    <li>
                                        <a href="/settings">
                                            <FiSettings /> Settings
                                        </a>
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
                                    <a href="/favorites">
                                        <FiHeart />
                                    </a>
                                </li>
                                <li>
                                    <a href="/settings">
                                        <FiSettings />
                                    </a>
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
                        <button onclick={() => navigate('/favorites')}>
                            <FiHeart />
                        </button>
                        <button onclick={() => navigate('/settings')}>
                            <FiSettings />
                        </button>
                    </div>
                </div>
            </Show>
        </>
    );
};

export default navBar;
