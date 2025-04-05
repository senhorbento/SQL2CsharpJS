import {
    MODEL_TEMPLATE_CS,
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
} from './cSharpTemplate.js';

import JSZip from 'https://cdn.jsdelivr.net/npm/jszip@3.10.1/+esm';
import { CONSTANTS_TEMPLATE_TS, MODEL_TEMPLATE_TS } from './tsTemplate.js';

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

        let sizeFound = null;
        const varcharMatch = typePart.match(/\((\d+)\)/i);
        if (varcharMatch) {
            sizeFound = varcharMatch[1];
        }

        let csTypeinitialization = mapToCSharpType(type);
        if (csTypeinitialization)
            currentClass.properties.push({
                name: property,
                type: csTypeinitialization.type,
                initialization: csTypeinitialization.initialization,
                size: sizeFound && sizeFound.includes("MAX") ? "" : sizeFound
            });
    });

    if (currentClass) classes.push(currentClass);
    return classes;
}

function mapToCSharpType(sqlType) {
    if (sqlType.includes("CHAR") || sqlType.includes("TEXT")) return { type: "string", initialization: "\"\"" };
    if (sqlType.includes("TINYINT")) return { type: "sbyte", initialization: "0" };
    if (sqlType.includes("SMALLINT")) return { type: "short", initialization: "0" };
    if (sqlType.includes("BIGINT")) return { type: "long", initialization: "0" };
    if (sqlType.includes("INT")) return { type: "int", initialization: "0" };
    if (sqlType.includes("FLOAT")) return { type: "float", initialization: "0" };
    if (sqlType.includes("DOUBLE")) return { type: "double", initialization: "0" };
    if (sqlType.includes("DECIMAL")) return { type: "decimal", initialization: "0" };
    if (sqlType.includes("BOOLEAN") || sqlType.includes("BIT")) return { type: "bool", initialization: "0" };
    if (sqlType.includes("DATE")) return { type: "DateTime", initialization: "new()" };
    return { type: "string", initialization: "\"\"" };
}

export async function generateZipFromSql(sql) {
    const parsedClasses = parseSqlToClasses(sql);
    if (parsedClasses.length === 0) throw new Error("Invalid SQL input");

    const zip = new JSZip();

    parsedClasses.forEach(element => {
        const modelContent = MODEL_TEMPLATE_CS(element.name, element.properties);
        const repoContent = REPOSITORY_TEMPLATE(element.name, element.properties);
        const serviceContent = SERVICE_TEMPLATE(element.name, element.properties);
        const controllerContent = CONTROLLER_TEMPLATE(element.name);
        zip.file(`API/Models/${element.name}.cs`, modelContent);
        zip.file(`API/Repositories/${element.name}Repository.cs`, repoContent);
        zip.file(`API/Services/${element.name}Service.cs`, serviceContent);
        zip.file(`API/Controllers/${element.name}Controller.cs`, controllerContent);
        const modelTsContent = MODEL_TEMPLATE_TS(element.name, element.properties);
        zip.file(`frontend/Models/${element.name}.ts`, modelTsContent);

    });

    const dbContent = DB_TEMPLATE;
    const constantsContent = CONSTANTS_TEMPLATE;
    const tokenServiceContent = TOKENSERVICE_TEMPLATE;
    const launchSettingsContent = PROPERTIES_TEMPLATE;
    const csprojContent = CSPROJ_TEMPLATE;
    const apiSlnContent = APISLN_TEMPLATE;
    const programContent = PROGRAM_TEMPLATE;
    const programServices = PROGRAMSERVICE_TEMPLATE;

    zip.file(`API/Services/TokenService.cs`, tokenServiceContent);
    zip.file(`API/Core/DB.cs`, dbContent);
    zip.file(`API/Core/Constants.cs`, constantsContent);
    zip.file(`API/Properties/launchSettings.json`, launchSettingsContent);
    zip.file(`API/API.csproj`, csprojContent);
    zip.file(`API/API.sln`, apiSlnContent);
    zip.file(`API/Program.cs`, programContent);
    zip.file(`API/ProgramServices.cs`, programServices);

    const constantsTsContent = CONSTANTS_TEMPLATE_TS(parsedClasses)
    zip.file(`frontend/Models/Constants.ts`, constantsTsContent);

    const blob = await zip.generateAsync({ type: "blob" });
    return blob;
}