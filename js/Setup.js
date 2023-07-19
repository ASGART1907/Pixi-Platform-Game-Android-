const loading = document.querySelector(".loadingContainer");
const timerEl = document.querySelector(".timer");

let homeMusic = null;
let gameMusic = null;
let isGameMusic = false;
let isHomeMusic = false;

let jumpFloodCount = 19;
let jumpCount = 17;
let playerGravity = 1;

const playMusic = (music,statu) => {
    if(statu){
        music.play();
        music.loop = true;
    }else{
        music.stop();
    }
}

let deviceRefreshRate = 60;
let startGameVelocityX = 2;
let characterFrameCount = 1;
let throwSpeed = 8;
let textSpeedY = 0.2;
let rectVelY = 0.04;
let playerDmg = [];

const deviceScaleControl = () => {
    if(device.tablet()){
        jumpFloodCount = 21;
        jumpCount = 19;
        var viewportMeta = document.getElementById('viewport-meta');
        viewportMeta.content = "width=device-width,initial-scale=2,maximum-scale=2,user-scalable=no";
    }else if(device.mobile()){
        var viewportMeta = document.getElementById('viewport-meta');
        viewportMeta.content = "width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no";
        rfrTest();
    }else{
        var viewportMeta = document.getElementById('viewport-meta');
        viewportMeta.content = "width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no";
    }
}

const rfrTest = () => {

    let secondsPassed;
    let oldTimeStamp;
    let fps = 0;

    let animateTestFrame = 0;
    let animateID = null;


    function refreshRateTestAnimate(timeStamp){
        secondsPassed = (timeStamp - oldTimeStamp) / 1000;
        animateTestFrame++;

        fps = Math.round(1 / secondsPassed);
            
        oldTimeStamp = timeStamp;
        animateID =  requestAnimationFrame(refreshRateTestAnimate);
        if(animateTestFrame >= 25){
            if(fps > 100){
                deviceRefreshRate = 120;
                characterFrameCount = 0.5;
                throwSpeed = 5;
                textSpeedY = 0.1;
                rectVelY = 0.02;
                jumpFloodCount = 34;
                jumpCount = 32;
                playerGravity = 0.5;
            }else{
                deviceRefreshRate = 60;
                characterFrameCount = 1;
                throwSpeed = 8;
                textSpeedY = 0.2;
                rectVelX = 0.04;
                playerGravity = 1;
            }

            startGameVelocityX = deviceRefreshRate == 120 ? 1 : 2;

            cancelAnimationFrame(animateID);
        }

    };
    refreshRateTestAnimate();
}

window.addEventListener("load",() => {
      setLocalStorageData();
      deviceScaleControl();

       let loadedSnd = 0; 

       homeScreenEl.style.top = 0;


       const iconsSound = sounds.icons;
       for(const audio in iconsSound){

        const selects = iconsSound[audio];
        if(selects.isDom){
           iconsSound[audio].sound = new Howl({
            src: [iconsSound[audio].source],
            preload: true,
            onload: function() {
                loadedSnd++;

                if(loadedSnd === 6){
                    sounds.icons.homeSound.sound = new Howl({
                        src: [sounds.icons.homeSound.source],
                        preload:true,
                        onload: function(){
                            homeMusic = sounds.icons.homeSound.sound;
                            homeScreenEl.style.display = "flex";
                            loading.style.display = "none";

                            if(!isHomeMusic){

                                const splashEl = document.querySelector(".splashScreen");

                                if(splashEl){
                                    setTimeout(() => {
                                        splashEl.style.display = "none";
                                        playMusic(homeMusic,true);
                                    },1000);
                                }
                                isHomeMusic = true;
                            } 
                        }
                    });

                    sounds.icons.gameSound.sound = new Howl({
                        src: [sounds.icons.gameSound.source],
                        preload: true,
                        onload: function(){
                            gameMusic = sounds.icons.gameSound.sound;
                        }
                    });
                    // playMusic(gameMusic,true);
                   }
            },
          });
        }
       }
});

let app = new PIXI.Application({
    width:this.innerWidth,
    height:this.innerHeight,
    backgroundAlpha:0,
});

if (PIXI.utils.isWebGLSupported()) {
    app.renderer = PIXI.autoDetectRenderer({
        width:this.innerWidth,
        height:this.innerHeight,
        backgroundAlpha:0,
        antialias: false
    });
  } else {
    app.renderer = new PIXI.CanvasRenderer({
        backgroundAlpha:0,
        width:this.innerWidth,
        height:this.innerHeight,
        backgroundAlpha:0,
        antialias: false
    });
  }

document.body.append(app.view);

app.stage.sortableChildren = true;

const c = new PIXI.Graphics();

let canvas = {
    width:app.view.width,
    height:app.view.height
}

const throwBtn = document.querySelector(".throw");
const jumpBtn = document.querySelector(".jump");

const canvas2 = document.querySelector("#canvas1");
const ctx = canvas2.getContext("2d");
ctx.imageSmoothingEnabled = false

canvas2.width = this.innerWidth;
canvas2.height = this.innerHeight;

canvas2.style.top = "0";
canvas2.style.left = "0";

//POWER ELEMENTS
const frontScreenEl = document.querySelector(".frontScreen");
const powerTimeEl = document.querySelector(".powerTime");
const powerContainerEl = document.querySelector(".powerContainer");
const powerImgEl = document.querySelector(".powerContainer .img-container img");
const coinEl = document.querySelector(".gold");
const diamondEl = document.querySelector(".diamond");
const coinScoreEl = document.querySelector(".gold span");
const diamondScoreEl = document.querySelector(".diamond span");
const wrapperPausedContainerEl = document.querySelector(".wrapperPaused");
const pausedContainerEl = document.querySelector(".pausedContainer");
const pauseBtnEl = document.querySelector(".pauseBtn");
const root = document.querySelector(":root");

//GAME OVER SCREEN
const gameOverScreenEl = document.querySelector(".wrapperGameOver");
const noEntry = document.querySelector(".noEntry");
const homeBtn = document.querySelector(".home");
const adBtn = document.querySelector(".ad");
const tryAgainBtn = document.querySelector(".tryAgain");
const bgImage = document.querySelector(".bg-image-container");
const gameOverBestScoreEl = document.querySelector(".gameOverBestScore");
const gameOverScoreEl = document.querySelector(".gameOverScore");
const gameOverGoldEl = document.querySelector(".gameOverGold");
const gameOverDiamondEl = document.querySelector(".gameOverDiamond");

//HOME SCREEN
const homeScreenEl = document.querySelector(".homeScreen");
const gameStartBtn = document.querySelector(".gameStartBtn");
const gameActiveBtn = document.querySelector(".gameActiveBtn");
const leaveBtn = document.querySelector("#leave");
const platformsEl = document.querySelector(".platforms");
const charactersEl = document.querySelector(".characters");
const characterElements = document.querySelector(".characterElements");
const platformElements = document.querySelector(".platformElements");
const platformElDiamond = document.querySelector(".platformElDiamond");
const characterElGold = document.querySelector(".characterElGoldCoin");
const platformAd = document.querySelector(".platformAd");
const playerAd = document.querySelector(".playerAd");
const scoresEl = document.querySelector(".scores");
const aboutEl = document.querySelector(".about");
const aboutContainer = document.querySelector(".aboutContainer");
const endGameContainerEl = document.querySelector(".endGameContainer");
const homeScreenBestScoreEl = document.querySelector(".homeScreenBestScore");
const closeElAll = document.querySelectorAll("#close");
const psBtn = document.querySelector("#psBtn");
const psBtn2 = document.querySelector("#goToPS");

const btns = document.querySelectorAll("button");

let platforms = [];
let upPlatforms = [];
let enemies = [];
let projectiles = [];
let diamonds = [];
let environments = [];
let upEnemies = [];
let forces = [];
let texts = [];
let particles = [];
let jumpEffects = [];
let birds = [];
let hearts = [];
let effects = [];
let containers = [];


let isSound = true;
let isObstacleCollision = false;
let route = "home";
let insertitialAdType = "startGame";


const lifes = {
    hearts1:[],
    hearts2:[]
}

const playerEvents = {
    isThrow:false,
    isJump:false
}

let game = {
    speed:1.1,
    score:0,
    active:false,
    start:true,
    flood:true
}
let flood = null;

let powerControl = {
    xPoint:false,
    sheild:false,
    dino:false
}

let adsControl = {
    continueGameCount:0,
    coinWinCount:0,
    diamondWinCount:0,
    insertitialCount:0
}

let isOnline = true;

let isPower = false;
let jumpVelocity = canvas.height / 18;

let score = 1;
let coinCount = 0;
let diamondCount = 0;