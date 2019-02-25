import Sprite = Phaser.Physics.Arcade.Sprite;
import { Mage } from "../enemies/Mage";
import { Player } from "../Player";
import Tile = Phaser.Tilemaps.Tile;

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
    this.player = new Player(this, 1, 1);
    this.physics.world.bounds.width = map.widthInPixels;
    this.physics.world.bounds.height = map.heightInPixels;

    this.physics.add.collider(this.player, this.obstacles);

    this.cursors = this.input.keyboard.createCursorKeys();

    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.startFollow(this.player);
    this.cameras.main.roundPixels = true;

    this.createSpawns();
  }

  public update(time: number, delta: number) {
    this.player.update();
    this.overlapResolveForSpawns();
  }

  private overlapResolveForSpawns() {
    const worldBounds = this.physics.world.bounds;
    this.physics.collide(
      this.spawns,
      this.obstacles,
      null,
      (mage: Mage, tile: any) => {
        if (tile.index != -1) {
          if (mage.body.x == 0) {
            return;
          }
          const x = Phaser.Math.RND.between(0, worldBounds.width);
          const y = Phaser.Math.RND.between(0, worldBounds.height);
          mage.setX(x);
          mage.setY(y);
          return true;
        }
      }
    );
  }

  private createSpawns() {
    Mage.createAnims(this);
    this.spawns = this.physics.add.group({
      runChildUpdate: true
    });

    for (let i = 0; i < 50; i++) {
      const mage = new Mage(this, 48, 48);
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
}
