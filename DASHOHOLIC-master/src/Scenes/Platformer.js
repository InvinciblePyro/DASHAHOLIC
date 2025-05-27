class Platformer extends Phaser.Scene {
    constructor() {
        super("platformerScene");
    }

    init() {
        // variables and settings
        this.lastDirection = null; // "left", "right", or null        
        this.ACCELERATION =400;
        this.DRAG = 2000;    // DRAG < ACCELERATION = icy slide
        this.physics.world.gravity.y = 1500;
        this.JUMP_VELOCITY = -600;
        this.PARTICLE_VELOCITY = 50;

        // dash settings
        this.DASH_VELOCITY = 800;
        this.canDash = true;
        this.dashCooldown = 500; // in milliseconds

        // window scaling
        let desiredScale = 2;
        if(window.innerHeight<=400){desiredScale=1}
        else if (window.innerHeight<=600){desiredScale=1.5}
        this.SCALE = desiredScale;
    }

    create() {
        // Create a new tilemap game object which uses 18x18 pixel tiles, and is
        // 45 tiles wide and 25 tiles tall.
        this.map = this.add.tilemap("map");

        this.tileset1 = this.map.addTilesetImage("monochrome_tilemap_transparent_packed", "monochrome_tilemap_transparent_packed");
        this.tileset2 = this.map.addTilesetImage("monochrome_tilemap_packed", "monochrome_tilemap_packed");

        this.visualLayer = this.map.createLayer("Ground-n-PlatformsVisual", [this.tileset1, this.tileset2], 0, 0);
        this.groundLayer = this.map.createLayer("Ground-n-Platforms", [this.tileset1, this.tileset2], 0, 0);
    
        // Make it collidable
        this.groundLayer.setCollisionByProperty({
            collides: true
        });
        this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

        // Find coins in the "Objects" layer in Phaser
        // Look for them by finding objects with the name "coin"
        // Assign the coin texture from the tilemap_sheet sprite sheet
        // Phaser docs:
        // https://newdocs.phaser.io/docs/3.80.0/focus/Phaser.Tilemaps.Tilemap-createFromObjects
        this.coins = this.map.createFromObjects("Objects", {
            name: "coin",
            key: "tilemap_sheet",
            frame: 151
        });
        

        // Since createFromObjects returns an array of regular Sprites, we need to convert 
        // them into Arcade Physics sprites (STATIC_BODY, so they don't move) 
        this.physics.world.enable(this.coins, Phaser.Physics.Arcade.STATIC_BODY);

        // Create a Phaser group out of the array this.coins
        // This will be used for collision detection below.
        this.coinGroup = this.add.group(this.coins);
        

        // set up player avatar
        my.sprite.player = this.physics.add.sprite(30, 0, "platformer_characters", "tile_0000.png");
        my.sprite.player.setCollideWorldBounds(true);

        // Enable collision handling
        this.physics.add.collider(my.sprite.player, this.groundLayer);

        // Handle collision detection with coins
        this.physics.add.overlap(my.sprite.player, this.coinGroup, (obj1, obj2) => {
            obj2.destroy(); // remove coin on overlap 
        });
        

        // set up Phaser-provided cursor key input
        cursors = this.input.keyboard.createCursorKeys();
        this.rKey = this.input.keyboard.addKey('R');
        this.shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);


        // debug key listener (assigned to D key)
        this.input.keyboard.on('keydown-D', () => {
            this.physics.world.drawDebug = this.physics.world.drawDebug ? false : true
            this.physics.world.debugGraphic.clear()
        }, this);

        // movement vfx
        my.vfx.walking = this.add.particles(0, 0, "kenny-particles", {
            frame: ['smoke_03.png', 'smoke_09.png'],
            // TODO: Try: add random: true
            scale: { start: 0.03, end: 0.1 },
            // TODO: Try: maxAliveParticles: 8,
            lifespan: 350,
            // TODO: Try: gravityY: -400,
            alpha: { start: 1, end: 0.1 },
        });
        my.vfx.walking.stop();
        
        // dashing vfx
        my.vfx.dashing = this.add.particles(0, 0, "kenny-particles", {
            frame: ['magic_03.png', 'magic_05.png'],
            // TODO: Try: add random: true
            scale: { start: 0.03, end: 0.1 },
            // TODO: Try: maxAliveParticles: 8,
            lifespan: 200,
            // TODO: Try: gravityY: -400,
            alpha: { start: 1, end: 0.1 },
        });
        my.vfx.dashing.startFollow(my.sprite.player, 0, 0);
        my.vfx.dashing.stop();

        
        // camera code
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(my.sprite.player, true, 0.25, 0.25); // (target, [,roundPixels][,lerpX][,lerpY])
        this.cameras.main.setDeadzone(50, 50);
        this.cameras.main.setZoom(this.SCALE);
        

    }

    update() {
        const player = my.sprite.player;

        if(cursors.left.isDown) {
            if (this.lastDirection !== "left") {
                my.sprite.player.setVelocityX(0); // cancel rightward velocity
                my.sprite.player.setDragX(this.DRAG);
            }
            my.sprite.player.setAccelerationX(-this.ACCELERATION);
            this.lastDirection = "left";

            my.sprite.player.setAccelerationX(-this.ACCELERATION);
            my.sprite.player.resetFlip();
            my.sprite.player.anims.play('walk', true);
            // TODO: add particle following code here
            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth / 2 - 10, my.sprite.player.displayHeight / 2 - 5, false);

            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);

            // Only play smoke effect if touching the ground
            if (my.sprite.player.body.blocked.down) {    
                my.vfx.walking.start();
            }

        } else if(cursors.right.isDown) {
            if (this.lastDirection !== "right") {
                my.sprite.player.setVelocityX(0); // cancel leftward velocity
                my.sprite.player.setDragX(this.DRAG);
            }
            my.sprite.player.setAccelerationX(this.ACCELERATION);
            this.lastDirection = "right";

            my.sprite.player.setAccelerationX(this.ACCELERATION);
            my.sprite.player.setFlip(true, false);
            my.sprite.player.anims.play('walk', true);
            // TODO: add particle following code here
            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth / 2 - 10, my.sprite.player.displayHeight / 2 - 5, false);

            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);

            // Only play smoke effect if touching the ground
            if (my.sprite.player.body.blocked.down) {
                my.vfx.walking.start();
            }

        } else {
            // Set acceleration to 0 and have DRAG take over
            my.sprite.player.setAccelerationX(0);
            my.sprite.player.setDragX(this.DRAG);
            this.lastDirection = null;
            my.sprite.player.anims.play('idle');
            // TODO: have the vfx stop playing
            my.vfx.walking.stop();
        }

        // player jump
        // note that we need body.blocked rather than body.touching b/c the former applies to tilemap tiles and the latter to the "ground"
        if(!my.sprite.player.body.blocked.down) {
            my.sprite.player.anims.play('jump');
        }
        if(my.sprite.player.body.blocked.down && Phaser.Input.Keyboard.JustDown(cursors.up)) {
            my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);
        }
        
        // player dash
        if (Phaser.Input.Keyboard.JustDown(this.shiftKey) && this.canDash) {
            my.vfx.dashing.setParticleSpeed(this.PARTICLE_VELOCITY, 0);
            my.vfx.dashing.start();
            // Only allow dash if moving 
            if (cursors.left.isDown) {
                my.sprite.player.setVelocityX(-this.DASH_VELOCITY);
            } else if (cursors.right.isDown) {
                my.sprite.player.setVelocityX(this.DASH_VELOCITY);
            } 
            
            if (cursors.up.isDown) {
                my.sprite.player.body.setVelocityY(-this.DASH_VELOCITY);
            }

            this.canDash = false;

            // Re-enable dash after cooldown
            this.time.delayedCall(this.dashCooldown, () => {
                this.canDash = true;
                my.vfx.dashing.stop();
            });
        }
    
        // scene restart
        if(Phaser.Input.Keyboard.JustDown(this.rKey)) {
            this.scene.restart();
        }
    }
}