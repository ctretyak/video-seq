import { ProgressBar } from '@pixi/ui';
import { Graphics } from 'pixi.js';

const args = {
  fillColor: '#00b1dd',
  borderColor: '#FFFFFF',
  backgroundColor: '#fe6048',
  value: 50,
  width: 450,
  height: 8,
  radius: 25,
  border: 1,
  animate: true,
  vertical: false,
};

const bg = new Graphics()
  .roundRect(0, 0, args.width, args.height, args.radius)
  .fill(args.borderColor)
  .roundRect(
    args.border,
    args.border,
    args.width - args.border * 2,
    args.height - args.border * 2,
    args.radius
  )
  .fill(args.backgroundColor);

const fill = new Graphics()
  .roundRect(0, 0, args.width, args.height, args.radius)
  .fill(args.borderColor)
  .roundRect(
    args.border,
    args.border,
    args.width - args.border * 2,
    args.height - args.border * 2,
    args.radius
  )
  .fill(args.fillColor);

export class VideoProgressBar extends ProgressBar {
  constructor() {
    super({ bg, fill });
  }
}
