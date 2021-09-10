import { readFile } from '../extract/file'
import { findVueText, findTextInVueTs } from '../extract/findChineseText'
import * as compilerVue from 'vue-template-compiler';
import * as path from 'path';


let code = readFile(path.resolve(process.cwd(), './src/test/vue/demo01.vue'))
const vueObejct = compilerVue.compile(code.toString(), { outputSourceRange: true });
let TextaArr = findVueText(vueObejct.ast);

const sfc = compilerVue.parseComponent(code.toString());
console.log(sfc)
let vueTemp = findTextInVueTs(sfc.script.content, 'fileName', sfc.script.start);

console.log(TextaArr)
console.log(vueTemp)
