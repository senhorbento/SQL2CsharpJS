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
    let className = "";
    let properties = [];

    lines.forEach((line) => {
        line = line.trim();
        if (!line) return;

        if (line.toUpperCase().startsWith("CREATE TABLE")) {
            if (currentClass) {
                currentClass.properties = properties;
                classes.push(currentClass);
            }

            const match = line.match(/CREATE TABLE (\w+)/i);
            if (match) {
                className = match[1];
                currentClass = { name: className, properties: [] };
                properties = [];
            }
            return;
        }

        if (line === ")" || line === ");") return;

        const [namePart, typePart] = line.split(/\s+/);
        if (!namePart || !typePart) return;

        const property = namePart.replace(/[,()]/g, "");
        let type = typePart.replace(/\(.*?\)/g, "").toUpperCase();

        let csType = mapToCSharpType(type);
        if (csType) {
            properties.push({ name: property, type: csType });
            currentClass.properties.push({ name: property, type: csType });
        }
    });

    if (currentClass) {
        currentClass.properties = properties;
        classes.push(currentClass);
    }

    return classes;
}

function mapToCSharpType(sqlType) {
    if (sqlType.includes("CHAR") || sqlType.includes("TEXT")) return "string";
    if (sqlType.includes("TINYINT")) return "sbyte";
    if (sqlType.includes("SMALLINT")) return "short";
    if (sqlType.includes("BIGINT")) return "long";
    if (sqlType.includes("INT")) return "int";
    if (sqlType.includes("FLOAT")) return "float";
    if (sqlType.includes("DOUBLE")) return "double";
    if (sqlType.includes("DECIMAL")) return "decimal";
    if (sqlType.includes("BOOLEAN") || sqlType.includes("BIT")) return "bool";
    if (sqlType.includes("DATE")) return "DateTime";
    return "string";
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