import { JSONVideoTree } from "../video-tree/interfaces";
import { VideoSprite } from "./video-sprite";

export class VideoTree {
  public id: number;
  public readonly sprite: VideoSprite;

  private nodes: VideoTree[];

  static fromJSON(json: JSONVideoTree, id = 0): VideoTree {
    return new VideoTree(
      id,
      json.src,
      json.nodes?.map((node, idx) => VideoTree.fromJSON(node, idx)),
    );
  }

  constructor(id: number, src: string, nodes: VideoTree[] = []) {
    this.id = id;
    this.sprite = new VideoSprite(src);
    this.nodes = nodes;
  }

  async load() {
    await Promise.all([
      this.sprite.load(),
      ...this.nodes.map((node) => node.load()),
    ]);
  }

  getNextVideoTree() {
    const length = this.nodes.length;
    if (!length) {
      return undefined;
    }

    return this.nodes[Math.floor(Math.random() * length)];
  }
}
