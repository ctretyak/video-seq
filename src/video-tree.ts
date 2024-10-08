import { JSONVideoTree } from "./video-tree/interfaces";

/* Дерево всех видео
 ** Каждый узел должен содеражть (src) ссылку на видео
 ** Каждый узел может содеражть дочерние видео (nodes), среди которых случайно выбирается одно видео, которое будет проиграно после заверешения проигрывания родительского видео
 */
export const VIDEO_TREE: JSONVideoTree =
  window.location.hostname === "localhost"
    ? {
        src: "http://localhost:5173/video-seq/monster_1.mp4.mp4",
        nodes: [
          {
            src: "http://localhost:5173/video-seq/monster_2.mp4.mp4",
            nodes: [
              {
                src: "http://localhost:5173/video-seq/monster_3.mp4.mp4",
              },
            ],
          },
        ],
      }
    : {
        src: "https://ctretyak.github.io/video-test/monster_1.mp4.mp4",
        nodes: [
          {
            src: "https://ctretyak.github.io/video-test/monster_2.mp4.mp4",
            nodes: [
              {
                src: "https://ctretyak.github.io/video-test/monster_3.mp4.mp4",
              },
            ],
          },
        ],
      };
