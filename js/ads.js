let adName = "";

var admobid = {
    interstitial: 'ca-app-pub-7952605312904252/5890756707',
    rewarded:'ca-app-pub-7952605312904252/6465471776'
  };

function rewardAd(direction){
  loading.style.display = "flex";

  if(direction === "coin"){
    AdMob.prepareRewardVideoAd({
      adId: admobid.rewarded,
    });
    adName = "coin";

  }else if(direction === "diamond"){
    AdMob.prepareRewardVideoAd({
      adId: admobid.rewarded,
    });
    adName = "diamond";
  }else if(direction === "insertitial"){
      AdMob.prepareInterstitial({
          adId:admobid.interstitial
      });
    adName = "insertitial";
  }
  
  else{    
    AdMob.prepareRewardVideoAd({
      adId: admobid.rewarded,
    });
    adName = "continueGame";
  }
}

document.addEventListener('onAdDismiss', function() {
  loading.style.display = "none";
  if(adName === "continueGame"){
      frontScreenEl.style.top = "0";
      bgImage.style.top = "0";
      contiuneGame();
  }else if(adName === "coin"){
    homeScreenEl.style.top = "0";
    platformElements.style.display = "0";
     coinAd();
    if(!isHomeMusic) playMusic(homeMusic,true)
    isHomeMusic = true;

  }else if(adName === "diamond"){
    homeScreenEl.style.top = "0";
    characterElements.style.display = "0";
    diamondAd();
    if(!isHomeMusic) playMusic(homeMusic,true)
    isHomeMusic = true;
    }else{
    loading.style.top = "0";
    frontScreenEl.style.top = "0";
    bgImage.style.display = "0";

    if(insertitialAdType === "startGame"){
      loadSprite();
      adsControl.insertitialCount = 0;
    }else if(insertitialAsType === "tryAgain"){
      loading.style.top = "0";
      tryAgainGame();
      adsControl.insertitialCount = 0;
    }
  }
});

document.addEventListener("onAdFailLoad",(data) => {
  const err = data;

  if(adName === "coin" || adName === "diamond"){
    loading.style.display = "none";
    alert("AD ERROR");
    if(!isHomeMusic) playMusic(homeMusic,true);
    isHomeMusic = true;
  }else if(adName === "insertitial"){
    loading.style.display = "none";
    if(insertitialAdType === "startGame"){
      loadSprite();
      adsControl.insertitialCount = 0;
    }else if(insertitialAdType === "tryAgain"){
      tryAgainGame();
      adsControl.insertitialCount = 0;
    }
  }else{
    loading.style.display = "none";
    if(!isGameMusic) playMusic(gameMusic,true);
    isGameMusic = true;
  }
})

function contiuneGame(){
  player.isDead = false;
  if(!isGameMusic){
    playMusic(gameMusic,true);
    isGameMusic = true;
  }

  gameOverScreenEl.style.display = "none";
  if(player.lastCollisionEnemy === "Bomb"){
    player.position.x = player.position.x - 150;
    player.position.y = 150;
  }else if(player.lastCollisionEnemy === "obstacle"){
      player.position.x = player.position.x - 150;
      player.position.y = 150;
  }else if(player.lastCollisionEnemy === "back"){
    player.position.x = 300;
    player.position.y = 150;
  }

  for(let i=0; i<lifes.hearts1.length; i++){
      app.stage.removeChild(lifes.hearts1[i]);
  }

  if(game.speed >= 1.6){
      game.speed = game.speed - 0.3;
  }

  adsControl.continueGameCount++;

  if(adsControl.continueGameCount >= 3){
    if(adBtn.firstElementChild.classList.contains("hearts")){
      adBtn.firstElementChild.style.display = "none";
    }
    adBtn.classList.remove("ad");
    adBtn.classList.add("noneAds");
  }

  createHeart2();
  timerControl();
}

function diamondAd(){
  adsControl.diamondWinCount++;
  setAdCoin("diamond");

  if(adsControl.diamondWinCount === 10){
    platformAd.classList.remove("ad");
    platformAd.classList.add("noneAds");
  }
}

function coinAd(){
  adsControl.coinWinCount++;
  setAdCoin("gold");

  if(adsControl.coinWinCount === 10){
    playerAd.classList.remove("ad");
    playerAd.classList.add("noneAds");
  }
}