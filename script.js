function Transpilar(){
    var input = (document.getElementById("inputText").value).split(/\r?\n/); 
    var classe;

    document.getElementById('outputText').value = "";

    input.forEach(function (item, indice, array){
        classe = ChecarLinha(item);
        if(classe != "")
            document.getElementById('outputText').value += classe + "\n";
    });
}

function ChecarLinha(item){
    const _PROPRIEDADE_ = " { get; set; }";
    if(item.indexOf("CREATE TABLE") > -1){
        item = item.replace("CREATE TABLE", "public class"); 
        item = item.replace("(", "{"); 
        return item;
    }
    if(item.indexOf(");") > -1){
        item = item.replace(");", "}");
        return item;
    } 
    if(item.indexOf("INT") > -1 || item.indexOf("int") > -1){
        var dividir = item.split(' ');
        var variavel = RetornarVariavel(dividir);
        item =  "    public int " + variavel + _PROPRIEDADE_; 
        return item; 
    }    
    if(item.indexOf("FLOAT") > -1 || item.indexOf("float") > -1){
        var dividir = item.split(' ');
        var variavel = RetornarVariavel(dividir);
        item =  "    public float " + variavel + _PROPRIEDADE_; 
        return item; 
    }
    if(item.indexOf("DOUBLE") > -1 || item.indexOf("double") > -1){
        var dividir = item.split(' ');
        var variavel = RetornarVariavel(dividir);
        item =  "    public double " + variavel + _PROPRIEDADE_;  
        return item;
    }  
    if(PodeSerString(item)){
        var dividir = item.split(' ');
        var variavel = RetornarVariavel(dividir);
        item =  "    public string " + variavel + _PROPRIEDADE_;  
        return item;
    }
    if(PodeSerData(item)){
        var dividir = item.split(' ');
        var variavel = RetornarVariavel(dividir);
        item =  "    public DateTime " + variavel + _PROPRIEDADE_;  
        return item;
    }
    return "";
}

function PodeSerString(atributo){
    if(atributo.indexOf("VARCHAR") > -1 || atributo.indexOf("varchar") > -1)
        return true;
    if(atributo.indexOf("CHAR") > -1 || atributo.indexOf("char") > -1)
        return true;
    return false;
}

function PodeSerData(atributo){
    if(atributo.indexOf("DATETIME") > -1 || atributo.indexOf("datetime") > -1)
        return true;
    if(atributo.indexOf("DATE") > -1 || atributo.indexOf("date") > -1)
        return true;
    return false;
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