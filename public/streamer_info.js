const vodsContainer = document.getElementById('vods-container'),
    clipsContainer = document.getElementById('clips-container'),
    clipFilterSelect = document.getElementById('clip-filter'),
    vodFilterSelect = document.getElementById('vod-filter');

let activeTab = 0,
    queryLimit = 100;

function formatTime(seconds) {
    const h = Math.floor(seconds / 3600),
        min = Math.floor((seconds % 3600) / 60),
        sec = seconds % 60;
    let parsedStr = '';

    if (h > 0) parsedStr += `${h}h `;
    if (min > 0) parsedStr += `${min}m `;
    if (sec > 0) parsedStr += `${sec}s`;

    return parsedStr.trim();
}

async function fetchClips(filter, limit) {
    // clean div
    document.getElementById('clips-container-content').innerHTML = '';

    const req = await fetch(`/api/clips/${window.username}/${filter}/${limit}`);

    if (req.status !== 200) {
        const errdiv = document.createElement('div');

        errdiv.classList =
            'border-error border-2 rounded-md shadow-md p-4 hidden';
        errdiv.innerText = 'Failed to load clip list.';

        document.getElementById('clips-container-content').appendChild(errdiv);

        console.log(await req.text());
        return;
    }
    const jsonRes = await req.json();

    if (jsonRes.valid == false) {
        const errdiv = document.createElement('div');

        errdiv.classList =
            'border-error border-2 rounded-md shadow-md p-4 hidden';
        errdiv.innerText = 'Failed to load clip list.';

        document.getElementById('clips-container-content').appendChild(errdiv);

        console.log(await req.text());

        return;
    }
    jsonRes.clips.forEach((clip) => {
        const div = document.createElement('div'),
            figure = document.createElement('figure'),
            img = document.createElement('img'),
            bodyDiv = document.createElement('div'),
            title = document.createElement('h3'),
            game = document.createElement('div'),
            author = document.createElement('div'),
            date = document.createElement('div'),
            link = document.createElement('a');

        div.classList = 'w-56 md:w-72 mb-4';
        img.classList = 'w-full h-auto';
        title.classList = 'text-lg';
        date.classList = 'text-sm italic';
        game.classList = 'text-secondary';

        title.innerText = clip.title;
        author.innerText = `By ${clip.author}`;
        game.innerText = clip.game;
        date.innerText = `${formatTime(clip.durationSeconds)} - ${new Date(
            clip.createdAt
        ).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        })}`;

        img.src = `/stream/urlproxy?url=${clip.thumbnailURL}`;

        link.href = `/${window.username}/clip/${clip.slug}`;

        bodyDiv.appendChild(title);
        bodyDiv.appendChild(date);
        bodyDiv.appendChild(author);
        bodyDiv.appendChild(game);

        figure.appendChild(img);

        div.appendChild(figure);
        div.appendChild(bodyDiv);

        link.appendChild(div);

        document.getElementById('clips-container-content').appendChild(link);
    });
}

async function fetchVods(filter, limit) {
    // clean div
    document.getElementById('vods-container-content').innerHTML = '';

    const req = await fetch(`/api/vods/${window.username}/${filter}/${limit}`);

    if (req.status !== 200) {
        const errdiv = document.createElement('div');

        errdiv.classList =
            'border-error border-2 rounded-md shadow-md p-4 hidden';
        errdiv.innerText = 'Failed to load vod list.';

        document.getElementById('vods-container-content').appendChild(errdiv);

        console.log(await req.text());
        return;
    }
    const jsonRes = await req.json();

    if (jsonRes.valid == false) {
        const errdiv = document.createElement('div');

        errdiv.classList =
            'border-error border-2 rounded-md shadow-md p-4 hidden';
        errdiv.innerText = 'Failed to load vod list.';

        document.getElementById('vods-container-content').appendChild(errdiv);

        console.log(await req.text());
        return;
    }

    jsonRes.vods.forEach((vod) => {
        const div = document.createElement('div'),
            figure = document.createElement('figure'),
            img = document.createElement('img'),
            bodyDiv = document.createElement('div'),
            title = document.createElement('h3'),
            game = document.createElement('div'),
            date = document.createElement('div'),
            link = document.createElement('a'),
            queryParams = `?${
                quality !== 'undefined' && quality.length > 1
                    ? `quality=${window.quality}&`
                    : 'quality=1280x720&'
            }proxy=${window.proxy ? window.proxy : false}`;

        div.classList = 'w-56 md:w-72 mb-4';
        img.classList = 'w-full h-auto';
        title.classList = 'text-lg';
        date.classList = 'text-sm italic';
        game.classList = 'text-secondary';

        title.innerText = vod.title;
        game.innerText = vod.game;
        date.innerText = `${formatTime(vod.lengthSeconds)} - ${new Date(
            vod.publishedAt
        ).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        })}`;

        img.src = `/stream/urlproxy?url=${vod.previewThumbnailURL}`;

        link.href = `/videos/${vod.id}${queryParams}`;

        bodyDiv.appendChild(title);
        bodyDiv.appendChild(date);
        bodyDiv.appendChild(game);

        figure.appendChild(img);

        div.appendChild(figure);
        div.appendChild(bodyDiv);

        link.appendChild(div);

        document.getElementById('vods-container-content').appendChild(link);
    });
}

async function handle_tabs() {
    await fetchVods(vodFilterSelect.value, queryLimit);

    const tabs = document.querySelectorAll('.tab');

    tabs.forEach((el) =>
        el.addEventListener('click', async () => {
            let { value } = el.dataset;
            el.classList = 'tab tab-active';
            if (value == 'vods') {
                tabs[1].classList = 'tab';

                vodsContainer.classList = 'visible';
                clipsContainer.classList = 'hidden';

                await fetchVods(vodFilterSelect.value, queryLimit);

                activeTab = 0;
            } else {
                tabs[0].classList = 'tab';

                vodsContainer.classList = 'hidden';
                clipsContainer.classList = 'visible';

                await fetchClips(clipFilterSelect.value, queryLimit);

                activeTab = 1;
            }
        })
    );
}

clipFilterSelect.addEventListener('change', async (e) => {
    if (activeTab == 1) {
        fetchClips(e.target.value, queryLimit);
    }
});

vodFilterSelect.addEventListener('change', async (e) => {
    if (activeTab == 0) {
        fetchVods(e.target.value, queryLimit);
    }
});
