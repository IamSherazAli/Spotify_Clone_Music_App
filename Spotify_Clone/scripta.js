console.log('hello')
let currentSong = new Audio();
let songs;
let currFolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds || seconds < 0)) {
        return "Invalid Input";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:5500/${folder}/`);
    const response = await a.text();
    // console.log(response)

    let div = document.createElement("div")
    div.innerHTML = response;

    let as = div.getElementsByTagName("a");

    let songs = []

    for (let index = 0; index < as.length; index++) {
        const element = as[index];

        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]) //why [1] here
        }

    }


    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li><img class="invert" width="34" src="img/music.svg" alt="">
                            <div class="info">
                                <div> ${song.replaceAll("%20", " ")}</div>
                                <div>Harry</div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img class="invert" src="img/play.svg" alt="">
                            </div> </li>`;
    }

    // Attach an event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())

        })
    })

    return songs

};

const playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + track;
    if (!pause) {
        currentSong.play();
        play.src = "img/pause.svg"
    }


    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00/00:00"
}

async function displayAlbums() {
    let a = await fetch(`/songs/`);
    const response = await a.text();
    // console.log(response)

    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)

    for (let index = 0; index < array.length; index++) {
        const e = array[index];

        if (e.href.includes("/songs")) {
            let folder = (e.href.split("/").slice(-2)[0])


            let a = await fetch(`/songs/${folder}/info.json`);
            let response = await a.json();

            // console.log(response)

            cardContainer.innerHTML = cardContainer.innerHTML + ` <div data-folder="${folder}" class="card">
                <div class="play">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                        xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5"
                            stroke-linejoin="round" />
                    </svg>
                </div>
    
                <img src="/songs/${folder}/cover.jpg" alt="">
                <h2>${response.title}</h2>
                <p>${response.description}</p>
            </div>`
        }
    }

    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            console.log("Fetching Songs")
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0])

        })
    })


}



async function main() {
    let songs = await getSongs("/songs/cs")
    // console.log(songs)
    playMusic(songs[0], true)

    //displaying all the albums on the page

    await displayAlbums();

    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]

    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li>
                            <img class="invert" src="img/music.svg" alt="">
                            <div class="info">
                                <div>${song.replaceAll("%20", " ")} </div>
                                <div>Sheraz Ali</div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img class="invert" src="img/play.svg" alt="">
                            </div>
        
        
        </li>`;
    }

    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            // console.log(e.querySelector(".info").firstElementChild.innerHTML);
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim()); ///why trim() here

        })
    })

    //attaching an event listener to either pause play or go to the next or the previous song.

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "img/pause.svg"
        } else {
            currentSong.pause();
            play.src = "img/play.svg"
        }
    })

    //An event listener for the timeupdate

    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)}/${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + '%';  //why percent here...
    })


    document.querySelector(".seekbar").addEventListener("click", e => { ///why e here
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    })

    //adding event listener to prev and next the song

    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
    })

    next.addEventListener("click", () => {

        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
    })

    //load the plyalist whenever the card is clicked

    // 1. Volume range input ko select karein
    let volumeRange = document.querySelector(".range input");

    // 2. 'change' ya 'input' event listener lagayein
    volumeRange.addEventListener("input", (e) => {
        // Input value 0-100 ke beech hoti hai, audio volume 0-1 ke beech
        // Isliye hum value ko 100 se divide karte hain
        let volumeValue = e.target.value / 100;

        currentSong.volume = volumeValue;

        // console.log("Setting volume to:", volumeValue);

        // Optional: Agar volume 0 ho jaye toh icon change kar dein
        let volumeImg = document.querySelector(".volume img");
        if (volumeValue == 0) {
            volumeImg.src = "img/mute.svg"; // Agar aapke paas mute icon hai
        } else {
            volumeImg.src = "img/volume.svg";
        }
    });


}

main()