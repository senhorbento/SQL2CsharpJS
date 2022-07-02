function ChecarEspecial(linha){
    if(linha.toUpperCase().indexOf("CREATE TABLE") > -1){
        linha = linha.replace(/CREATE TABLE/gi, "public class"); 
        linha = linha.replace("(", "{"); 
        return linha + "\n";
    }
    if(linha.indexOf(");") > -1){
        linha = linha.replace(");", "}");
        return linha;
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
    if(atributo.indexOf("MEDIUMINT") > -1)
        return true;
    if(atributo.indexOf("INT") > -1)
        return true;
    return false;
}

function ChecarString(atributo){
    if(atributo.indexOf("VARCHAR") > -1)
        return true;
    if(atributo.indexOf("CHAR") > -1)
        return true;
    return false;
}

function ChecarData(atributo){
    if(atributo.indexOf("DATETIME") > -1)
        return true;
    if(atributo.indexOf("DATE") > -1)
        return true;
    return false;
}

function ChecarLinha(atributo){
    var variavel = RetornarPropriedade(atributo.split(' '));
    atributo = atributo.toUpperCase();

    if(atributo.indexOf("FLOAT") > -1){
        atributo =  "    public float " + variavel; 
        return atributo; 
    }
    if(atributo.indexOf("DOUBLE") > -1){
        atributo =  "    public double " + variavel;  
        return atributo;
    }  
    if(atributo.indexOf("DECIMAL") > -1){
        atributo =  "    public decimal " + variavel;  
        return atributo;
    } 
    if(atributo.indexOf("TINYINT") > -1){
        atributo =  "    public sbyte " + variavel; 
        return atributo; 
    } 
    if(atributo.indexOf("SMALLINT") > -1){
        atributo =  "    public short " + variavel; 
        return atributo; 
    } 
    if(atributo.indexOf("BIGINT") > -1){
        atributo =  "    public long " + variavel; 
        return atributo; 
    }
    if(ChecarInteiro(atributo)){
        atributo =  "    public int " + variavel; 
        return atributo; 
    }  
    if(ChecarString(atributo)){
        atributo =  "    public string " + variavel;  
        return atributo;
    }
    if(ChecarData(atributo)){
        atributo =  "    public DateTime " + variavel;  
        return atributo;
    }
    return "";
}

function Transpilar(){
    var input = (document.getElementById("inputText").value).split(/\r?\n/); 
    document.getElementById('outputText').value = "";

    input.forEach(function(linha){
        var classe;
        classe = ChecarEspecial(linha);
        if(classe == "")
            classe = ChecarLinha(linha); 
        if(classe != "")
            document.getElementById('outputText').value += classe;
    });
}