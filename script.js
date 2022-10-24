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

function ChecarAtributo(linha){
    let nome, tipo;
    let nomeTipo = RetornarNomeTipo(linha.split(' '));

    if(nomeTipo[1] == undefined) return linha;

    nome = nomeTipo[0];
    tipo = nomeTipo[1].toUpperCase();

    if(ProcurarTipos(tipo)) return _VISIBILIDADE_ + ProcurarTipos(tipo) + nome;
    return linha;
}

function RetornarNomeTipo(linha){
    let nomeTipo = [], qtd = 0;

    linha.forEach(function (parte){
        if(parte != '' && qtd == 1){
            nomeTipo.push(parte);
            qtd++;
        }
        if(parte != '' && qtd == 0){
            nomeTipo.push(parte +  _PROPRIEDADE_ + "\n");
            qtd++;
        } 
    });
    return nomeTipo;
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
    if(linha.indexOf("TEXT") > -1)     return "string ";  
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