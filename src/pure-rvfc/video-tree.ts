import { JSONVideoTree } from "../video-tree/interfaces";

export class VideoTree {
  public id: number;
  private src: string;
  private nodes: VideoTree[];
  public video!: HTMLVideoElement;

  static fromJSON(json: JSONVideoTree, id = 0): VideoTree {
    return new VideoTree(
      id,
      json.src,
      json.nodes?.map((node, idx) => VideoTree.fromJSON(node, idx)),
    );
  }

  constructor(id: number, src: string, nodes: VideoTree[] = []) {
    this.id = id;
    this.src = src;
    this.nodes = nodes;
  }

  async load(): Promise<HTMLVideoElement[]> {
    this.video = document.createElement('video');
    this.video.playsInline = true;
    this.video.preload = "auto";
    this.video.controls = true;
    this.video.muted = true;
    this.video.autoplay = true;
    this.video.src = this.src;

    const videoLoadedPromise = new Promise<HTMLVideoElement>((resolve) => {
      const canPlay = () => {
        this.video.removeEventListener('canplay', canPlay);

        const loaded = () => {
          this.video.removeEventListener('canplaythrough', loaded);
          this.video.currentTime = this.video.duration * Math.random();
          resolve(this.video);
        }

        this.video.addEventListener('canplaythrough', loaded);
      }

      this.video.addEventListener('canplay', canPlay);
    });

    const [pr, pr2 = []] = await Promise.all([videoLoadedPromise, ...this.nodes.map((node) => node.load())]);
    return [pr, ...pr2]
  }

  getNextVideoTree() {
    const length = this.nodes.length;
    if (!length) {
      return undefined;
    }

    return this.nodes[Math.floor(Math.random() * length)];
  }

  play(){
    this.video.play();
  }
}
