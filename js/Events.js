throwBtn.addEventListener("click",() => {
    if(game.start) return;
    if(!playerEvents.isThrow) playerEvents.isThrow = true;
    player.frameX = 0;

    const width = playerSprite.kunai.width;
    const height = playerSprite.kunai.height;
  
    projectiles.push(new Project({
                position:{
                    x:player.collisionBox.position.x + player.collisionBox.width,
                    y:player.position.y + player.height / 2 - playerSprite.kunai.positionY
                },
                velocity:{
                    x:throwSpeed,
                    y:0
                },
                width,
                height,
                color:"transparent",
                type:"kunai",
                sprite: playerSprite.kunai
    }));

    soundPlay(playerSound.throw);
});

jumpBtn.addEventListener("click",() => {
    if(!game.active) return;
    if(playerEvents.isJump) return;


    if(player.position.y + player.height > canvas.height / 2){
        if(!collisionRect(player.collisionBox,flood)){
            jumpVelocity = (player.position.y + player.height) / jumpCount;
        }else jumpVelocity = (player.position.y + player.height) / jumpFloodCount;
    }else if(player.position.y + player.height < canvas.height / 2){
        jumpVelocity = jumpCount;
    }
    
    soundPlay(sounds.icons.jump);

    playerEvents.isJump = true;
    if(player.velocity.y === 0){
        player.velocity.y = -jumpVelocity;
    }

    createJumpEffect();
});

homeBtn.addEventListener("click",() => {
    adsControl.continueGameCount = 0;

    showHomeScreen();
});

adBtn.addEventListener("click",() => {
    if(!adBtn.classList.contains("noneAds") && isOnline){
        if(isGameMusic){
            playMusic(gameMusic,false);
            isGameMusic = false;
        }
        rewardAd(null);
        route = "ads";
    }else return;
});

gameStartBtn.addEventListener("click",() => {
    loading.style.top = "0";
    adsControl.insertitialCount++;
    route = "gameStart";

    playerDmg = [Math.floor(playerPower1 / 2),Math.floor(playerPower1 / 2 + (playerPower1 / 5)),playerPower1];


    if(wrapperPausedContainerEl.style.display == "flex"){
        wrapperPausedContainerEl.style.display = "none";
        pauseBtnEl.firstElementChild.src = images.icons.iconPause.source;
    }

    playerPower1 = playerSprite.kunai.power;

    if(navigator.onLine){
        if(adsControl.insertitialCount === 3){
            if(isHomeMusic) playMusic(homeMusic,false);
            isHomeMusic = false;
            rewardAd("insertitial");
            insertitialAdType = "startGame";
        }else{
            loadSprite();
        }
    }else{
        loadSprite();
    }
    
});

tryAgainBtn.addEventListener("click",() => {
    adsControl.insertitialCount++;
    route = "gameStart";

    if(navigator.onLine){
        if(adsControl.insertitialCount === 3){
            gameOverScreenEl.style.display = "none";

            if(isGameMusic) playMusic(gameMusic,false);
            isGameMusic = false;

            rewardAd("insertitial");
            insertitialAdType = "tryAgain";
        }else{
        tryAgainGame();
        }
    }else{
        tryAgainGame();
    }

});

const tryAgainGame = () => {
    gameOverScreenEl.style.display = "none";

    player.isDead = false;
    route = "gameStart";
    game.speed = 1.1;

    gameOverBestScoreEl.parentElement.style.display = "none";
    gameActiveBtn.parentElement.style.display = "flex";

    if(isGameMusic){
        playMusic(gameMusic,false);
        isGameMusic = false;
        gameMusic.currentTime = 0;
    }
    
    const data = localStorage.getItem("Game");
    if(data){
        const game = JSON.parse(data);

        const newData = {...game,
            coins:{
            gold:game.coins.gold + coinCount,
            diamond:game.coins.diamond + diamondCount
            },
            scores:{
                score:score - 1,
                bestScore:score > game.scores.bestScore ? score - 1 : game.scores.bestScore
            }
        };

        localStorage.setItem("Game",JSON.stringify(newData));
    }
    playerSprite = lastPlayerSprite;
    playerSound = lastPlayerSound;
    kunaiDecrease = playerSprite.kunai.decrease;
    playerPower1 = playerSprite.kunai.power;

    playerDmg = [Math.floor(playerPower1 / 2),Math.floor(playerPower1 / 2 + (playerPower1 / 5)),playerPower1];

    if(player.lastCollisionEnemy === "Bomb"){
        player.position.x = player.position.x - 150;
        player.position.y = -150;
      }
    if(game.start){
        game.start = false;
    }else return;
    
    player.activeAnimate = "idle";
    player.sprite = playerSprite.idle;
    player.updateSource();

    init();
    animate();
}

const setLocalGameData = () => {
    if(localStorage.getItem("Game")){
        const data = localStorage.getItem("Game");

        if(data){
            const game = JSON.parse(data);

            const newData = {
                ...game,
                coins:{
                    gold:game.coins.gold + coinCount,
                    diamond:game.coins.diamond + diamondCount,
                },
                scores:{
                    score:score - 1,
                    bestScore:score > game.scores.bestScore ? score - 1 : game.scores.bestScore
                }
            };

            localStorage.setItem("Game",JSON.stringify(newData));

            const gameData = localStorage.getItem("Game");
            if(gameData){
                const newGame = JSON.parse(gameData);
                setGameData(newGame);
            }
        }
    }
};

gameActiveBtn.addEventListener("click",() => {
    soundPlay(sounds.icons.gameActive);
    soundPlay(playerSound.start);

    if(!game.active) game.active = true;
    gameActiveBtn.parentElement.style.display = "none";
    route = "gameActive";

        if(!isGameMusic){
            playMusic(gameMusic,true);
            isGameMusic = true;
        }
});

leaveBtn.addEventListener("click",() => {
        route = "leave";
        endGameContainerEl.parentElement.style.display = "flex";
});

endGameContainerEl.lastElementChild.lastElementChild.addEventListener("click",() => {
    endGameContainerEl.parentElement.style.display = "none";
});

endGameContainerEl.lastElementChild.firstElementChild.addEventListener("click",() => {
    navigator.app.exitApp();
});

const pauseGame = (direction) => {
    if(direction == "resume"){
        if(wrapperPausedContainerEl.style.display !== "flex"){
            wrapperPausedContainerEl.style.display = "flex";
            pauseBtnEl.firstElementChild.src = images.icons.iconCancel.source;
        }
    }

    if(direction == "resume") return;

    game.start = !game.start;

    if(wrapperPausedContainerEl.style.display == "flex"){
        wrapperPausedContainerEl.style.display = "none";
        pauseBtnEl.firstElementChild.src = images.icons.iconPause.source;
        route = "gameActive";
        animate();

        if(isSound){
            if(!isGameMusic) playMusic(gameMusic,true);
            isGameMusic = true;
        }
        
    }else{
        route = "pause";
        wrapperPausedContainerEl.style.display = "flex";
        pauseBtnEl.firstElementChild.src = images.icons.iconCancel.source;
            if(isGameMusic) playMusic(gameMusic,false);
            isGameMusic = false;
    }
}

pauseBtnEl.addEventListener("click",pauseGame);

platformsEl.addEventListener("click",() => {
    domSoundPlay(sounds.icons.click);
    route = "container";

    if(navigator.onLine){
        platformAd.lastElementChild.style.display = "none";
        if(!isOnline) isOnline = true;

    }else{
        platformAd.lastElementChild.style.display = "flex";
        if(isOnline) isOnline = false;
    }

    platformElements.style.display = "flex";
});

pausedContainerEl.firstElementChild.addEventListener("click",() => {
    showHomeScreen();
    wrapperPausedContainerEl.style.display = "none";
    pauseBtnEl.firstElementChild.src = images.icons.iconPause.source;
});

pausedContainerEl.firstElementChild.nextElementSibling.addEventListener("click",() => {
    isSound = !isSound;

    if(isSound){
        pausedContainerEl.firstElementChild.nextElementSibling.firstElementChild.firstElementChild.src = images.icons.iconSoundOn.source
    } 
    else{
        pausedContainerEl.firstElementChild.nextElementSibling.firstElementChild.firstElementChild.src = images.icons.iconSoundOff.source;
    }
})

pausedContainerEl.lastElementChild.addEventListener("click",() => {
    if(!game.start) return;
    if(isSound){
        if(!isGameMusic) playMusic(gameMusic,true);
        isGameMusic = true;
    }
    
    game.start = false;
    route = "gameActive";
    wrapperPausedContainerEl.style.display = "none";
    pauseBtnEl.firstElementChild.src = images.icons.iconPause.source;
    animate();
});

charactersEl.addEventListener("click",() => {
    domSoundPlay(sounds.icons.click);
    route = "container";

    if(navigator.onLine){
        playerAd.lastElementChild.style.display = "none";
        if(!isOnline) isOnline = true;
    }else{
        playerAd.lastElementChild.style.display = "flex";
        if(isOnline) isOnline = false;
    }

    characterElements.style.display = "flex";
});

closeElAll.forEach(closeEl => {
    if(route !== "home") route = "home";
    closeEl.addEventListener("click",() => {
        soundPlay(sounds.icons.click);
        closeEl.parentElement.parentElement.style.display = "none";
    });
});

platformAd.addEventListener("click",() => {
    if(!platformAd.classList.contains("noneAds") && isOnline){
        rewardAd("diamond");
    }else return;
});

playerAd.addEventListener("click",() => {
    if(!playerAd.classList.contains("noneAds") && isOnline){
        rewardAd("coin");
    }else return;
});

const setAdCoin = (type) => {
    const data = localStorage.getItem("Game");

    if(data){
        const game = JSON.parse(data);
        let newData;

        if(type === "gold"){
            newData = {...game,coins:{
                gold:game.coins.gold + 100,
                diamond:game.coins.diamond
            }}
        }else{
            newData = {...game,coins:{
                diamond:game.coins.diamond + 15,
                gold:game.coins.gold
            }}
        }

        localStorage.setItem("Game",JSON.stringify(newData));

        const newGame = localStorage.getItem("Game");
        if(newGame){
            const newDataGame = JSON.parse(newGame);
            setGameData(newDataGame);
        }
    }
};

let rewTest = 0;

aboutEl.addEventListener("click",() => {
    route = "container";
    aboutContainer.style.display = "flex";
    
    rewTest++;
    if(rewTest === 20){
        admob.requestRewardedAd();

        document.addEventListener(admob.events.onAdFailedToLoad, function (e) {
                alert("AD ERROR");
        });
        rewTest = 0;
    }
});

const showHomeScreen = () => {
    if(isGameMusic) playMusic(gameMusic,false);
    isGameMusic = false;

    setTimeout(() => {
        if(!isHomeMusic) playMusic(homeMusic,true);
        isHomeMusic = true;
    },1000)

    setLocalGameData();
    route = "home";

    canvas2.style.display = "none";

    frontScreenEl.style.display = "none";
    bgImage.style.display = "none";
    homeScreenEl.style.display = "flex";
    gameOverScreenEl.style.display = "none";
    gameOverBestScoreEl.parentElement.style.display = "none";

    game.active = false;

    for(i = 0; i<lifes.hearts1.length; i++){
        app.stage.removeChild(lifes.hearts1[i].img);
    }

    lifes.hearts1 = [];

    for(let i=0; i<projectiles.length; i++){
        const projectile = projectiles[i];
        app.stage.removeChild(projectile.img);
    }

    enemies.forEach((enemy,index) => {
        removeObject({Array:enemies,index})
    })


    player.isDead = false;
    projectiles = [];
};

btns.forEach(btn => btn.addEventListener("click",() => domSoundPlay(sounds.icons.click)));

psBtn.addEventListener("click",connectPlayStore);
psBtn2.addEventListener("click",connectPlayStore);

function connectPlayStore(){
    const playStoreLink = "https://play.google.com/store/apps/details?id=io.cordova.pixiplatform";
  
    const ref = cordova.InAppBrowser.open(playStoreLink, "_system");
}

document.addEventListener("backbutton",() => {
    if(route === "home"){
        route = "leave";
        endGameContainerEl.parentElement.style.display = "flex";
    }else if(route === "container"){
        route = "home";
        closeElAll.forEach(closeEl => {
                soundPlay(sounds.icons.click);
                closeEl.parentElement.parentElement.style.display = "none";
        });
    }else if(route === "leave"){
        route = "home";
        endGameContainerEl.parentElement.style.display = "none";
    }else if(route === "gameActive"){
        if(game.start) return;
        route = "pause";
        if(isGameMusic) playMusic(gameMusic,false);
        isGameMusic = false;

        pauseGame();
    }else if(route === "pause"){
        route = "gameActive";
        if(!isGameMusic) playMusic(gameMusic,true);
        isGameMusic = true;
        
        if(game.start) game.start = false;
        wrapperPausedContainerEl.style.display = "none";
        pauseBtnEl.firstElementChild.src = images.icons.iconPause.source;
        animate();
    }
})

document.addEventListener("pause", () => {
    if(route === "gameActive" || route === "pause"){
        if(isGameMusic) playMusic(gameMusic,false);
        isGameMusic = false;

    }else if(route === "home" || route === "container" || route === "leave"){
        if(isHomeMusic) playMusic(homeMusic,false);
        isHomeMusic = false;
    }
});

document.addEventListener("resume", () => {
    if(route === "pause" || route === "gameActive"){
        if(route === "pause"){
            frontScreenEl.style.top = "0";
            pauseGame("resume");
        }

        if(route === "pause") return;

        frontScreenEl.style.top = "0";
        route = "pause";
        pauseGame();
    }else if(route === "home" || route === "container" || route === "leave"){
        homeScreenEl.style.top = "0";
        if(!isHomeMusic) playMusic(homeMusic,true);
        isHomeMusic = true;
    }
});

window.addEventListener("resize",() => {
    app.renderer.resize(window.innerWidth,window.innerHeight);

    canvas = {
        width:app.view.width,
        height:app.view.height
    }
    canvas2.width = window.innerWidth;
    canvas2.height = window.innerHeight;

    canvas2.style.top = "0";
    canvas2.style.left = "0";

    if(!flood) return;
    else flood.container.position.y = canvas.height - flood.container.height;
});