import Sprite = Phaser.Physics.Arcade.Sprite;
import { Mage } from "../enemies/Mage";
import { Player } from "../Player";

export class WorldScene extends Phaser.Scene {
  private player: Player;
  private cursors: Phaser.Input.Keyboard.CursorKeys;
  private spawns: Phaser.Physics.Arcade.Group;
  private obstacles: Phaser.Tilemaps.StaticTilemapLayer;

  constructor() {
    super({ key: "WorldScene" });
  }

  public create() {
    const map = this.make.tilemap({ key: "map" });
    const tiles = map.addTilesetImage("spritesheet", "tiles");
    const grass = map.createStaticLayer("Grass", tiles, 0, 0);
    this.obstacles = map.createStaticLayer("Obstacles", tiles, 0, 0);
    this.obstacles.setCollisionByExclusion([-1]);
    this.createPlayer();
    this.physics.world.bounds.width = map.widthInPixels;
    this.physics.world.bounds.height = map.heightInPixels;

    this.physics.add.collider(this.player, this.obstacles);

    this.cursors = this.input.keyboard.createCursorKeys();

    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.startFollow(this.player);
    this.cameras.main.roundPixels = true;

    this.createSpawns();
    this.physics.add.collider(this.spawns, this.obstacles);
  }

  public update(time: number, delta: number) {
    this.player.setVelocity(0);

    const speedFactor = 1.5;
    this.updatePlayer(speedFactor);
    this.updateSpawns(speedFactor);
  }

  private updatePlayer(speedFactor: number) {
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-80 * speedFactor);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(80 * speedFactor);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-80 * speedFactor);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(80 * speedFactor);
    }

    if (this.cursors.left.isDown) {
      this.player.anims.play("left", true);
      this.player.flipX = true;
    } else if (this.cursors.right.isDown) {
      this.player.anims.play("right", true);
      this.player.flipX = false;
    } else if (this.cursors.up.isDown) {
      this.player.anims.play("up", true);
    } else if (this.cursors.down.isDown) {
      this.player.anims.play("down", true);
    } else {
      this.player.anims.stop();
    }
  }

  private createPlayer() {
    this.player = new Player(this, 50, 100);
    console.log(this.player);
    this.player.setCollideWorldBounds(true);
  }

  private createSpawns() {
    Mage.createAnims(this);
    this.spawns = this.physics.add.group({
      runChildUpdate: true
    });

    for (let i = 0; i < 50; i++) {
      const mage = new Mage(this, 0, 0);
      this.spawns.add(mage);
    }
    Phaser.Actions.RandomRectangle(
      this.spawns.getChildren(),
      this.physics.world.bounds
    );
    this.physics.add.collider(this.spawns, this.obstacles);

    this.physics.add.overlap(
      this.player,
      this.spawns,
      this.onMeetEnemy,
      null,
      this
    );
  }

  private onMeetEnemy(player, zone) {
    this.cameras.main.shake(50);
  }

  private updateSpawns(speedFactor: number) {
    this.spawns.getChildren().forEach((spawn: Sprite, index, array) => {});
  }
}
