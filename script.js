function ChecarEspecial(linha){	
    console.log(linha.length)
    if(linha == "(")
        return "{\n";
    if(linha == ")")
        return "}\n";
    if(linha == "" || linha.length == 1)
        return -2;
    if(linha.indexOf(");") > -1){
        linha = linha.replace(");", "}");
        return linha + "\n";
    }
    if(linha.toUpperCase().indexOf("CREATE TABLE") > -1){
        linha = linha.replace(/CREATE TABLE/gi, "public class"); 
        linha = linha.replace("(", "{"); 
        return linha + "\n";
    }
    return -1;
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

function ChecarLinha(atributo){
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
    return -1;
}

function Transpilar(){
    var input = (document.getElementById("inputText").value).split(/\r?\n/); 
    document.getElementById('outputText').value = "";

    input.forEach(function(linha){
        var classe;
        classe = ChecarEspecial(linha);
        if(classe == -1)
            classe = ChecarLinha(linha);
        if(classe.length > 0)
            document.getElementById('outputText').value += classe;
    });
}