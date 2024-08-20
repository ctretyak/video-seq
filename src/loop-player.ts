import { Application, Container, Text } from 'pixi.js';
import { VideoProgressBar } from './video-progress-bar';
import { VideoTree } from './video-tree/tree';
import { JSONVideoTree } from './video-tree/interfaces';

export class LoopPlayer extends Container {
  private tree: VideoTree;
  private currentVideo: VideoTree | undefined;
  private text: Text;
  private progress: VideoProgressBar;
  private playerWrapper: HTMLElement | null | undefined;
  private playing = false;

  constructor(json: JSONVideoTree, debug = false) {
    super();

    this.text = new Text({
      text: 'Loading',
      style: { fill: '#fff' },
    });
    this.addChild(this.text);

    let eventsText: Text | undefined; 
    if(debug){
       eventsText = new Text({
        text: '{}',
        style: { fill: '#fff' },
      });
      eventsText.x = 450;
      eventsText.zIndex = 99;
      this.addChild(eventsText);
    }

    this.progress = new VideoProgressBar();
    this.progress.y = this.text.height;
    this.addChild(this.progress);

    this.playerWrapper = debug ?  document.getElementById('player-wrapper'): undefined;

    this.tree = VideoTree.fromJSON(json, 0, eventsText);
  }

  async play() {
    await this.tree.loadSprites();
    this.playNextVideo();
    this.playing = true;
  }

  playNextVideo() {
    let nextVideo = this.currentVideo?.getNextVideo();
    if (!nextVideo) {
      nextVideo = this.tree;
      this.text.text = `Video #${nextVideo.id}`;
    } else {
      this.text.text += ` - ${nextVideo.id}`;
    }
    nextVideo.sprite.y = this.text.height + this.progress.height + 8;

    this.addChild(nextVideo.sprite);
    if (this.currentVideo) {
      this.removeChild(this.currentVideo.sprite);
      this.currentVideo.resetVideo();
    }

    if (this.playerWrapper) {
      const video = nextVideo.getVideo();
      video.style.maxWidth = '100%';
      video.style.maxHeight = '100%';
      this.playerWrapper.innerHTML = '';
      this.playerWrapper.appendChild(video)
    }
    nextVideo.play();

    this.currentVideo = nextVideo;
  }

  onTick(app: Application) {
    if (!this.playing) {
      return;
    }
    if (this.currentVideo?.isEnded()) {
      this.playNextVideo();
    }
    if (this.currentVideo) {
      this.progress.progress = this.currentVideo.getProgress();

      const video = this.currentVideo.getVideo();
      const screenHeight = app.screen.height - this.progress.height - this.text.height - 8;

      // resize video to fullscreen
      if (video.videoWidth && video.videoHeight) {
        const scale = Math.min(app.screen.width / video.videoWidth, screenHeight / video.videoHeight);
        this.currentVideo.sprite.width = video.videoWidth * scale;
        this.currentVideo.sprite.height = video.videoHeight * scale;
      }
    }
  }
}
