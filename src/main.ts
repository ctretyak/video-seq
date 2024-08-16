import { Application, Text } from 'pixi.js';
import { VideoTree } from './video-tree/tree';
import { VIDEO_TREE } from './video-tree';
import { VideoProgressBar } from './video-progress-bar';

let videoTree = VIDEO_TREE;

const searchParams = new URLSearchParams(window.location.search);
const paramsTree = searchParams.get("tree");
if(paramsTree){
  videoTree = JSON.parse(paramsTree) as any;
}

(async () => {
  // Create a new application
  const app = new Application();

  // Initialize the application
  await app.init({ resizeTo: window });

  // Append the application canvas to the document body
  document.body.appendChild(app.canvas);

  const text = new Text({
    text: 'Loading',
    style: { fill: '#fff' },
  });
  app.stage.addChild(text);

  const progress = new VideoProgressBar();
  progress.y = text.height;

  app.stage.addChild(progress);

  const tree = VideoTree.fromJSON(videoTree);

  await tree.loadSprites();

  let currentVideo: VideoTree | undefined = undefined;
  function playNextVideo() {
    let nextVideo = currentVideo?.getNextVideo();
    if (!nextVideo) {
      nextVideo = tree;
      text.text = `Video #${nextVideo.id}`;
    } else {
      text.text += ` - ${nextVideo.id}`;
    }
    nextVideo.sprite.y = text.height + progress.height + 8;

    app.stage.addChild(nextVideo.sprite);
    if (currentVideo) {
      app.stage.removeChild(currentVideo.sprite);
      currentVideo.resetVideo();
    }

    nextVideo.play();

    currentVideo = nextVideo;
  }

  playNextVideo();

  app.ticker.add(() => {
    if (currentVideo?.isEnded()) {
      playNextVideo();
    }
    if (currentVideo) {
      progress.progress = currentVideo.getProgress();
    }
  });
})();
