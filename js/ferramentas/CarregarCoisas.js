function Carregador(){
    var visao = Visao.getInstancia();
    var percentual;
    var imagens;
    var sons;
    var that = this;

    this.iniciar = function(){
        percentual = visao.create("div");
        visao.addClass(percentual, "percentual");
        visao.setHTML(percentual, "0%");
        visao.appendToBody(percentual);

        imagens = {
            1: 'imagens/bg.png',
            2: 'imagens/bullet.png',
            3: 'imagens/coin.png',
            4: 'imagens/elements.png',
            5: 'imagens/enemies.png',
            6: 'imagens/flag-pole.png',
            7: 'imagens/flag.png',
            8: 'imagens/mario-head.png',
            9: 'imagens/mario-sprites.png',
            10: 'imagens/powerups.png',
        };

        that.carregarImagens(imagens);
    };

    this.carregarImagens = function(imagens){
        var imagensOK = {};
        var carregadas = 0;
        var totalImagens = 0;

        for(var i in imagens){
            totalImagens++;
        }

        for(var i in imagens){
            imagensOK[i] = new Image();
            imagensOK[i].src = imagens[i];
            imagensOK[i].onload = function(){
                carregadas++;
                porcentagem = Math.floor(carregadas*100/totalImagens);
                visao.setHTML(percentual, porcentagem + "%");

                if(carregadas>=totalImagens){
                    visao.removeFromBody(percentual);
                    that.iniciarMapa();
                }
            };
        }
    };

    this.iniciarMapa = function(){
        var config = Configuracoes.getInstancia();
        config.iniciar();
    };
}

window.onload = function(){
    var carregador = new Carregador();
    carregador.iniciar();
};