function ChecarEspecial(linha){
    if(linha.toUpperCase().indexOf("CREATE TABLE") > -1){
        linha = linha.replace(/CREATE TABLE/gi, "public class"); 
        linha = linha.replace("(", "{"); 
        return linha + "\n";
    }
    if(linha.toUpperCase().indexOf(");") > -1){
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
    if(atributo.toUpperCase().indexOf("MEDIUMINT") > -1)
        return true;
    if(atributo.toUpperCase().indexOf("INT") > -1)
        return true;
    return false;
}

function ChecarString(atributo){
    if(atributo.toUpperCase().indexOf("VARCHAR") > -1)
        return true;
    if(atributo.toUpperCase().indexOf("CHAR") > -1)
        return true;
    return false;
}

function ChecarData(atributo){
    if(atributo.toUpperCase().indexOf("DATETIME") > -1)
        return true;
    if(atributo.toUpperCase().indexOf("DATE") > -1)
        return true;
    return false;
}

function ChecarLinha(atributo){
    var variavel = RetornarPropriedade(atributo.split(' '));
    
    if(atributo.toUpperCase().indexOf("FLOAT") > -1){
        atributo =  "    public float " + variavel; 
        return atributo; 
    }
    if(atributo.toUpperCase().indexOf("DOUBLE") > -1){
        atributo =  "    public double " + variavel;  
        return atributo;
    }  
    if(atributo.toUpperCase().indexOf("DECIMAL") > -1){
        atributo =  "    public decimal " + variavel;  
        return atributo;
    } 
    if(atributo.toUpperCase().indexOf("TINYINT") > -1){
        atributo =  "    public sbyte " + variavel; 
        return atributo; 
    } 
    if(atributo.toUpperCase().indexOf("SMALLINT") > -1){
        atributo =  "    public short " + variavel; 
        return atributo; 
    } 
    if(atributo.toUpperCase().indexOf("BIGINT") > -1){
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