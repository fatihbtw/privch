import { Component, For, createSignal } from 'solid-js';
import {
    FiCompass,
    FiGithub,
    FiHeart,
    FiHome,
    FiMoon,
    FiSettings,
    FiSun,
} from 'solid-icons/fi';
import { useLocation, useNavigate } from '@solidjs/router';
import { t } from '../utils/i18n';

const THEME_KEY = 'privch_theme';

const NavBar: Component = () => {
    const navigate = useNavigate(),
        location = useLocation(),
        [theme, setTheme] = createSignal(
            localStorage.getItem(THEME_KEY) || 'dracula'
        );

    function toggleTheme() {
        const next = theme() === 'dracula' ? 'light' : 'dracula';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem(THEME_KEY, next);
        setTheme(next);
    }

    const links = [
        { href: '/', icon: FiHome, label: 'nav.home' },
        { href: '/explore', icon: FiCompass, label: 'nav.explore' },
        { href: '/favorites', icon: FiHeart, label: 'nav.favorites' },
        { href: '/settings', icon: FiSettings, label: 'nav.settings' },
    ];

    const isActive = (href: string) =>
        href === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(href);

    return (
        <>
            {/* top bar */}
            <div class="navbar sticky top-0 z-40 bg-base-100/80 backdrop-blur border-b border-base-content/10 min-h-14">
                <div class="navbar-start">
                    <a
                        class="btn btn-ghost normal-case text-xl gap-2 px-2"
                        href="/"
                    >
                        <img src="/assets/favicon.svg" class="w-7 h-7" alt="" />
                        <span class="font-extrabold tracking-tight">
                            Priv<span class="text-primary">ch</span>
                        </span>
                    </a>
                </div>
                <div class="navbar-end gap-1">
                    {/* page links, desktop only - mobile uses the bottom nav */}
                    <ul class="menu menu-horizontal px-1 gap-1 hidden md:flex">
                        <For each={links.slice(1)}>
                            {(link) => (
                                <li>
                                    <a
                                        href={link.href}
                                        class={
                                            isActive(link.href)
                                                ? 'active font-semibold'
                                                : ''
                                        }
                                    >
                                        <link.icon />
                                        {t(link.label)}
                                    </a>
                                </li>
                            )}
                        </For>
                    </ul>
                    <button
                        class="btn btn-ghost btn-circle btn-sm md:btn-md"
                        onclick={toggleTheme}
                        title={t('nav.theme')}
                    >
                        {theme() === 'dracula' ? <FiSun /> : <FiMoon />}
                    </button>
                    <a
                        class="btn btn-ghost btn-circle btn-sm md:btn-md"
                        href="https://github.com/fatihbtw/privch"
                        target="_blank"
                        rel="noopener noreferrer"
                        title="GitHub"
                    >
                        <FiGithub />
                    </a>
                </div>
            </div>
            {/* mobile bottom nav */}
            <div class="btm-nav z-40 border-t border-base-content/10 bg-base-100/95 backdrop-blur md:hidden">
                <For each={links}>
                    {(link) => (
                        <button
                            class={
                                isActive(link.href) ? 'active text-primary' : ''
                            }
                            onclick={() => navigate(link.href)}
                        >
                            <link.icon />
                            <span class="btm-nav-label text-xs">
                                {t(link.label)}
                            </span>
                        </button>
                    )}
                </For>
            </div>
        </>
    );
};

export default NavBar;
