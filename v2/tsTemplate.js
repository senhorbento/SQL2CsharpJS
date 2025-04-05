function mapToTsType(csharType) {
    if (csharType.includes("bool")) return "boolean";
    for (let type of ["sbyte", "short", "long", "int", "float", "double", "decimal"]) {
        if (csharType.includes(type)) {
            return "number";
        }
    }
    if (csharType.includes("date")) return "Date";
    return "string";
}

export const MODEL_TEMPLATE_TS = (className, props) => `
export class ${className} {
${props.map(p => `\t${p.name}: ${mapToTsType(p.type)} = ${p.initialization};\n`)}
}
`;

export const CONSTANTS_TEMPLATE_TS = (classes) => `
import { environment } from "src/environments/environment";

export class Constants {
    private static BASE_URL = environment.apiUrl;
${classes.map(p => `\tstatic ${p.name.toUpperCase()} : string = \`\${this.BASE_URL}/${p.name}\`;\n`).join('')}
}
`;