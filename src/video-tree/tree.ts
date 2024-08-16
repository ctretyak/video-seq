import { Assets, Sprite } from 'pixi.js';
import { JSONVideoTree } from './interfaces';

export class VideoTree {
  public id: number;
  public sprite!: Sprite;

  private src: string;
  private nodes: VideoTree[];

  static fromJSON(json: JSONVideoTree, id = 0): VideoTree {
    return new VideoTree(
      id,
      json.src,
      json.nodes?.map((node, idx) => VideoTree.fromJSON(node, idx))
    );
  }

  constructor(id: number, src: string, nodes: VideoTree[] = []) {
    this.id = id;
    this.src = src;
    this.nodes = nodes;
  }

  async loadSprites() {
    const [texture] = await Promise.all([
      Assets.load(this.src),
      ...this.nodes.map((node) => node.loadSprites()),
    ]);
    this.sprite = new Sprite(texture);
    this.resetVideo();
  }

  getVideo() {
    return this.sprite.texture.baseTexture.resource as any as HTMLVideoElement;
  }

  resetVideo() {
    const video = this.getVideo();
    video.pause();
    video.currentTime = 0;
  }

  play() {
    const video = this.getVideo();
    video.currentTime = 0;
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
