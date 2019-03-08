import Sprite = Phaser.Physics.Arcade.Sprite;
import { Mage } from "../enemies/Mage";
import { Player } from "../Player";
import * as PF from "pathfinding";
import GameObject = Phaser.GameObjects.GameObject;

export class WorldScene extends Phaser.Scene {
  private player: Player;
  private cursors: Phaser.Input.Keyboard.CursorKeys;
  private spawns: Phaser.Physics.Arcade.Group;
  private grass: Phaser.Tilemaps.StaticTilemapLayer;
  private obstacles: Phaser.Tilemaps.StaticTilemapLayer;
  private debugGraphics: Phaser.GameObjects.Graphics;
  private readonly tileSize: number;

  constructor() {
    super({ key: "WorldScene" });
    this.tileSize = 16;
  }

  public create() {
    const map = this.make.tilemap({ key: "map" });
    const tiles = map.addTilesetImage("spritesheet", "tiles");
    this.grass = map.createStaticLayer("Grass", tiles, 0, 0);
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

    for (let y = 0; y < this.grass.tilemap.height; y++) {
      for (let x = 0; x < this.grass.tilemap.width; x++) {
        const text = `${x}\n${y}`;
        this.add.text(x * this.tileSize, y * this.tileSize, text, {
          fontSize: "5px",
          fontFamily: '"PressStart2P"',
          fill: "#000"
        });
      }
    }
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
    // matrix.push([].fill(0, 0, this.obstacles.tilemap.width));
    for (let y = 0; y < this.obstacles.tilemap.height; y++) {
      let col = [];
      // col.push(0);
      for (let x = 0; x < this.obstacles.tilemap.width; x++) {
        col.push(this.obstacles.getTileAt(x, y) ? 1 : 0);
      }
      matrix.push(col);
    }

    const mages = <Mage[]>this.spawns.getChildren();
    this.debugGraphics.clear();
    for (let i = 0; i < mages.length; i++) {
      const mage = mages[i];
      const grid = new PF.Grid(matrix);
      const finder = new PF.AStarFinder({
        allowDiagonal: false
      });

      const mageTileX = Math.floor(mage.x / this.tileSize);
      const mageTileY = Math.floor(mage.y / this.tileSize);
      const playerTileX = Math.floor(this.player.x / this.tileSize);
      const playerTileY = Math.floor(this.player.y / this.tileSize);
      // const mageTileX = Math.round((mage.x + this.tileSize / 2) / this.tileSize);
      // const mageTileY = Math.round((mage.y + this.tileSize / 2) / this.tileSize);
      // const playerTileX = Math.round((this.player.x + this.tileSize / 2) / this.tileSize);
      // const playerTileY = Math.round((this.player.y + this.tileSize / 2) / this.tileSize);
      console.log(mageTileX, mageTileY, playerTileX, playerTileY);

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

      this.drawDebugGrid();
      const x0 = mageTileX * this.tileSize;
      const y0 = mageTileY * this.tileSize;
      const x1 = playerTileX * this.tileSize;
      const y1 = playerTileY * this.tileSize;
      const line = new Phaser.Geom.Line(x0, y0, x1, y1);
      const squareMage = new Phaser.Geom.Rectangle(x0, y0, this.tileSize/4,this.tileSize/4);
      const squarePlayer = new Phaser.Geom.Rectangle(x1, y1, this.tileSize/4,this.tileSize/4);
      this.debugGraphics.lineStyle(1, 0xff00ff, 0.8);
      this.debugGraphics.strokeLineShape(line);
      this.debugGraphics.strokeRectShape(squareMage);
      this.debugGraphics.lineStyle(1, 0x00ffff, 0.8);
      this.debugGraphics.strokeRectShape(squarePlayer);
      for (let i = 0; i < path.length - 1; i++) {
        const x0 = path[i][0] * this.tileSize + this.tileSize / 2;
        const y0 = path[i][1] * this.tileSize + this.tileSize / 2;
        const x1 = path[i + 1][0] * this.tileSize + this.tileSize / 2;
        const y1 = path[i + 1][1] * this.tileSize + this.tileSize / 2;
        const line = new Phaser.Geom.Line(x0, y0, x1, y1);
        this.debugGraphics.lineStyle(1, 0xff0000, 1.0);
        this.debugGraphics.strokeLineShape(line);
      }

      const nextStep = path[1];
      //console.log(mageTileX, mageTileY, playerTileX, playerTileY);
      mage.setVelocity(0);
      if (!nextStep) {
        continue;
      }
      if (!(mage.body.blocked.up || mage.body.blocked.down) && mageTileX * this.tileSize != mage.x) {
        if (mageTileX * this.tileSize > mage.x) {
          mage.runRight()
        }
        if (mageTileX * this.tileSize < mage.x) {
          mage.runLeft()
        }
      }
      if (!(mage.body.blocked.left || mage.body.blocked.right) && mageTileY * this.tileSize != mage.y) {
        if (mageTileY * this.tileSize > mage.y) {
          mage.runDown()
        }
        if (mageTileY * this.tileSize < mage.y) {
          mage.runUp()
        }
      }
      if (mageTileX < nextStep[0] && mage.body.blocked.right == false) {
          mage.runRight();
      }
      if (mageTileX > nextStep[0] && mage.body.blocked.left == false) {
        mage.runLeft();
      }
      if (mageTileY < nextStep[1] && mage.body.blocked.down == false) {
        mage.runDown();
      }
      if (mageTileY > nextStep[1] && mage.body.blocked.up == false) {
        mage.runUp();
      }
    }
  }

  private drawDebugGrid() {
    this.debugGraphics.lineStyle(1, 0xffffff, 0.5);
    for (let y = 1; y < this.grass.tilemap.height; y++) {
      const line = new Phaser.Geom.Line(
        0,
        y * this.tileSize,
        this.physics.world.bounds.width,
        y * this.tileSize
      );
      this.debugGraphics.strokeLineShape(line);
      for (let x = 1; x < this.grass.tilemap.width; x++) {
        const line = new Phaser.Geom.Line(
          x * this.tileSize,
          0,
          x * this.tileSize,
          this.physics.world.bounds.width
        );
        this.debugGraphics.strokeLineShape(line);
      }
    }
  }
}
