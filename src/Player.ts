import Scene = Phaser.Scene;

export class Player extends Phaser.Physics.Arcade.Sprite {
  private readonly currentScene: Phaser.Scene;
  private readonly keys: Map<string, Phaser.Input.Keyboard.Key>;
  private readonly speedFactor: number;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "player", 6);

    this.currentScene = scene;
    this.keys = Player.generateKeysForScene(this.currentScene);
    Player.createAnimsForScene(this.currentScene);
    this.initPhysics();
    this.currentScene.add.existing(this);

    this.speedFactor = 1.5;
  }

  public getKeys(): Map<string, Phaser.Input.Keyboard.Key> {
    return this.keys;
  }

  public update(...args): void {
    this.handleInput();
  }

  private initPhysics() {
    this.currentScene.physics.world.enable(this);
    this.setCollideWorldBounds(true);
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
      key: "player_right",
      frames: scene.anims.generateFrameNumbers("player", {
        frames: [1, 7, 1, 13]
      }),
      frameRate: 10,
      repeat: -1
    });
    scene.anims.create({
      key: "player_up",
      frames: scene.anims.generateFrameNumbers("player", {
        frames: [2, 8, 2, 14]
      }),
      frameRate: 10,
      repeat: -1
    });
    scene.anims.create({
      key: "player_down",
      frames: scene.anims.generateFrameNumbers("player", {
        frames: [0, 6, 0, 12]
      }),
      frameRate: 10,
      repeat: -1
    });
  }

  private handleInput() {
    this.setVelocity(0);
    if (this.keys.get("LEFT").isDown) {
      this.setVelocityX(-80 * this.speedFactor);
    } else if (this.keys.get("RIGHT").isDown) {
      this.setVelocityX(80 * this.speedFactor);
    }

    if (this.keys.get("UP").isDown) {
      this.setVelocityY(-80 * this.speedFactor);
    } else if (this.keys.get("DOWN").isDown) {
      this.setVelocityY(80 * this.speedFactor);
    }

    if (this.keys.get("LEFT").isDown) {
      this.anims.play("player_right", true);
      this.flipX = true;
    } else if (this.keys.get("RIGHT").isDown) {
      this.anims.play("player_right", true);
      this.flipX = false;
    } else if (this.keys.get("UP").isDown) {
      this.anims.play("player_up", true);
    } else if (this.keys.get("DOWN").isDown) {
      this.anims.play("player_down", true);
    } else {
      this.anims.stop();
    }
  }
}
