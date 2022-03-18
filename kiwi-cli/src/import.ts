/**
 * @author linhuiw
 * @desc 导入翻译文件
 */
require('ts-node').register({
    compilerOptions: {
        module: 'commonjs'
    }
});
import * as fs from 'fs';
import * as path from 'path';
import * as _ from 'lodash';
import { tsvParseRows } from 'd3-dsv';
import { getAllMessages, getProjectConfig, traverse } from './utils';

const CONFIG = getProjectConfig();

function getMessagesToImport(file: string) {
    const content = fs.readFileSync(file).toString();
    const messages = tsvParseRows(content, ([key, value]) => {
        try {
            // value 的形式和 JSON 中的字符串值一致，其中的特殊字符是以转义形式存在的，
            // 如换行符 \n，在 value 中占两个字符，需要转成真正的换行符。
            value = JSON.parse(`"${value}"`);
        } catch (e) {
            throw new Error(`Illegal message: ${value}`);
        }
        return [key, value];
    });
    const rst = {};
    const duplicateKeys = new Set();
    messages.forEach(([key, value]) => {
        if (rst.hasOwnProperty(key)) {
            duplicateKeys.add(key);
        }
        rst[key] = value;
    });
    if (duplicateKeys.size > 0) {
        const errorMessage = 'Duplicate messages detected: \n' + [...duplicateKeys].join('\n');
        console.error(errorMessage);
        process.exit(1);
    }
    return rst;
}

function writeMessagesToFile(messages: any, file: string, lang: string) {
    const kiwiDir = CONFIG.kiwiDir;
    const srcMessages = require(path.resolve(kiwiDir, CONFIG.srcLang, file)).default;
    const dstFile = path.resolve(kiwiDir, lang, file);
    const oldDstMessages = require(dstFile).default;
    const rst = {};
    traverse(srcMessages, (message, key) => {
        /**
         * 优先使用messages里面的国际化路径key对应的值，此为tsv文件导入进来的值
         * 不存在的情况下,使用原有lang对应的配置文件中的值
         * 此迭代是基于中文srcMessages对象的，默认是翻译中文
         */
        _.setWith(rst, key, _.get(messages, key) || _.get(oldDstMessages, key), Object);
    });
    /**
     * rst全量替换源文件dstFile的内容
     */
    fs.writeFileSync(dstFile + '.ts', 'export default ' + JSON.stringify(rst, null, 2));
}

function importMessages(file: string, lang: string) {
    /**
     * messagesToImport形式如下
     * {
     *    key:value
     * }
     * 其中key为国际化变量，其值类型为string，即文案
     */
    let messagesToImport = getMessagesToImport(file);
    const allMessages = getAllMessages(CONFIG.srcLang);
    /**
     * messagesToImport过滤掉allMessages不存在的键
     */
    messagesToImport = _.pickBy(messagesToImport, (message, key) => allMessages.hasOwnProperty(key));
    /**
     * 返回的对象keysByFiles如下形式
     * {
     *    fileName1:[key1,key2,...]
     *    fileName2:[key1,key2,...]
     * }
     * 其中fileName为文件名，key为国际化变量，其值类型为string，即文案
     */
    const keysByFiles = _.groupBy(Object.keys(messagesToImport), key => key.split('.')[0]);
    /**
     * 将keysByFiles展开成按文件分割对象messagesByFiles，其第一层和lang文件夹下每个配置文件的对象形式一样
     * {
     *    fileName1:{
     *        [key:string]:(Object | string)
     *    }
     * }
     */
    const messagesByFiles = _.mapValues(keysByFiles, (keys, file) => {
        const rst = {};
        _.forEach(keys, key => {
            _.setWith(rst, key.substr(file.length + 1), messagesToImport[key], Object);
        });
        return rst;
    });
    _.forEach(messagesByFiles, (messages, file) => {
        writeMessagesToFile(messages, file, lang);
    });
}

export { importMessages };
