export class Mage extends Phaser.Physics.Arcade.Sprite {
  public static createAnims(scene: Phaser.Scene) {
    scene.anims.create({
      key: "mage_left",
      frames: scene.anims.generateFrameNumbers("mage", {
        frames: [8, 9, 10, 11]
      }),
      frameRate: 10,
      repeat: -1
    });
  }
  private currentScene: Phaser.Scene;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "mage", 0);
    this.currentScene = scene;
    this.currentScene.add.existing(this);
  }

  public update(): void {
    this.anims.play("mage_left", true);
  }
}
