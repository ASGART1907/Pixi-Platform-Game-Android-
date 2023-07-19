function animate(){
        ctx.clearRect(0,0,canvas2.width,canvas2.height);

        c.clear();

        //BOARDS
        if(board) boardUpdate();
        
        //TEXTS
        if(texts.length) textUpdate();

        //ENVİRONMENT
        if(environments.length) environmentUpdate();

        // ENEMİES
        if(enemies.length) enemiesUpdate();

        //PLAYER
        if(player) playerUpdate();

        //FLOOD
        if(game.flood) floodUpdate();

        //EFFECT
        if(effects.length) effectsUpdate();

        //PLATFORMS
        platformsUpdate();

        //PROJECTİLES
        if(projectiles.length) projectilesUpdate();

        //UPPLATFORM
        if(upPlatforms.length) upPlatformUpdate();

        //UPCOİNS
        if(diamonds.length) diamondUpdate();

        //CONTAİNERS
        if(containers.length) containerUpdate();

        //UPENEMİES
        if(upEnemies.length) upEnemyUpdate();

        //JUMPEFFECT
        if(jumpEffects.length) jumpEffectUpdate();

        //POWERS
        if(isPower || force) powerUpdate();

        //LİFES
        if(lifes.hearts2.length) lifeUpdate();

        //GAMECONTROL
        if(game.active) gameControl();

        //PARTİCLES
        if(particles.length) particleUpdate();
        
        //SHEILD
        if(powerControl.sheild) sheildUpdate();

        //HEARTS
        if(hearts.length) heartUpdate();
            
        if(!game.start) requestAnimationFrame(animate);
};

const checkHearts = () => {
        soundPlay(playerSound.dead);
        timerControl();
}