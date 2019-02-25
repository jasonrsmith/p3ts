import Sprite = Phaser.Physics.Arcade.Sprite;
import { Mage } from "../enemies/Mage";
import { Player } from "../Player";
import * as PF from "pathfinding";

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
    this.updateMagePaths();
  }

  private overlapResolveForSpawns() {
    const worldBounds = this.physics.world.bounds;
    this.physics.collide(
      this.spawns,
      this.obstacles,
      null,
      (mage: Mage, tile: any) => {
        // TODO find a better way
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

    for (let i = 0; i < 10; i++) {
      const mage = new Mage(this, 48, 48);
      this.spawns.add(mage);
      mage.initPhysics();
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

  private updateMagePaths() {
    let matrix = [];
    for (let y = 0; y < this.obstacles.tilemap.height; y++) {
      let col = [];
      for (let x = 0; x < this.obstacles.tilemap.width; x++) {
        col.push(this.obstacles.getTileAt(x, y) ? 1 : 0);
      }
      matrix.push(col);
    }

    const grid = new PF.Grid(matrix);
    const finder = new PF.AStarFinder();
    const tileSize = 16;

    this.spawns.getChildren().forEach((mage: Mage) => {
      const mageTileX = Math.floor(mage.x / tileSize);
      const mageTileY = Math.floor(mage.y / tileSize);
      const path = finder.findPath(
        mageTileX,
        mageTileY,
        Math.floor(this.player.x / tileSize),
        Math.floor(this.player.y / tileSize),
        grid
      );

      // console.log(
      //   Math.floor(mage.x / tileSize),
      //   Math.floor(mage.y / tileSize),
      //   Math.floor(this.player.x / tileSize),
      //   Math.floor(this.player.y / tileSize)
      // );
      // console.log(nextStep);

      const nextStep = path[1];
      if (!nextStep) {
        return;
      }
      if (mageTileX < nextStep[0]) {
        mage.setVelocityX(30);
      }
      if (mageTileX > nextStep[0]) {
        mage.setVelocityX(-30);
      }
      if (mageTileY < nextStep[1]) {
        mage.setVelocityY(30);
      }
      if (mageTileY > nextStep[1]) {
        mage.setVelocityY(-30);
      }
    });
  }
}
