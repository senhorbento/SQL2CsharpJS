const _PROPRIEDADE_ = " { get; set; }";
const _VISIBILIDADE_ = "    public ";

function LimparSaida(){
    document.getElementById('outputText').value = "";
}

function Transpilar(){
    LimparSaida();
    let input = (document.getElementById("inputText").value).split(/\r?\n/); 
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

function TrocarCaracterEspecial(linha){
    if(linha.indexOf("(") > -1)  linha = linha.replace("(", "{");
    if(linha.indexOf(");") > -1) linha = linha.replace(");", "}");
    if(linha.indexOf(")") > -1)  linha = linha.replace(")", "}");
    return linha;
}

function ChecarAtributo(atributo){
    let nome = RetornarNomeTipo(atributo.split(' '));

    if(nome[1] == undefined) return atributo;

    let tipo = nome[1].toUpperCase();
    nome = nome[0];

    if(ProcurarTipos(tipo)) return _VISIBILIDADE_ + ProcurarTipos(tipo) + nome;
    return atributo;
}

function RetornarNomeTipo(linha){
    let variavel = [], qtd = 0;

    linha.forEach(function (parte){
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

function ProcurarTipos(linha){
    if(linha.indexOf("TINYINT") > -1)  return "sbyte ";
    if(linha.indexOf("SMALLINT") > -1) return "short "; 
    if(linha.indexOf("BIGINT") > -1)   return "long "; 
    if(linha.indexOf("INT") > -1)      return "int ";
    if(linha.indexOf("FLOAT") > -1)    return "float "; 
    if(linha.indexOf("DOUBLE") > -1)   return "double ";  
    if(linha.indexOf("DECIMAL") > -1)  return "decimal ";  
    if(linha.indexOf("CHAR") > -1)     return "string ";  
    if(linha.indexOf("DATE") > -1)     return "DateTime ";
    return false;
}

function ChecarCriacaoTabela(linha){
    if(linha.toUpperCase().indexOf("CREATE TABLE") > -1){
        linha = linha.replace(/CREATE TABLE/gi, "public class");  
        return linha + "\n";
    }
    return linha;
}