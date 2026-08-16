const back10 = document.getElementById('back10');
const forward10 = document.getElementById('forward10');
const albumCover = document.querySelector('.album-cover');
const playBtn = document.getElementById('playBtn');
const disk = document.querySelector('.disk'); 
const seekbar = document.getElementById('seekbar');
const currentTimeText = document.getElementById('current-time');
const durationText = document.getElementById('duration');
const audio = document.getElementById('audio');
const canvas = document.getElementById('visualizer');
const ctx = canvas.getContext('2d');

let audioCtx, analyser, source;

audio.addEventListener('loadedmetadata', () => {
    seekbar.max = audio.duration;
    let mins = Math.floor(audio.duration / 60);
    let secs = Math.floor(audio.duration % 60);
    durationText.innerText = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
});

audio.addEventListener('timeupdate', () => {
    if (!isNaN(audio.duration)) {
        seekbar.max = audio.duration;
        let current = Math.floor(audio.currentTime);
        let duration = Math.floor(audio.duration);
        if (current >= duration) {
            current = duration;
        }
        let percentage = (current / duration) * 100;
        seekbar.style.backgroundSize = percentage + '% 100%';
        let mins = Math.floor(current / 60);
        let secs = current % 60;
        currentTimeText.innerText = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
        seekbar.value = current;
    }
});

audio.addEventListener('ended', () => {
    stopRotation();
    currentRotation = 0;
    disk.style.transform = `rotate(0deg)`;
    playBtn.classList.remove('playing');
    seekbar.value = 0;
    audio.currentTime = 0;
    seekbar.style.backgroundSize = '0% 100%';
});

seekbar.addEventListener('input', () => {
    audio.currentTime = seekbar.value;
});

audio.addEventListener('play', initVisualizer);

function initVisualizer(){
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        source = audioCtx.createMediaElementSource(audio);
        analyser = audioCtx.createAnalyser();
        
        source.connect(analyser);
        
        analyser.connect(audioCtx.destination);
        
        analyser.fftSize = 32;
        renderFrame();
    }
    
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

function renderFrame() {
    requestAnimationFrame(renderFrame);
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);
    canvas.height = 300;
    const centerX = canvas.width / 2;
    const barsToDisplay = bufferLength / 2;
    const barWidth = (canvas.width / barsToDisplay) / 2;
    let x_offset = 0;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < barsToDisplay; i++) {
        let barHeight = dataArray[i] * 1.5;
        let gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0.0, "#FF3131");   
        gradient.addColorStop(0.3, "#D8B4FE");    
        gradient.addColorStop(0.6, "#A3FFC2");  
        gradient.addColorStop(1.0, "#A3FFC2");
        ctx.shadowBlur = 15;
        ctx.fillStyle = gradient;
        analyser.smoothingTimeConstant = 0.85;
        ctx.fillRect(centerX + x_offset, canvas.height - barHeight, barWidth - 1, barHeight); 
        ctx.fillRect(centerX - x_offset - barWidth, canvas.height - barHeight, barWidth - 1, barHeight);
        x_offset += barWidth;
    }
};

playBtn.addEventListener('click', () => {
    if (audio.currentTime > audio.duration - 0.5 || audio.ended) {
        audio.currentTime = 0;
        currentRotation = 0;
        seekbar.value = 0;
        disk.style.transform = `rotate(${currentRotation}deg)`;
        playBtn.classList.remove('playing');
        if (disk) disk.classList.remove('playing');
    }
    
    if (audio.paused) {
        audio.play();
            playBtn.classList.add('playing');
            if (disk) disk.classList.add('playing');
            startRotation();
    } else {
        audio.pause();
        playBtn.classList.remove('playing');
        if (disk) disk.classList.remove('playing');
        stopRotation();
    }
});

let currentRotation = 0;
let rotationInterval;

function startRotation() {
    clearInterval(rotationInterval);
    rotationInterval = setInterval(() => {
        currentRotation += 1; 
        disk.style.transform = `rotate(${currentRotation}deg)`;
    }, 20);
}

function stopRotation() {
    clearInterval(rotationInterval);
}

seekbar.addEventListener('input', () => {
    audio.currentTime = seekbar.value;
    currentRotation = seekbar.value * 3.6;
    disk.style.transform = `rotate(${currentRotation}deg)`;

    if (!audio.paused) {
        startRotation();
   }
});

let currentRotationOffset = 0;

function scratchDisk(degrees) {
    currentRotationOffset += degrees;
    setTimeout(() => {
        albumCover.style.transition = "transform 0.2s ease";
        albumCover.style.transform = `rotate(${currentRotationOffset}deg) `;
    }, 200);
}

document.getElementById('forward10').addEventListener('click', () => {
    audio.currentTime = Math.min(audio.currentTime + 10, audio.duration);
    scratchDisk(20);
});

document.getElementById('back10').addEventListener('click', () =>{
    audio.currentTime = Math.max(audio.currentTime - 10, 0);
    scratchDisk(-20);
});

const expandBtn = document.querySelector('.expand-btn');

expandBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    lyricsCard.classList.toggle('expanded');
});

const lrcText = `
    [00:52.67]On a dark desert highway
    [00:55.92]Cool wind in my hair
    [00:59.17]Warm smell of colitas
    [01:02.17]Rising up through the air
    [01:05.42]Up ahead
    [01:06.42]In the distance
    [01:08.67]I saw a shimmering light
    [01:11.92]My head grew heavy
    [01:12.92]And my sight grew dim
    [01:15.17]I had to stop
    [01:16.05]For the night
    [01:18.55]There she stood
    [01:19.55]In the doorway
    [01:21.80]I heard the mission bell
    [01:25.81]And I was thinking to myself
    [01:27.20]"This could be Heaven
    [01:28.70]Or this could be Hell"
    [01:31.70]Then she lit up a candle
    [01:34.70]And she showed me the way
    [01:38.20]There were voices
    [01:38.95]Down the corridor
    [01:41.45]I thought
    [01:41.85]I heard them say
    [01:44.74]"Welcome to the
    [01:45.74]Hotel California
    [01:50.49]Such a lovely place
    [01:51.99](Such a lovely place)
    [01:53.74]Such a lovely face
    [01:57.24]Plenty of room at the
    [01:58.74]Hotel California
    [02:03.49]Any time of year
    [02:05.24](Any time of year)
    [02:06.74]You can find it here"
    [02:10.49]Her mind is
    [02:10.99]Tiffany-twisted
    [02:13.74]She got the Mercedes Benz
    [02:16.74]She got a lot of pretty,
    [02:18.49]Pretty boys
    [02:20.63]She calls friends
    [02:23.63]How they dance
    [02:24.38]In the courtyard
    [02:26.63]Sweet summer sweat
    [02:30.13]Some dance to remember
    [02:33.38]Some dance to forget
    [02:36.38]So I called up the Captain
    [02:39.88]"Please bring me my wine"
    [02:42.53]He said, "We haven't had
    [02:44.02]That spirit here since
    [02:46.27]1969"
    [02:49.53]And still those voices
    [02:51.28]Are calling from
    [02:52.52]Far away
    [02:56.03]Wake you up
    [02:57.03]In the middle of the night
    [02:59.28]Just to hear them say
    [03:02.53]"Welcome to the
    [03:03.78]Hotel California
    [03:08.53]Such a lovely place
    [03:10.28](Such a lovely place)
    [03:11.78]Such a lovely face
    [03:15.03]They living it up at the
    [03:17.03]Hotel California
    [03:21.53]What a nice surprise
    [03:22.92](what a nice surprise)
    [03:24.67]Bring your alibis"
    [03:28.42]Mirrors on the ceiling
    [03:31.67]The pink champagne on ice
    [03:34.18]And she said:
    [03:34.92]"We are all just prisoners here
    [03:38.42]Of our own device"
    [03:41.68]And in the master's chambers
    [03:44.68]They gathered
    [03:45.67]For the feast
    [03:48.17]They stab it
    [03:48.92]With their steely knives
    [03:50.67]But they just can't
    [03:52.18]Kill the beast
    [03:54.43]Last thing I remember,
    [03:56.93]I was
    [03:57.92]Running for the door
    [04:01.56]I had to find
    [04:02.06]The passage back
    [04:03.56]To the place
    [04:04.81]I was before
    [04:07.81]"Relax,"
    [04:08.31]Said the night man
    [04:10.06]"We are programmed
    [04:11.56]To receive
    [04:14.06]You can check out
    [04:15.06]Any time you like
    [04:17.31]But you can never leave!"
    [04:19.56]🎸🎵 `;

function parseLRC(lrc) {
    const lines = lrc.split('\n');
    const result = [];
    
    lines.forEach(line => {
        const match = line.match(/\[(\d+):(\d+\.\d+)\](.*)/);
        if (match) {
            const minutes = parseInt(match[1]);
            const seconds = parseFloat(match[2]);
            const time = minutes * 60 + seconds; // Convert lahat sa seconds
            const text = match[3].trim();
            result.push({ time, text });
        }
    });
    return result;
}

const lyricsData = parseLRC(lrcText);

const lyricsContent = document.getElementById('lyrics-content'); // Dapat match sa ID ng HTML mo

function renderLyrics() {
    // 1. Siguraduhing malinis ang div
    lyricsContent.innerHTML = ''; 
    
    // 2. Isa-isang gawin yung mga <p> tags base sa LRC data
    lyricsData.forEach((line) => {
        const p = document.createElement('p'); // Dito natin nililikha yung <p>
        p.classList.add('lyric-line');
        p.textContent = line.text;
        lyricsContent.appendChild(p); // Dito natin siya "sinasaksak" sa HTML
    });
}

// 🚀 SOBRANG IMPORTANTENG TAWAGIN ITO!
renderLyrics(); 

const lyricLines = document.querySelectorAll('.lyric-line'); // Yung mga <p> tags mo

audio.addEventListener('timeupdate', () => {
    const currentTime = audio.currentTime;
    const lyricsLines = document.querySelectorAll('.lyrics-line');
    lyricsData.forEach((data, index) => {
        const line = lyricLines[index];
        if (!line) return;
        if (currentTime >= data.time) {
            line.classList.add('past');
            lyricsLines.forEach(l => l.classList.remove('active'));
            line.classList.add('active');
        }   
    });
});

