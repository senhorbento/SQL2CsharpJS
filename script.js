const _PROPRIEDADE_ = " { get; set; }";
const VISIBILIDADE = "    public ";

function ChecarCriacaoTabela(checar){
    if(checar.toUpperCase().indexOf("CREATE TABLE") > -1){
        checar = checar.replace(/CREATE TABLE/gi, "public class");  
        return checar + "\n";
    }
    return checar;
}

function TrocarCaracterEspecial(checar){
    if(checar.indexOf("(") > -1)  checar = checar.replace("(", "{");
    if(checar.indexOf(");") > -1) checar = checar.replace(");", "}");
    if(checar.indexOf(")") > -1)  checar = checar.replace(")", "}");
    return checar;
}

function RetornarNomeTipo(dividir){
    let variavel = [], qtd = 0;

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

function Inteiros(tipo){
    if(tipo.indexOf("TINYINT") > -1)  return "sbyte ";
    if(tipo.indexOf("SMALLINT") > -1) return "short "; 
    if(tipo.indexOf("BIGINT") > -1)   return "long "; 
    if(tipo.indexOf("INT") > -1)      return "int "; 
    return false;
}

function OutrosTipos(tipo){
    if(tipo.indexOf("FLOAT") > -1)   return "float "; 
    if(tipo.indexOf("DOUBLE") > -1)  return "double ";  
    if(tipo.indexOf("DECIMAL") > -1) return "decimal ";  
    if(tipo.indexOf("CHAR") > -1)    return "string ";  
    if(tipo.indexOf("DATE") > -1)    return "DateTime ";
    return false;
}

function ChecarAtributo(atributo){
    let nome = RetornarNomeTipo(atributo.split(' '));

    if(nome[1] == undefined) return atributo;

    let tipo = nome[1].toUpperCase();
    nome = nome[0];

    if(Inteiros(tipo)) return VISIBILIDADE + Inteiros(tipo) + nome;
    if(OutrosTipos(tipo)) return VISIBILIDADE + OutrosTipos(tipo) + nome;
    return atributo;
}

function LimparSaida(){
    document.getElementById('outputText').value = "";
}

function Transpilar(){
    let input = (document.getElementById("inputText").value).split(/\r?\n/); 
    LimparSaida();
    input.forEach(function(linha){
        let classe;
        let modificado = TrocarCaracterEspecial(linha);

        if(modificado.match(/[a-z]/i)){
            classe = ChecarAtributo(linha);

            if(classe == linha) classe = ChecarCriacaoTabela(modificado);
            if(classe == linha) classe = -1;
        }
        else classe = modificado + "\n";
        if(modificado != "" && classe != -1) document.getElementById('outputText').value += classe;
    });
}