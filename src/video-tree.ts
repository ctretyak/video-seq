import { JSONVideoTree } from './video-tree/interfaces';

/* Дерево всех видео
 ** Каждый узел должен содеражть (src) ссылку на видео
 ** Каждый узел может содеражть дочерние видео (nodes), среди которых случайно выбирается одно видео, которое будет проиграно после заверешения проигрывания родительского видео
 */
export const VIDEO_TREE: JSONVideoTree = {
  src: 'https://ctretyak.github.io/video-test/part1(split-video.com)_no_audio.mp4',
  nodes: [
    {
      src: 'https://ctretyak.github.io/video-test/part1(split-video.com)_no_audio.mp4',
    },
    {
      src: 'https://ctretyak.github.io/video-test/part2(split-video.com)_no_audio.mp4',
      nodes: [
        {
          src: 'https://ctretyak.github.io/video-test/part1(split-video.com)_no_audio.mp4',
        },
        {
          src: 'https://ctretyak.github.io/video-test/203845-922675645_tiny.mp4',
        },
      ],
    },
    {
      src: 'https://ctretyak.github.io/video-test/203845-922675645_tiny.mp4',
    },
  ],
};
