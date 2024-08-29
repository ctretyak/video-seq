import { Container, Text } from "pixi.js";
import { VideoTree } from "./video-tree";

export class LoopPlayer extends Container {
  private tree: VideoTree;
  private currentTree: VideoTree | undefined = undefined;

  constructor(tree: VideoTree) {
    super();
    this.tree = tree;
  }

  async play() {
    const loadingText = new Text({
      text: "Loading",
      style: { fill: "#fff" },
    });
    this.removeChild(loadingText);
    this.addChild(loadingText);
    console.time("loaded");
    await this.tree.load();
    console.timeEnd("loaded");

    this.playNextSprite();
  }

  private playNextSprite() {
    const nextTree = this.currentTree?.getNextVideoTree() || this.tree;
    nextTree.sprite.play();
    this.addChild(nextTree.sprite);
    nextTree.sprite.once("end", () => {
      this.removeChild(nextTree.sprite);
      this.playNextSprite();
    });
    this.currentTree = nextTree;
  }
}
