class TestScene extends Phaser.Scene {
    // player: Phaser.GameObjects.Sprite
    // cursors: any

    constructor() {
        super({
            key: 'TestScene',
        })
    }

    preload() {
        this.load.image('sky', 'assets/sky.png');
        this.load.image('ground', 'assets/platform.png');
        this.load.image('star', 'assets/star.png');
        this.load.image('bomb', 'assets/bomb.png');
        this.load.spritesheet('dude',
            'assets/dude.png',
            {frameWidth: 32, frameHeight: 48},
        );
        //
        // this.load.tilemapTiledJSON('map', '/assets/tilemaps/desert.json');
        // this.load.image('Desert', '/assets/tilemaps/tmw_desert_spacing.png');
        // this.load.image('player', '/assets/sprites/mushroom.png');
    }

    create() {
        this.add.image(400, 300, 'sky');
        this.add.image(400, 300, 'star');


        // var map: Phaser.Tilemaps.Tilemap = this.make.tilemap({key: 'map'})
        // var tileset: Phaser.Tilemaps.Tileset = map.addTilesetImage('Desert')
        // var layer: Phaser.Tilemaps.StaticTilemapLayer = map.createStaticLayer(0, tileset, 0, 0)
        //
        // this.player = this.add.sprite(100, 100, 'player')
        // this.cursors = this.input.keyboard.createCursorKeys()
        //
        // this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels)
        // this.cameras.main.startFollow(this.player, false)
    }

    update(time: number, delta: number) {
        // this.player.angle += 1
        // if (this.cursors.left.isDown) {
        //     this.player.x -= 5
        // }
        // if (this.cursors.right.isDown) {
        //     this.player.x += 5
        // }
        // if (this.cursors.down.isDown) {
        //     this.player.y += 5
        // }
        // if (this.cursors.up.isDown) {
        //     this.player.y -= 5
        // }
    }
}

export default TestScene