import { VideoTree } from "./video-tree";

export class LoopPlayer {
  tree: VideoTree;
  hiddenPlayersElem: HTMLElement;
  metadata: Record<string, any> = { fps: undefined };
  debug = false;

  private currentVideoTree: VideoTree | undefined;

  constructor(
    videoTree: VideoTree,
    hiddenPlayersElem: HTMLElement,
    debug = false,
  ) {
    this.tree = videoTree;
    this.hiddenPlayersElem = hiddenPlayersElem;
    this.debug = debug;
    if (debug) {
      this.hiddenPlayersElem.classList.add("debug");
      document.getElementById("metadata")?.classList.add("debug");
    }
  }

  async play() {
    const allVideo = await this.tree.load((video) =>
      this.addEventsCallbacks(video),
    );

    const hiddenPlayersElem = document.getElementById("hidden-players");
    allVideo.forEach((video) => {
      this.metadata[this.getVideoName(video)] = { last_events: [] };
      hiddenPlayersElem?.appendChild(video);
    });

    let lastCalledTime: number;
    const frameRequestCallback: FrameRequestCallback = () => {
      if (!lastCalledTime) {
        lastCalledTime = Date.now();
        this.metadata.fps = 0;
      } else {
        const delta = (Date.now() - lastCalledTime) / 1000;
        lastCalledTime = Date.now();
        this.metadata.fps = Math.round(1 / delta);
      }

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
      });
      this.updateMetadata();

      window.requestAnimationFrame(frameRequestCallback);
    };

    window.requestAnimationFrame(frameRequestCallback);

    this.playNextVideo();
  }

  playNextVideo() {
    const nextVideoTree =
      this.currentVideoTree?.getNextVideoTree() ?? this.tree;
    nextVideoTree.play();
    nextVideoTree.video.style.zIndex = "11";
    if (this.currentVideoTree) {
      this.currentVideoTree.video.style.zIndex = "10";
    }
    // const ended = () => {
    //   this.metadata.ended = Date.now();
    //   nextVideoTree.video.removeEventListener('ended', ended);
    //   this.playNextVideo();
    // }
    // nextVideoTree.video.addEventListener('ended', ended)
    let lastCurrentTime = nextVideoTree.video.currentTime;
    const frameRequestCallback: FrameRequestCallback = () => {
      const { currentTime, duration } = nextVideoTree.video;
      const tillEnd = duration - currentTime;
      if (nextVideoTree.video.ended) {
        this.metadata[this.getVideoName(nextVideoTree.video)].raf_ended =
          Date.now();
        nextVideoTree.video.pause();
        this.playNextVideo();
        nextVideoTree.video.currentTime = 0;
        return;
      } else if (
        tillEnd > 0 &&
        tillEnd < 0.06 &&
        lastCurrentTime === currentTime
      ) {
        this.playNextVideo();
        nextVideoTree.video.currentTime = nextVideoTree.video.duration;
        return;
      }
      lastCurrentTime = currentTime;
      window.requestAnimationFrame(frameRequestCallback);
    };
    // window.requestAnimationFrame(frameRequestCallback);
    frameRequestCallback(Date.now());

    this.currentVideoTree = nextVideoTree;
  }

  updateMetadata() {
    if (!this.debug) {
      return;
    }
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
      "waiting",
    ].forEach((event) => {
      video.addEventListener(event, () => {
        const lastEvents: string[] =
          this.metadata[this.getVideoName(video)]?.last_events;
        if (!lastEvents) {
          return;
        }
        lastEvents.push(event);
        if (lastEvents.length > 4) {
          lastEvents.shift();
        }
        this.metadata[this.getVideoName(video)].last_event_ts = Date.now();
        this.updateMetadata();
      });
    });
  }

  iOS() {
    return (
      [
        "iPad Simulator",
        "iPhone Simulator",
        "iPod Simulator",
        "iPad",
        "iPhone",
        "iPod",
      ].includes(navigator.platform) ||
      // iPad on iOS 13 detection
      (navigator.userAgent.includes("Mac") && "ontouchend" in document)
    );
  }
}
