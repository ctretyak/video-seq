import { Assets, Sprite, Text } from 'pixi.js';
import { JSONVideoTree } from './interfaces';

export class VideoTree {
  public id: number;
  public sprite!: Sprite;

  private src: string;
  private nodes: VideoTree[];
  private eventsText?: Text;

  static fromJSON(json: JSONVideoTree, id = 0, eventsText?: Text): VideoTree {
    return new VideoTree(
      id,
      json.src,
      json.nodes?.map((node, idx) => VideoTree.fromJSON(node, idx, eventsText)),
      eventsText
    );
  }

  constructor(id: number, src: string, nodes: VideoTree[] = [], eventsText?: Text) {
    this.id = id;
    this.src = src;
    this.nodes = nodes;
    this.eventsText = eventsText;
  }

  async loadSprites() {
    const [texture] = await Promise.all([
      Assets.load(this.src),
      ...this.nodes.map((node) => node.loadSprites()),
    ]);
    this.sprite = new Sprite(texture);
    if(this.eventsText){
      this.addEvents();
    }
    const video = this.getVideo();
    video.controls = true;
    video.pause();
    video.currentTime = 0;
  }

  addEvents() {
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
    ].map((event) => {
        const video = this.getVideo();
      video.addEventListener(event, () => {
        if (this.eventsText) {
          const currentText = JSON.parse(this.eventsText.text); 
          currentText[video.currentSrc.replace(/(\.mp4)+$/gm, "").slice(-8)] = event;
          this.eventsText.text = JSON.stringify(currentText, null, 2);
        }
      })
    })
  }

  getVideo() {
    return this.sprite.texture.source.resource as any as HTMLVideoElement;
  }

  resetVideo() {
    const video = this.getVideo();
    video.pause();
    video.load();
    video.addEventListener("loadeddata", ()=> {
      video.pause();
      video.currentTime = 0;
    })
  }

  play() {
    const video = this.getVideo();
    video.play();
  }

  isEnded() {
    const video = this.getVideo();
    return video.ended;
  }

  getNextVideo() {
    const length = this.nodes.length;
    if (!length) {
      return undefined;
    }

    return this.nodes[Math.floor(Math.random() * length)];
  }

  getProgress() {
    const video = this.getVideo();
    return (video.currentTime / video.duration) * 100;
  }
}
