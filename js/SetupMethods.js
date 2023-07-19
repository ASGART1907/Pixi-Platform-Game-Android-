let playerSprite = images.characters.NinjaMan;
let playerSound = sounds.characters.NinjaMan;
let lastPlayerSprite = images.characters.NinjaMan;
let lastPlayerSound = sounds.characters.NinjaMan;
let kunaiDecrease = playerSprite.kunai.decrease;
let playerPower = playerSprite.kunai.power;

let playerPower1 = null;

const setLocalStorageData = () => {
    if(localStorage.getItem("Game")){
        const game = localStorage.getItem("Game");
        if(game){
            const data = JSON.parse(game);
            setGameData(data);
        }
    }else{
        const obj = {
            characters:[
                {id:1,playerName:"Ninja Man",total:0,power:15,isActive:true,isBuy:true,img:"./Assets/Icons/iconNinja2.png"},
                {
                    id:2,
                    playerName:"Ninja Girl",
                    total:1000,
                    power:15,
                    isActive:false,
                    isBuy:false,
                    img:"./Assets/Icons/iconNinjaGirl.png"
                },
                {id:3,playerName:"Adventure Girl",total:2000,power:20,isActive:false,isBuy:false,img:"./Assets/Icons/iconAdventureGirl.png"},
                {id:4,playerName:"Police",total:3000,power:20,isActive:false,isBuy:false,img:"./Assets/Icons/iconPolice.png"},
                {id:5,playerName:"Robot",total:5000,power:25,isActive:false,isBuy:false,img:"./Assets/Icons/iconRobot.png"},
                {id:6,playerName:"Sheriff",total:7000,power:30,isActive:false,isBuy:false,img:"./Assets/Icons/iconSherif.png"},
                {id:7,playerName:"OldSheriff",total:10000,power:35,isActive:false,isBuy:false,img:"./Assets/Icons/iconOldSherif.png"}
            ],
            platforms:[
                {id:1,platformName:"Summer",total:0,isActive:true,isBuy:true,img:"./Assets/Icons/platformImage4.jpg"},
                {id:2,platformName:"Desert",total:600,isActive:false,isBuy:false,img:"./Assets/Icons/platformImage1.jpg"},
                {id:3,platformName:"Night",total:1000,isActive:false,isBuy:false,img:"./Assets/Icons/platformImage3.jpg"},
                {id:4,platformName:"Winter",total:2000,isActive:false,isBuy:false,img:"./Assets/Icons/platformImage2.jpg"}
            ],
            scores:{
                bestScore:0,
                score:0
            },
            coins:{
                diamond:0,
                gold:0
            }
          }

        localStorage.setItem("Game",JSON.stringify(obj));
        setLocalStorageData();
    }
}

const setGameData = (data) => {
    setCharacters(data);
    setPlatforms(data);

    loading.style.display = "none";
    homeScreenEl.style.display = "flex";

    platformElDiamond.innerHTML = data.coins.diamond;
    characterElGold.innerHTML = data.coins.gold;

    scoresEl.firstElementChild.firstElementChild.innerHTML = data.scores.score;
    scoresEl.lastElementChild.lastElementChild.innerHTML = data.scores.bestScore;
}

const setCharacters = (data) => {
    const homeGoldCoin = document.querySelector(".homeScreenGoldCoin");
    homeGoldCoin.innerHTML = data.coins.gold;

    characterElements.lastElementChild.innerHTML = "";

    data.characters.forEach((player,index) => {
        const container = document.createElement("div");
        container.classList.add("playerContainer");
        if(player.isActive){
            container.classList.add("playerActive");


            let activePlayerName = "";
                player.playerName.split(" ").forEach(name => {
                    activePlayerName += name;
                });

            playerSprite = images.characters[activePlayerName];
            kunaiDecrease = images.characters[activePlayerName].kunai.decrease;
            lastPlayerSprite = images.characters[activePlayerName];
            lastPlayerSound = sounds.characters[activePlayerName];
            playerSound = sounds.characters[activePlayerName];

            playerPower1 = playerSprite.kunai.power;
        }

        const playerName = document.createElement("h4");
        playerName.innerHTML = player.playerName;

        const image = document.createElement("img");
        image.src = player.img;
        image.classList.add("playerImage");

        const strong = document.createElement("strong");
        strong.innerHTML = player.power;

        const btn = setButton({
            image:"./Assets/Icons/goldCoin.png",
            total:player.total,
            isBuy:player.isBuy,
            coin:homeGoldCoin.innerHTML
        });

        container.addEventListener("click",() => {
            const result = [];

            if(player.isBuy){
                domSoundPlay(sounds.icons.select);
                const data = localStorage.getItem("Game");
                if(data){
                    const game = JSON.parse(data);

                    game.characters.forEach(character => {
                        character.isActive = false;

                        if(character.id === index + 1){
                            character.isActive = true;
                        }

                        result.push(character);
                    });

                    const newData = {...game,characters:result};
                    localStorage.setItem("Game",JSON.stringify(newData));

                    const gameData = localStorage.getItem("Game");

                    if(gameData){
                        const newGame = JSON.parse(gameData);

                        setGameData(newGame);
                    }

                }
            }
        })

        btn.addEventListener("click",() => {
            if(+homeGoldCoin.innerHTML >= +btn.lastElementChild.innerHTML && !player.isBuy){
                domSoundPlay(sounds.icons.isBuy);
                setCharacterBuy({characterIndex:index + 1,total:+btn.lastElementChild.innerHTML});
            }else return;
        });

        container.appendChild(strong);
        container.appendChild(btn);
        container.appendChild(image);
        container.appendChild(playerName);
        characterElements.lastElementChild.appendChild(container);
    })
}

const setPlatforms = (data) => {
    const homeDiamondCoin = document.querySelector(".homeScreenDiamondCoin");
    homeDiamondCoin.innerHTML = data.coins.diamond;

    platformElements.lastElementChild.innerHTML = "";

    data.platforms.forEach((platform,index) => {
        const container = document.createElement("div");
        container.classList.add("platformContainer");
        if(platform.isActive){
            container.classList.add("platformActive");

            let activePlatformName = platform.platformName;
            platformSprite = images.platforms[activePlatformName];

            bgImage.firstElementChild.src = platformSprite.bg.source;
        }

        const image = document.createElement("img");
        image.src = platform.img;

        const h4 = document.createElement("h4");
        h4.innerHTML = platform.platformName;

        const btn = setButton({
            image:"./Assets/Icons/diamond.png",
            total:platform.total,
            isBuy:platform.isBuy,
            coin:homeDiamondCoin.innerHTML
        });

        container.addEventListener("click",(e) => {
            const result = [];
            if(platform.isBuy){
                domSoundPlay(sounds.icons.select);
                const data = localStorage.getItem("Game");
                if(data){
                    const game = JSON.parse(data);

                    game.platforms.forEach(platform => {
                        platform.isActive = false;

                        if(platform.id === index + 1){
                            platform.isActive = true;
                        }

                        result.push(platform);
                    });

                    const newData = {...game,platforms:result};
                    localStorage.setItem("Game",JSON.stringify(newData));

                    const gameData = localStorage.getItem("Game");

                    if(gameData){
                        const newGame = JSON.parse(gameData);

                        setGameData(newGame);
                    }

                }
            }
        })

        btn.addEventListener("click",() => {
            if(+homeDiamondCoin.innerHTML >= +btn.lastElementChild.innerHTML && !platform.isBuy){
                domSoundPlay(sounds.icons.isBuy);
                setPlatformBuy({characterIndex:index + 1,total:+btn.lastElementChild.innerHTML});
            }
        });

        container.appendChild(btn);
        container.appendChild(h4);
        container.appendChild(image);
        platformElements.lastElementChild.appendChild(container);
    })
};

const setButton = ({image,total,isBuy,coin}) => {
    const image2 = document.createElement("img");
    image2.src = image;

    const btn = document.createElement("button");
    if(isBuy){
        const completeImg = document.createElement("img");
        completeImg.src = "./Assets/Icons/iconTick.png";
        completeImg.style.width = "20px";
        completeImg.style.height = "20px";
        btn.classList.add("completeBtn","btn");

        btn.appendChild(completeImg);
    }else{
        const span = document.createElement("span");
        span.innerHTML = total;

        if(coin >= total){
            btn.classList.add("active");
        }else{
            btn.classList.add("deactive");
        }
    
        btn.appendChild(image2);
        btn.appendChild(span);
    }

    return btn;
}

const setCharacterBuy = ({characterIndex,total}) => {
    const result = [];
    if(localStorage.getItem("Game")){
        const data = localStorage.getItem("Game");
        if(data){
            const game = JSON.parse(data);

            game.characters.forEach(character => {

                if(character.id === characterIndex){
                    character.isBuy = true;
                }
                result.push(character)
            });

            const newData = {...game,
                characters:result,
                coins:{diamond:game.coins.diamond,gold:game.coins.gold - total
            }};

            localStorage.setItem("Game",JSON.stringify(newData));

            if(localStorage.getItem("Game")){
                const data = localStorage.getItem("Game");
                if(data){
                    const game = JSON.parse(data);
                    setGameData(game);
                }
            }
        }
    }
};

const setPlatformBuy = ({characterIndex,total}) => {
    const result = [];
    if(localStorage.getItem("Game")){
        const data = localStorage.getItem("Game");
        if(data){
            const game = JSON.parse(data);

            game.platforms.forEach(platform => {
                if(platform.id === characterIndex){
                    platform.isBuy = true;
                }
                result.push(platform)
            });

            const newData = {...game,
                platforms:result,
                coins:{gold:game.coins.gold,diamond:game.coins.diamond - total
            }};

            localStorage.setItem("Game",JSON.stringify(newData));

            if(localStorage.getItem("Game")){
                const data = localStorage.getItem("Game");
                if(data){
                    const game = JSON.parse(data);
                    setGameData(game);
                }
            }
        }
    }
};