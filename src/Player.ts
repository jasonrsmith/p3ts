import Scene = Phaser.Scene;

export class Player extends Phaser.Physics.Arcade.Sprite {
  private currentScene: Phaser.Scene;

  private keys: Map<string, Phaser.Input.Keyboard.Key>;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "player", 6);

    this.currentScene = scene;
    this.keys = Player.generateKeysForScene(this.currentScene);
    Player.createAnimsForScene(this.currentScene);
    this.currentScene.physics.world.enable(this);
    this.currentScene.add.existing(this);
  }

  public getKeys(): Map<string, Phaser.Input.Keyboard.Key> {
    return this.keys;
  }

  private static generateKeysForScene(
    scene: Phaser.Scene
  ): Map<string, Phaser.Input.Keyboard.Key> {
    const addKey = (key: string) => scene.input.keyboard.addKey(key);
    return new Map([
      ["LEFT", addKey("LEFT")],
      ["RIGHT", addKey("RIGHT")],
      ["DOWN", addKey("DOWN")],
      ["UP", addKey("UP")]
    ]);
  }

  private static createAnimsForScene(scene: Scene): void {
    scene.anims.create({
      key: "left",
      frames: scene.anims.generateFrameNumbers("player", {
        frames: [1, 7, 1, 13]
      }),
      frameRate: 10,
      repeat: -1
    });

    scene.anims.create({
      key: "right",
      frames: scene.anims.generateFrameNumbers("player", {
        frames: [1, 7, 1, 13]
      }),
      frameRate: 10,
      repeat: -1
    });
    scene.anims.create({
      key: "up",
      frames: scene.anims.generateFrameNumbers("player", {
        frames: [2, 8, 2, 14]
      }),
      frameRate: 10,
      repeat: -1
    });
    scene.anims.create({
      key: "down",
      frames: scene.anims.generateFrameNumbers("player", {
        frames: [0, 6, 0, 12]
      }),
      frameRate: 10,
      repeat: -1
    });
  }
}
