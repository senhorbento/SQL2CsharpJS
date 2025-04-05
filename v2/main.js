import {
    MODEL_TEMPLATE,
    REPOSITORY_TEMPLATE,
    SERVICE_TEMPLATE,
    CONTROLLER_TEMPLATE,
    DB_TEMPLATE,
    CONSTANTS_TEMPLATE,
    TOKENSERVICE_TEMPLATE,
    PROPERTIES_TEMPLATE,
    CSPROJ_TEMPLATE,
    APISLN_TEMPLATE,
    PROGRAM_TEMPLATE,
    PROGRAMSERVICE_TEMPLATE
} from './constants.js';

import JSZip from 'https://cdn.jsdelivr.net/npm/jszip@3.10.1/+esm';

export function parseSqlToClasses(input) {
    const lines = input.split(/\r?\n/);
    let currentClass = null;
    let classes = [];

    lines.forEach((line) => {
        line = line.trim();
        if (!line) return;

        if (line.toUpperCase().startsWith("CREATE TABLE")) {
            if (currentClass)
                classes.push(currentClass);

            const match = line.match(/CREATE TABLE (\w+)/i);
            if (match)
                currentClass = { name: match[1], properties: [] };
            return;
        }

        if (line === ")" || line === ");") return;

        const [namePart, typePart] = line.split(/\s+/);
        if (!namePart || !typePart) return;

        const property = namePart.replace(/[,()]/g, "");
        let type = typePart.replace(/\(.*?\)/g, "").toUpperCase();

        let csTypeInicialization = mapToCSharpType(type);
        if (csTypeInicialization) currentClass.properties.push({ name: property, type: csTypeInicialization.type, inicialization: csTypeInicialization.inicialization });
    });

    if (currentClass) classes.push(currentClass);

    return classes;
}

function mapToCSharpType(sqlType) {
    if (sqlType.includes("CHAR") || sqlType.includes("TEXT")) return { type: "string", inicialization: "\"\"" };
    if (sqlType.includes("TINYINT")) return { type: "sbyte", inicialization: "0" };
    if (sqlType.includes("SMALLINT")) return { type: "short", inicialization: "0" };
    if (sqlType.includes("BIGINT")) return { type: "long", inicialization: "0" };
    if (sqlType.includes("INT")) return { type: "int", inicialization: "0" };
    if (sqlType.includes("FLOAT")) return { type: "float", inicialization: "0" };
    if (sqlType.includes("DOUBLE")) return { type: "double", inicialization: "0" };
    if (sqlType.includes("DECIMAL")) return { type: "decimal", inicialization: "0" };
    if (sqlType.includes("BOOLEAN") || sqlType.includes("BIT")) return { type: "bool", inicialization: "0" };
    if (sqlType.includes("DATE")) return { type: "DateTime", inicialization: "new()" };
    return { type: "string", inicialization: "\"\"" };
}

export async function generateZipFromSql(sql) {
    const parsedClasses = parseSqlToClasses(sql);
    if (parsedClasses.length === 0) throw new Error("Invalid SQL input");

    const zip = new JSZip();

    parsedClasses.forEach(element => {
        const modelContent = MODEL_TEMPLATE(element.name, element.properties);
        const repoContent = REPOSITORY_TEMPLATE(element.name, element.properties);
        const serviceContent = SERVICE_TEMPLATE(element.name, element.properties);
        const controllerContent = CONTROLLER_TEMPLATE(element.name);
        zip.file(`API/Models/${element.name}.cs`, modelContent);
        zip.file(`API/Repositories/${element.name}Repository.cs`, repoContent);
        zip.file(`API/Services/${element.name}Service.cs`, serviceContent);
        zip.file(`API/Controllers/${element.name}Controller.cs`, controllerContent);
    });

    const dbContent = DB_TEMPLATE;
    const constantsContent = CONSTANTS_TEMPLATE;
    const tokenServiceContent = TOKENSERVICE_TEMPLATE;
    const launchSettingsContent = PROPERTIES_TEMPLATE;
    const csprojContent = CSPROJ_TEMPLATE;
    const apiSlnContent = APISLN_TEMPLATE;
    const programContent = PROGRAM_TEMPLATE;
    const ProgramServices = PROGRAMSERVICE_TEMPLATE;

    zip.file(`API/Services/TokenService.cs`, tokenServiceContent);
    zip.file(`API/Core/DB.cs`, dbContent);
    zip.file(`API/Core/Constants.cs`, constantsContent);
    zip.file(`API/Properties/launchSettings.json`, launchSettingsContent);
    zip.file(`API/API.csproj`, csprojContent);
    zip.file(`API/API.sln`, apiSlnContent);
    zip.file(`API/Program.cs`, programContent);
    zip.file(`API/ProgramServices.cs`, ProgramServices);

    const blob = await zip.generateAsync({ type: "blob" });
    return blob;
}