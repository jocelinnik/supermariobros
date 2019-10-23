var Interface = (function(){
    var instancia;

    function Interface(){
        var canvas = document.getElementById("jogo");
        var contexto = canvas.getContext("2d");
        var that = this;

        this.getWidth = function(){
            return canvas.width;
        };

        this.getHeight = function(){
            return canvas.height;
        };

        this.setWidth = function(width){
            canvas.width = width;
        };

        this.setHeight = function(height){
            canvas.height = height;
        };

        this.getCanvas = function(){
            return canvas;
        };

        this.exibirCanvas = function(){
            canvas.style.display = "block";
        };
 
        this.esconderCanvas = function(){
            canvas.style.display = "none";
        };

        this.limparTela = function(x, y, width, height){
            contexto.clearRect(x, y, width, height);
        };

        this.rolarAnimacao = function(x, y){
            contexto.translate(x, y);
        };

        this.desenhar = function(imagem, sx, sy, width, height, x, y, width, height){
            contexto.drawImage(imagem, sx, sy, width, height, x, y, width, height);
        };

        this.desenharCaixa = function(x, y, width, height){
            contexto.rect(x, y, width, height);
            contexto.fillStyle = "black";
            contexto.fill();
        };

        this.escrever = function(text, x, y){
            contexto.font = "20px SuperMario256";
            contexto.fillStyle = "white";
            contexto.fillText(text, x, y);
        };
    }

    return {
        getInstancia: function(){
            if(instancia==null){
                instancia = new Interface();
            }

            return instancia;
        }
    };
})();