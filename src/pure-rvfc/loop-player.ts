import { VideoTree } from "./video-tree";

export class LoopPlayer {
  tree: VideoTree;
  canvas: HTMLCanvasElement;
  hiddenPlayersElem: HTMLElement;

  private currentVideoTree: VideoTree | undefined;

  constructor(videoTree: VideoTree, canvas: HTMLCanvasElement, hiddenPlayersElem: HTMLElement) {
    this.tree = videoTree;
    this.canvas = canvas;
    this.hiddenPlayersElem = hiddenPlayersElem;


    // window.addEventListener('resize', resizeCanvas, false);
    // window.addEventListener('orientationchange', resizeCanvas, false);
    // window.addEventListener('fullscreenchange', resizeCanvas, false);
    // window.addEventListener('mozfullscreenchange', resizeCanvas, false);
    // window.addEventListener('webkitfullscreenchange', resizeCanvas, false);
    //
    //
    // function resizeCanvas(event?: any) {
    //     canvas.width = (event?.target || window ).innerWidth;
    //     canvas.height = (event?.target || window).innerHeight;
    // }
    //
    // resizeCanvas();
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
      nextVideoTree.video.requestVideoFrameCallback(videoFrameCallback)
    }
    nextVideoTree.video.requestVideoFrameCallback(videoFrameCallback)
    const ended = () => {
      nextVideoTree.video.removeEventListener('ended', ended);
      this.playNextVideo();
    }
    nextVideoTree.video.addEventListener('ended', ended)

    this.currentVideoTree = nextVideoTree;
  }
}
