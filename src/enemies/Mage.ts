export class Mage extends Phaser.Physics.Arcade.Sprite {
  private speed: number;

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
    this.initPhysics();
    this.currentScene.add.existing(this);
    this.flipX = true;
  }

  public initPhysics() {
    this.speed = -20;
    this.currentScene.physics.world.enable(this);
    this.setCollideWorldBounds(true);
  }

  public update(): void {
    this.anims.play("mage_left", true);
    //this.setVelocityX(this.speed);
    if (this.body.blocked.right || this.body.blocked.left) {
      this.speed = -this.speed;
      this.setVelocityX(this.speed);
      this.flipX = !this.flipX;
    }
  }
}
