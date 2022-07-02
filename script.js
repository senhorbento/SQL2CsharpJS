function ChecarEspecial(item){
    if(item.indexOf("CREATE TABLE") > -1){
        item = item.replace("CREATE TABLE", "public class"); 
        item = item.replace("(", "{"); 
        return item + "\n";
    }
    if(item.indexOf(");") > -1){
        item = item.replace(");", "}");
        return item;
    }
    return "";
}

function RetornarPropriedade(dividir){
    const _PROPRIEDADE_ = " { get; set; }";
    var variavel, qtd = 0;

    dividir.forEach(function (parte){
        if(parte != '' && qtd == 0){
            variavel = parte;
            qtd++;
        }
    });
    return variavel +  _PROPRIEDADE_ + "\n";
}

function ChecarInteiro(atributo){
    if(atributo.indexOf("MEDIUMINT") > -1 || atributo.indexOf("mediumint") > -1)
        return true;
    if(atributo.indexOf("INT") > -1 || atributo.indexOf("int") > -1)
        return true;
    return false;
}

function ChecarString(atributo){
    if(atributo.indexOf("VARCHAR") > -1 || atributo.indexOf("varchar") > -1)
        return true;
    if(atributo.indexOf("CHAR") > -1 || atributo.indexOf("char") > -1)
        return true;
    return false;
}

function ChecarData(atributo){
    if(atributo.indexOf("DATETIME") > -1 || atributo.indexOf("datetime") > -1)
        return true;
    if(atributo.indexOf("DATE") > -1 || atributo.indexOf("date") > -1)
        return true;
    return false;
}

function ChecarLinha(item){
    var variavel = RetornarPropriedade(item.split(' '));
    
    if(item.indexOf("FLOAT") > -1 || item.indexOf("float") > -1){
        item =  "    public float" + variavel; 
        return item; 
    }
    if(item.indexOf("DOUBLE") > -1 || item.indexOf("double") > -1){
        item =  "    public double" + variavel;  
        return item;
    }  
    if(item.indexOf("DECIMAL") > -1 || item.indexOf("decimal") > -1){
        item =  "    public decimal" + variavel;  
        return item;
    } 
    if(item.indexOf("TINYINT") > -1 || item.indexOf("tinyint") > -1){
        item =  "    public sbyte" + variavel; 
        return item; 
    } 
    if(item.indexOf("SMALLINT") > -1 || item.indexOf("smallint") > -1){
        item =  "    public short" + variavel; 
        return item; 
    } 
    if(item.indexOf("BIGINT") > -1 || item.indexOf("bigint") > -1){
        item =  "    public long" + variavel; 
        return item; 
    }
    if(ChecarInteiro(item)){
        item =  "    public int" + variavel; 
        return item; 
    }  
    if(ChecarString(item)){
        item =  "    public string" + variavel;  
        return item;
    }
    if(ChecarData(item)){
        item =  "    public DateTime" + variavel;  
        return item;
    }
    return "";
}

function Transpilar(){
    var input = (document.getElementById("inputText").value).split(/\r?\n/); 
    document.getElementById('outputText').value = "";

    input.forEach(function(item){
        var classe;
        classe = ChecarEspecial(item);
        if(classe != "")
            document.getElementById('outputText').value += classe;
        else{
            classe = ChecarLinha(item);
            if(classe != "")
                document.getElementById('outputText').value += classe;
        }  
    });
}