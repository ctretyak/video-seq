import { Application, Assets, Sprite, Texture, Ticker } from "pixi.js";

export class VideoSprite extends Sprite {
  private video: HTMLVideoElement;
  private canvas = document.createElement("canvas");
  private FPS = 60;
  private frames: Array<{ time: number; texture: Texture }> = [];

  constructor(src: string) {
    super();

    this.video = document.createElement("video");
    this.video.autoplay = false;
    this.video.preload = "none";
    this.video.src = src;
    this.video.controls = true;

    const hiddenElem = document.getElementById("hidden-video-container");
    if (hiddenElem) {
      hiddenElem.appendChild(this.video);
    }
  }

  async load() {
    return new Promise<void>((resolve) => {
      const canPlay = async () => {
        this.video.removeEventListener("canplay", canPlay);
        await this.captureFrames();
        resolve();
      };

      this.video.addEventListener("canplay", canPlay);
      this.video.load();
    });
  }

  async captureFrames() {
    const { duration } = this.video;
    const step = 1 / this.FPS;
    this.frames = [];
    for (let time = 0; time <= duration; time += step) {
      const texture = await this.captureFrame(time);
      this.frames.push({ time: time - step, texture });
    }
  }

  captureFrame(time: number) {
    return new Promise<Texture>((resolve) => {
      const onSeeked = async () => {
        this.video.removeEventListener("seeked", onSeeked);
        this.canvas.width = this.video.videoWidth;
        this.canvas.height = this.video.videoHeight;
        const ctx = this.canvas.getContext("2d");
        ctx?.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
        const data = await Assets.load(this.canvas.toDataURL());
        resolve(data);
      };
      if (this.video.currentTime === time) {
        onSeeked();
      } else {
        this.video.currentTime = time;
        this.video.addEventListener("seeked", onSeeked);
      }
    });
  }

  play() {
    const startTime = Date.now();
    const onTick = () => {
      this.resize();

      const ellapsedTime = (Date.now() - startTime) / 1000;
      const nextFrame = this.frames.find(({ time }) => time >= ellapsedTime);

      if (!nextFrame) {
        Ticker.shared.remove(onTick);
        this.emit("end");
        return;
      }
      this.texture = nextFrame.texture;
    };
    Ticker.shared.add(onTick);
    onTick();
  }

  resize() {
    const { videoHeight, videoWidth } = this.video;
    const {
      screen: { width, height },
    } = (window as any).app as Application;

    let scale = 1;
    if (videoWidth > width || videoHeight > height) {
      scale = Math.min(width / videoWidth, height / videoHeight);
    }

    this.scale.set(scale);
  }
}
