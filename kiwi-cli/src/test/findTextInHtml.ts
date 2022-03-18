import { findTextInHtml } from "../extract/findChineseText"
import * as fs from 'fs';
import * as compiler from '@angular/compiler';
let code = fs.readFileSync("./src/test/登录逻辑流程图.html", 'utf-8');
console.log(findTextInHtml(code))