import { Application, Sprite, Texture, Ticker } from "pixi.js";

export class VideoSprite extends Sprite {
  private video: HTMLVideoElement;
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

        this.video.play();

        const track = (this.video as any).captureStream().getVideoTracks()[0];
        this.video.onended = () => {
          track.stop();
          debugger;
        };

        const trackProcessor = new (window as any).MediaStreamTrackProcessor(
          track,
        );

        const reader = trackProcessor.readable.getReader();

        let idx = 0;
        const readChunk = async () => {
          const { done, value } = (await reader.read()) as {
            done: boolean;
            value: VideoFrame;
          };
          idx++;

          console.log(this.video.src, done, this.frames.length);

          const bitmap = await createImageBitmap(value);

          this.frames.push({
            texture: Texture.from(bitmap),
            time: value.timestamp,
          });
          value.close();

          if (!done) {
            readChunk();
            return;
          }

          reader.cancel();
          resolve();
        };

        readChunk();
      };

      this.video.addEventListener("canplay", canPlay);
      this.video.load();
    });
  }

  play() {
    const frameStack = [...this.frames];
    const onTick = () => {
      this.resize();

      const nextFrame = frameStack.pop();
      console.log("nextFrame", nextFrame);

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
