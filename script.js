function ChecarCriacaoTabela(checar){
    if(checar.toUpperCase().indexOf("CREATE TABLE") > -1){
        checar = checar.replace(/CREATE TABLE/gi, "public class");  
        if(checar.indexOf("(") > -1)
            checar = checar.replace("(", "{"); 
        return checar + "\n";
    }
    return checar;
}

function TrocarCaracterEspecial(checar){
    var modificado = checar;
    var qtd = 0;
    if(modificado.indexOf("(") > -1){
        modificado = modificado.replace("(", "{"); 
        qtd++;
    }
    if(modificado.indexOf(");") > -1){
        modificado = modificado.replace(");", "}"); 
        qtd++;
    }
    if(modificado.indexOf(")") > -1){
        modificado = modificado.replace(")", "}");
        qtd++;
    }
    if(modificado.match(/[a-z]/i)){
        qtd++;
    }
    return qtd > 0 ? modificado : "";
}

function RetornarNomeTipo(dividir){
    const _PROPRIEDADE_ = " { get; set; }";
    var variavel = [];
    var qtd = 0;

    dividir.forEach(function (parte){
        if(parte != '' && qtd == 1){
            variavel.push(parte);
            qtd++;
        }
        if(parte != '' && qtd == 0){
            variavel.push(parte +  _PROPRIEDADE_ + "\n");
            qtd++;
        }
    });
    return variavel;
}

function ChecarAtributo(atributo){
    var nome = RetornarNomeTipo(atributo.split(' '));
    var tipo = nome[1].toUpperCase();
    nome = nome[0];

    if(tipo.indexOf("FLOAT") > -1){
        atributo =  "    public float " + nome; 
        return atributo; 
    }
    if(tipo.indexOf("DOUBLE") > -1){
        atributo =  "    public double " + nome;  
        return atributo;
    }  
    if(tipo.indexOf("DECIMAL") > -1){
        atributo =  "    public decimal " + nome;  
        return atributo;
    } 
    if(tipo.indexOf("TINYINT") > -1){
        atributo =  "    public sbyte " + nome; 
        return atributo; 
    } 
    if(tipo.indexOf("SMALLINT") > -1){
        atributo =  "    public short " + nome; 
        return atributo; 
    } 
    if(tipo.indexOf("BIGINT") > -1){
        atributo =  "    public long " + nome; 
        return atributo; 
    }
    if(tipo.indexOf("INT") > -1){
        atributo =  "    public int " + nome; 
        return atributo; 
    }  
    if(tipo.indexOf("CHAR") > -1){
        atributo =  "    public string " + nome;  
        return atributo;
    }
    if(tipo.indexOf("DATE") > -1){
        atributo =  "    public DateTime " + nome;  
        return atributo;
    }
    return atributo;
}

function Transpilar(){
    var input = (document.getElementById("inputText").value).split(/\r?\n/); 
    document.getElementById('outputText').value = "";

    input.forEach(function(linha){
        var classe, modificado;
        modificado = TrocarCaracterEspecial(linha);
        if(modificado != "" && modificado.match(/[a-z]/i)){
            classe = ChecarAtributo(linha);
            if(classe == linha)
                classe = ChecarCriacaoTabela(linha);
            if(classe == linha)
                classe = -1;
        }
        else
            classe = modificado + "\n";
        if(modificado != "" && classe != -1)
            document.getElementById('outputText').value += classe;
    });
}