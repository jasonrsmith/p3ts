import "phaser";

import BootScene from "./scenes/BootScene";
import WorldScene from "./scenes/WorldScene";

const config: GameConfig = {
  parent: "content",
  width: 320,
  height: 240,
  zoom: 2,
  render: {
    pixelArt: true,
  },
  scene: [BootScene, WorldScene],
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
};

new Phaser.Game(config);
