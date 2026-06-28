import { Component } from 'solid-js';
import FavBtn from './favCh';
import { FiEye } from 'solid-icons/fi';

const liveMetadata: Component<{
    title: string;
    views: number;
    game: string;
    avatar: string;
    username: string;
}> = ({ title, views, game, avatar, username }) => {
    return (
        <div class="mt-1 overflow-auto break-words">
            {/* desktop */}
            <div class="hidden md:block lg:block">
                {/* title */}
                <div class="flex flex-wrap justify-between">
                    <div class="w-full sm:w-auto mb-4 sm:mb-0">
                        <div class="text-lg font-semibold">{title}</div>
                    </div>
                    {/* views */}
                    <div class="w-full sm:w-auto">
                        <div class="inline-flex items-center space-x-2">
                            <FiEye />
                            <span>{views}</span>
                        </div>
                    </div>
                </div>
                {/* game */}
                <div>
                    <span class="text-indigo-400 italic">{game}</span>
                </div>
                {/* streamer */}
                <div class="flex flex-wrap justify-between">
                    <div class="w-full sm:w-auto mb-4 sm:mb-0">
                        <div class="inline-flex items-center space-x-2">
                            <img class="w-8 rounded-full" src={avatar} />
                            <span>{username}</span>
                        </div>
                    </div>
                    {/* follow */}
                    <div class="w-full sm:w-auto">
                        <FavBtn username={username} />
                    </div>
                </div>
            </div>
            {/* mobile */}
            <div class="md:hidden lg:hidden">
                <div class="mb-2">
                    <div class="inline-flex items-center space-x-2">
                        <div class="text-lg font-semibold">{title}</div>
                        <FavBtn username={username} />
                    </div>
                </div>
                <div class="mb-1">
                    <div class="inline-flex items-center space-x-2">
                        <FiEye />
                        <span>{views}</span>
                    </div>
                </div>
                <div class="inline-flex items-center space-x-2">
                    <img class="w-8 rounded-full" src={avatar} />
                    <span>{username}</span>
                </div>
            </div>
        </div>
    );
};

export default liveMetadata;
