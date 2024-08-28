import { VideoTree } from "./video-tree";
import { VIDEO_TREE } from '../video-tree';
import { LoopPlayer } from "./loop-player";

let jsonVideoTree = VIDEO_TREE;

const searchParams = new URLSearchParams(window.location.search);
const paramsTree = searchParams.get("tree");
if (paramsTree) {
  jsonVideoTree = JSON.parse(paramsTree) as any;
}

const videoTree = VideoTree.fromJSON(jsonVideoTree);
const loopPlayer = new LoopPlayer(
  videoTree,
  document.getElementById('canvas') as HTMLCanvasElement,
  document.getElementById('hidden-players') as HTMLElement
);


const playButton = document.getElementById('play') as HTMLButtonElement;
playButton?.addEventListener('click', () => {
  playButton.innerHTML = 'Loading...';
  playButton.disabled = true;
  loopPlayer.play();
});


