import "phaser";

import { BootScene } from "./scenes/BootScene";
import { WorldScene } from "./scenes/WorldScene";

const config: GameConfig = {
  parent: "content",
  render: {
    pixelArt: true
  },
  scene: [BootScene, WorldScene],
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
      debug: true
    }
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    height: 240,
    width: 420
  }
};

const game = new Phaser.Game(config);
