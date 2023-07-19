let loadedAssets = 0;
let maxLoadedAssets = 0;

let loadedSounds = 0;
let maxLoadedSounds = 0;

function spriteLoad(source,type){
    let image = null;
    if(type === "image"){
        image = new Image();
        image.src = source;

        loadedAssets++;
    }else{
        image = PIXI.Texture.from(source);
        loadedAssets++;
    }

    return image;
}

async function loadSprite(){
    const maxLoadedAssets = playerSprite.spriteCount +
                            platformSprite.spriteCount + 
                            images.enemies.spriteCount +
                            images.characters.Dino.spriteCount + 
                            iconsLength + 
                            effectsLength +
                            jumpEffectLength + 1;

    loading.style.display = "flex";


    //PLAYER LOAD
    for(const sprite in playerSprite){
        const image = playerSprite[sprite];
        if(image.source && image.spriteWidth){
            const img = spriteLoad(image.source,"image");

            img.addEventListener("load",() => {
                playerSprite[sprite].image = img;
            });
        }else if(image.source && !image.spriteWidth){
            const img = spriteLoad(image.source,"texture");
            img.baseTexture.once("loaded",() => {
                playerSprite[sprite].texture = img;
            })
        }
    }

     //PLATFORM LOAD
     for(const sprite in platformSprite){
        switch(sprite){
            case "Objects":
                const objs = platformSprite[sprite];
                for(const obj in objs){
                    const source = objs[obj].source;
                    if(source){
                        const img = spriteLoad(source,"texture");
                        img.baseTexture.once("loaded",() => {
                            objs[obj].texture = img;
                        })
                    }
                }
            break;

            case "Tiles":
                const tiles = platformSprite[sprite];
                for(const obj in tiles){
                    const source = tiles[obj].source;
                    if(source){
                        const img = spriteLoad(source,"texture");
                        img.baseTexture.once("loaded",() => {
                            tiles[obj].texture = img;
                        })
                    }
                }
            break;

            default: 
               const source = platformSprite[sprite].source;
               if(source){
                const img = spriteLoad(source,"texture");
                img.baseTexture.once("loaded",() => {
                    platformSprite[sprite].texture = img;
                })
            };
        }
        
    }

    //DINO LOAD
    const dino = images.characters.Dino;
    for(const sprite in dino){
            const source = dino[sprite];
            if(source.source && source.spriteWidth){
                const img = spriteLoad(source.source,"image");

                img.addEventListener("load",() => {
                    dino[sprite].image = img;
                });
            }else if(source.source && !source.spriteWidth){
                const img = spriteLoad(source.source,"texture");

                img.baseTexture.once("loaded",() => {
                    dino[sprite].texture = img;
                });
            }
    }

    //JUMPEFFECT LOAD
    const jumpEffect = images.jumpEffects.effect2.source;
    const img = spriteLoad(jumpEffect,"image");

    img.addEventListener("load",() => {
        images.jumpEffects.effect2.image = img;
    });

    //COINEFFECT LOAD
    const coinSource = images.goldCoin.meta.image;
    if(coinSource){
        const img = spriteLoad(coinSource,"texture");
        img.baseTexture.once("loaded",() => {
            images.goldCoin.meta.texture = img;
        })
    }

    //EFFECT LOAD
    const effects = images.effects;
    for(const sprite in effects){
        const source = images.effects[sprite].source;
        if(source){
            const img = spriteLoad(source,"image");

            img.addEventListener("load",() => {
                images.effects[sprite].image = img;
            });
        }
    }

      //ICONS LOAD
      const icons = images.icons;
      for(const sprite in icons){
          const sp = icons[sprite];
          if(sp.source && sp.spriteWidth){
              const img = spriteLoad(sp.source,"texture");
              icons[sprite].texture = img;
          }else if(sp.source && !sp.spriteWidth){
            const img = spriteLoad(sp.source,"image");
            icons[sprite].image = img;
          }
      }

      //ENEMIES LOAD
      const enemies = images.enemies;
      for(const enemy in enemies){
          const sprites = enemies[enemy];
          for(const sprite in sprites){
              if(sprite !== "scale"){
                  const source = sprites[sprite].source;
                  if(source){
                    const img = spriteLoad(source,"image");

                    img.addEventListener("load",() => {
                        sprites[sprite].image = img;
                    });
                  }
              }
          }
      }

      let interval = setInterval(() => {
        if(loadedAssets === maxLoadedAssets){
            clearInterval(interval);
            loadSound();
        }
     },1000);
}

const iconsLength = Object.keys(images.icons).length;
const effectsLength = Object.keys(images.effects).length;
const jumpEffectLength = Object.keys(images.jumpEffects).length;

function startGame(){
    gameActiveBtn.parentElement.style.display = "flex";
    
    if(isHomeMusic){
        if(!isSound) return;
        playMusic(homeMusic,false);
        isHomeMusic = false;
    }
    
    createPlayer();
    createPlatform();
    createFlood();
    createLife();

    homeScreenEl.style.display = "none";

    frontScreenEl.style.display = "flex";
    bgImage.style.display = "flex";
    canvas2.style.display = "flex";

    init();
    animate();

   loading.style.display = "none";
   loadedAssets = 0;
   maxLoadedAssets = 0;

   loadedSounds = 0;
   maxLoadedSounds = 0;
}

function soundLoad(source){
    const sound = new Audio();
    sound.src = source;
    loadedSounds++;

    return sound;
}

function loadSound(){
    const iconsSoundLength = 3;
    const powerSoundLength = Object.keys(sounds.power).length;
    const coinSoundLength = Object.keys(sounds.coins).length;
    const upEnemySoundLength = Object.keys(sounds.UpEnemies).length;
    const enemySoundLength = 9;
    const playerSoundLength = 6;

    maxLoadedSounds = iconsSoundLength +
                      powerSoundLength + 
                      coinSoundLength + 
                      upEnemySoundLength +
                      enemySoundLength +
                      playerSoundLength;

    //PLAYER SOUND LOAD       
    for(const sound in playerSound){
        playerSound[sound].sound = new Howl({
            src: [playerSound[sound].source],
            preload: true,
            onload: function() {
                loadedSounds++;
            },
          });
    }

    //DINO SOUND LOAD       
    const dino = sounds.characters.Dino;
    for(const sound in dino){
        const audio = dino[sound].source;
        dino[sound].sound = new Howl({
            src: [audio],
            preload: true,
            onload: function() {
                loadedSounds++;
            },
          });
    }

    //ENEMY SOUND LOAD
    const enemies = sounds.Enemies;
    for(const enemy in enemies){
        const sounds = enemies[enemy];
        for(const audio in sounds){
            sounds[audio].sound = new Howl({
                src: [sounds[audio].source],
                preload: true,
                onload: function() {
                    loadedSounds++;
                },
              });
        }
    }

    //ICON SOUND LOAD
    const iconsSound = sounds.icons;
    for(const sound in iconsSound){
        const select = iconsSound[sound];
        if(!select.isDom){
            iconsSound[sound].sound = new Howl({
                src: [select.source],
                preload: true,
                onload: function() {
                    loadedSounds++;
                },
              });
        }
    }

    //POWER SOUND LOAD
    const powerSound = sounds.power;
    for(const sound in powerSound){
        const audio = powerSound[sound];
        powerSound[sound].sound = new Howl({
            src: [audio.source],
            preload: true,
            onload: function() {
                loadedSounds++;
            },
          });
    }

    //COIN SOUND LOAD
    const coinSound = sounds.coins;
    for(const sound in coinSound){
        const audio = coinSound[sound];

        coinSound[sound].sound = new Howl({
            src: [audio.source],
            preload: true,
            onload: function() {
                loadedSounds++;
            },
          });
    }

    //UPENEMIES SOUND LOAD
    const upEnemySounds = sounds.UpEnemies;
    for(const sound in upEnemySounds){
        const audio = upEnemySounds[sound];

        upEnemySounds[sound].start.sound = new Howl({
            src: [audio.start.source],
            preload: true,
            onload: function() {
                loadedSounds++;
            },
          });
    }

    let interval = setInterval(() => {
        if(loadedSounds === maxLoadedSounds){
            clearInterval(interval);
            startGame();
        }
     },1000);
}