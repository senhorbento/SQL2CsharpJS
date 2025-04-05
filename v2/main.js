import {
    MODEL_TEMPLATE,
    REPOSITORY_TEMPLATE,
    SERVICE_TEMPLATE,
    CONTROLLER_TEMPLATE,
    DB_TEMPLATE,
    CONSTANTS_TEMPLATE
} from './constants.js';

import JSZip from 'https://cdn.jsdelivr.net/npm/jszip@3.10.1/+esm';

let className = "";
let properties = [];
let types = [];

export function parseSqlToClass(input) {
    const lines = input.split(/\r?\n/);
    let props = [];
    className = "";
    properties = [];
    types = [];

    lines.forEach((line) => {
        line = line.trim();
        if (!line || line.startsWith("--")) return;

        if (line.toUpperCase().startsWith("CREATE TABLE")) {
            const match = line.match(/CREATE TABLE (\w+)/i);
            if (match) className = match[1];
            return;
        }

        if (line === ")" || line === ");") return;

        const [namePart, typePart] = line.split(/\s+/);
        if (!namePart || !typePart) return;

        const property = namePart.replace(/[,()]/g, "");
        let type = typePart.replace(/\(.*?\)/g, "").toUpperCase();

        let csType = mapToCSharpType(type);
        if (csType) {
            properties.push(property);
            types.push(csType);
            props.push({ name: property, type: csType });
        }
    });

    return props;
}

export function getClassName(sql) {
    const match = sql.match(/CREATE TABLE (\w+)/i);
    return match ? match[1] : '';
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
    const parsedProps = parseSqlToClass(sql);
    if (!className || parsedProps.length === 0) throw new Error("Invalid SQL input");

    const zip = new JSZip();

    const modelContent = MODEL_TEMPLATE(className, parsedProps);
    const repoContent = REPOSITORY_TEMPLATE(className, parsedProps);
    const serviceContent = SERVICE_TEMPLATE(className, parsedProps);
    const controllerContent = CONTROLLER_TEMPLATE(className);
    const dbContent = DB_TEMPLATE;
    const constantsContent = CONSTANTS_TEMPLATE;

    zip.file(`Models/${className}.cs`, modelContent);
    zip.file(`Repositories/${className}Repository.cs`, repoContent);
    zip.file(`Services/${className}Service.cs`, serviceContent);
    zip.file(`Controllers/${className}Controller.cs`, controllerContent);
    zip.file(`Core/DB.cs`, dbContent);
    zip.file(`Core/Constants.cs`, constantsContent);

    const blob = await zip.generateAsync({ type: "blob" });
    return blob;
}