import { VideoTree } from "./video-tree";

export class LoopPlayer {
  tree: VideoTree;
  canvas: HTMLCanvasElement;
  hiddenPlayersElem: HTMLElement;
  metadata: Record<string, any> = {};

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
      this.metadata[this.getVideoName(video)] = { last_events: [] };
      hiddenPlayersElem?.appendChild(video);
      this.addEventsCallbacks(video);
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
      this.updateMetadata();
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

  updateMetadata() {
    const metadataElem = document.getElementById("metadata");
    if (metadataElem) {
      const metadataString = JSON.stringify(this.metadata, null, 2);
      if (metadataElem.innerHTML !== metadataString) {
        metadataElem.innerHTML = JSON.stringify(this.metadata, null, 2);
      }
    }
  }

  getVideoName(video: HTMLVideoElement) {
    return video.currentSrc.replace(/(\.mp4)+$/gm, "").slice(-8);
  }

  addEventsCallbacks(video: HTMLVideoElement) {
    [
      "audioprocess",
      "canplay",
      "canplaythrough",
      "complete",
      "durationchange",
      "emptied",
      "ended",
      "error",
      "loadeddata",
      "loadedmetadata",
      "loadstart",
      "pause",
      "play",
      "playing",
      "progress",
      "ratechange",
      "seeked",
      "seeking",
      "stalled",
      "suspend",
      // "timeupdate",
      "volumechange",
      "waiting"
    ].forEach((event) => {
      video.addEventListener(event, () => {
        const lastEvents: string[] = this.metadata[this.getVideoName(video)].last_events;
        lastEvents.push(event);
        if (lastEvents.length > 5) {
          lastEvents.shift();
        }
        this.metadata[this.getVideoName(video)].last_event_ts = Date.now();
        this.updateMetadata();
      })
    })
  }
}
