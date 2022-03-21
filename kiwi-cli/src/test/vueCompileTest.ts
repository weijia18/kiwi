import { readFile } from '../extract/file'
import { findVueText, findTextInVueTs } from '../extract/findChineseText'
import * as compilerVue from 'vue-template-compiler';
import * as path from 'path';
import * as fs from 'fs';

let code = readFile(path.resolve(process.cwd(), './src/test/vue/demo01.vue'))
const vueObejct = compilerVue.compile(code.toString(), { outputSourceRange: true });
let TextaArr = findVueText(vueObejct.ast);

const sfc = compilerVue.parseComponent(code.toString());
let vueTemp = findTextInVueTs(sfc.script.content, 'fileName', sfc.script.start);

console.log("-----------------------vueObejct-ast-------------------------")
console.log(vueObejct.ast)
fs.writeFileSync('./src/test/vue-ast.json', JSON.stringify(vueObejct.ast, function (key, value) {
    if (key !== 'parent') {
        return value
    }
}))
console.log("-----------------------vueObejct-keys-------------------------")
console.log(Object.keys(vueObejct))
console.log("-----------------------sfc-------------------------")
console.log(sfc)
console.log("-----------------------TextaArr-------------------------")
console.log(TextaArr)
console.log("-------------------vueTemp-----------------------------")
console.log(vueTemp)
