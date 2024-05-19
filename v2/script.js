const _PROPRIEDADE_ = " { get; set; }";
const _VISIBILIDADE_ = "    public ";
let criarCrud = false;

alterarCriarCrud = () => criarCrud = !criarCrud;

function LimparSaida() {
    document.getElementById("outputText").value = "";
}

function Converter() {
    LimparSaida();
    let input = (document.getElementById("inputText").value).split(/\r?\n/);
    input.forEach((linha) => {
        if (!linha) return;
        linha = TrocarCaracterEspecial(linha);
        var tabela = ChecarCriacaoTabela(linha);
        if (!tabela)
            var atributo = ChecarAtributo(linha);
        document.getElementById("outputText").value += `${tabela ? tabela : atributo ? atributo : linha}\n`;
    });
    if (criarCrud) CriarCrud();
}

function TrocarCaracterEspecial(linha) {
    if (linha.indexOf("(") > -1) linha = linha.replace("(", "{");
    if (linha.indexOf(");") > -1) linha = linha.replace(");", "}");
    if (linha.indexOf(")") > -1) linha = linha.replace(")", "}");
    return linha;
}

function ChecarAtributo(linha) {
    let nome, tipo;
    let nomeTipo = RetornarNomeTipo(linha.split(" "));

    if (!nomeTipo[1]) return false;

    nome = nomeTipo[0];
    tipo = nomeTipo[1].toUpperCase();

    return _VISIBILIDADE_ + ProcurarTipos(tipo) + nome;
}

function RetornarNomeTipo(linha) {
    let nomeTipo = [], qtd = 0;

    linha.forEach(function (parte) {
        parte = parte.trim();
        if (parte && qtd == 1) {
            nomeTipo.push(parte);
            qtd++;
        }
        if (parte && qtd == 0) {
            nomeTipo.push(`${parte}${_PROPRIEDADE_}`);
            qtd++;
        }
    });
    return nomeTipo;
}

function ProcurarTipos(linha) {
    if (linha.indexOf("TINYINT") > -1) return "sbyte ";
    if (linha.indexOf("SMALLINT") > -1) return "short ";
    if (linha.indexOf("BIGINT") > -1) return "long ";
    if (linha.indexOf("INT") > -1) return "int ";
    if (linha.indexOf("FLOAT") > -1) return "float ";
    if (linha.indexOf("DOUBLE") > -1) return "double ";
    if (linha.indexOf("DECIMAL") > -1) return "decimal ";
    if (linha.indexOf("CHAR") > -1) return "string ";
    if (linha.indexOf("TEXT") > -1) return "string ";
    if (linha.indexOf("BOOLEAN") > -1) return "bool ";
    if (linha.indexOf("DATE") > -1) return "DateTime ";
    return "string ";
}

function ChecarCriacaoTabela(linha) {
    if (linha.toUpperCase().indexOf("CREATE TABLE") > -1)
        return linha = linha.replace(/CREATE TABLE/gi, "public class");
    return false;
}

function DbParameters(atributos) {
    let funcao = "";
    atributos.forEach(atributo => {
        funcao += `db.Parameter("@${atributo}", obj.${atributo});\n`;
    });
    funcao += "db.Execute();\n}\ncatch\n{\nthrow;\n}\n}\n\n";
    return funcao;
}

CriarFuncaoVoid = (classe, sql, atributos, funcao) =>
    `public int ${funcao}(${classe} obj)\n{\nusing DB db = new();\ntry\n{\ndb.NewCommand(\"${sql}\");\n${DbParameters(atributos)}`;


CriarFuncaoRetornoLista = (classe, sql, atributos) =>
    `public List<${classe}> Select()\n{\nusing DB db = new();\ntry\n{\ndb.NewCommand(\"${sql}\");\n${DbParameters([])}`;

function CriarCrud() {
    const csharp = document.getElementById("outputText").value.split("\n");
    const nomeClasse = csharp[0].split(" ")[2];
    let atributos = [];
    let tipos = [];
    let atributosVirgula = "";
    let atributosIgual = "";
    csharp.forEach(linha => {
        linha = linha.split(" ");
        if (linha[6] != undefined) {
            atributos.push(linha[6]);
            tipos.push(linha[5]);
            atributosVirgula += `${linha[6]}, `;
            atributosIgual += `${linha[6]}=@${linha[6]}, `;
        }
    });
    atributosVirgula = atributosVirgula.slice(0, -2);
    atributosIgual = atributosIgual.slice(0, -2);
    const INSERT = `INSERT INTO ${nomeClasse} (${atributosVirgula}) VALUES (${atributosVirgula});`;
    const SELECT = `SELECT ${atributosVirgula} FROM ${nomeClasse};`;
    const UPDATE = `UPDATE ${nomeClasse} SET ${atributosIgual} WHERE ${atributosIgual};`;
    const DELETE = `DELETE FROM ${nomeClasse} WHERE ${atributosIgual};`;
    document.getElementById("outputText").value += CriarFuncaoVoid(nomeClasse, INSERT, atributos, "Create");
    document.getElementById("outputText").value += CriarFuncaoRetornoLista(nomeClasse, SELECT, atributos);
    document.getElementById("outputText").value += CriarFuncaoVoid(nomeClasse, UPDATE, atributos, "Update");
    document.getElementById("outputText").value += CriarFuncaoVoid(nomeClasse, DELETE, atributos, "Delete");
}