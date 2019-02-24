export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: "BootScene" });
  }

  public preload() {
    this.load.pack("preload", "assets/pack.json", "preload");
  }

  public update() {
    this.scene.start("WorldScene");
  }
}
