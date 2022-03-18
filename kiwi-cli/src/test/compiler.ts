import * as fs from 'fs';
import * as compiler from '@angular/compiler';
let code = fs.readFileSync("./src/test/登录逻辑流程图.html", 'utf-8');
const ast = compiler.parseTemplate(code, 'ast.html', {
    preserveWhitespaces: false
});
fs.writeFileSync('./src/test/ast.json', JSON.stringify(ast))