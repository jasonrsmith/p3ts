import Sprite = Phaser.Physics.Arcade.Sprite;
import { Mage } from "../enemies/Mage";
import { Player } from "../Player";
import * as PF from "pathfinding";
import GameObject = Phaser.GameObjects.GameObject;

export class WorldScene extends Phaser.Scene {
  private player: Player;
  private cursors: Phaser.Input.Keyboard.CursorKeys;
  private spawns: Phaser.Physics.Arcade.Group;
  private obstacles: Phaser.Tilemaps.StaticTilemapLayer;
  private debugGraphics: Phaser.GameObjects.Graphics;

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
    this.debugGraphics = this.add.graphics();
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

    for (let i = 0; i < 1; i++) {
      const mage = new Mage(this, 48, 48);
      this.spawns.add(mage);
      mage.initPhysics();
      mage.setName("mage_" + i);
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
    // this.cameras.main.shake(50);
  }

  private updateMagePaths() {
    const mageRunSpeed = 10;
    let matrix = [];
    for (let y = 0; y < this.obstacles.tilemap.height; y++) {
      let col = [];
      for (let x = 0; x < this.obstacles.tilemap.width; x++) {
        col.push(this.obstacles.getTileAt(x, y) ? 1 : 0);
      }
      matrix.push(col);
    }

    const tileSize = 16;

    const mages = <Mage[]>this.spawns.getChildren();
    for (let i = 0; i < mages.length; i++) {
      const mage = mages[i];
      const grid = new PF.Grid(matrix);
      const finder = new PF.AStarFinder({
        allowDiagonal: true
      });

      // const mageTileX = Math.round(mage.x / tileSize);
      // const mageTileY = Math.round(mage.y / tileSize);
      // const playerTileX = Math.round(this.player.x / tileSize);
      // const playerTileY = Math.round(this.player.y / tileSize);
      const mageTileX = Math.floor((mage.x + tileSize / 2) / tileSize);
      const mageTileY = Math.floor((mage.y + tileSize / 2) / tileSize);
      const playerTileX = Math.floor((this.player.x + tileSize / 2) / tileSize);
      const playerTileY = Math.floor((this.player.y + tileSize / 2) / tileSize);

      let path;
      try {
        path = finder.findPath(
          mageTileX,
          mageTileY,
          playerTileX,
          playerTileY,
          grid
        );
      } catch (e) {
        console.log(e);
        debugger;
        continue;
      }

      this.debugGraphics.clear();
      const x0 = mageTileX * tileSize + tileSize / 2;
      const y0 = mageTileY * tileSize + tileSize / 2;
      const x1 = playerTileX * tileSize + tileSize / 2;
      const y1 = playerTileY * tileSize + tileSize / 2;
      const line = new Phaser.Geom.Line(x0, y0, x1, y1);
      this.debugGraphics.lineStyle(1, 0xff00ff, 0.8);
      this.debugGraphics.strokeLineShape(line);
      for (let i = 0; i < path.length - 1; i++) {
        const x0 = path[i][0] * tileSize;
        const y0 = path[i][1] * tileSize;
        const x1 = path[i + 1][0] * tileSize;
        const y1 = path[i + 1][1] * tileSize;
        const line = new Phaser.Geom.Line(x0, y0, x1, y1);
        this.debugGraphics.lineStyle(1, 0xff0000, 1.0);
        //this.debugGraphics.strokeLineShape(line);
      }

      const nextStep = path[1];
      //console.log(mageTileX, mageTileY, playerTileX, playerTileY);
      if (!nextStep) {
        mage.setVelocity(0);
        continue;
      }
      if (mageTileX < nextStep[0] && mage.body.blocked.right == false) {
        mage.flipX = false;
        mage.setVelocityX(mageRunSpeed);
      }
      if (mageTileX > nextStep[0] && mage.body.blocked.left == false) {
        mage.flipX = true;
        mage.setVelocityX(-mageRunSpeed);
      }
      if (mageTileY < nextStep[1] && mage.body.blocked.down == false) {
        mage.setVelocityY(mageRunSpeed);
      }
      if (mageTileY > nextStep[1] && mage.body.blocked.up == false) {
        mage.setVelocityY(-mageRunSpeed);
      }
    }
  }
}
