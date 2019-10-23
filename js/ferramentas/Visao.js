var Visao = (function(){
    var instancia;

    function Visao(){
        this.getConteiner = function(){
            var elemento = document.getElementsByClassName("main-wrapper")[0];

            return elemento;
        };

        this.create = function(elemento){
            var elemento = document.createElement(elemento);

            return elemento;
        };

        this.addClass = function(elemento, classe){
            elemento.className = classe;
        };

        this.append = function(elementoPai, elementoFilho){
            if(elementoFilho.className=="score-wrapper"){
                elementoPai.insertBefore(elementoFilho, elementoPai.firstChild);
            }else if(elementoPai.lastChild&&elementoPai.lastChild.className=="score-wrapper"){
                elementoPai.insertBefore(elementoFilho, elementoPai.lastChild);
            }else{
                elementoPai.appendChild(elementoFilho);
            }
        };

        this.appendToBody = function(elementoFilho){
            document.body.appendChild(elementoFilho);
        };

        this.remove = function(elementoPai, elementoFilho){
            elementoPai.removeChild(elementoFilho);
        };

        this.removeFromBody = function(elementoFilho) {
            document.body.removeChild(elementoFilho);
        };

        this.style = function(elemento, styles){
            for(var property in styles){
                elemento.style[property] = styles[property];
            }
        };

        this.setHTML = function(elemento, conteudo){
            elemento.innerHTML = conteudo;
        };
    }

    return {
        getInstancia: function(){
            if(instancia==null){
                instancia = new Visao();
            }

            return instancia;
        }
    };
})();