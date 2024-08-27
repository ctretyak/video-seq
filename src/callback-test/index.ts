const [video, canvas, play, pause, seek0] = [
  document.getElementById("player") as HTMLVideoElement,
  document.getElementById("canvas") as HTMLCanvasElement,
  document.getElementById("play") as HTMLButtonElement,
  document.getElementById("pause") as HTMLButtonElement,
  document.getElementById("seek-0") as HTMLButtonElement,
]


play.onclick = () => {
  video.play();
};

pause.onclick = () => {
  video.pause();
};

seek0.onclick = () => {
  video.currentTime = 0;
};

// let paintCount = 0;
let startTime = 0.0;

const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
const updateCanvas = (now: any) => {
  if (startTime === 0.0) {
    startTime = now;
  }

  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  // const elapsed = (now - startTime) / 1000.0;
  // const fps = (++paintCount / elapsed).toFixed(3);
  // fpsInfo.innerText = `video fps: ${fps}`;
  // metadataInfo.innerText = JSON.stringify(metadata, null, 2);

  video.requestVideoFrameCallback(updateCanvas);
};

video.requestVideoFrameCallback(updateCanvas);
