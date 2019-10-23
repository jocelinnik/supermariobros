function MarioGame(){
    var interface = Interface.getInstancia();

    //elementos de cenario
    var maxWidth, height, viewPort, tileSize, mapa, mapasAtuais, translatedDist, centerPos, marioInGround;
    //elementos do jogo
    var mario, elemento, sons, placar, teclas = [], goombas, powerUps, foguinhos, foguinhoAtivado = false;
    //elementos de gerencia
    var nivelAtual, animationID, timeOutId;
    //configuracoes dos elementos do jogo
    var tickCounter = 0; //for animating mario
    var maxTick = 25; //max number for ticks to show mario sprite
    var instructionTick = 0; //showing instructions counter

    var that = this;

    this.iniciar = function(mapas, nivel){
        height = 480;
        maxWidth = 0;
        viewPort = 1280;
        tileSize = 32;
        translatedDist = 0;
        goombas = [];
        powerUps = [];
        foguinhos = [];

        interface.setWidth(viewPort);
        interface.setHeight(height);
        interface.exibirCanvas();

        nivelAtual = nivel;
        mapasAtuais = mapas;
        mapa = JSON.parse(mapasAtuais[nivelAtual]);

        if(!placar){
            placar = new Placar();
            placar.iniciar();
        }
        placar.mostrarPlacar();
        placar.atualizarNivel(nivelAtual);

        if(!mario){
            mario = new Mario();
            mario.iniciar();
        }else{
            mario.x = 10;
            mario.frame = 0;
        }

        elemento = new Elemento();
        sons = new Sons();
        sons.iniciar();

        that.calcularMaxWidth();
        that.pegarTecla();
        that.iniciarJogo();
    };

    that.calcularMaxWidth = function(){
        for(var linha=0;linha<mapa.length;linha++){
            for(var coluna=0;coluna<mapa[linha].length;coluna++){
                if(maxWidth<mapa[linha].length*32){
                    maxWidth = mapa[coluna].length*32;
                }
            }
        }
    };

    that.pegarTecla = function(){
        var canvas = interface.getCanvas();

        document.body.addEventListener("keydown", function(e){
            teclas[e.keyCode] = true;
        });

        document.body.addEventListener("keyup", function(e){
            teclas[e.keyCode] = false;
        });

        canvas.addEventListener("touchstart", function(e){
            var toques = e.changeTouches;
            e.preventDefault();

            for (var i = 0; i < toques.length; i++) {
                if (toques[i].pageX <= 200) {
                  teclas[37] = true; //seta esquerda
                }
                if (toques[i].pageX > 200 && toques[i].pageX < 400) {
                  teclas[39] = true; //seta direita
                }
                if (toques[i].pageX > 640 && toques[i].pageX <= 1080) {
                  //as duas teclas atuam como corrida e de atirar foguinho
                  teclas[16] = true; //tecla shift
                  teclas[17] = true; //tecla ctrl
                }
                if (toques[i].pageX > 1080 && toques[i].pageX < 1280) {
                  teclas[32] = true; //espaco
                }
            }
        });

        canvas.addEventListener("touchend", function(e){
            var toques = e.changeTouches;
            e.preventDefault();

            for (var i = 0; i < toques.length; i++) {
                if (toques[i].pageX <= 200) {
                  teclas[37] = false;
                }
                if (toques[i].pageX > 200 && toques[i].pageX < 400) {
                  teclas[39] = false;
                }
                if (toques[i].pageX > 640 && toques[i].pageX <= 1080) {
                  teclas[16] = false;
                  teclas[17] = false;
                }
                if (toques[i].pageX > 1080 && toques[i].pageX < 1280) {
                  teclas[32] = false;
                }
            }
        });

        canvas.addEventListener('touchmove', function(e) {
            var toques = e.changedTouches;
            e.preventDefault();
      
            for (var i = 0; i < toques.length; i++) {
                if (toques[i].pageX <= 200) {
                    teclas[37] = true;
                    teclas[39] = false;
                }
                if (toques[i].pageX > 200 && toques[i].pageX < 400) {
                    teclas[39] = true;
                    teclas[37] = false;
                }
                if (toques[i].pageX > 640 && toques[i].pageX <= 1080) {
                    teclas[16] = true;
                    teclas[32] = false;
                }
                if (toques[i].pageX > 1080 && toques[i].pageX < 1280) {
                    teclas[32] = true;
                    teclas[16] = false;
                    teclas[17] = false;
                }
            }
        });
    };

    //loop de animacao
    this.iniciarJogo = function(){
        animationID = window.requestAnimationFrame(that.iniciarJogo);
        interface.limparTela(0,0, maxWidth, height);

        if(instructionTick<1000){
            that.mostrarInstrucoes();
            instructionTick++;
        }

        that.carregarMapa();

        for(var i=0;i<powerUps.length;i++){
            powerUps[i].desenhar();
            powerUps[i].atualizar();
        }

        for(var i=0;i<foguinhos.length;i++){
            foguinhos[i].desenhar();
            foguinhos[i].atualizar();
        }

        for(var i=0;i<goombas.length;i++){
            goombas[i].desenhar();
            goombas[i].atualizar();
        }

        that.checarColisaoMarioPowerUp();
        that.checarColisaoFoguinhoInimigo();
        that.checarColisaoMarioInimigo();

        mario.desenhar();
        that.atualizarMario();
        that.colisaoParede();
        marioInGround = mario.noChao;
    };

    this.mostrarInstrucoes = function(){
        interface.escrever("Controles: use as setas para controlar o personagem", 30, 30);
        interface.escrever("shift para correr loucamente e ctrl para soltar o foguinho", 30, 60);
        interface.escrever("Dica: pule enquanto corre para conseguir saltar mais alto no mapa", 30, 90);
    };

    this.carregarMapa = function(){
        mario.noChao = false;

        for(var i=0;i<powerUps.length;i++){
            powerUps[i].noChao = false;
        }

        for(var i=0;i<goombas.length;i++){
            goombas[i].noChao = false;
        }

        for(var i=0;i<mapa.length;i++){
            for(var j=0;j<mapa[i].length;j++){
                switch(mapa[i][j]){
                    case 1: //plataforma
                        elemento.x = j * tileSize;
                        elemento.y = i * tileSize;
                        elemento.plataforma();
                        elemento.desenhar();

                        that.checarColisaoElementoMario(elemento, i, j);
                        that.checarColisaoElementoPowerUp(elemento);
                        that.checarColisaoElementoInimigo(elemento);
                        that.checarColisaoElementoFoguinho(elemento);
                        break;
                    case 2: //caixa de moeda
                        elemento.x = j * tileSize;
                        elemento.y = i * tileSize;
                        elemento.caixaDeMoeda();
                        elemento.desenhar();

                        that.checarColisaoElementoMario(elemento, i, j);
                        that.checarColisaoElementoPowerUp(elemento);
                        that.checarColisaoElementoInimigo(elemento);
                        that.checarColisaoElementoFoguinho(elemento);
                        break;
                    case 3: //caixa surpresa
                        elemento.x = j * tileSize;
                        elemento.y = i * tileSize;
                        elemento.caixaSurpresa();
                        elemento.desenhar();

                        that.checarColisaoElementoMario(elemento, i, j);
                        that.checarColisaoElementoPowerUp(elemento);
                        that.checarColisaoElementoInimigo(elemento);
                        that.checarColisaoElementoFoguinho(elemento);
                        break;
                    case 4: //caixa usada
                        elemento.x = j * tileSize;
                        elemento.y = i * tileSize;
                        elemento.caixaUsada();
                        elemento.desenhar();

                        that.checarColisaoElementoMario(elemento, i, j);
                        that.checarColisaoElementoPowerUp(elemento);
                        that.checarColisaoElementoInimigo(elemento);
                        that.checarColisaoElementoFoguinho(elemento);
                        break;
                    case 5: //poste da bandeira
                        elemento.x = j * tileSize;
                        elemento.y = i * tileSize;
                        elemento.posteBandeira();
                        elemento.desenhar();

                        that.checarColisaoElementoMario(elemento, i, j);
                        that.checarColisaoElementoPowerUp(elemento);
                        that.checarColisaoElementoInimigo(elemento);
                        that.checarColisaoElementoFoguinho(elemento);
                        break;
                    case 6: //bandeira
                        elemento.x = j * tileSize;
                        elemento.y = i * tileSize;
                        elemento.bandeira();
                        elemento.desenhar();

                        that.checarColisaoElementoMario(elemento, i, j);
                        that.checarColisaoElementoPowerUp(elemento);
                        that.checarColisaoElementoInimigo(elemento);
                        that.checarColisaoElementoFoguinho(elemento);
                        break;
                    case 7: //cano esquerdo
                        elemento.x = j * tileSize;
                        elemento.y = i * tileSize;
                        elemento.canoEsq();
                        elemento.desenhar();

                        that.checarColisaoElementoMario(elemento, i, j);
                        that.checarColisaoElementoPowerUp(elemento);
                        that.checarColisaoElementoInimigo(elemento);
                        that.checarColisaoElementoFoguinho(elemento);
                        break;
                    case 8: //cano direito
                        elemento.x = j * tileSize;
                        elemento.y = i * tileSize;
                        elemento.canoDir();
                        elemento.desenhar();

                        that.checarColisaoElementoMario(elemento, i, j);
                        that.checarColisaoElementoPowerUp(elemento);
                        that.checarColisaoElementoInimigo(elemento);
                        that.checarColisaoElementoFoguinho(elemento);
                        break;
                    case 9: //topo do cano esquerdo
                        elemento.x = j * tileSize;
                        elemento.y = i * tileSize;
                        elemento.topoCanoEsq();
                        elemento.desenhar();

                        that.checarColisaoElementoMario(elemento, i, j);
                        that.checarColisaoElementoPowerUp(elemento);
                        that.checarColisaoElementoInimigo(elemento);
                        that.checarColisaoElementoFoguinho(elemento);
                        break;
                    case 10: //topo do cano direito
                        elemento.x = j * tileSize;
                        elemento.y = i * tileSize;
                        elemento.topoCanoDir();
                        elemento.desenhar();

                        that.checarColisaoElementoMario(elemento, i, j);
                        that.checarColisaoElementoPowerUp(elemento);
                        that.checarColisaoElementoInimigo(elemento);
                        that.checarColisaoElementoFoguinho(elemento);
                        break;
                    case 20: //goomba
                        var inimigo = new Inimigo();
                        inimigo.x = j * tileSize;
                        inimigo.y = i * tileSize;
                        inimigo.goomba();
                        inimigo.desenhar();

                        goombas.push(inimigo);
                        mapa[i][j] = 0;
                }
            }
        }
    };

    this.checarColisao = function(obj1, obj2){
        var vX = obj1.x + obj1.width / 2 - (obj2.x + obj2.width / 2);
        var vY = obj1.y + obj1.height / 2 - (obj2.y + obj2.height / 2);

        var metadeWidth = obj1.width/2 + obj2.width/2;
        var metadeHeight = obj1.height/2 + obj2.height/2;
        var direcaoColisao = null;

        if(Math.abs(vX)<metadeWidth && Math.abs(vY)<metadeHeight){
            var offsetX = metadeWidth - Math.abs(vX);
            var offsetY = metadeHeight - Math.abs(vY);

            if(offsetX>=offsetY){
                if(vY>0 && vY<37){
                    direcaoColisao = 't';
                    if(obj2.tipo != 5){
                        obj1.y += offsetY;
                    }
                }else if(vY<0){
                    direcaoColisao = 'b';
                    if(obj2.tipo != 5){
                        obj1.y -= offsetY;
                    }
                }
            }else{
                if(vX>0){
                    direcaoColisao = 'l';
                    obj1.x += offsetX;
                }else{
                    direcaoColisao = 'r';
                    obj1.x -= offsetX;
                }
            }
        }

        return direcaoColisao;
    };

    this.checarColisaoElementoMario = function(elemento, linha, coluna){
        var direcaoColisao = that.checarColisao(mario, elemento);
    
        if(direcaoColisao=='l'||direcaoColisao=='r'){
            mario.velX = 0;
            mario.pulando = false;
    
            if(elemento.tipo==5){
                //flag pole
                that.finalDoNivel(direcaoColisao);
            }
        }else if(direcaoColisao=='b'){
            if(elemento.tipo!=5){
                //only if not flag pole
                mario.noChao = true;
                mario.pulando = false;
            }
        }else if(direcaoColisao=='t'){
            if(elemento.tipo!=5){
                mario.velY *= -1;
            }
    
            if(elemento.tipo==3){
                //PowerUp Box
                var powerUp = new PowerUp();
         
                //gives cogumelo if mario is pequeno, otherwise gives flor
                if(mario.tipo=='pequeno'){
                    powerUp.cogumelo(elemento.x, elemento.y);
                    powerUps.push(powerUp);
                }else{
                    powerUp.flor(elemento.x, elemento.y);
                    powerUps.push(powerUp);
                }
        
                mapa[linha][coluna] = 4; //sets to useless box after powerUp appears
        
                //sound when cogumelo appears
                sons.play('powerUpAppear');
            }
    
            if(elemento.tipo==11){
                //flor Box
                var powerUp = new PowerUp();
                powerUp.flor(elemento.x, elemento.y);
                powerUps.push(powerUp);
        
                mapa[linha][coluna] = 4; //sets to useless box after powerUp appears
        
                //sound when flor appears
                sons.play('powerUpAppear');
            }
    
            if (elemento.tipo == 2) {
                //Coin Box
                placar.moedas++;
                placar.totalPlacar += 100;
        
                placar.atualizarMoedas();
                placar.atualizarPlacar();
                mapa[linha][coluna] = 4; //sets to useless box after coin appears
        
                //sound when coin block is hit
                sons.play('coin');
            }
        }
    };

    this.checarColisaoElementoPowerUp = function(elemento){
        for(var i=0;i<powerUps.length;i++){
            var direcaoColisao = that.checarColisao(powerUps[i], elemento);

            if(direcaoColisao == 'l' || direcaoColisao == 'r'){
                powerUps[i].velX *= -1;
            }else if(direcaoColisao == 'b'){
                powerUps[i].noChao = true;
            }
        }
    };

    this.checarColisaoElementoInimigo = function(elemento){
        for (var i = 0; i < goombas.length; i++) {
            if (goombas[i].estado != 'mortoPeloFoguinho') {
                var direcaoColisao = that.checarColisao(goombas[i], elemento);

                if (direcaoColisao == 'l' || direcaoColisao == 'r') {
                    goombas[i].velX *= -1;
                } else if (direcaoColisao == 'b') {
                    goombas[i].noChao = true;
                }
            }
        }
    };

    this.checarColisaoElementoFoguinho = function(elemento){
        for(var i=0;i<foguinhos.length;i++){
            var direcaoColisao = that.checarColisao(foguinhos[i], elemento);

            if (direcaoColisao == 'b') {
                foguinhos[i].noChao = true;
                } else if (direcaoColisao == 't' || direcaoColisao == 'l' || direcaoColisao == 'r') {
                foguinhos.splice(i, 1);
            }
        }
    };

    this.checarColisaoMarioPowerUp = function() {
        for (var i = 0; i < powerUps.length; i++) {
            var colisaoMario = that.checarColisao(powerUps[i], mario);
            if (colisaoMario) {
                if (powerUps[i].tipo == 30 && mario.tipo == 'pequeno') {
                    mario.tipo = 'grande';
                } else if (powerUps[i].tipo == 31) {
                    mario.tipo = 'pegando-fogo';
                }
                powerUps.splice(i, 1);

                placar.totalPlacar += 1000;
                placar.atualizarPlacar();

                sons.play('powerUp');
            }
        }
    };

    this.checarColisaoMarioInimigo = function() {
        for (var i = 0; i < goombas.length; i++) {
            if (!mario.invulnerable && goombas[i].estado != 'morto' && goombas[i].estado != 'mortoPeloFoguinho') {
                //if mario is invulnerable or goombas state is dead, collision doesnt occur
                var colisaoMario = that.checarColisao(goombas[i], mario);
        
                if (colisaoMario == 't') {
                    //kill goombas if collision is from top
                    goombas[i].estado = 'morto';
            
                    mario.velY = -mario.speed;
            
                    placar.totalPlacar += 1000;
                    placar.atualizarPlacar();
            
                    //sound when enemy dies
                    sons.play('killEnemy');
                } else if (colisaoMario == 'r' || colisaoMario == 'l' || colisaoMario == 'b') {
                    goombas[i].velX *= -1;
            
                    if (mario.tipo == 'grande') {
                        mario.tipo = 'pequeno';
                        mario.invulnerable = true;
                        colisaoMario = undefined;
            
                        //sound when mario powerDowns
                        sons.play('powerDown');
            
                        setTimeout(function() {
                            mario.invulnerable = false;
                        }, 1000);
                    } else if (mario.tipo == 'pegando-fogo') {
                        mario.tipo = 'grande';
                        mario.invulnerable = true;
            
                        colisaoMario = undefined;
            
                        //sound when mario powerDowns
                        sons.play('powerDown');
            
                        setTimeout(function() {
                            mario.invulnerable = false;
                        }, 1000);
                    } else if (mario.tipo == 'pequeno') {
                        //kill mario if collision occurs when he is pequeno
                        that.pausarJogo();
            
                        mario.frame = 13;
                        colisaoMario = undefined;
            
                        placar.vidas--;
                        placar.atualizarVidas();
            
                        //sound when mario dies
                        sons.play('marioDie');
            
                        timeOutId = setTimeout(function() {
                            if (placar.vidas == 0) {
                                that.gameOver();
                            } else {
                                that.resetGame();
                            }
                        }, 3000);
                        break;
                    }
                }
            }
        }
    };

    this.checarColisaoFoguinhoInimigo = function() {
        for (var i = 0; i < goombas.length; i++) {
            for (var j = 0; j < foguinhos.length; j++) {
                if (goombas[i] && goombas[i].state != 'dead') {
                    //check for collision only if goombas exist and is not dead
                    var colisaoFoguiho = that.checarColisao(goombas[i], foguinhos[j]);
                }
            
                if (colisaoFoguiho) {
                    foguinhos[j] = null;
                    foguinhos.splice(j, 1);
            
                    goombas[i].estado = 'mortoPeloFoguinho';
            
                    placar.totalPlacar += 1000;
                    placar.atualizarPlacar();
            
                    //sound when enemy dies
                    sons.play('killEnemy');
                }
            }
        }
    };

    this.colisaoParede = function() {
        //for walls (vieport walls)
        if (mario.x>= maxWidth - mario.width) {
            mario.x = maxWidth - mario.width;
        } else if (mario.x <= translatedDist) {
          mario.x = translatedDist + 1;
        }
    
        //for ground (viewport ground)
        if (mario.y >= height) {
            that.pausarJogo();
        
            //sound when mario dies
            sons.play('marioDie');
        
            placar.vidas--;
            placar.atualizarVidas();
        
            timeOutId = setTimeout(function() {
                if (placar.vidas == 0) {
                    that.gameOver();
                } else {
                    that.resetGame();
                }
            }, 3000);
        }
    };

    this.atualizarMario = function() {
        var friccao = 0.9;
        var gravidade = 0.2;
    
        mario.checarTipoMario();
    
        if (teclas[38] || teclas[32]) {
            //up arrow
            if (!mario.pulando && mario.noChao) {
                mario.pulando = true;
                mario.noChao = false;
                mario.velY = -(mario.speed / 2 + 5.5);
        
                // mario sprite position
                if (mario.frame == 0 || mario.frame == 1) {
                    mario.frame = 3; //right jump
                } else if (mario.frame == 8 || mario.frame == 9) {
                    mario.frame = 2; //left jump
                }
        
                //sound when mario jumps
                sons.play('jump');
            }
        }
    
        if (teclas[39]) {
            //right arrow
            that.checarPosicaoMario(); //if mario goes to the center of the screen, sidescroll the map
        
            if (mario.velX < mario.speed) {
                mario.velX++;
            }
        
            //mario sprite position
            if (!mario.pulando) {
                tickCounter += 1;
        
                if (tickCounter > maxTick / mario.speed) {
                    tickCounter = 0;
            
                    if (mario.frame != 1) {
                        mario.frame = 1;
                    } else {
                        mario.frame = 0;
                    }
                }
            }
        }
    
        if (teclas[37]) {
            //left arrow
            if (mario.velX > -mario.speed) {
                mario.velX--;
            }
        
            //mario sprite position
            if (!mario.pulando) {
                tickCounter += 1;
        
                if (tickCounter > maxTick / mario.speed) {
                    tickCounter = 0;
            
                    if (mario.frame != 9) {
                        mario.frame = 9;
                    } else {
                        mario.frame = 8;
                    }
                }
            }
        }
    
        if (teclas[16]) {
            //shift key
            mario.speed = 4.5;
        } else {
            mario.speed = 3;
        }
    
        if (teclas[17] && mario.tipo == 'pegando-fogo') {
            if (!foguinhoAtivado) {
                foguinhoAtivado = true;
                var foguinho = new Foguinho();
                if (mario.frame == 9 || mario.frame == 8 || mario.frame == 2) {
                var direcao = -1;
                } else {
                var direcao = 1;
                }
                foguinho.iniciar(mario.x, mario.y, direcao);
                foguinhos.push(foguinho);
        
                //foguinho sound
                sons.play('bullet');
        
                setTimeout(function() {
                    foguinhoAtivado = false; //only lets mario pegando-fogo bullet after 500ms
                }, 500);
            }
        }
    
        //velocity 0 sprite position
        if (mario.velX > 0 && mario.velX < 1 && !mario.pulando) {
            mario.frame = 0;
        } else if (mario.velX > -1 && mario.velX < 0 && !mario.pulando) {
            mario.frame = 8;
        }
    
        if (mario.noChao) {
            mario.velY = 0;
        
            //noChao sprite position
            if (mario.frame == 3) {
                mario.frame = 0; //looking right
            } else if (mario.frame == 2) {
                mario.frame = 8; //looking left
            }
        }
    
        //change mario position
        mario.velX *= friccao;
        mario.velY += gravidade;
    
        mario.x += mario.velX;
        mario.y += mario.velY;
    };

    this.checarPosicaoMario = function() {
        posicaoCentro = translatedDist + viewPort / 2;
    
        //side scrolling as mario reaches center of the viewPort
        if (mario.x > posicaoCentro && posicaoCentro + viewPort / 2 < maxWidth) {
          interface.rolarAnimacao(-mario.speed, 0);
          translatedDist += mario.speed;
        }
    };

    this.finalDoNivel = function(direcaoColisao) {
        //game finishes when mario slides the flagPole and collides with the ground
        if(direcaoColisao=='r'){
            mario.x += 10;
            mario.velY = 2;
            mario.frame = 11;
        }else if(direcaoColisao=='l'){
            mario.x -= 32;
            mario.velY = 2;
            mario.frame = 10;
        }
    
        if(marioInGround){
            mario.x += 20;
            mario.frame = 10;
            tickCounter += 1;
            if (tickCounter > maxTick) {
                that.pausarJogo();
        
                mario.x += 10;
                tickCounter = 0;
                mario.frame = 12;
        
                //sound when stage clears
                sons.play('stageClear');
                /*timeOutId = setTimeout(function() {
                    that.iniciar(mapasAtuais, nivelAtual);
                }, 5000);*/
        
                timeOutId = setTimeout(function() {
                    nivelAtual++;
                    if (mapasAtuais[nivelAtual]) {
                        that.iniciar(mapasAtuais, nivelAtual);
                        placar.atualizarNivel(nivelAtual);
                    } else {
                        that.gameOver();
                    }
                }, 5000);
            }
        }
    };

    this.pausarJogo = function(){
        window.cancelAnimationFrame(animationID);
    };

    this.gameOver = function(){
        placar.mostrarGameOver();
        interface.desenharCaixa(0, 0, maxWidth, height);
        interface.escrever("Game Over", centerPos - 80, height - 300);
        interface.escrever("Obrigado por jogar :)", centerPos - 122, height/2);
    };

    this.resetGame = function(){
        that.limparInstancias();
        that.iniciar(mapasAtuais, nivelAtual);
    };

    this.limparInstancias = function(){
        mario = elemento = sons = null;
        goombas = foguinhos = powerUps = [];
    };

    this.limparTimeOut = function(){
        clearTimeout(timeOutId);
    };

    this.removerTelaJogo = function(){
        interface.esconderCanvas();

        if(placar){
            placar.esconderPlacar();
        }
    };

    this.mostrarTelaJogo = function(){
        interface.exibirCanvas();
    };
}