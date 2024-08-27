const [player, canvas, play, pause, seek0, playerInvisible, playerDisplayNone, playerLeft, playerReset, playerOverlay] = [
  document.getElementById("player") as HTMLVideoElement,
  document.getElementById("canvas") as HTMLCanvasElement,
  document.getElementById("play") as HTMLButtonElement,
  document.getElementById("pause") as HTMLButtonElement,
  document.getElementById("seek-0") as HTMLButtonElement,
  document.getElementById("player-invisible") as HTMLButtonElement,
  document.getElementById("player-display-none") as HTMLButtonElement,
  document.getElementById("player-left") as HTMLButtonElement,
  document.getElementById("player-reset") as HTMLButtonElement,
  document.getElementById("player-overlay") as HTMLButtonElement,
]

const video = document.createElement("video");
video.src = "https://ctretyak.github.io/video-test/monster_1.mp4.mp4";
// video.src = "https://ctretyak.github.io/video-test/L1.mp4.mp4";
video.controls = true;
video.muted = true;
video.playsInline = true;

player.appendChild(video)


play.onclick = () => {
  video.play();
};

pause.onclick = () => {
  video.pause();
};

seek0.onclick = () => {
  video.currentTime = 0;
};

playerInvisible.onclick = () => {
  player.style.visibility = "hidden";
}

playerDisplayNone.onclick = () => {
  player.style.display = "none";
}

playerLeft.onclick = () => {
  player.style.position = "absolute";
  player.style.left = "-9999px";
}

playerReset.onclick = () => {
  player.style.visibility = "initial";
  player.style.display = "initial";
  player.style.position = "initial";
  player.style.left = "initial";
}

playerOverlay.onclick = () => {
  player.style.zIndex = "99";
  canvas.style.zIndex = "100";
  player.style.position = "relative";
  canvas.style.position = "absolute";
  canvas.style.top = "0px";
}

// let paintCount = 0;
let startTime = 0.0;

const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
const updateCanvas = (now: any) => {
  if (startTime === 0.0) {
    startTime = now;
  }
  console.log(video.videoWidth, video.videoHeight)

  debugger
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  // const elapsed = (now - startTime) / 1000.0;
  // const fps = (++paintCount / elapsed).toFixed(3);
  // fpsInfo.innerText = `video fps: ${fps}`;
  // metadataInfo.innerText = JSON.stringify(metadata, null, 2);

  video.requestVideoFrameCallback(updateCanvas);
};

video.requestVideoFrameCallback(updateCanvas);
