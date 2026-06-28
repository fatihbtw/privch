import { Component, createSignal } from 'solid-js';
import Nav from './components/nav';

const QUALITY_KEY = 'privch_quality';

const Settings: Component = () => {
    const [quality, setQuality] = createSignal(
        localStorage.getItem(QUALITY_KEY) || 'chunked'
    );

    function save() {
        localStorage.setItem(QUALITY_KEY, quality());
    }

    return (
        <div>
            <Nav isHome={false} />
            <title>Privch - Settings</title>
            <div class="container mx-auto px-10 py-2 mb-16 md:mb-10 max-w-md">
                <h1 class="text-2xl font-bold mb-4">Einstellungen</h1>

                <div class="form-control">
                    <label class="label">
                        <span class="label-text">
                            Bevorzugte Stream-Qualität
                        </span>
                    </label>
                    <select
                        class="select select-bordered"
                        value={quality()}
                        onChange={(e) => setQuality(e.currentTarget.value)}
                    >
                        <option value="chunked">Source (Max)</option>
                        <option value="1080p60">1080p60</option>
                        <option value="720p60">720p60</option>
                        <option value="720p">720p</option>
                        <option value="480p30">480p</option>
                        <option value="360p30">360p</option>
                        <option value="160p30">160p</option>
                    </select>
                    <p class="text-sm text-base-content/60 mt-1">
                        Wird verwendet, wenn die gewählte Qualität für einen
                        Stream verfügbar ist. Ansonsten wird automatisch auf
                        Source zurückgegriffen.
                    </p>
                </div>

                <button class="btn btn-primary mt-4" onclick={save}>
                    Speichern
                </button>
            </div>
        </div>
    );
};

export default Settings;
