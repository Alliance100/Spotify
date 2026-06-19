let currentSong = new Audio();
let songs;
let currFolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currFolder = folder
    let a = await fetch(`http://127.0.0.1:5500/${folder}/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }

    }
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li> <div class ="list"> <img class="invert " src="assests/img/music.svg" alt=""> 
                                                    ${song.replaceAll("%20", " ").replaceAll(".mp3", " ")}
                                                    <img class="invert" src="assests/img/play.svg" alt="">
        </div>
        </li>`;
    }


    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach((e, index) => {

        e.addEventListener("click", () => {
            playMusic(songs[index]);
        })

    })
    return songs;

}

const playMusic = (track, pause = false) => {
    currentSong.src = `${currFolder}/` + track
    if (!pause) {
        currentSong.play()
        play.src = "assests/img/pause.svg"
    }

    document.querySelector(".songinfo").innerHTML =
        decodeURIComponent(track).replace(".mp3", "");
    document.querySelector(".songtime").innerHTML = "00:00/00:00"
}

async function displayAlbums() {
    let a = await fetch(`http://127.0.0.1:5500/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer");

    let array = Array.from(anchors);
    for (let e of array) {
        if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {

            let folder = e.href.split("/").filter(Boolean).pop();

            if (folder !== "songs") {

                let fetchInfo = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`);

                if (fetchInfo.ok) {
                    let response = await fetchInfo.json();

                    cardContainer.innerHTML += `<div data-folder="${folder}" class="card">
                                    <div class="play">
                                        <svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M8 5V19L19 12L8 5Z" fill="#141B34" />
                                        </svg>
                                    </div>
                                    <img src="/songs/${folder}/cover.jpg" alt="">
                                    <h2>${response.title}</h2>
                                    <p>${response.description}</p>
                                </div>`;
                }
            }
        }
    }
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
            playMusic(songs[0])
        })
    })


    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
            
            if (window.innerWidth <= 1200) {
                document.querySelector(".left").style.left = "0";
            }
        })
    })

}

async function main() {

    await getSongs("songs/subh")
    playMusic(songs[0], true)

    displayAlbums()


    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "assests/img/pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "assests/img/play.svg"
        }
    })

    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML =
            `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`

        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%"
    })

    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100
    })

    previous.addEventListener("click", () => {
        currentSong.pause()

        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
    })

    next.addEventListener("click", () => {
        currentSong.pause()


        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
    })

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-130%"
    })

}
main()