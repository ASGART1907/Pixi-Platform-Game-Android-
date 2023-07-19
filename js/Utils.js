const collisionRect = (rect1,rect2) => {

    const rect1Left = rect1.position.x;
    const rect1Right = rect1.position.x + rect1.width;
    const rect1Top = rect1.position.y;
    const rect1Bottom = rect1.position.y + rect1.height;

    const rect2Left = rect2.position.x;
    const rect2Right = rect2.position.x + rect2.width;
    const rect2Top = rect2.position.y;
    const rect2Bottom = rect2.position.y + rect2.height;

    if(rect1Right < rect2Left ||
       rect1Left > rect2Right ||
       rect1Bottom < rect2Top ||
       rect1Top > rect2Bottom){
        return false;
       }

    return true;
}

const removeImage = (obj) => {
    obj.img = null;
    if (obj.img && obj.img.parent) {
        obj.img.parent.removeChild(obj.img);
    }
}

const removeObject = ({Array, index}) => {
        Array.splice(index, 1);
}

const outScreen = ({object,Array,index}) => {
    if(object.position.x + object.width < 0){
        removeObject({Array,index,obj:object});
    }
}

const soundPlay = (audio) => {
    if(game.start) return;
    if(!isSound) return;
    audio.sound.play();
}

const domSoundPlay = (audio) => {
    if(!game.start) return;
    audio.sound.play();
}

// PLAYER
let player = null;
let force = null;

const createPlayer = () => {
    player = new Player({
        sprite:playerSprite.idle,
        scale:playerSprite.scale,
        position:{
            x:1000,
            y:100
        },
        activeAnimate:"idle",
        isDead:false
    });
}

const playerUpdate = () => {
    player.update();

    if(game.active){
        if(playerEvents.isJump &&
           player.activeAnimate !== "jump" &&
           !playerEvents.isThrow){
            player.activeAnimate = "jump";
            player.sprite = playerSprite.jump;
            player.updateSource();

        }else if(playerEvents.isThrow && player.activeAnimate !== "throw"){
            player.activeAnimate = "throw";
            player.sprite = playerSprite.throw;
            player.updateSource();

        }else if(player.activeAnimate !== "run" &&
                !playerEvents.isJump &&
                !playerEvents.isThrow){
            player.updateSource();
            player.activeAnimate = "run";
            player.sprite = playerSprite.run;
            player.updateSource();
        }

        if(playerEvents.isThrow &&
            player.frameX === playerSprite.throw.frameCount){
                player.frameX = 0;
                playerEvents.isThrow = false;
        }
    }else{
            player.sprite = playerSprite.idle;

    }

    if(player.position.x + player.width < -15){
        for(let i=0; i<lifes.hearts1.length; i++){
            const heart = lifes.hearts1[i];
            app.stage.removeChild(heart.img);
        }
        lifes.hearts1 = [];
        player.lastCollisionEnemy = "back";
    }
}

//FLOOD
const floodHeight = (Math.floor(Math.random() * 10) + 10);

const createFlood = () => {
    flood = new Platform({
        position:{
            x:0,
            y:canvas.height - floodHeight
        },
        width:canvas.width,
        height:floodHeight,
        velocity:{
            x:-startGameVelocityX,
            y:0
        },
        color:0xFFA500,
        type:"flood"
    });
}

const floodUpdate = () => {
    flood.update();
    if(collisionRect(player.collisionBox,flood)){
        playerEvents.isJump = false;
        player.velocity.y = 0;
        player.position.y = flood.position.y - player.height;
    }
}

//CANVASRECT
const canvasRect = {
    left:0,
    top:0,
    right:innerWidth,
    bottom:innerHeight
}
//COINBOX
const width = 40;
const height = 40;

// PLATFORMES
let startPlatformPositionX = 0;

const createPlatform = () => {
    const width = (Math.floor(Math.random() * canvas.width + canvas.width)) + canvas.width;
    const height = Math.floor(Math.random() * 50) + 50;

    const obsCounts = [70,80,60];
    let obstacleWidth = obsCounts[Math.floor(Math.random() * obsCounts.length)]

    const velocity = {
        x:-startGameVelocityX,
        y:0
    }

    const positionX = startPlatformPositionX === 0 ? canvas.width -((Math.floor(Math.random() * 300)) + 100) : canvas.width + obstacleWidth;
    const positionY = canvas.height - height;
    platforms.push(
        new Platform({
            position:{
                x:positionX,
                y:positionY
            },
            velocity,
            width,
            height,
            type:"platform",
            color:0x00ffff
        })
    );


    startPlatformPositionX = 1;

    createEnemy({position:{x:positionX,y:positionY},width,height,velocity,type:"flood"});

    createCoin({velocity,height,width,positionX});

    for(let i=0; i<Math.floor(Math.random() * 2) + 1; i++){
        createUpPlatform({velocity,height,width});
    }

    createEnvironment({position:{x:positionX,y:positionY},velocity,width,height,type:"flood"});
    createUpEnemy();
    createCrate({position:{x:positionX,y:positionY},velocity,width,height});
    createBoard({positionX,height,velocity});

    score++;
}

const platformsUpdate = () => {
    let i,p;

    if(!platforms.length) createPlatform();

    for(i=0; i<platforms.length; i++){
        platforms[i].update();
    }

    for(i=0; i<platforms.length; i++){
        const platform = platforms[i];

        if(collisionRect(player.collisionBox,platforms[i].container)){
            player.velocity.y = 0;
        }

        if(platform.container.position.x + platform.container.width === canvas.width ||
          (platform.container.position.x + platform.container.width < canvas.width &&
           platforms.length < 2)){
            createPlatform();
        }

        if(collisionRect(player.downBox,platform.container) && !collisionRect(player.downBox,flood)){
            playerEvents.isJump = false;
            player.velocity.y = 0;
            player.position.y = platform.position.y - player.height;
        }else if(collisionRect(player.rightBox,platform.container) &&
                 collisionRect(player.downBox,flood)){
            player.position.x = platform.position.x - playerSprite.pCount;

        }

        const obstacle = {
            position:{
                x:Math.floor(platform.container2.position.x),
                y:Math.floor(platform.container2.position.y + 20),
            },
            width:Math.floor(platform.container2.width),
            height:Math.floor(platform.container2.height)
        }

        if(obstacle.position.x + obstacle.width < 0){
            platform.destroy();
            removeObject({Array:platforms,index:i});
        }

        if(collisionRect(player.collisionBox,obstacle) && !isObstacleCollision){
            isObstacleCollision = true;
            for(let i=0; i<lifes.hearts1.length; i++){
                app.stage.removeChild(lifes.hearts1[i].img);
            }
            lifes.hearts1 = [];
            player.lastCollisionEnemy = "obstacle";
            soundPlay(playerSound.dead);
        }

        //Projectiles
        for(p=0; p<projectiles.length; p++){
            const projectile = projectiles[p];
                if(collisionRect(projectile,platform)){
                    projectile.isDestroy = true;
                }
        }
    };
}

//ENEMİES
let textColor = null;

const enemiesUpdate = () => {
    const ply = {
        position:{
            x:player.collisionBox.position.x,
            y:player.collisionBox.position.y
        },
        width:player.collisionBox.width,
        height:player.collisionBox.height
    }

    let i;
    for(i=0; i<enemies.length; i++){
        const enemy = enemies[i];
        enemy.update();
    }

    for(i=0; i<enemies.length; i++){
        const enemy = enemies[i];
        for(let j=0; j<projectiles.length; j++){
            const projectile = projectiles[j];
            if(collisionRect(enemy.newPosition,projectile)){
                  projectile.isDestroy = true;

                if(enemy.health > 0){
                    const dmg = playerDmg[Math.floor(Math.random() * playerDmg.length)];
                    if(dmg == playerDmg[0]){
                        textColor = 0x32CD32;
                    }else if(dmg == playerDmg[1]){
                        textColor = 0xFFFF00;
                    }else if(dmg == playerDmg[2]){
                        textColor = 0xFF4500;
                    }
                    createText({
                        text:dmg,
                        position:{
                            x:enemy.position.x + 10,
                            y:enemy.position.y + 10,
                        },
                            velocity:{x:(Math.floor(Math.random() - 0.5)) * 2,y: -3},
                            fontSize:2,
                            color:textColor,
                            type:"dmg"
                    });
                    enemy.health = enemy.health - dmg;
                }
            }
        }
    }

    for(i=0; i<enemies.length; i++){
        const enemy = enemies[i];

        if(enemy.position.x + enemy.width < 0){
            removeObject({Array:enemies,index:i});
        }

        if(enemy.health <= 0){
            createParticle({
                position:{
                    x:enemy.position.x + enemy.width / 5,
                    y:enemy.position.y + enemy.height / 5
                },
                velocity:{
                    x:0,
                    y:3
                },
                tileCount:((enemy.width + enemy.height) / 2) / 8,
                colors: enemy.type === "Bomb" ? [0xacb8c2,0x56646D,0x313c43] : [0xd40000,0x790f0f,0xFF0000],
                type:"circle"
            });

            removeObject({Array:enemies,index:i});
            soundPlay(sounds.icons.bloodSound);
        }

        if(enemy.position.x + enemy.width < canvas.width &&
            enemy.sprite.type2 !== "attack" &&
            enemy.type !== "Bomb"){
                enemy.position.x = enemy.type2 === "flood" ? enemy.position.x - 0.3 : enemy.position.x - 0.1;
        }

        if(!game.active){
            if(enemy.position.x < canvas.width){
                removeObject({Array:enemies,index:i});
                enemies = [];
            }
        }
    }

    for(i=0; i<enemies.length; i++){
        const enemy = enemies[i];
        const result = images.enemies[enemy.type];
        if(enemy.type2 == "flood" &&
           enemy.position.x <= canvas.width / 2 &&
           enemy.position.y > canvas.height / 2 &&
           player.position.y > canvas.height / 2 &&
           player.position.x < enemy.position.x){
            if(enemy.activeSprite !== "active"){
                enemy.activeSprite = "active";
                enemy.sprite = result.attack ? result.attack : result.run;
                enemy.updateSource();
            }

            if(!enemy.isSound){
                    soundPlay(sounds.Enemies[enemy.type].attack);
                    enemy.isSound = true;
            }
        }else if(enemy.type2 === "sky" && 
                 player.position.x < enemy.position.x &&
                 enemy.position.x < canvas.width / 2 &&
                 enemy.position.y < canvas.height / 2 &&
                 player.position.y < canvas.height / 2){
                if(enemy.activeSprite !== "active"){
                    enemy.activeSprite = "active";
                    enemy.sprite = result.attack ? result.attack : result.run;
                    enemy.updateSource();
                }
       
                if(!enemy.isSound){
                        soundPlay(sounds.Enemies[enemy.type].attack);
                        enemy.isSound = true;
                }
        }else{
            if(enemy.activeSprite !== "run"){
                enemy.activeSprite = "run";
                enemy.sprite = result.run ? result.run : "";
                enemy.updateSource();
            }

        }

        const epy = enemy.sprite.collisionHeight;
        const ppy = player.collisionBox.position.y - epy;

        ply.position.y = ppy;
        if(collisionRect(ply,enemy.newPosition) &&
           powerControl.dino &&
           enemy.type !== "Bomb"){
           enemy.health = 0;
        }else if(collisionRect(ply,enemy.newPosition) && enemy.health > 0 && !player.isDead){
            if(lifes.hearts1.length > 1 && !powerControl.sheild && enemy.type !== "Bomb"){
                enemy.health = 0;
                if(lifes.hearts1.length){
                    app.stage.removeChild(lifes.hearts1[lifes.hearts1.length -1].img);
                    lifes.hearts1.pop();
                }
                checkHearts();
            }else if(enemy.type === "Bomb" &&
                   !powerControl.sheild){
                player.isDead = true;
                enemy.health = 0;
                player.lastCollisionEnemy = "Bomb";

                for(i = 0; i<lifes.hearts1.length; i++){
                    app.stage.removeChild(lifes.hearts1[i].img);
                }

                createEffect({
                    type:"Bomb",
                    sprite:images.effects.bombEffect,
                    position:enemy.position,
                    height:enemy.height
                });

                        createParticle({
                            position:{
                                x:enemy.position.x,
                                y:enemy.position.y
                            },
                            velocity:{
                                x:0,
                                y:3
                            },
                            tileCount:((enemy.width + enemy.height) / 2) / 8,
                            color:"red",
                            type:"circle"
                        });

                soundPlay(sounds.Enemies.Bomb.explosion);

                removeObject({Array:enemies,index:i});

                player.velocity.y = -50;
                soundPlay(playerSound.dead);
                setTimeout(() => {
                    lifes.hearts1 = [];
                    gameOver();
                },1000);
            }else{
                if(powerControl.sheild) return;
                soundPlay(playerSound.dead);
                if(lifes.hearts1.length){
                    app.stage.removeChild(lifes.hearts1[lifes.hearts1.length -1].img);
                    lifes.hearts1.pop();
                }
            }
        }
    }
}

let lastEnemyPositionX = null;
let lastEnemyWidth = null;
const createEnemy = ({position,width,height,velocity,type}) => {
    const nums = [600];
    const count = nums[Math.floor(Math.random() * nums.length)]

    let enemyCount = width / count;

    for(let i=0; i<enemyCount; i++){
        const typeEnemy = enemyType();

        const activeSprite = images.enemies[typeEnemy];
        const scale = activeSprite.scale;
        let enemyWidth = activeSprite.run.spriteWidth * scale;
        let enemyHeight = activeSprite.run.spriteHeight * scale;

        let positionX = Math.floor(Math.random() * width);

        if(positionX > canvas.width - 150) positionX = positionX - 150;

        if(positionX < 250) positionX = (Math.random() * (width - 200));


            enemies.push(
                new Enemy({
                    position:{
                        x:type === "flood" ? position.x + positionX : position.x + (Math.floor(Math.random() * width / 2) + width / 2) - enemyWidth,
                        y:type === "flood" ? canvas.height - height - (enemyHeight - 2) : position.y - (enemyHeight - 2)
                    },
                    velocity:{
                        x:velocity.x,
                        y:0
                    },
                    width:enemyWidth,
                    height:enemyHeight,
                    color:"red",
                    sprite:activeSprite.run,
                    type:typeEnemy,
                    type2:type === "flood" ? type : "sky",
                    isSound:false,
                    activeSprite:"run",
                    scale
                })
            );

            if(type === "flood"){
                lastEnempPositionX = positionX;
                lastEnemyWidth = enemyWidth;
            }
    }
}

const enemyType = () => {
    const enemiesType = [
        "ZombieMan",
        "ZombieMan",
        "ZombieMan",
        "ZombieGirl",
        "ZombieGirl",
        "GrassMonster",
        "Spider",
        "Spider",
        "Spider",
        "Skeleton2",
        "Bomb"
    ]

    const randomEnemy = Math.floor(Math.random() * enemiesType.length);

    return enemiesType[randomEnemy];
}

//PROJECTILES
const projectilesUpdate = () => {
    let i;
    for(i=0; i<projectiles.length; i++){
        projectiles[i].update();
    }

    for(i = 0; i<projectiles.length; i++){
        const projectile = projectiles[i];
        if(projectile.width > 0 && projectile.height > 0){
            projectile.width -= kunaiDecrease;
            projectile.height -= kunaiDecrease;
            if(playerSprite.type === "Dino"){
                projectile.position.y += 0.8;
            }
        }

        if(projectile.width <= 1 || projectile.height <= 1){
            projectile.isDestroy = true;
        }

        if(projectile.position.x + projectile.width > canvas.width - 20){
            projectile.isDestroy = true;
        }

        if(projectile.isDestroy){
            app.stage.removeChild(projectile.img);
            removeObject({Array:projectiles,obj:projectile,index:i});
        }
    }
}

//UPLATFORM
const upPlatformUpdate = () => {

    for(let i=0; i<upPlatforms.length; i++){
        upPlatforms[i].update();
    }

    upPlatforms.forEach((upPlatform,index) => {

        if(player.position.x + player.width - 20 >= upPlatform.position.x &&
           player.position.x + 20 <= upPlatform.position.x + upPlatform.width &&
           player.velocity.y > -0 && collisionRect(player.collisionBox,upPlatform)){
            playerEvents.isJump = false;
            player.velocity.y = 0;
            player.position.y = upPlatform.position.y - player.height;
        }

        outScreen({object:upPlatform,Array:upPlatforms,index});

        // UpPlatform collision with UpPlatform
        upPlatforms.forEach((upPlatform2,index2) => {
            if(index !== index2){
                if(collisionRect(upPlatform,upPlatform2)){
                    // upPlatform2.position.x = upPlatform2.position.x + upPlatform2.width;
                    upPlatform2.color = "black";
                }
            }
        });
    })
}

const createUpPlatform = ({velocity,width,height}) => {
    const platformWidths = [330,440,550];
    let positionY = Math.floor(Math.random() * canvas.height / 2);
    const positionX = canvas.width + Math.floor(Math.random() * width) + 300;
    const platformWidth = platformWidths[Math.floor(Math.random() * platformWidths.length)];
    const stringHeight = `${platformWidth}`;
    const platformHeight = stringHeight.slice(1,stringHeight.length);
    if(positionY < canvas.height / 2){
        positionY = canvas.height / 2;
    }
    if(positionY > canvas.height / 2 - 50){
        positionY = positionY - 50;
    }
    // if(upPlatforms.length > 0) return;
    upPlatforms.push(
        new Platform({
            position:{
                x:positionX,
                y:positionY
            },
            velocity:{
                x: velocity.x,
                y: velocity.y
            },
            width:platformWidth,
            height:+platformHeight,
            color:0x1E90FF,
            type:"upPlatform"
        })
    );

    createDiamond({width:platformWidth,height:platformHeight,positionY,velocity,positionX});
    createEnvironment({position:{x:positionX,y:positionY},velocity,width:platformWidth,height:platformHeight,type:"sky"});
    createEnemy({position:{x:positionX,y:positionY},width:platformWidth,height:platformHeight,velocity,type:"sky"});
}

//DIAMONDS
const createDiamond = ({width,height,positionY,velocity,positionX}) => {
    const coinWidth = 50;
    const coinHeight = 50;
    const posx = positionX + Math.floor(Math.random() * width);

    for(let i=0; i<Math.floor(Math.random() * 2) + 1; i++){
        diamonds.push(
            new Project({
                position:{
                    x:posx + i * (coinWidth + 5),
                    y:positionY - coinHeight - coinHeight / 4
                },
                velocity:{
                    x:velocity.x,
                    y:velocity.y
                },
                width:coinWidth,
                height:coinHeight,
                isSound:false,
                color:"transparent",
                sprite:images.icons.diamond,
                type:"diamond"
            })
        );
    }

}

const diamondUpdate = () => {
    diamonds.forEach((diamond,index) => {
        diamond.update();

        if(diamond.position.x + diamond.width < -10){
            app.stage.removeChild(diamond.img);
            removeObject({Array:diamonds,index});
        }

        if(collisionRect(player.collisionBox,diamond)){
            if(powerControl.xPoint) diamondCount += 2;
            else diamondCount++;

            const diamondL = `${diamondCount}`;
            if(diamondL.length > 2 && diamondL.length < 4){
                diamondScoreEl.style.width = 35 + "px";
            }else if(diamondL.length > 3 && diamondL.length < 5){
                diamondScoreEl.style.width = 45 + "px";
            }else if(diamondL.length > 4 && diamondL.length < 6){
                diamondScoreEl.style.width = 55 + "px";
            }else if(diamondL.length > 5 && diamondL.length < 7){
                diamondScoreEl.style.width = 65 + "px";
            }

            diamondScoreEl.innerHTML = diamondCount;
            app.stage.removeChild(diamond.img);

            removeObject({Array:diamonds,index});
            if(!diamond.isSound){
                diamond.isSound = true;
                soundPlay(sounds.coins.sound4);
            }
        }
    })
}

//ENVİRONMENT
const createEnvironment = ({position,velocity,width,height,type = "flood"}) => {
    for(let i=0; i<width / 200; i++){
        let sprite = environmentType();


        let envrmntWidth = sprite.spriteWidth;
        let envrmntHeight = sprite.spriteHeight;

        if(type !== "flood"){
            envrmntWidth = sprite.spriteWidth * 0.8;
            envrmntHeight = sprite.spriteHeight * 0.8;
        }

        if(platformSprite.type && platformSprite.type === "Winter"){
            if(sprite.type &&
                (sprite.type === "igloo" ||
                 sprite.type === "tree") &&
                 type !== "flood") continue;

                 if(sprite.type === "igloo" || sprite.type === "snowMan"){
                  envrmntWidth = sprite.spriteWidth * 0.6;
                  envrmntHeight = sprite.spriteHeight * 0.6;
                 }
        }


        let positionX = Math.floor(Math.random() * width);
            if(positionX + envrmntWidth > width){
                positionX = positionX - envrmntWidth;
            }else if(positionX + envrmntWidth < 0){
                positionX = positionX + envrmntWidth;
            }

        environments.push(
            new Environment({
                position:{
                    x:position.x + positionX,
                    y:type === "flood" ? canvas.height - height - envrmntHeight + 2 : position.y - envrmntHeight + 2
                },
                velocity,
                width: envrmntWidth,
                height: envrmntHeight,
                color:0xff00ff,
                type,
                sprite
            })
        );
    }

}

const environmentType = () => {
    let envLength = Object.keys(platformSprite.Objects).length;
    const randomEnv = Math.floor(Math.random() * envLength);

    const objs = [
        "one",
        "two",
        "three",
        "four",
        "five",
        "six",
        "seven",
        "eight",
        "nine",
        "ten",
        "eleven",
        "tvelve"
    ]

    let sprite = platformSprite.Objects[objs[randomEnv]];

    return sprite;
}

const environmentUpdate = () => {
    environments.forEach((environment,index) => {
        environment.update();

        if(environment.position.x + environment.width < 0){
            app.stage.removeChild(environment.img);
        }

        outScreen({object:environment,Array:environments,index});

    })
}

//UPENEMY
const upEnemyUpdate = () => {
    let i;

    for(i=0; i<upEnemies.length; i++){
        const upEnemy = upEnemies[i];
        upEnemy.update();
    }

    for(i=0; i<upEnemies.length; i++){
        const upEnemy = upEnemies[i];
        if(!upEnemy.isSound && upEnemy.position.x + upEnemy.width < canvas.width){
            soundPlay(sounds.UpEnemies[upEnemy.type2].start);
            upEnemy.isSound = true;
        }

        outScreen({object:upEnemy,Array:upEnemies,index:i});

        projectiles.forEach((projectile,projectileIndex) => {
            if(collisionRect(projectile,upEnemy.newPosition)){
                projectile.isDestroy = true;
                if(upEnemy.health > 0){
                    createText({
                        text:playerSprite.kunai.power,
                        position:{
                            x:upEnemy.position.x,
                            y:upEnemy.position.y,
                        },
                            velocity:{x:(Math.floor(Math.random() - 0.5)) * 2,y: -3},
                            fontSize:2,
                            color:0xFF4500,
                            type:"dmg"
                    });

                    // upEnemy.health - playerSprite.kunai.power
                    const health = upEnemy.health;
                    for(let i=0; i<3; i++){
                        upEnemy.health = upEnemy.health - health / 3;
                    }
                }
            }
        });

        const angle = Math.atan2(
            player.position.y + player.height / 2 - upEnemy.position.y - upEnemy.height / 2,
            player.position.x + player.width / 2 - upEnemy.position.x
        );

        const velocity = {
            x:Math.cos(angle),
            y:Math.sin(angle)
        }

        upEnemy.velocity.x = velocity.x * 2;
        upEnemy.velocity.y = velocity.y * 2;

        if(upEnemy.health <= 0){
            removeObject({Array:upEnemies,index:i});
            soundPlay(sounds.icons.bloodSound);
            createParticle({
                position:{
                    x:upEnemy.position.x + upEnemy.width / 4,
                    y:upEnemy.position.y + upEnemy.height / 4
                },
                velocity:{
                    x:0,
                    y:3
                },
                tileCount:((upEnemy.width + upEnemy.height) / 2) / 8,
                type:"circle"
            });
        }
    }


    for(i=0; i<upEnemies.length; i++){
        const enemy = upEnemies[i];
        if(collisionRect(player.collisionBox,enemy.newPosition) && powerControl.dino){
            enemy.health = 0;
        }else if(collisionRect(player.collisionBox,enemy.newPosition) && powerControl.sheild){
            enemy.health = 0;
        }else if(collisionRect(
            player.collisionBox,enemy.newPosition
            ) &&
            enemy.health > 0){
            if(lifes.hearts1.length > 1 && !powerControl.sheild){
                if(lifes.hearts1.length){
                    app.stage.removeChild(lifes.hearts1[lifes.hearts1.length -1].img);
                    lifes.hearts1.pop();
                }

                checkHearts();
            }else{
                if(powerControl.sheild) return;
                if(lifes.hearts1.length){
                    app.stage.removeChild(lifes.hearts1[lifes.hearts1.length -1].img);
                    lifes.hearts1.pop();
                }
                gameOver();
            }
        }
    }
}

const createUpEnemy = () => {
    if(score < 5) return;
    const sprite = upEnemyType();

    if(upEnemies.length) return;
    upEnemies.push(
        new Enemy({
            position:{
                x:canvas.width + Math.floor(Math.random() * 500),
                y:canvas.height / 2 + 100
            },
            velocity:{
                x:0,
                y:0
            },
            width:50,
            height:50,
            color:"blue",
            sprite,
            isSound:false,
            type:"upEnemy",
            type2:sprite.type2
        })
    );
}

const upEnemyType = () => {
    const allUpEnemies = [
        "birdsp",
        "Bee",
        "Skeleton"
    ];

    const sprite = images.enemies[allUpEnemies[Math.floor(Math.random() * allUpEnemies.length)]].run;
    return sprite;
}

//POWER
let lastPower;
let powerTimeWidth = 100;
let powerFrame = 0;
let createPowerFrame = 0;
let powerSound = true;

const powerAnimateControl = () => {
    if(game.start){
        if(powerTimeEl.style.animationPlayState !== 'paused'){
            powerTimeEl.style.animationPlayState = 'paused';
        }
    }else{
        if(powerTimeEl.style.animationPlayState !== 'running'){
            powerTimeEl.style.animationPlayState = 'running';
        }
    }

}

const powerUpdate = () => {
   if(force){
    force.update();

    if(collisionRect(force.hitbox,player.collisionBox) && !player.isDead){
        isPower = true;

        soundPlay(sounds.power.kam);
        powerImgEl.src = force.sprite.source;
        powerTimeWidth = 100;

        createParticle({position:{x:force.position.x,y:force.position.y},type:"power",sprite:force.sprite,tileCount:10});


        if(force.type === "heart"){
            let positionX;
            soundPlay(sounds.power.heart);

            if(lifes.hearts1.length === 1){
                positionX = 55;
            }else if(lifes.hearts1.length === 2){
                positionX = 97;
            }

            lifes.hearts1.push(new Environment({
                position:{
                    x: positionX,
                    y: 5
                },
                velocity:{
                    x:0,
                    y:0
                },
                width,
                height,
                type:"heart2",
                color:"transparent",
                sprite:images.icons.heart
            }));
        };

        if(force.type === "timer"){
            game.speed = game.speed + 0.2;
        };

        if(force.type !== "heart" && force.type !== "timer"){
            powerContainerEl.style.display = "flex";
            powerSound = true;
            if(force.type === "xPoint"){
                powerControl.xPoint = true;
            }else if(force.type === "dino"){
                playerSprite = images.characters.Dino;

                const activeSprite = playerSprite[player.activeAnimate];
                player.sprite = activeSprite;

                playerPower1 = playerSprite.kunai.power;
                playerDmg = [Math.floor(playerPower1 / 2),Math.floor(playerPower1 / 2 + (playerPower1 / 5)),playerPower1];

                player.updateSource();

                powerControl.dino = true;

                player.position.x = player.position.x - 110;
                player.position.y = player.position.y - 60;
                soundPlay(sounds.icons.crate);
                kunaiDecrease = playerSprite.kunai.decrease;

                playerSound = sounds.characters.Dino;
                soundPlay(sounds.characters.Dino.start);

                createEffect({
                    type:"transform",
                    sprite:images.effects.transformEffect,
                    position:{
                        x: player.collisionBox.position.x - (player.collisionBox.width / 2) - 50,
                        y: player.position.y - (player.height + player.height / 2)
                    },
                    scale:1,
                });

            }else if(force.type === "sheild"){
                powerControl.sheild = true;
            }
        }


        app.stage.removeChild(force.img);
        force = null;

    }

    if(force){
        if(force.position.x + force.width < 0){
            app.stage.removeChild(force.img);
            force = null;
        }
    }
   }

   if(isPower){
    powerAnimateControl();

    powerFrame--;
    if(powerFrame % 15 === 0){
        if(powerTimeWidth > 0){
            powerTimeWidth--;
        }else{
            if(powerSound){
                soundPlay(sounds.power.powerDown)
            }
            powerContainerEl.style.display = "none";
            isPower = false;
            powerSound = false;
            if(powerControl.dino){
                playerSprite = lastPlayerSprite;

                const activeSprite = playerSprite[player.activeAnimate];
                player.sprite = activeSprite;

                playerPower1 = playerSprite.kunai.power;
                playerDmg = [Math.floor(playerPower1 / 2),Math.floor(playerPower1 / 2 + (playerPower1 / 5)),playerPower1];

                playerSound = lastPlayerSound;

                soundPlay(sounds.icons.crate);

                soundPlay(playerSound.start);
                player.updateSource();
                kunaiDecrease = playerSprite.kunai.decrease;

                createEffect({
                    type:"transform",
                    sprite:images.effects.transformEffect,
                    position:{
                        x:player.position.x,
                        y:player.position.y - 300
                    },
                    height:player.height,
                    scale:0.5,
                });
            }else if(powerControl.sheild){
                app.stage.removeChild(sheild.img);
                sheild = null;
            }

            powerControl = {
                xPoint:false,
                sheild:false,
                dino:false
            }
        }
    }
    powerTimeEl.style.width = powerTimeWidth + "%";
   }
}

const createPower = () => {
    if(score < 3) return;
    powerControl = {
        xPoint:false,
        sheild:false,
        dino:false
    }

    createPowerFrame = 0;

    powerTimeWidth = 100;
    const powers = [
        "heart",
        "xPoint",
        "sheild",
        "timer",
        "dino"
    ];

    let randomPower = Math.floor(Math.random() * powers.length);
    let powerRandom = powers[randomPower];

    if(lifes.hearts1.length > 2 && powerRandom === "heart") {
        createPower();
    }else{
        if(randomPower === lastPower){
            if(randomPower === powers.length - 1) randomPower = 0;
            else randomPower += 1;

            powerRandom = powers[randomPower];
        }

        const activeSprite = images.icons[powerRandom];

        force = new Power({
                position:{
                    x:canvas.width,
                    y:Math.floor(Math.random() * canvas.height / 4)
                 },
                velocity:{
                    x:-(startGameVelocityX + 1),
                    y:0
                },
                width:90,
                height:90,
                sprite:activeSprite,
                type:powerRandom,
                color:0x00ffff
        })

        lastPower = randomPower;
    }
}

const containerUpdate = () => {
    let i,j;
    for(i = 0; i<containers.length; i++){
        const container = containers[i];
        container.update();

        if(container.position.x + container.width + 50 < 0 || !container.container.children){
            app.stage.removeChild(container.container);
            removeObject({Array:containers,index:i});
        }

        if(container.type == "crate") crateCollision({array:container});

        if(container.type == "coin") coinsUpdate({array:container});

    }
}

let crateVelocity = 0;
const crateCollision = ({array}) => {
    array.container.children.forEach((crate,index) => {
        const newPosition = {
            position:{
                x:array.container.x + crate.position.x,
                y:array.container.y + crate.position.y
            },
            width:crate.width,
            height:crate.height
        }

        let c;
        for(c = 0; c<platforms.length; c++){
           const platform = platforms[c];
            if(!collisionRect(platform,newPosition) &&
               index === 0){
                crateVelocity = 5;
                crate.position.y += crateVelocity;
            }else if(collisionRect(platform,newPosition) && index === 0){
                crate.position.y = (crate.height + crate.height) - crate.height;
            }

        }

        if(collisionRect(player.collisionBox,newPosition) && powerControl.dino){
            soundPlay(sounds.icons.crate);

            removeObject({Array:array.container.children,index});

            createParticle({
                position:{
                    x:newPosition.position.x + crate.width / 2,
                    y:newPosition.position.y + crate.height / 2
                },
                velocity:{
                    x: (Math.random() - 0.5) * (Math.floor(Math.random() * 8)),
                    y: (Math.random() - 0.5) * (Math.floor(Math.random() * 8)),
                },
                radius:Math.floor(Math.random() * 15) + 5,
                tileCount:30,
                colors:["#c37857","#854836","#685454"],
                type:"rect"
            });
        }

        if(!powerControl.dino){
            if(collisionRect(player.rightBox,newPosition)){
                player.velocity.x = array.velocity.x;
                player.position.x = newPosition.position.x - playerSprite.pCount;
            }else if(collisionRect(player.downBox,newPosition)){
                player.velocity.y = 0;
                player.position.y = newPosition.position.y - player.height;
                playerEvents.isJump = false;
            }
        }

        let p;
        for(p = 0; p<projectiles.length; p++){
            const projectile = projectiles[p];
            if(collisionRect(projectile,newPosition)){
                soundPlay(sounds.icons.crate);

                projectile.isDestroy = true;

                removeObject({Array:array.container.children,index});
                createParticle({
                    position:{
                        x:newPosition.position.x + crate.width / 2,
                        y:newPosition.position.y + crate.height / 2
                    },
                    velocity:{
                        x: (Math.random() - 0.5) * (Math.floor(Math.random() * 8)),
                        y: (Math.random() - 0.5) * (Math.floor(Math.random() * 8)),
                    },
                    radius:Math.floor(Math.random() * 15) + 5,
                    tileCount:30,
                    colors:["#c37857","#854836","#685454"],
                    type:"rect"
                });
            }
        }
    })
}

const createCrate = ({position,velocity,width,height}) => {
    const sprite = platformSprite.crate;
    const spriteWidth = sprite.spriteWidth * 0.5;
    const spriteHeight = sprite.spriteHeight * 0.5;

    const nums = [2,4];
    const randomNum = nums[Math.floor(Math.random() * nums.length)];

    for(let i=0; i<randomNum; i++){
        const tileX = Math.floor(Math.random() * 2) + 1;

        const containerHeight = 2 * spriteHeight;

        if(Math.floor((width / randomNum) * i) > 300 &&
           Math.floor((width / randomNum) * i) < width - 200){

            containers.push(new Container({
                position:{
                    x: position.x + (width / randomNum) * i,
                    y: canvas.height - height - containerHeight
                },
                velocity:{
                    x:velocity.x,
                    y:0
                },
                width:spriteWidth,
                height:spriteHeight,
                tileX,
                tileY:2,
                sprite,
                type:"crate",
                color:0xff0000
            }));
        }
    }
}

//COİNS
const coinsUpdate = ({array}) => {
    array.container.children.forEach(coin => {
        const coinPosition = {
            position:{
                x:array.container.x + coin.position.x,
                y:array.container.y + coin.position.y
            },
            width:coin.width,
            height:coin.height
        }

        if(game.start) coin.stop();
        else coin.play();

        if(collisionRect(player.collisionBox,coinPosition)){

            game.speed += 0.001;

            if(powerControl.xPoint) coinCount += 2;
            else coinCount++;

            coinScoreEl.innerHTML = coinCount;

            array.container.removeChild(coin);

                if(Math.random() <= 0.5){
                    soundPlay(sounds.coins.sound5);
                }else{
                    soundPlay(sounds.coins.sound4);
                }

                const coinL = `${coinCount}`;
                if(coinL.length > 2 && coinL.length < 4){
                    coinScoreEl.style.width = 30 + "px";
                }else if(coinL.length > 3 && coinL.length < 5){
                    coinScoreEl.style.width = 45 + "px";
                }else if(coinL.length > 4 && coinL.length < 6){
                    coinScoreEl.style.width = 55 + "px";
                }
        }
    })
}

const createCoin = ({velocity,width,height,positionX}) => {
    let containerPositionX = Math.floor(Math.random() * width);

    if(containerPositionX > width) {
        containerPositionX = containerPositionX;
    }else if(containerPositionX < positionX){
        containerPositionX = width / 2
    }

    containers.push(new Container({
        position:{
            x:containerPositionX,
            y:canvas.height - height
        },
        velocity:velocity,
        sprite:{
            image:images.goldCoin.meta.image,
            atlas:images.goldCoin,
            sprite:"walk"
        },
        type:"coin"
    }));
}

//BOARD
let board = null;
const createBoard = ({positionX,height,velocity}) => {

    const sprite = platformSprite.sign1;
    const boardWidth = sprite.spriteWidth;
    const boardHeight = sprite.spriteHeight;
    let positionY = canvas.height - height - boardHeight;
    let boardPositionX = positionX + ((Math.random() * 20) + 5);

    if(!board){
        board = new Project({
            position:{
                x:boardPositionX,
                y:positionY
            },
            velocity:velocity,
            width:boardWidth,
            height:boardHeight,
            type:"board",
            color:0xFF0000,
            sprite
        });
    }else{
        board.position = {
            x:positionX + ((Math.random() * 20) + 5),
            y:canvas.height - height - boardHeight
        }
    }

    //COMMANDS
    const commands = ["RUN","JUMP","THROW","GATHER"];
    const colors = [0x32CD32,0xFF4500,0xFF1493];


    const randomCommand = Math.floor(Math.random() * commands.length);
    const command = commands[randomCommand];
    let fontSize;
    if(command === "JUMP") fontSize = 2.5;
    else if(command === "THROW" || command === "GATHER") fontSize = 1.7;
    else fontSize = 3;

    createText({
        text:command,
        position:{
            x:boardPositionX,
            y:positionY + 5
        },
        velocity:{
            x:velocity.x,
            y:velocity.y
        },
        fontSize,
        color:colors[Math.floor(Math.random() * colors.length)]
    });

    let scoreText = `${score}`;
    let scoreFontSize = 4;
    let textPositionX = boardPositionX + boardWidth / 4;
    let textPositionY = positionY + boardHeight / 2 + boardHeight / 6;

    if(scoreText.length > 1 && scoreText.length < 3){
        textPositionX = boardPositionX + boardWidth / 6;
        scoreFontSize = 3.8;
    }else if(scoreText.length > 2 && scoreText.length < 4){
        scoreFontSize = 3;
        textPositionX = boardPositionX + 2;
        textPositionY = positionY + boardHeight / 2 + 5;
    }else if(scoreText.length > 3 && scoreText.length < 5){
        scoreFontSize = 2.3;
        textPositionX = boardPositionX + 2;
        textPositionY = positionY + boardHeight / 2 + 5;
    }else if(scoreText.length > 4){
        scoreFontSize = 1.8;
        textPositionX = boardPositionX;
        textPositionY = positionY + boardHeight / 2;
    }

    createText({
        text:score,
        position:{
            x:textPositionX,
            y:textPositionY
        },
        velocity:{
            x:velocity.x,
            y:velocity.y
        },
        fontSize:scoreFontSize,
        color:"white",
        type:"score"
    });
}

const boardUpdate = () => {
    if(board.position.x + board.width > -10){
        board.update();
    }
}

//JUMPEFFECT
const createJumpEffect = () => {
    const activeEffect = images.jumpEffects.effect2;
    let width = activeEffect.spriteWidth * 0.3;
    let height = activeEffect.spriteHeight * 0.3;

        jumpEffects.push(
            new Effect({
                position:{
                    x:player.position.x - width / 2,
                    y:player.position.y + player.height - height + 4

                },
                velocity:{
                    x:-3,
                    y:0
                },
                width,
                height,
                sprite:activeEffect,
            })
        )
}

const jumpEffectUpdate = () => {
   jumpEffects.forEach((effect,index) => {
    effect.update();

    if(effect.frameX === effect.sprite.frameCount){
        removeObject({Array:jumpEffects,index});
    }
   })
}

//LİFES
const createLife = () => {
    const width = 40;
    const height = 40;
    for(let i=0; i<3; i++){
        lifes.hearts1.push(new Environment({
            position:{
                x: 10 + i * width * 1.1,
                y: 5
            },
            velocity:{
                x:0,
                y:0
            },
            width,
            height,
            color:"transparent",
            sprite:images.icons.heart,
            type:"heart"
        }))

        lifes.hearts2.push(new Environment({
            position:{
                x: 10 + i * width * 1.1,
                y: 5
            },
            velocity:{
                x:0,
                y:0
            },
            width,
            height,
            color:"transparent",
            type:"heart2",
            sprite:images.icons.bubble
        }))
    }
}

const lifeUpdate = () => {
    lifes.hearts2.forEach(life => {
        life.update();
    })

    lifes.hearts1.forEach(life => {
        life.update();
    });
}

//TEXTES
const createText = ({text,position,velocity,fontSize,color,type}) => {
    texts.push(
        new Text({
            font:text,
            position,
            velocity,
            fontSize,
            color,
            type
        })
    );
}

const textUpdate = () => {
    let i;
    let text;
    for(i=0; i<texts.length; i++){
        text = texts[i];
        text.update();

        if(text.position.x + 100 < 0 ||
        text.fontSize <= 0.2 ||
           text.position.y - 50 > canvas.height
           ){
            removeObject({Array:texts,index:i});
        }
    }
}

//PARTICLES
const createParticle = ({position,type,colors = [0xd40000,0x790f0f,0xFF0000],tileCount = 20,sprite = ""}) => {
    if(type === "circle"){
        for(let i=0; i<9; i++){
            particles.push(
                new Circle({
                    position:{
                        x:position.x + 10,
                        y:position.y + 10
                    },
                    velocity:{
                        x:(Math.random() - 0.5) * (Math.floor(Math.random() * 10)),
                        y:(Math.random() - 0.5) * (Math.floor(Math.random() * 10))
                    },
                    radius: (Math.random() * 2) + 3,
                    color:colors[Math.floor(Math.random() * colors.length)],
                    type:"circle"
                })
            );
        }
    }

    else if(type === "rect"){
        const speedX = characterFrameCount == 0.5 ? 7 : 12;
        const speedY = characterFrameCount == 0.5 ? 5 : 10;

        for(let i=0; i<10; i++){
            const size = (Math.floor(Math.random() * 10)) + 10;
            const sprite = platformSprite.crate;
            particles.push(
                new Rect({
                    position:{
                        x:position.x,
                        y:position.y
                    },
                    velocity:{
                        x: (Math.random() - 0.5) * (Math.floor(Math.random() * speedX)),
                        y: (Math.random() - 0.5) * (Math.floor(Math.random() * speedY)),
                    },
                    width: size,
                    height: size,
                    color:0xFFA500,
                    type:"rect",
                    sprite
                })
            );
        }
    }else if(type === "power"){
        for(let i=0; i<Math.floor(tileCount); i++){
            const size = (Math.floor(Math.random() * 25) + 10)
                particles.push(
                    new Power({
                        position:{
                            x:position.x + 30,
                            y:position.y + 30
                        },
                        velocity:{
                            x:((Math.random() - 0.5) * 10),
                            y:((Math.random() - 0.5) * 10)
                        },
                        width:size,
                        height:size,
                        color:"transparent",
                        type:"power",
                        sprite
                    })
                )
            }
    }else return;
}

const particleUpdate = () => {
    let i;
    for(i=0; i<particles.length; i++){
        particles[i].update();
    }

    for(i=0; i<particles.length; i++){
        const particle = particles[i];
        if(particle.position.y > canvas.height ||
            particle.position.x > canvas.width ||
            particle.position.x + particle.width < 0 ||
            (particle.width <= 0 || particle.height <= 0)){
            app.stage.removeChild(particle.img);
            removeObject({Array:particles,index:i});
        }
    }

    for(i=0; i<particles.length; i++){
        const particle = particles[i];
        if(particle.type && particle.type === "power"){
            if(particle.width > 1) particle.width -= 0.7;
            if(particle.height > 1) particle.height -= 0.7;

            if(particle.width <= 0 ||
               particle.height <= 0){
                app.stage.removeChild(particle.img);
                removeObject({Array:particles,index:i});
            }
          }

          if(particle.type === "circle" && particle.radius > 0.1){
            particle.radius -= 0.1;
          }
    }


}

//SHEILD
let sheild = null;

const sheildUpdate = () => {
    if(!sheild){
        sheild = new Power({
            position:{
                x:player.collisionBox.position.x,
                y:player.position.y - player.height
            },
            velocity:{
                x:player.position.x,
                y:player.position.y
            },
            width:40,
            height:40,
            color:0x32CD32,
            type:"sheild",
            sprite: images.icons.sheild
        });
    }

    sheild.update();
    sheild.position.x = player.collisionBox.position.x;
    sheild.position.y = player.position.y - 40;

    sheild.velocity.x = player.velocity.x;
    sheild.velocity.y = player.velocity.y;
}

//HEART
const createHeart = () => {
    soundPlay(sounds.power.success);

    for(let i=0; i<50; i++){
        const size = Math.floor(Math.random() * 100) + 50;
        hearts.push(new Project({
            position:{
                x:Math.random() * canvas.width,
                y:Math.random() * canvas.height
            },
            velocity:{
                x:Math.random() - 0.5,
                y:Math.random() - 0.5,
            },
            width:size,
            height:size,
            color:"transparent",
            sprite:images.icons.heart,
            isSound:false,
            type:"heart"
        }));
    }
}

const createHeart2 = () => {

    if(lifes.hearts1.length === 3 || lifes.hearts1.length === 2) return;
    for(let i=0; i<3; i++){
        lifes.hearts1.push(new Environment({
            position:{
                x: 10 + i * width * 1.1,
                y: 5
            },
            velocity:{
                x:0,
                y:0
            },
            width,
            height,
            color:"transparent",
            sprite:images.icons.heart
        }))
    }
}

const heartUpdate = () => {
    let i;
    for(i=0; i<hearts.length; i++){
    const heart = hearts[i];
            heart.width--;
            heart.height--;

        if(heart.width <= 0.2 || heart.height <= 0.2){
            app.stage.removeChild(heart.img);
            removeObject({Array:hearts,obj:heart,index:i});
        }else{
            heart.update();
        }
    }
}

//EFFECTS
const createEffect = ({type,sprite,position,height,scale = 1}) => {
    const effectHeight = sprite.spriteHeight * scale;
    const effectWidth = sprite.spriteWidth * scale;
        const positionY = type == "transform" ? position.y : position.y - effectHeight + 51;
        const positionX = type == "transform" ? position.x : position.x - effectWidth / 4 - 40;

        effects.push(new Effect({
            position:{
                x:positionX,
                y:positionY,
            },
            velocity:{
                x:0,
                y:0
            },
            width:effectWidth,
            height:effectHeight,
            sprite,
            type
        }));

}

const effectsUpdate = () => {
    effects.forEach((effect,index) => {
        effect.update();

        if(effect.frameX === effect.sprite.frameCount){
            removeObject({Array:effects,index});
        }

        if(effect.type === "transform"){
            if(playerSprite.type === "Dino"){
                effect.position.x = player.collisionBox.position.x - (player.collisionBox.width / 2) - 90;
                effect.position.y = player.collisionBox.position.y - ((effect.height / 3) + 10)
            }else{
                effect.position.x = player.position.x - playerSprite.transLeft;
                effect.position.y = player.position.y - playerSprite.transTop;
            }
        }
    })
}

const removeObjectImage = () => {
    let i;
    for(i = 0; i<platforms.length; i++){
        platforms[i].destroy();
    }

 
    for(i = 0; i<upPlatforms.length; i++){
        upPlatforms[i].destroy();
    }

    for(i = 0; i<environments.length; i++){
        app.stage.removeChild(environments[i].img);
    }

    for(i = 0; i<diamonds.length; i++){
        app.stage.removeChild(diamonds[i].img);
    }

    for(i = 0; i<hearts.length; i++){
        app.stage.removeChild(hearts[i].img);
    }

    for(i = 0; i<texts.length; i++){
        app.stage.removeChild(texts[i].text);
    }

    for(i = 0; i<particles.length; i++){
        app.stage.removeChild(particles[i].img);
    }

    for(let i=0; i<projectiles.length; i++){
        const projectile = projectiles[i];
        app.stage.removeChild(projectile.img);
    }

    if(board) app.stage.removeChild(board.img);
    if(force) app.stage.removeChild(force.img);
    if(sheild) app.stage.removeChild(sheild.img);

    containers.forEach(container => {
            app.stage.removeChild(container.container);
    })
}

//TIMER
const timerControl = (direction) => {
    if(!game.start) game.start = true;
    powerAnimateControl();

    timerEl.style.display = "flex";
    let second = 3;

    const interval = setInterval(() => {
        timerEl.firstElementChild.innerHTML = second;
        --second;
        if(second < 0){
            clearInterval(interval);
            if(!game.start) return;

            setTimeout(() => {
                isObstacleCollision = false;
            },3000);

            timerEl.style.display = "none";

            player.isDead = false;
            player.lastCollisionEnemy = "";

            game.start = false;
            if(projectiles.length){
                let i;
                for(i=0; i<projectiles.length; i++){
                    const projectile = projectiles[i];
                    projectile.isDestroy = true;
                }
            }

            player.sprite = playerSprite.run;

            enemies.forEach((enemy) => {
                if(enemy.position.x < canvas.width){
                    enemy.health = 0;
                }
            });

            upEnemies.forEach((enemy,index) => {
                if(enemy.position.x < canvas.width){
                    enemy.health = 0;
                }
            });


        if(!direction) createHeart();
        second = 3;
        timerEl.firstElementChild.innerHTML = second;

        if(sheild) app.stage.removeChild(sheild.img);

        if(player.velocity.y === 1){
            player.sprite = playerSprite.run;
            player.activeAnimate = "run";
            player.updateSource();
        }else{
            player.sprite = playerSprite.jump;
            player.activeAnimate = "jump";
            player.updateSource();
        }

        route = "gameActive";
        animate();
        }
    },500);
}

//INIT
const init = () => {
    upEnemies = [];
    jumpEffects = [];
    enemies = [];

    removeObjectImage();

    platforms = [];
    upPlatforms = [];
    environments = [];
    texts = [];
    containers = [];
    diamonds = [];
    hearts = [];
    particles = [];
    effects = [];
    projectiles = [];
    board = null;
    sheild = null;
    force = null;

    score = 1;
    coinCount = 0;
    diamondCount = 0;


    coinScoreEl.innerHTML = coinCount;
    diamondScoreEl.innerHTML = diamondCount;

    if(player){

        player.isDead = false;
        player.lastCollisionEnemy = "";

        playerPower1 = playerSprite.kunai.power;

        player.position.y = canvas.height / 2;
        player.position.x = canvas.width / 4;
        if(player.isDead) player.isDead = false;
    }

    game = {
        speed:1.1,
        active:false,
        start:false,
        flood:true
    }

    flood.position.x = 0;
    flood.container.x = 0;

    powerControl = {
        xPoint:false,
        sheild:false,
        dino:false
    }

    createHeart2();

    startPlatformPositionX = 0;
    lastPower;
    powerTimeWidth = 100;
    powerFrame = 0;
    createPowerFrame = 0;
    powerSound = true;

    powerContainerEl.style.display = "none";

    lastEnemyPositionX = null;
    lastEnemyWidth = null;

    if(adBtn.classList.contains("noneAds")){
        adsControl.continuGameCount = 0;

        adBtn.firstElementChild.style.display = "flex";
        adBtn.classList.remove("noneAds");
        adBtn.classList.add("ad");
    }
}

//GAMECONTROL
const gameControl = () => {
    if(!lifes.hearts1.length){
        gameOver();
    }

    //POWERCONTROL
    const powersFrames = [1000,2000];

    for(const [key,value] of Object.entries(powerControl)){
        if(value) return;
        if(score > 3 && game.active){
            createPowerFrame++;
        }
    }

    if(createPowerFrame % powersFrames[Math.floor(Math.random() * powersFrames.length)] === 0){
        createPower();
    }
}

const gameOver = () => {
    game.start = true;
    powerAnimateControl();
    setTimeout(() => {
        gameOverScreenEl.style.display = "flex";

        if(navigator.onLine){
            noEntry.style.display = "none";
            if(!isOnline) isOnline = true;
        }else{
            noEntry.style.display = "flex";
            if(isOnline) isOnline = false;
        }

        if(+scoresEl.lastElementChild.lastElementChild.innerText < score){
            gameOverBestScoreEl.parentElement.style.display = "flex";
            gameOverBestScoreEl.innerHTML = score - 1;
        }else{
            gameOverBestScoreEl.parentElement.style.display = "none";
        }

        gameOverScoreEl.innerHTML = score - 1;
        gameOverGoldEl.innerHTML = coinCount;
        gameOverDiamondEl.innerHTML = diamondCount;
    },1000)
}