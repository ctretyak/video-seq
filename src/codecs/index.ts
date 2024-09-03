import { Application } from "pixi.js";
import { VIDEO_TREE } from "../video-tree";
import { LoopPlayer } from "./loop-player";
import { VideoTree } from "./video-tree";

let jsonVideoTree = VIDEO_TREE;

const searchParams = new URLSearchParams(window.location.search);
const paramsTree = searchParams.get("tree");
if (paramsTree) {
  jsonVideoTree = JSON.parse(paramsTree) as any;
}

const videoTree = VideoTree.fromJSON(jsonVideoTree);

(async () => {
  const app = new Application();
  (window as any).app = app;

  // Initialize the application
  await app.init({ resizeTo: window });

  // Append the application canvas to the document body
  document.body.appendChild(app.canvas);
  const loopPlayer = new LoopPlayer(videoTree);

  app.stage.addChild(loopPlayer);

  loopPlayer.play();
})();
