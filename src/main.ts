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
  const playerWrapper = document.getElementById('player-wrapper');

  const text = new Text({
    text: 'Loading',
    style: { fill: '#fff' },
  });
  app.stage.addChild(text);

  const eventsText = new Text({
    text: '{}',
    style: { fill: '#fff' },
  });
  eventsText.x = 450;
  eventsText.zIndex = 99;
  app.stage.addChild(eventsText);

  const progress = new VideoProgressBar();
  progress.y = text.height;

  app.stage.addChild(progress);

  const tree = VideoTree.fromJSON(videoTree, 0, eventsText);

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

    if(playerWrapper){
      const video = nextVideo.getVideo();
      video.style.maxWidth = '100%';
      video.style.maxHeight = '100%';
      playerWrapper.innerHTML = '';
      playerWrapper.appendChild(video)
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

      const video = currentVideo.getVideo();
      const screenHeight = app.screen.height - progress.height - text.height - 8;

      // resize video to fullscreen
      if(video.videoWidth && video.videoHeight){
        const scale = Math.min(app.screen.width / video.videoWidth, screenHeight / video.videoHeight);
        currentVideo.sprite.width =video.videoWidth * scale;
        currentVideo.sprite.height =video.videoHeight * scale;
      }
    }
  });
})();
