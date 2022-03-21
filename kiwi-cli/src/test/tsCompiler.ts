import * as fs from 'fs';
import * as ts from 'typescript';
let code = fs.readFileSync("./src/test/Columns.js", 'utf-8');
const ast = ts.createSourceFile('', code, ts.ScriptTarget.ES2015, true, ts.ScriptKind.TSX);
fs.writeFileSync('./src/test/ts-ast.json', JSON.stringify(ast, function (key, value) {
    if (key !== 'parent') {
        return value
    }
}))