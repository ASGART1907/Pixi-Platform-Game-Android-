const color1 = 0x00ffff;

class SpriteSheet{
    constructor({ sprite }){
        this.sprite = sprite;
        this.image = this.sprite.image;
        this.frameX = 0;
        this.frame = 0;
        this.frameY = 0;

        this.frameArea = characterFrameCount;
    }

    drawImg(){
        if(!this.image) return;
            ctx.drawImage(
                this.image,
                this.frameX * this.sprite.spriteWidth,
                this.frameY * this.sprite.spriteHeight,
                this.sprite.spriteWidth,
                this.sprite.spriteHeight,
                this.position.x,
                this.position.y,
                this.width,
                this.height
            )    
    }

    updateImage(){
        if(this.position.x > canvas.width ||
        this.position.x + this.width < 0) return;
        
        this.drawImg();

        if(this.frame % this.sprite.frameEllipse === 0){
            if(this.frameX < this.sprite.frameCount) this.frameX++;
            else this.frameX = 0;
        }

       this.frame += this.frameArea;
    }
}

class Player extends SpriteSheet{
    constructor({ sprite,position,scale,activeAnimate,isDead }){
        super({ sprite });
        this.position = position;
        this.activeAnimate = activeAnimate;
        this.isDead = isDead;

        this.sprite = sprite;
        this.scale = scale;

        this.velocity = {
            x:0,
            y:0
        }

        this.lastCollisionEnemy = "";

        this.gravity = playerGravity;

        this.widthCollisionRect = this.sprite.collisionWidth;
        this.leftCollisionRect = this.position.x + this.sprite.collisionLeft;

        this.width = this.sprite.spriteWidth * this.scale;
        this.height = this.sprite.spriteHeight * this.scale;



        this.collisionBox = {
            position:{
                x:this.leftCollisionRect,
                y:this.position.y
            },
            width:this.widthCollisionRect,
            height:this.height,
            color:0xff0000
        }
        this.rightBox = {
            position:{
                x:this.collisionBox.position.x + this.collisionBox.width,
                y:this.position.y
            },
            width:5,
            height:this.height - 10,
            color:0xFFFFFF
        };

        this.downBox = {
            position:{
                x:this.collisionBox.position.x,
                y:this.position.y + this.height
            },
            width: this.collisionBox.width - 10,
            height: 5,
            color:0xff0000
        };
    }

    update(){
        this.updateImage();

       if(game.active) this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        if(this.position.y + this.height < canvas.height){
            this.velocity.y += this.gravity - 0.3;
        }else{
            this.velocity.y = 0;
            this.position.y = canvas.height - this.height;
        }

        if(this.position.x + this.width < canvas.width / 2 - 20) this.velocity.x = characterFrameCount;
        else if(this.velocity.x !== 0) this.velocity.x = 0;

        this.leftCollisionRect = this.position.x + this.sprite.collisionLeft;

            this.collisionBox = {
                position:{
                    x:this.leftCollisionRect,
                    y:this.position.y
                },
                width:this.widthCollisionRect,
                height:this.height,
            }

        this.rightBox = {
            position:{
                x:this.collisionBox.position.x + this.collisionBox.width,
                y:this.position.y
            },
            width:5,
            height:this.height - 10,
        };

        this.downBox = {
            position:{
                x:this.collisionBox.position.x,
                y:this.position.y + this.height
            },
            width: this.collisionBox.width - 10,
            height: 5,
        };
    }

    updateSource(){
        this.image = this.sprite.image;
        this.scale = playerSprite.scale;
        
        this.width = this.sprite.spriteWidth * this.scale;
        this.height = this.sprite.spriteHeight * this.scale;

        this.widthCollisionRect = this.sprite.collisionWidth;
    }
}

class Sprite{
    constructor({sprite,position,width,height,type = null}){
        this.sprite = sprite;
        this.texture = this.sprite.texture;
        this.position = position;
        this.height = height;
        this.width = width;
        this.type = type;

        this.img = new PIXI.Sprite(this.texture);
        this.img.height = this.height;
        this.img.width = this.width;

        this.img.position.x = this.position.x;
        this.img.position.y = this.position.y;

        if(this.type === "diamond" || this.type === "board"){
            this.img.zIndex = 3;
        }else if(this.type === "rect"){
            this.img.zIndex = 4;
        }else if(this.type === "power" ||
                 this.type === "dino" ||
                 this.type === "timer" ||
                 this.type === "sheild" ||
                 this.type === "heart"){
            this.img.zIndex = 5;
        }else if(this.type === "heart" || this.type === "sheild"){
            this.img.zIndex = 6;
        }else if(this.type === "flood" || this.type === "sky"){
            this.img.zIndex = 0;
        }else if(this.type === "heart2"){
            this.img.zIndex = 7;
        }else if(this.type === "heart"){
            this.img.zIndex = 8;
        }

        app.stage.addChild(this.img);
    }

    updateImg(){
        if(!this.img) return;
        this.img.width = this.width;
        this.img.height = this.height;

        this.img.position.set(this.position.x,this.position.y);
    };
}

class Platform{
    constructor({position,velocity = {x:0,y:0},width,height,color = "transparent",type=""}){
        this.position = position;
        this.velocity = velocity;
        this.width = width;
        this.height = height;
        this.color = color;
        this.type = type;

        this.container = new PIXI.Container();
        this.container2 = new PIXI.Container();
        this.container.x = this.position.x;
        this.container.y = this.position.y;

        if(this.type === "platform"){
            this.obstacleTile();
            this.platformTile();

        }
        else if(this.type === "upPlatform") this.upPlatformTile();
        else this.floodTile();
    }

    update(){
        if(game.active) this.position.x += this.velocity.x * game.speed;

        if(game.active) this.container.x = this.position.x;

        if(game.active) this.container2.x = this.container.x + this.width;

    }

    platformTile(){
        this.obstacleTile();

        const tileHeight = this.height / 2;
        const tileCount = this.width / tileHeight;

        let activeSprite;
       for(let i=0; i<tileCount; i++){
        for(let j=0; j<2; j++){

            if(i === 0){
                activeSprite = platformSprite.Tiles.first;
            }else if(i >= tileCount - 1){
                activeSprite = platformSprite.Tiles.three;
            }else{
                activeSprite = platformSprite.Tiles.two;
            }

            if(j === 1 && i === 0){
                activeSprite = platformSprite.Tiles.four;
            }else if(j === 1){
                activeSprite = platformSprite.Tiles.five;
            }

            if(j === 1 && i >= tileCount - 1){
                activeSprite = platformSprite.Tiles.six;
            }

            this.img = new PIXI.Sprite(activeSprite.texture);

            this.img.width = tileHeight;
            this.img.height = tileHeight;

            this.img.position.x = platforms.length === 0 ? tileHeight * i : 5 + tileHeight * i;
            this.img.position.y = tileHeight * j;

            this.container.zIndex = 3;
            this.container.addChild(this.img);
        }
       }
       app.stage.addChild(this.container);
    }

    upPlatformTile(){
        const tileHeight = this.height;
        const tileCount = Math.floor(this.width / tileHeight);
        let activeSprite;

       for(let i=0; i<tileCount; i++){
            if(i === 0){
                activeSprite = platformSprite.Tiles.fourTeen;
            }else if(i === tileCount - 1){
                activeSprite = platformSprite.Tiles.sixTeen;
            }else{
                activeSprite = platformSprite.Tiles.fiftTeen;
            }

            this.img = new PIXI.Sprite(activeSprite.texture);

            this.img.width = tileHeight;
            this.img.height = tileHeight;

            this.img.position.x = tileHeight * i;
            this.img.position.y = 0;

            this.container.zIndex = 3;
            this.container.addChild(this.img);
       }

       app.stage.addChild(this.container);
    }

    floodTile(){
            const tileHeight = this.height;

            for(let i=0; i <= this.width / tileHeight; i++){
                const texture = PIXI.Texture.from(platformSprite.Tiles.two.source);
                this.img = new PIXI.Sprite(texture);
                this.img.width = tileHeight;
                this.img.height = tileHeight;

                this.img.position.x = i * tileHeight;
                this.img.position.y = 0;

                this.container.addChild(this.img);
            }
            app.stage.addChild(this.container);
    }

    obstacleTile(){
        const sprite = platformSprite.obstacle;
        const obstacleWidth = sprite.spriteWidth * 0.6;
        const obstacleHeight = sprite.spriteHeight * 0.6;

        this.container2.x = this.container.x + this.width;
        this.container2.y = canvas.height - obstacleHeight / 2;

        for(let o=0; o<=2; o++){

            this.img = new PIXI.Sprite(sprite.texture);

            this.img.width = obstacleWidth;
            this.img.height = obstacleHeight;

            this.img.position.x = obstacleWidth * o;

            this.container2.addChild(this.img);

        }

        app.stage.addChild(this.container2);
    }

    destroy(){
        this.container.destroy();
        this.container2.destroy();
    }
}

class Enemy extends SpriteSheet{
    constructor({position,velocity,width,height,sprite,type,type2,color = "red",isSound,scale,activeSprite}){
        super({ sprite });
        this.position = position;
        this.velocity = velocity;
        this.color = color;
        this.sprite = sprite;
        this.type = type;
        this.type2 = type2;
        this.width = width;
        this.height = height;
        this.scale = scale;
        if(activeSprite) this.activeSprite = activeSprite;


        this.isSound = isSound;

            this.hitbox = {
                position:{
                    x:this.position.x,
                    y:this.position.y - 10
                },
                width:this.width,
                height:7,
            }
            this.health = this.hitbox.width;
    
            this.living = {
                position:this.hitbox.position,
                width:this.health,
                height:this.hitbox.height - 1
            }
        
        this.livingHeight = 5;

        this.positionX = this.sprite.positionX;

        this.newPosition = {
            position:{
                x:this.position.x + this.positionX,
                y:this.position.y + 5
            },
            width:this.sprite.collisionWidth,
            height:this.height - 25
        }
    }

    draw(){
        if(this.health <= 0) return;
        ctx.save();
        ctx.fillStyle = "limegreen";
        ctx.fillRect(this.hitbox.position.x,this.hitbox.position.y,this.hitbox.width,this.hitbox.height);
        ctx.strokeRect(this.hitbox.position.x,this.hitbox.position.y,this.hitbox.width,this.hitbox.height);
        ctx.stroke();
        ctx.restore();

        ctx.fillStyle = "red";
        ctx.fillRect(this.living.position.x,this.living.position.y,this.living.width,this.living.height);
    }

    update(){
        this.hitbox = {
            position:{
                x:this.position.x,
                y:this.position.y - 10
            },
            width:this.width,
            height:7,
        }

        this.living = {
            position:{
                x:this.hitbox.position.x,
                y:this.hitbox.position.y + this.hitbox.height / 2 - this.livingHeight / 2
            },
            width:this.health,
            height:this.livingHeight
        }

        this.updateImage();
        this.draw();

        this.newPosition.position.x = this.position.x + this.positionX;
        this.newPosition.position.y = this.position.y + 10;
        
        if(game.active) this.position.x += this.velocity.x * game.speed;
        if(game.active) this.position.y += this.velocity.y * game.speed;
    }

    updateSource(){
        this.image = this.sprite.image;
        
        this.width = this.sprite.spriteWidth * this.scale;
        this.height = this.sprite.spriteHeight * this.scale;
        this.positionX = this.sprite.positionX;
    }
}

class Effect extends SpriteSheet{
    constructor({
        position,
        velocity,
        width,
        height,
        sprite,
        type
    }){
        super({sprite});
        this.position = position;
        this.velocity = velocity;
        this.width = width;
        this.height = height;
        this.type = type;
    }
    update(){
        if(game.active) this.position.x += this.velocity.x * game.speed;
        this.updateImage();
    }
}

class Project extends Sprite{
    constructor({
        position,
        velocity,
        width,
        height,
        color = "deeppink",
        isCollision = false,
        type,
        isSound,
        isDestroy,
        sprite
    }){
        super({ sprite,position,width,height,type});
        this.position = position;
        this.velocity = velocity;
        this.width = width;
        this.height = height;
        this.color = color;
        this.isCollision = isCollision;

        if(type) this.type = type;
        if(isSound) this.isSound = isSound;
        if(isDestroy) this.isDestroy = isDestroy;

    }

    update(){
        this.updateImg();

        if(game.active) this.position.x += this.velocity.x * game.speed;
        this.position.y += this.velocity.y * game.speed;

    }
}

class Environment extends Sprite{
    constructor({position,velocity,width,height,color = "transparent",type = "",sprite,isSound}){
        super({ sprite,position,width,height,type});
        this.position = position;
        this.velocity = velocity;
        this.width = width;
        this.height = height;
        this.color = color;
        this.type = type;
        this.sprite = sprite;

        if(isSound) this.isSound = isSound;
    }

    update(){
        this.updateImg();

        if(game.active) this.position.x += this.velocity.x * game.speed;
        if(game.active) this.position.y += this.velocity.y * game.speed;
    }
}

class Power extends Sprite{
    constructor({position,velocity,width,height,type = "test",color = "transparent",sprite}){
        super({ sprite,position,width,height,type });
        this.position = position;
        this.velocity = velocity;
        this.width = width;
        this.height = height;
        this.color = color;
        this.sprite = sprite;
        this.type = type;

        this.hitbox = {
            position:{
                x:this.position.x + 15,
                y:this.position.y + 15,
            },
            width:this.width - 30,
            height:this.height - 30
        };
    }

    update(){
        this.updateImg();

        if(game.active) this.position.x += this.velocity.x * game.speed;
        this.position.y += this.velocity.y * game.speed;

        this.hitbox = {
            position:{
                x:this.position.x + 15,
                y:this.position.y + 15,
            },
            width:this.width - 30,
            height:this.height - 30
        };
    }
}

class Text {
    constructor({ font, position, velocity, fontSize, color, type }) {
      this.position = position;
      this.velocity = velocity;
      this.font = font;
      this.fontSize = fontSize;
      this.color = color;
      this.type = type;

      const options = {
        fontSize: `${this.fontSize}rem`,
        fontFamily: "MyFont",
        fill: this.color,
        stroke:0x000000,
        padding:10,
        align:"center",
        strokeThickness:5,

      };
      this.text = new PIXI.Text(this.font, options);

      this.text.x = this.position.x;
      this.text.y = this.position.y - this.text.height + 2;


      this.text.zIndex = 3;
      app.stage.addChild(this.text);
    }

    update() {
      this.text.x = this.position.x;
      this.text.y = this.position.y - (this.text.height) + 2;

      this.text.style.fill = this.color;

      if (game.active) this.position.x += this.velocity.x * game.speed;
      this.position.y += this.velocity.y * game.speed;

      if (this.type === "dmg") {
        if (this.text.width > 0.1) {
            this.text.width -= 0.5;
            this.text.height -= 0.3;
        }
        this.velocity.y += textSpeedY;
      }

      if (this.width <= 0 || this.height ||
         this.position.x + this.text.width < 0 ||
         this.position.y - 50 > canvas.height) {
        app.stage.removeChild(this.text);
      }
    }
}

class Circle{
    constructor({position,velocity,radius,color,type}){
        this.position = position;
        this.velocity = velocity;
        this.radius = radius;
        this.color = color;
        this.type = type;
    }

    draw(){
        c.beginFill(this.color);
        c.drawCircle(this.position.x,this.position.y,this.radius,this.radius);
        c.endFill();
    }

    update(){
        this.draw();

        this.position.x += this.velocity.x * game.speed;
        this.position.y += this.velocity.y * game.speed;

        if(this.velocity.x > 0){
            this.velocity.x -= 0.1;
        }

        if(this.velocity.x < 0){
            this.velocity.y += 0.1;
        }

        this.velocity.y += 0.08;
    }
}

class Rect extends Sprite{
    constructor({position,velocity,width,height,color,type,sprite}){
        super({ sprite,position,width,height,type });
        this.position = position;
        this.velocity = velocity;
        this.width = width;
        this.height = height;
        this.color = color;
        this.type = type;
    }

    update(){
        this.updateImg();

        this.position.x += this.velocity.x * game.speed;
        this.position.y += this.velocity.y;

        this.position.y += this.velocity.y * game.speed * this.height / 5;
        if(this.velocity.x > 0){
            this.velocity.x -= 0.1;
        }

        if(this.velocity.x < 0){
            this.velocity.y += 0.1;
        }

        this.velocity.y += rectVelY;
    }
}

class Container{
    constructor({position,velocity,width,height,sprite,tileX,tileY,type}){
        this.position = position;
        this.velocity = velocity;
        if(width) this.width = width;
        if(height) this.height = height;
        if(tileX) this.tileX = tileX;
        if(tileY) this.tileY = tileY;
        this.sprite = sprite;
        this.type = type;

        this.container = new PIXI.Container();

        if(this.type == "crate") this.crateAdd();
        else if(this.type == "coin") this.coinAdd();
    }

    coinAdd(){
        this.spriteSheet = new PIXI.Spritesheet(
            PIXI.BaseTexture.from(this.sprite.image),
            this.sprite.atlas
        );


        this.spriteSheet.parse();
        this.source = this.spriteSheet.animations[this.sprite.sprite];
            for(let i=0; i<Math.floor(Math.random() * 20) + 10; i++){
                this.animation = new PIXI.AnimatedSprite(this.source);
                this.animation.animationSpeed = 0.2;
        

                this.animation.position.x = (this.animation.width + 5) * i;

                this.container.addChild(this.animation);
            }
            
            this.container.x = this.position.x;
            this.container.y = this.position.y - (this.container.height + 15);

            this.container.zIndex = 4;

        app.stage.addChild(this.container);
        this.playCoin();

    }

    playCoin(){
        let frame = 0;
        this.container.children.forEach((child, index) => {
            if(frame > 5) frame = 0;
            frame++;
            child.currentFrame = frame - 1;
            child.play();
        })
    }
    

    crateAdd(){
        this.container.x = this.position.x;
        this.container.y = this.position.y + 3;

        for(let i=0; i<this.tileX; i++){
            for(let j=0; j<this.tileY; j++){
                this.img = new PIXI.Sprite(this.sprite.texture);

                this.img.width = this.width;
                this.img.height = this.height;

                this.img.position.y = this.height * (this.tileY - j - 1);

                this.img.position.x = this.width * i;

                this.container.addChild(this.img);
            }
        }

        this.container.zIndex = 4;
        app.stage.addChild(this.container);
    }

    update(){
        if(game.active) this.position.x += this.velocity.x * game.speed;
        this.container.x = this.position.x;
    }
}

c.zIndex = 4;
app.stage.addChild(c);