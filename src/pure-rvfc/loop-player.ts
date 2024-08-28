import { VideoTree } from "./video-tree";

export class LoopPlayer {
  tree: VideoTree;
  canvas: HTMLCanvasElement;
  hiddenPlayersElem: HTMLElement;
  metadata: Record<string,any> = {};

  private currentVideoTree: VideoTree | undefined;

  constructor(videoTree: VideoTree, canvas: HTMLCanvasElement, hiddenPlayersElem: HTMLElement, debug = false) {
    this.tree = videoTree;
    this.canvas = canvas;
    this.hiddenPlayersElem = hiddenPlayersElem;
    if (debug) {
      this.hiddenPlayersElem.classList.add('debug');
      document.getElementById("metadata")?.classList.add('debug');
    }
  }

  async play() {
    const allVideo = await this.tree.load();

    const hiddenPlayersElem = document.getElementById('hidden-players');
    allVideo.forEach((video) => {
      hiddenPlayersElem?.appendChild(video);
    });

    this.playNextVideo();
  }

  playNextVideo() {
    const metadataElem = document.getElementById("metadata");
    const nextVideoTree = this.currentVideoTree?.getNextVideoTree() ?? this.tree;
    nextVideoTree.play();
    const ctx = this.canvas.getContext('2d');
    const videoFrameCallback: VideoFrameRequestCallback = () => {

      if (ctx) {
        ctx.canvas.width = Math.min(screen.width, window.innerWidth);
        ctx.canvas.height = Math.min(screen.height, window.innerHeight);
      }

      const video = nextVideoTree.video;;
      const { width: screenWidth, height: screenHeight } = this.canvas.getBoundingClientRect();

      let dw = 100;
      let dh = 100;
      if (video.videoWidth && video.videoHeight) {
        const scale = Math.min(screenWidth / video.videoWidth, screenHeight / video.videoHeight);
        dw = video.videoWidth * scale;
        dh = video.videoHeight * scale;
      }

      ctx?.drawImage(nextVideoTree.video, 0, 0, dw, dh);
      if (metadataElem) {
        const metadataString = JSON.stringify(this.metadata, null, 2);
        if (metadataElem.innerHTML !== metadataString) {
          metadataElem.innerHTML = JSON.stringify(this.metadata, null, 2);
        }
      }
      nextVideoTree.video.requestVideoFrameCallback(videoFrameCallback)
    }
    nextVideoTree.video.requestVideoFrameCallback(videoFrameCallback)
    const ended = () => {
      this.metadata.ended = Date.now();
      nextVideoTree.video.removeEventListener('ended', ended);
      this.playNextVideo();
    }
    nextVideoTree.video.addEventListener('ended', ended)

    this.currentVideoTree = nextVideoTree;
  }
}
