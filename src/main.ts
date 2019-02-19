import "phaser";

import TestScene from "./scenes/PlayScene";

const config: GameConfig = {
  type: Phaser.AUTO,
  parent: "content",
  width: 800,
  height: 600,
  resolution: 1,
  backgroundColor: "#EDEEC9",
  scene: [TestScene],
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 300 },
      debug: false,
    },
  },
};

new Phaser.Game(config);
