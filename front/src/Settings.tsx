import { Component, createSignal, Show } from 'solid-js';
import Nav from './components/nav';
import { t, locale, setLocale, LOCALES, Locale } from './utils/i18n';

const QUALITY_KEY = 'privch_quality';
const HOMEPAGE_KEY = 'privch_homepage';
const NOTIFICATIONS_KEY = 'privch_notifications';
const AUDIO_ONLY_KEY = 'privch_audio_only';
const THEME_KEY = 'privch_theme';
const SHOW_SUGGESTIONS_KEY = 'privch_show_suggestions';
const PLAYBACK_SPEED_KEY = 'privch_playback_speed';

const Settings: Component = () => {
    const [quality, setQuality] = createSignal(
            localStorage.getItem(QUALITY_KEY) || 'chunked'
        ),
        [homepage, setHomepage] = createSignal(
            localStorage.getItem(HOMEPAGE_KEY) || 'search'
        ),
        [notifications, setNotifications] = createSignal(
            localStorage.getItem(NOTIFICATIONS_KEY) === 'true'
        ),
        [notificationsBlocked, setNotificationsBlocked] = createSignal(false),
        [audioOnly, setAudioOnly] = createSignal(
            localStorage.getItem(AUDIO_ONLY_KEY) === 'true'
        ),
        [theme, setTheme] = createSignal(
            localStorage.getItem(THEME_KEY) || 'dracula'
        ),
        [showSuggestions, setShowSuggestions] = createSignal(
            localStorage.getItem(SHOW_SUGGESTIONS_KEY) !== 'false'
        ),
        [playbackSpeed, setPlaybackSpeed] = createSignal(
            localStorage.getItem(PLAYBACK_SPEED_KEY) || '1'
        );

    function save() {
        localStorage.setItem(QUALITY_KEY, quality());
        localStorage.setItem(HOMEPAGE_KEY, homepage());
        localStorage.setItem(AUDIO_ONLY_KEY, String(audioOnly()));
        localStorage.setItem(SHOW_SUGGESTIONS_KEY, String(showSuggestions()));
        localStorage.setItem(PLAYBACK_SPEED_KEY, playbackSpeed());
    }

    function changeTheme(value: string) {
        setTheme(value);
        document.documentElement.setAttribute('data-theme', value);
        localStorage.setItem(THEME_KEY, value);
    }

    async function toggleNotifications(enabled: boolean) {
        if (enabled && Notification?.permission !== 'granted') {
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                setNotifications(false);
                setNotificationsBlocked(true);
                localStorage.setItem(NOTIFICATIONS_KEY, 'false');
                return;
            }
        }

        setNotificationsBlocked(false);
        setNotifications(enabled);
        localStorage.setItem(NOTIFICATIONS_KEY, String(enabled));
    }

    return (
        <div>
            <Nav isHome={false} />
            <title>Privch - {t('settings.title')}</title>
            <div class="container mx-auto px-10 py-2 mb-16 md:mb-10 max-w-md">
                <h1 class="text-2xl font-bold mb-4">{t('settings.title')}</h1>

                <div class="form-control">
                    <label class="label">
                        <span class="label-text">{t('settings.language')}</span>
                    </label>
                    <select
                        class="select select-bordered"
                        value={locale()}
                        onChange={(e) =>
                            setLocale(e.currentTarget.value as Locale)
                        }
                    >
                        {LOCALES.map((l) => (
                            <option value={l.value}>{l.label}</option>
                        ))}
                    </select>
                </div>

                <div class="form-control mt-4">
                    <label class="label">
                        <span class="label-text">{t('settings.quality')}</span>
                    </label>
                    <select
                        class="select select-bordered"
                        value={quality()}
                        onChange={(e) => setQuality(e.currentTarget.value)}
                    >
                        <option value="chunked">
                            {t('settings.qualitySource')}
                        </option>
                        <option value="1080p60">1080p60</option>
                        <option value="720p60">720p60</option>
                        <option value="720p">720p</option>
                        <option value="480p30">480p</option>
                        <option value="360p30">360p</option>
                        <option value="160p30">160p</option>
                    </select>
                    <p class="text-sm text-base-content/60 mt-1">
                        {t('settings.qualityHint')}
                    </p>
                </div>

                <div class="form-control mt-4">
                    <label class="label">
                        <span class="label-text">{t('settings.theme')}</span>
                    </label>
                    <select
                        class="select select-bordered"
                        value={theme()}
                        onChange={(e) => changeTheme(e.currentTarget.value)}
                    >
                        <option value="dracula">
                            {t('settings.themeDark')}
                        </option>
                        <option value="light">
                            {t('settings.themeLight')}
                        </option>
                    </select>
                </div>

                <div class="form-control mt-4">
                    <label class="label">
                        <span class="label-text">
                            {t('settings.homepage')}
                        </span>
                    </label>
                    <select
                        class="select select-bordered"
                        value={homepage()}
                        onChange={(e) =>
                            setHomepage(e.currentTarget.value)
                        }
                    >
                        <option value="search">
                            {t('settings.homepageSearch')}
                        </option>
                        <option value="favorites">
                            {t('settings.homepageFavorites')}
                        </option>
                    </select>
                    <p class="text-sm text-base-content/60 mt-1">
                        {t('settings.homepageHint')}
                    </p>
                </div>

                <div class="form-control mt-4">
                    <label class="label cursor-pointer justify-start gap-2">
                        <input
                            type="checkbox"
                            class="checkbox"
                            checked={notifications()}
                            onChange={(e) =>
                                toggleNotifications(e.currentTarget.checked)
                            }
                        />
                        <span class="label-text">
                            {t('settings.notifications')}
                        </span>
                    </label>
                    <p class="text-sm text-base-content/60 mt-1">
                        {t('settings.notificationsHint')}
                    </p>
                    <Show when={notificationsBlocked()}>
                        <p class="text-sm text-error mt-1">
                            {t('settings.notificationsBlocked')}
                        </p>
                    </Show>
                </div>

                <div class="form-control mt-4">
                    <label class="label cursor-pointer justify-start gap-2">
                        <input
                            type="checkbox"
                            class="checkbox"
                            checked={audioOnly()}
                            onChange={(e) =>
                                setAudioOnly(e.currentTarget.checked)
                            }
                        />
                        <span class="label-text">
                            {t('settings.audioOnly')}
                        </span>
                    </label>
                    <p class="text-sm text-base-content/60 mt-1">
                        {t('settings.audioOnlyHint')}
                    </p>
                </div>

                <div class="form-control mt-4">
                    <label class="label cursor-pointer justify-start gap-2">
                        <input
                            type="checkbox"
                            class="checkbox"
                            checked={showSuggestions()}
                            onChange={(e) =>
                                setShowSuggestions(e.currentTarget.checked)
                            }
                        />
                        <span class="label-text">
                            {t('settings.showSuggestions')}
                        </span>
                    </label>
                    <p class="text-sm text-base-content/60 mt-1">
                        {t('settings.showSuggestionsHint')}
                    </p>
                </div>

                <div class="form-control mt-4">
                    <label class="label">
                        <span class="label-text">
                            {t('settings.playbackSpeed')}
                        </span>
                    </label>
                    <select
                        class="select select-bordered"
                        value={playbackSpeed()}
                        onChange={(e) =>
                            setPlaybackSpeed(e.currentTarget.value)
                        }
                    >
                        <option value="0.5">0.5x</option>
                        <option value="0.75">0.75x</option>
                        <option value="1">1x</option>
                        <option value="1.25">1.25x</option>
                        <option value="1.5">1.5x</option>
                        <option value="1.75">1.75x</option>
                        <option value="2">2x</option>
                    </select>
                    <p class="text-sm text-base-content/60 mt-1">
                        {t('settings.playbackSpeedHint')}
                    </p>
                </div>

                <button class="btn btn-primary mt-4" onclick={save}>
                    {t('settings.save')}
                </button>
            </div>
        </div>
    );
};

export default Settings;
