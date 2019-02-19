import CursorKeys = Phaser.Input.Keyboard.CursorKeys;
import Group = Phaser.Physics.Arcade.Group;
import Sprite = Phaser.Physics.Arcade.Sprite;

class TestScene extends Phaser.Scene {
  public player: Phaser.Physics.Arcade.Sprite;
  public platforms: Phaser.Physics.Arcade.StaticGroup;
  public cursors: CursorKeys;
  public stars: Group;
  public bombs: Group;
  public score: integer;
  public scoreText: Phaser.GameObjects.Text;
  private gameOver: boolean;
  private playerIsDying: boolean;

  constructor() {
    super({
      key: "TestScene",
    });
  }

  public preload() {
    this.load.image("sky", "assets/sky.png");
    this.load.image("ground", "assets/platform.png");
    this.load.image("star", "assets/star.png");
    this.load.image("bomb", "assets/bomb.png");
    this.load.spritesheet("dude", "assets/dude.png", {
      frameHeight: 48,
      frameWidth: 32,
    });
  }

  public create() {
    this.add.image(0, 0, "sky").setOrigin(0, 0);
    this.createPlatforms();
    this.createPlayer();
    this.createStars();
    this.bombs = this.physics.add.group();

    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.stars, this.platforms);
    this.physics.add.collider(this.bombs, this.platforms);
    this.physics.add.collider(
      this.player,
      this.bombs,
      this.onHitBomb,
      null,
      this,
    );
    this.physics.add.overlap(
      this.player,
      this.stars,
      this.onCollectStar,
      null,
      this,
    );

    this.cursors = this.input.keyboard.createCursorKeys();
    this.score = 0;
    this.scoreText = this.add.text(16, 16, "score: 0", {
      fontSize: "32px",
      fill: "#000",
    });

    this.dropBomb();
  }

  public update(time: number, delta: number) {
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);
      this.player.anims.play("left", true);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);
      this.player.anims.play("right", true);
    } else {
      this.player.setVelocityX(0);
      this.player.anims.play("turn");
    }

    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-330);
    }

    if (this.playerIsDying) {
    }
  }

  private createPlatforms() {
    this.platforms = this.physics.add.staticGroup();
    this.platforms
      .create(400, 568, "ground")
      .setScale(2)
      .refreshBody();

    this.platforms.create(600, 400, "ground");
    this.platforms.create(50, 250, "ground");
    this.platforms.create(750, 220, "ground");
  }

  private createPlayer() {
    this.player = this.physics.add.sprite(100, 450, "dude");

    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);

    this.anims.create({
      key: "left",
      frames: this.anims.generateFrameNumbers("dude", { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "turn",
      frames: [{ key: "dude", frame: 4 }],
      frameRate: 20,
    });

    this.anims.create({
      key: "right",
      frames: this.anims.generateFrameNumbers("dude", { start: 5, end: 8 }),
      frameRate: 10,
      repeat: -1,
    });
  }

  private createStars() {
    this.stars = this.physics.add.group({
      key: "star",
      repeat: 11,
      setXY: { x: 12, y: 0, stepX: 70 },
    });

    this.stars.children.iterate((child: Sprite) => {
      child.setBounce(Phaser.Math.FloatBetween(0.1, 0.8));
    });
  }

  private onCollectStar(player: Sprite, star: Sprite) {
    star.disableBody(true, true);

    this.score += 10;
    this.scoreText.setText("Score: " + this.score);
  }

  private async onHitBomb() {
    this.gameOver = true;
    this.physics.pause();
    this.player.setTint(0xff0000);

    const player = this.player;
    const time = this.time;
    const tweens = this.tweens;
    const canvasHeight = this.sys.game.canvas.height

    const turnAnim = () =>
      new Promise((resolve) => {
        player.anims
          .play("turn")
          .once(Phaser.Animations.Events.SPRITE_ANIMATION_COMPLETE, resolve);
      });

    const delayMs = (ms) =>
      new Promise((resolve) => {
        time.addEvent({
          delay: ms,
          callback: resolve,
        });
      });

    const playerUpTween = (ms) =>
        new Promise((resolve) => {
          tweens.add({
            targets: player,
            y: player.y - player.height,
            duration: ms,
            ease: "Quintic",
            onComplete: resolve,
          });
        });

    const playerFallTween = (ms) =>
      new Promise((resolve) => {
        tweens.add({
          targets: player,
          y: canvasHeight + player.height,
          duration: ms,
          ease: "Power1",
          onComplete: resolve,
        });
      });

    await turnAnim();
    await delayMs(100);
    await playerUpTween(200);
    await delayMs(100);
    await playerFallTween(400);
  }

  private dropBomb() {
    if (!this.player || this.gameOver) {
      return;
    }

    const x =
      this.player.x < 400
        ? Phaser.Math.Between(400, 800)
        : Phaser.Math.Between(0, 400);

    const bomb = this.bombs.create(x, 16, "bomb");
    bomb.setBounce(1);
    bomb.setCollideWorldBounds(true);
    bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);

    this.time.addEvent({
      delay: Phaser.Math.Between(500, 5000),
      callback: this.dropBomb,
      callbackScope: this,
    });
  }
}

export default TestScene;
