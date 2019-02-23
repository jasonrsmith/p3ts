class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: "BootScene" });
  }

  public preload() {
    this.load.image("tiles", "assets/map/spritesheet.png");
    this.load.tilemapTiledJSON("map", "assets/map/map.json");
    this.load.spritesheet("player", "assets/RPG_assets.png", {
      frameWidth: 16,
      frameHeight: 16,
    });
  }

  public create() {
    this.scene.start("WorldScene");
  }
}

export default BootScene;
