function Transpilar(){
    const _PROPRIEDADE_ = " { get; set; }";

    var input = (document.getElementById("inputText").value).split(/\r?\n/); 
    var classe;

    document.getElementById('outputText').value = "";

    input.forEach(function (item, indice, array){
        if(item.indexOf("CREATE TABLE") > -1){
            item = item.replace("CREATE TABLE", "public class"); 
            item = item.replace("(", "{"); 
        }
        else if(item.indexOf(");") > -1)
            item = item.replace(");", "}"); 
        else if(item.indexOf("INT") > -1 || item.indexOf("int") > -1){
            var dividir = item.split(' ');
            var variavel = RetornarVariavel(dividir);
            item =  "    public int " + variavel + _PROPRIEDADE_;  
        }    
        else if(item.indexOf("DOUBLE") > -1 || item.indexOf("double") > -1){
            var dividir = item.split(' ');
            var variavel = RetornarVariavel(dividir);
            item =  "    public double " + variavel + _PROPRIEDADE_;  
        }  
        else if(item.indexOf("FLOAT") > -1 || item.indexOf("float") > -1){
            var dividir = item.split(' ');
            var variavel = RetornarVariavel(dividir);
            item =  "    public float " + variavel + _PROPRIEDADE_;  
        }
        else if(PodeSerString(item) == true){
            var dividir = item.split(' ');
            var variavel = RetornarVariavel(dividir);
            item =  "    public string " + variavel + _PROPRIEDADE_;  
        }
        document.getElementById('outputText').value += item + "\n";
    });
}

function PodeSerString(atributo){
    var lista = ["VARCHAR","CHAR","DATETIME","DATE","varchar","char","datetime","date"];
    var retorno = false;
    lista.forEach(function (item, indice, array){
        if(atributo.indexOf(item) > -1)
            retorno = true;
    });
    return retorno;
}

function RetornarVariavel(dividir){
    var variavel, qtd =0;
    dividir.forEach(function (parte, indice, array){
        if(parte != '' && qtd == 0){
            variavel = parte;
            qtd++;
        }
    });
    return variavel;
}