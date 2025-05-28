class Load extends Phaser.Scene {
    constructor() {
        super("loadScene");
    }

    preload() {
        this.load.setPath("./assets/");

        // Load characters spritesheet
        this.load.atlas("platformer_characters", "tilemap-characters-packed.png", "tilemap-characters-packed.json");

        // Oooh, fancy. A multi atlas is a texture atlas which has the textures spread
        // across multiple png files, so as to keep their size small for use with
        // lower resource devices (like mobile phones).
        // kenny-particles.json internally has a list of the png files
        // The multiatlas was created using TexturePacker and the Kenny
        // Particle Pack asset pack.
        this.load.multiatlas("kenny-particles", "kenny-particles.json");

        //loading map
        this.load.setPath("./assets/DASHOHOLIC-assets/");
        this.load.image("monochrome_tilemap_packed", "./kenney_1-bit-platformer-pack/Tilemap/monochrome_tilemap_packed.png");    // tile sheet   
        this.load.image("monochrome_tilemap_transparent_packed", "./kenney_1-bit-platformer-pack/Tilemap/monochrome_tilemap_transparent_packed.png");    // tile sheet   
        this.load.tilemapTiledJSON("map", "DASHOHOLIC.json");                   // Load tmx of tilemap
        this.load.setPath("./assets/");

        //loading music
        this.load.audio("OST", "DASHOHOLIC-OST.mp3");

        //loading sfx
        this.load.audio("SFX-CoinCollect", "DASHOHOLIC-FX-CoinCollect.mp3");
        this.load.audio("SFX-Dash", "DASHOHOLIC-FX-DashFX.mp3");
        this.load.audio("SFX-Fail", "DASHOHOLIC-FX-Fail.mp3");
        this.load.audio("SFX-lvlFinish", "DASHOHOLIC-FX-LvlFinish.mp3");



    }

    create() {
        this.anims.create({
            key: 'coinSpin',
            frames: this.anims.generateFrameNames('kenny-particles', {
                prefix: 'muzzle_0',
                start: 1,
                end: 5,
                suffix: '.png',
                zeroPad: 0
            }),
            frameRate: 6,
            repeat: -1
        });

        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNames('platformer_characters', {
                prefix: "tile_",
                start: 0,
                end: 1,
                suffix: ".png",
                zeroPad: 4
            }),
            frameRate: 15,
            repeat: -1
        });

        this.anims.create({
            key: 'idle',
            defaultTextureKey: "platformer_characters",
            frames: [
                { frame: "tile_0000.png" }
            ],
            repeat: -1
        });

        this.anims.create({
            key: 'jump',
            defaultTextureKey: "platformer_characters",
            frames: [
                { frame: "tile_0001.png" }
            ],
        });


        let highScore = localStorage.getItem("highScore");
        if (highScore === null) {
            highScore = 0;
            localStorage.setItem("highScore", highScore);
        }

         // ...and pass to the next Scene
         this.scene.start("platformerScene");
    }

    // Never get here since a new scene is started in create()
    update() {
    }
}