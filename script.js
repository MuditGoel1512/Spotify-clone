console.log("Lets write some Javascript");
let currentSong = new Audio();
let songs;
let currFolder;

function secondsToMinutesSeconds(seconds) {
  // Calculate minutes and seconds
  var minutes = Math.floor(seconds / 60);
  var remainingSeconds = Math.floor(seconds % 60);

  // Format minutes and seconds to have leading zeros if necessary
  var formattedMinutes = minutes < 10 ? "0" + minutes : minutes;
  var formattedSeconds = remainingSeconds < 10 ? "0" + remainingSeconds : remainingSeconds;

  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }
  else {
    return `${formattedMinutes}:${formattedSeconds}`;

  }
  // Concatenate minutes and seconds with a colon
}

async function getSongs(folder) {
  currFolder = folder;
  let a = await fetch(`http://127.0.0.2:5500/${folder}/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1]);
    }
  }
  // Show all the songs in the playlist
  let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0];
  songUL.innerHTML = "";
  for (const song of songs) {
    songUL.innerHTML += `<li class="flex space-between">
                                <div class="flex song-detail">
        <img src="SVG/music.svg" class="invert" alt="">
        <div class="song-details">
            <div class="artist-name">${song.replaceAll("%20", " ")}</div>
            <div class="artist-title">${song.split("-")[1].replaceAll("%20", " ")}</</div>
        </div>
    </div>
    <img src="SVG/play.svg" class="invert song-play items-center" alt="">
    </li>`;
  }

  // Attach an event listener to each song
  Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
    e.addEventListener("click", element => {
      // console.log(e.querySelector(".song-details").firstElementChild.innerHTML);
      PlayMusic(e.querySelector(".song-details").firstElementChild.innerHTML);

    })
  })
  return songs;
}

const PlayMusic = (track, pause = false) => {
  // let audio = new Audio("/Songs/" + track);
  currentSong.src = `/${currFolder}/` + track;
  if (!pause) {
    currentSong.play();
    play.src = "SVG/pause.svg";
  }
  document.querySelector(".song-info").innerHTML = track.split("-")[0].replaceAll("%20", " ");
  document.querySelector(".song-time").innerHTML = "00:00 / 00:00"

}


async function displayAlbums() {
  let a = await fetch(`http://127.0.0.2:5500/Songs/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a");
  let cards = document.querySelector(".cards");
  let array = Array.from(anchors);
  for (let index = 0; index < array.length; index++) {
    const e = array[index];
    
    if (e.href.includes("/Songs/")) {
      let folder = e.href.split("/Songs/").slice(1)[0];

      // Get the metadata of the folder
      let a = await fetch(`http://127.0.0.2:5500/Songs/${folder}/info.json`);
      let response = await a.json();
      // console.log(response);
      cards.innerHTML = cards.innerHTML + `<div data-folder="${folder}" class="card flex-column border">
                                              <div class="play absolute">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="button-icon">
                                                <path fill="black"
                                                d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z" />
                                                </svg>
                                              </div>
                                            <div class="image flex justify-center items-center">
                                              <img class="img" src="Songs/${folder}/cover.jpeg" alt="No image">
                                            </div>
                                            <div class="artist-name">
                                              ${response.title}
                                            </div>
                                            <div class="artist-title">
                                              ${response.description}
                                            </div>
                                          </div> `

    }
  }
  // Load the playlist whenever the card is clicked
  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async item => {
      console.log(item, item.currentTarget.dataset)
      songs = await getSongs(`Songs/${item.currentTarget.dataset.folder}`);
      PlayMusic(songs[0])
    })
  })

}



async function main() {
  // Get the list of all the songs
  await getSongs("Songs/Pritam");
  PlayMusic(songs[0], true);

  // Display all the albums on the page
  displayAlbums()

  // Attach an event listener to play, next and previous
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "SVG/pause.svg"
    }
    else {
      currentSong.pause();
      play.src = "SVG/play.svg"
    }
  })

  // Listen for time update event
  currentSong.addEventListener("timeupdate", () => {
    // console.log(currentSong.currentTime, currentSong.duration);
    document.querySelector(".song-time").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)}/${secondsToMinutesSeconds(currentSong.duration)}`;
    document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
  })

  //Add an event listener to seekbar
  document.querySelector(".seekbar").addEventListener("click", e => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = ((currentSong.duration) * percent) / 100;
  })

  // Add an event listener for hamburger button
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0px";
    document.querySelector(".right").style.opacity = 0.5;
  })

  // Add an event listener for close button
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-100%";
    document.querySelector(".right").style.opacity = 1;
  })

  // Add an event listener to previous and next
  previous.addEventListener("click", () => {
    console.log("Previous Clicked");
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if ((index - 1) >= 0) {
      PlayMusic(songs[index - 1]);
    }
  })

  next.addEventListener("click", () => {
    console.log("Next Clicked");
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if ((index + 1) < songs.length) {
      PlayMusic(songs[index + 1]);
    }
  })

  // Add an event to volume
  document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
    console.log("Setting volume to", e.target.value, "/ 100");
    currentSong.volume = parseInt(e.target.value) / 100;
  })


  // Load the playlist whenever the card is clicked
  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async item => {
      console.log(item, item.currentTarget.dataset)
      songs = await getSongs(`Songs/${item.currentTarget.dataset.folder}`);
      PlayMusic(songs[0]);
    })
  })

  // Add the event listener to Mute the track

  document.querySelector(".volume>img").addEventListener("click", (e)=>{
    if (e.target.src.includes("SVG/volume.svg")) {
      e.target.src = e.target.src.replace("SVG/volume.svg","SVG/mute.svg");
      currentSong.volume = 0;
      document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
    }
    else{
      e.target.src = e.target.src.replace("SVG/mute.svg","SVG/volume.svg");
      currentSong.volume = 0.1;
      document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
    }
  })


}

main()
