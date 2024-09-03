import { VideoTree } from "./video-tree";

export class LoopPlayer {
  tree: VideoTree;
  hiddenPlayersElem: HTMLElement;
  metadata: Record<string, any> = { fps: undefined };
  debug = false;
  transparent = false;

  private currentVideoTree: VideoTree | undefined;

  constructor(
    videoTree: VideoTree,
    hiddenPlayersElem: HTMLElement,
    {
      debug = false,
      transparent = false,
    }: { debug?: boolean; transparent?: boolean },
  ) {
    this.tree = videoTree;
    this.hiddenPlayersElem = hiddenPlayersElem;
    this.debug = debug;
    this.transparent = transparent;
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
    allVideo.forEach((video, idx) => {
      this.metadata[this.getVideoName(video)] = { last_events: [] };
      if (this.debug) {
        video.style.border = `2px solid ${colors[idx]}`;
      }
      hiddenPlayersElem?.appendChild(video);
    });

    if (this.transparent) {
      const transparentVideo = this.createTransparentVideo();
      transparentVideo.style.zIndex = "101";
      this.hiddenPlayersElem.appendChild(transparentVideo);
    }

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
        this.playNextVideo();
        setTimeout(() => {
          nextVideoTree.video.pause();
          nextVideoTree.video.currentTime = 0;
        }, 100);
        return;
      } else if (
        tillEnd > 0 &&
        tillEnd < 0.06 &&
        currentTime === lastCurrentTime
      ) {
        this.metadata[this.getVideoName(nextVideoTree.video)].endBefore =
          Date.now();
        this.playNextVideo();
        setTimeout(() => {
          nextVideoTree.video.pause();
          nextVideoTree.video.currentTime = 0;
        }, 100);
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

  createTransparentVideo() {
    function supportsHEVCAlpha() {
      const navigator = window.navigator;
      const ua = navigator.userAgent.toLowerCase();
      const hasMediaCapabilities = !!(
        navigator.mediaCapabilities && navigator.mediaCapabilities.decodingInfo
      );
      const isSafari =
        ua.indexOf("safari") != -1 &&
        !(ua.indexOf("chrome") != -1) &&
        ua.indexOf("version/") != -1;

      return isSafari && hasMediaCapabilities;
    }

    const video = document.createElement("video");
    video.src = supportsHEVCAlpha()
      ? "https://doggo.s3.amazonaws.com/output.mov"
      : "https://doggo.s3.amazonaws.com/output.webm";
    video.muted = true;
    video.loop = true;
    video.autoplay = true;

    return video;
  }
}

const colors = [
  "red",
  "green",
  "blue",
  "yellow",
  "purple",
  "orange",
  "pink",
  "brown",
  "cyan",
  "magenta",
  "lime",
  "teal",
  "indigo",
  "violet",
  "light-blue",
  "light-green",
  "amber",
  "deep-orange",
  "deep-purple",
];
