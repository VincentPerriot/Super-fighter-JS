const canvas = document.querySelector("canvas");
const c = canvas.getContext('2d');

canvas.width = 1024;
canvas.height = 576;

c.fillRect(0,0, canvas.width, canvas.height);

const gravity = 0.7;

const background = new Sprite({
    position:{
        x:0,
        y: 0
    },
    imageSrc: './assets/background.png'
})

const shop = new Sprite({
    position:{
        x: 600,
        y: 128
    },
    imageSrc: './assets/shop.png',
    scale: 2.75,
    framesMax: 6
})


const player = new Fighter({
    position:{
        x:0,
        y:0
    },
    velocity:{
        x: 0,
        y: 0,
    },
    offset: {
        x: 0,
        y: 0
    },
    imageSrc: './assets/samuraiMack/Idle.png',
    framesMax: 8,
    scale: 2.5,
    offset: {
        x:215,
        y:156
    },
    sprites: {
        idle:{
            imageSrc: './assets/samuraiMack/Idle.png',
            framesMax: 8
        },
        run:{
            imageSrc: './assets/samuraiMack/Run.png',
            framesMax: 8
        },
        jump:{
            imageSrc: './assets/samuraiMack/Jump.png',
            framesMax: 2
        },
        fall: {
            imageSrc: './assets/samuraiMack/Fall.png',
            framesMax: 2
        },
        attack1:{
            imageSrc: './assets/samuraiMack/Attack1.png',
            framesMax: 6
        },
        takeHit: {
            imageSrc: './assets/samuraiMack/Take Hit.png',
            framesMax: 4
        },
        death: {
            imageSrc: './assets/samuraiMack/Death.png',
            framesMax: 6
        }
    },
    attackBox: {
        offset: {
            x: 100,
            y: 50
        },
        width: 155,
        height: 50
    }
})

const enemy = new Fighter({
    position:{
        x:400,
        y:0
    },
    velocity:{
        x: 0,
        y: 0,
    },
    imageSrc: './assets/kenji/Idle.png',
    framesMax: 4,
    scale: 2.5,
    offset: {
        x:215,
        y:167
    },
    sprites: {
        idle:{
            imageSrc: './assets/kenji/Idle.png',
            framesMax: 4
        },
        run:{
            imageSrc: './assets/kenji/Run.png',
            framesMax: 8
        },
        jump:{
            imageSrc: './assets/kenji/Jump.png',
            framesMax: 2
        },
        fall: {
            imageSrc: './assets/kenji/Fall.png',
            framesMax: 2
        },
        attack1:{
            imageSrc: './assets/kenji/Attack1.png',
            framesMax: 4
        },
        takeHit: {
            imageSrc: './assets/kenji/Take hit.png',
            framesMax: 3
        },
        death: {
            imageSrc: './assets/kenji/Death.png',
            framesMax: 7
        },
    },
    attackBox: {
        offset: {
            x: -165,
            y: 50
        },
        width: 165,
        height: 50
    }
})

const keys = {
    a:{
        pressed: false
    },
    d:{
        pressed: false
    },
    w:{
        pressed: false
    },
    ArrowRight: {
        pressed: false
    },
    ArrowLeft: {
        pressed: false
    },
    ArrowUp: {
        pressed: false
    },
}

decreaseTimer();

function animate(){
    window.requestAnimationFrame(animate);
    c.fillStyle = "black";
    c.fillRect(0,0, canvas.width, canvas.height);

    background.update();
    shop.update();

    c.fillStyle = 'rgba(255, 255, 255, 0.1)'
    c.fillRect(0, 0, canvas.width, canvas.height)

    player.update();
    enemy.update();

    player.velocity.x = 0;
    enemy.velocity.x = 0;

    //player movement
    if(keys.d.pressed && player.lastKey === 'd'){
        player.velocity.x = 5;
        player.switchSprite('run');
    } else if (keys.a.pressed && player.lastKey === 'a') {
        player.velocity.x = -5;
        player.switchSprite('run');
    } else {
        player.switchSprite('idle');
    }

    if (player.velocity.y < 0) {
        player.switchSprite('jump');
    } else if (player.velocity.y > 0) {
        player.switchSprite('fall');
    }


    //enemy movement
    if(keys.ArrowRight.pressed && enemy.lastKey === 'ArrowRight'){
        enemy.velocity.x = 5;
        enemy.switchSprite('run');
    } else if (keys.ArrowLeft.pressed && enemy.lastKey === 'ArrowLeft') {
        enemy.velocity.x = -5;
        enemy.switchSprite('run');
    } else {
        enemy.switchSprite('idle');
    }

    if (enemy.velocity.y < 0) {
        enemy.switchSprite('jump');
    } else if (enemy.velocity.y > 0) {
        enemy.switchSprite('fall');
    }

    //detect for collision
    if(
        rectangularCollision({
            rectangle1: player,
            rectangle2: enemy
        })
        && player.isAttacking
        && player.framesCurrent === 4
        ){
        enemy.takeHit();
        player.isAttacking = false;

        gsap.to('#enemyHealth', {
            width: enemy.health + '%'
        })
    }

    //case player misses
    if(player.isAttacking && player.framesCurrent === 4){
        player.isAttacking = false;
    }

    if(
        rectangularCollision({
            rectangle1: enemy,
            rectangle2: player
        })
        && enemy.isAttacking
        && enemy.framesCurrent === 2
        ){
        player.takeHit();
        enemy.isAttacking = false;
        
        gsap.to('#playerHealth', {
            width: enemy.health + '%'
        })
    }   

    //case enemy misses
    if(enemy.isAttacking && enemy.framesCurrent === 2){
        enemy.isAttacking = false;
    }
    
    //end game based on health
    if (enemy.health <= 0 || player.health <=0 ){
        determineWinner({player, enemy, timerId});
    }
}

animate();

window.addEventListener('keydown', (e) => {
    if(!player.dead){
    switch(e.key){
        case 'd':
            keys.d.pressed = true;
            player.lastKey ='d';
        break
        case 'a':
            keys.a.pressed = true;
            player.lastKey = 'a';
        break
        case 'w':
            player.velocity.y = -20;
        break
        case ' ':
            player.attack()
        break
    }
    }

    if(!enemy.dead){
    switch(e.key){
        case 'ArrowRight':
            keys.ArrowRight.pressed = true;
            enemy.lastKey ='ArrowRight';
        break
        case 'ArrowLeft':
            keys.ArrowLeft.pressed = true;
            enemy.lastKey ='ArrowLeft';
        break
        case 'ArrowUp':
            enemy.velocity.y = -20;
        break
        case 'ArrowDown':
            enemy.attack()
        break
    }
    }
})

window.addEventListener('keyup', (e) => {
    switch(e.key){
        //player
        case 'd':
            keys.d.pressed = false;
        break
        case 'a':
            keys.a.pressed = false;
        break
        case 'w':
            keys.w.pressed = false;
        break

        //enemy
        case 'ArrowRight':
            keys.ArrowRight.pressed = false;
        break
        case 'ArrowLeft':
            keys.ArrowLeft.pressed = false;
        break
        case 'ArrowUp':
            keys.ArrowUp.pressed = false;
        break

    }
})