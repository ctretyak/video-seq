import { Application, Graphics } from 'pixi.js';
import { VIDEO_TREE } from './video-tree';
import { LoopPlayer } from './loop-player';

let videoTree = VIDEO_TREE;

const searchParams = new URLSearchParams(window.location.search);
const paramsTree = searchParams.get("tree");
if (paramsTree) {
  videoTree = JSON.parse(paramsTree) as any;
}

(async () => {
  // Create a new application
  const app = new Application();

  // Initialize the application
  await app.init({ resizeTo: window });

  // Append the application canvas to the document body
  document.body.appendChild(app.canvas);

  const button = new Graphics()
    .roundRect(0, 0, 100, 100, 10)
    .fill(0xffffff, 0.5)
    .beginPath()
    .moveTo(36, 30)
    .lineTo(36, 70)
    .lineTo(70, 50)
    .closePath()
    .fill(0xffffff);
  button.eventMode = 'static';
  button.cursor = 'pointer';
  app.stage.addChild(button);

  const loopPlayer = new LoopPlayer(videoTree, searchParams.has('debug'));
  button.on('pointertap', () => {
    button.destroy();

    app.stage.addChild(loopPlayer);
    loopPlayer.play();
  });
  app.ticker.add(() => {
    // Position the button
    if (!button.destroyed) {
      button.x = (app.screen.width - button.width) / 2;
      button.y = (app.screen.height - button.height) / 2;
    }

    loopPlayer.onTick(app);
  });
})();
