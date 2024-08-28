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
    const allVideo = await this.tree.load(video => this.addEventsCallbacks(video));

    const hiddenPlayersElem = document.getElementById('hidden-players');
    allVideo.forEach((video) => {
      this.metadata[this.getVideoName(video)] = { last_events: [] };
      hiddenPlayersElem?.appendChild(video);
    });

    const frameRequestCallback: FrameRequestCallback = () => {
      allVideo.forEach((video) => {
        const { currentTime, duration, ended, paused, seeking } = video;
        const tillEnd = duration - currentTime;
        this.metadata[this.getVideoName(video)].video = {
          currentTime: currentTime.toFixed(3),
          duration: duration.toFixed(3),
          ended,
          paused,
          seeking,
          tillEnd: tillEnd.toFixed(3),
        };
      })
      this.updateMetadata();

      window.requestAnimationFrame(frameRequestCallback);
    }

    window.requestAnimationFrame(frameRequestCallback);

    this.playNextVideo();
  }

  playNextVideo() {
    const nextVideoTree = this.currentVideoTree?.getNextVideoTree() ?? this.tree;
    nextVideoTree.play();
    const ctx = this.canvas.getContext('2d');
    let videoFrameCallbackId = -1;
    const videoFrameCallback: VideoFrameRequestCallback = (_now, _metadata) => {

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
      videoFrameCallbackId = nextVideoTree.video.requestVideoFrameCallback(videoFrameCallback)
    }
    videoFrameCallbackId = nextVideoTree.video.requestVideoFrameCallback(videoFrameCallback)
    // const ended = () => {
    //   this.metadata.ended = Date.now();
    //   nextVideoTree.video.removeEventListener('ended', ended);
    //   this.playNextVideo();
    // }
    // nextVideoTree.video.addEventListener('ended', ended)
    let prevCurrTime = -1;
    const frameRequestCallback: FrameRequestCallback = () => {
      const { currentTime, duration } = nextVideoTree.video;
      const tillEnd = duration - currentTime;
      if (nextVideoTree.video.ended) {
        this.metadata[this.getVideoName(nextVideoTree.video)].raf_ended = Date.now();
        nextVideoTree.video.cancelVideoFrameCallback(videoFrameCallbackId)
        this.playNextVideo();
        nextVideoTree.video.currentTime = 0;
        return;
      } else if (tillEnd > 0 && tillEnd < 0.06 && prevCurrTime === currentTime) {
        nextVideoTree.video.currentTime = nextVideoTree.video.duration;
      }
      prevCurrTime = currentTime;
      window.requestAnimationFrame(frameRequestCallback);
    }

    window.requestAnimationFrame(frameRequestCallback)

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
      "timeupdate",
      "volumechange",
      "waiting"
    ].forEach((event) => {
      video.addEventListener(event, () => {
        const lastEvents: string[] = this.metadata[this.getVideoName(video)].last_events;
        lastEvents.push(event);
        if (lastEvents.length > 4) {
          lastEvents.shift();
        }
        this.metadata[this.getVideoName(video)].last_event_ts = Date.now();
        this.updateMetadata();
      })
    })
  }

  iOS() {
    return [
      'iPad Simulator',
      'iPhone Simulator',
      'iPod Simulator',
      'iPad',
      'iPhone',
      'iPod'
    ].includes(navigator.platform)
      // iPad on iOS 13 detection
      || (navigator.userAgent.includes("Mac") && "ontouchend" in document)
  }
}
