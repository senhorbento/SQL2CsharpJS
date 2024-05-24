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
    if (linha.indexOf("CHAR") > -1) return "string ";
    if (linha.indexOf("TEXT") > -1) return "string ";
    if (linha.indexOf("TINYINT") > -1) return "sbyte ";
    if (linha.indexOf("SMALLINT") > -1) return "short ";
    if (linha.indexOf("BIGINT") > -1) return "long ";
    if (linha.indexOf("INT") > -1) return "int ";
    if (linha.indexOf("FLOAT") > -1) return "float ";
    if (linha.indexOf("DOUBLE") > -1) return "double ";
    if (linha.indexOf("DECIMAL") > -1) return "decimal ";
    if (linha.indexOf("BOOLEAN") > -1) return "bool ";
    if (linha.indexOf("BIT") > -1) return "bool ";
    if (linha.indexOf("DATE") > -1) return "DateTime ";
    return "string ";
}

function ChecarCriacaoTabela(linha) {
    if (linha.toUpperCase().indexOf("CREATE TABLE") > -1)
        return linha = linha.replace(/CREATE TABLE/gi, "public class");
    return false;
}

DbParameters = (atributos) => {
    let funcao = "";
    atributos.forEach(atributo => {
        funcao += `\tdb.Parameter("@${atributo}", obj.${atributo});\n`;
    });
    funcao = funcao.slice(0, -1);
    funcao += `
        db.Execute();
        }
        catch
        {
            throw;
        }
    }\n`;
    return funcao;
}

function CriarFuncaoAtributos (classe, atributos, tipos) {
    let funcao = `public dynamic SetAttributes(SqlDataReader reader) => new ${classe}() {\n`;
    for(let i = 0; i < atributos.length; i++){
        if(tipos[i]=='string')
            funcao += `\t${atributos[i]} = reader["${atributos[i]}"].ToString() ?? "",\n`;
        if(tipos[i]!='string')
            funcao += `\t${atributos[i]} = (${tipos[i]})reader["${atributos[i]}"],\n`;
    }
    funcao += `};\n`;
    return funcao;
}

CriarFuncaoVoid = (classe, sql, atributos, funcao) =>
    `public int ${funcao}(${classe} obj)
    {
        using DB db = new();
        try
        {
        db.NewCommand(\"${sql}\");
        ${DbParameters(atributos)}`;


CriarFuncaoRetornoLista = (classe, sql) =>
    `public List<${classe}> SelectAll()
    {
        using DB db = new();
        db.NewCommand(\"${sql}\");
        List<${classe}> list = [];
        using SqlDataReader reader = db.Execute();
        while (reader.Read())
        {
            list.Add(SetAttributes(reader));
        }
        return list;
    }\n`;

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
    document.getElementById("outputText").value += CriarFuncaoAtributos(nomeClasse, atributos, tipos);
    document.getElementById("outputText").value += CriarFuncaoVoid(nomeClasse, INSERT, atributos, "Insert");
    document.getElementById("outputText").value += CriarFuncaoRetornoLista(nomeClasse, SELECT);
    document.getElementById("outputText").value += CriarFuncaoVoid(nomeClasse, UPDATE, atributos, "Update");
    document.getElementById("outputText").value += CriarFuncaoVoid(nomeClasse, DELETE, atributos, "Delete");
}
