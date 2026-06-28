import { Component, createSignal } from 'solid-js';
import { FiHeart } from 'solid-icons/fi';
import { TbFillHeartBroken } from 'solid-icons/tb';

const favBtn: Component<{ username: string }> = ({ username }) => {
    const [favChs, setFavChs] = createSignal<string[]>([]);

    function getFavs(): string[] {
        const items = localStorage.getItem('favorites');
        if (items == null) return [];
        return JSON.parse(items);
    }

    function addOrRemoveFav(ch: string) {
        let chList = getFavs();

        if (chList.includes(ch)) {
            const chIndex = chList.indexOf(ch);
            if (chIndex !== -1) {
                chList.splice(chIndex, 1);
            }
        } else {
            chList.push(ch);
        }

        localStorage.setItem('favorites', JSON.stringify(chList));

        setFavChs(getFavs());
    }

    setFavChs(getFavs());
    return (
        <>
            <button
                class="btn btn-secondary btn-circle btn-sm"
                onclick={() => addOrRemoveFav(username.toLowerCase())}
            >
                {favChs().includes(username.toLowerCase()) ? (
                    <TbFillHeartBroken />
                ) : (
                    <FiHeart />
                )}
            </button>
        </>
    );
};

export default favBtn;
