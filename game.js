var gameWidth = window.innerWidth;
var gameHeight = window.innerHeight;

var config = {
    type: Phaser.AUTO,
    width: gameWidth,
    height: gameHeight,
    backgroundColor:0x00eded,
    scale: {
        mode: Phaser.Scale.FIT,
        parent: 'phaser-example',
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 920,
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 550 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};
const pipeWidth = 52;
var game = new Phaser.Game(config);
var isPaused = false,
    gameOver = false;
var score = 0;
var birdyX = (gameWidth/2)-235;
var birdyY = (gameHeight/2)-50;
function preload ()
{
    this.load.image('sky', 'assets/img/sky.png');
    this.load.image('pipeb', 'assets/img/pipeb.png');
    this.load.image('pipet', 'assets/img/pipet.png');
    this.load.spritesheet('birdy', 
        'assets/img/birdy.png',
        { frameWidth: 34, frameHeight: 24 }
    );

    this.load.audio('flap', './assets/sounds/sfx_wing.ogg');
    this.load.audio('hit', './assets/sounds/sfx_hit.ogg');
    this.load.audio('die', './assets/sounds/sfx_die.ogg');
    this.load.audio('score', './assets/sounds/sfx_point.ogg');
}
var platforms,spacebar,player,scoreText;
var gap = 150;
var xGap = 250;
var music;
function create ()
{
    //Add score text
    scoreText = this.add.text(birdyX, (gameHeight/4),score,{ fontFamily: '"04b19"', fontSize: 60, color: '#fff' });
    
    platforms = this.physics.add.staticGroup();
    var pipePos = gameWidth+2*xGap
    let pos = getRandom();
    // bottom placable at 260+gap to height
    platforms.create(pipePos, pos[0], 'pipeb').setScale(1).refreshBody();
    platforms.create(pipePos, pos[1], 'pipet').setScale(1).refreshBody();

    player = this.physics.add.sprite(birdyX, birdyY, 'birdy');

    player.setBounce(0.2);
    player.setCollideWorldBounds(true);

    this.anims.create({
        key: 'flap',
        frames: this.anims.generateFrameNumbers('birdy', { start: 0, end: 3 }),
        frameRate: 20,
        repeat: 0
    });

    player.body.setGravityY(300)

    this.physics.add.collider(player, platforms, playerHit, null, game)

    spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    // spacebar.onDown.add(flapNow, this);
    this.input.keyboard.on('keydown-' + 'SPACE', flapNow);
    this.input.on('pointerdown', flapNow); //touch support
}

function getRandom() {
    let safePadding = 25;
    let min = Math.ceil(safePadding+gap/2);
    let max = Math.floor(game.canvas.height-safePadding-gap/2);
    let ran =  Math.floor(Math.random() * (max - min + 1)) + min;
    let rantop = ran-((gap/2)+260);
    let ranbot = ran+((gap/2)+260);
    console.log(ranbot,rantop)
    return [ranbot, rantop]
}

var countpipe = 0;
function update ()
{
    let children = platforms.getChildren();
    children.forEach((child) => {
        if (child instanceof Phaser.GameObjects.Sprite) {
            child.refreshBody();
            child.x += -3;
            //when one set of pipe is just shown
            if(child.x <= gameWidth && !child.drawn) {
                countpipe+=1;
                child.drawn=true;

                if(countpipe>=2) {
                    let pos = getRandom();
                    console.log("created one")
                    platforms.create(gameWidth+xGap, pos[0], 'pipeb').setScale(1).refreshBody();

                    platforms.create(gameWidth+xGap, pos[1], 'pipet').setScale(1).refreshBody();
                    countpipe=0;
                }
            }
            if(child.x <= -50) {
                console.log("Destroyed one "+countpipe)
                child.destroy();
            }

            //check if pipe passed bird (birdyX)
            if(child.x< birdyX && !gameOver && child.texture.key=="pipeb" && !child.scored){ //only check one pipe
                child.scored = true
                score+=1;
                scoreText.setText(score)
                game.sound.play("score");
                console.log("score:",score);
            }
        }
    });
    //set lower Bounds
    if(player.y > Number(game.canvas.height)+200) {
        console.log("y= ",player.y)
        endGame();
    }
    //set upper Bounds
    if(player.y < -200) {
        console.log("y= ",player.y)
        endGame();
    }
}

function flapNow(){
    if(gameOver) return;

    if(isPaused) resume();
    // console.log("flap")
    player.setVelocityY(-330);
    game.sound.play("flap");
}
var hitflag = false;
function playerHit() {
    if(hitflag) return
    console.log("Player hit!!!!!!!!!")
    var hitSound = game.sound.play("hit");
    hitflag=true;
    setTimeout(playerDead, 200)
}

function playerDead() {
    console.log("Player dead!!!!!!!!!")
    game.sound.play("die");
    player.setCollideWorldBounds(false);
    gameOver =  true;
}

function endGame() {
    gameOver= true;
    pause();
    console.log("game paused")
    player.y =450
}
function pause(obj = game) {
    console.log("pause")
    isPaused = true;
    obj.scene.pause("default");
}
function resume(obj = game) {
    console.log("resume")
    isPaused = false;
    obj.scene.resume("default");
}
