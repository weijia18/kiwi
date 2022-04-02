/**
 * @author linhuiw
 * @desc 插件主入口
 */
import * as vscode from 'vscode';
import * as _ from 'lodash';
import * as randomstring from 'randomstring';
import * as fs from 'fs-extra';
import * as slash from 'slash2';
import { getSuggestLangObj, getSuggestion } from './getLangData';
import { DIR_ADAPTOR } from './const';
import { findAllI18N, findI18N } from './findAllI18N';
import { findMatchKey } from './utils';
import { triggerUpdateDecorations } from './chineseCharDecorations';
import { TargetStr } from './define';
import { replaceAndUpdate } from './replaceAndUpdate';
import { getConfiguration, getConfigFile, translateText, getKiwiLinterConfigFile } from './utils';

/**
 * 主入口文件
 * @param context
 */
export function activate(context: vscode.ExtensionContext) {
    if (!getKiwiLinterConfigFile() && !getConfigFile() && !fs.existsSync(DIR_ADAPTOR)) {
        /** 存在配置文件则开启 */
        return;
    }
    console.log('Congratulations, your extension "kiwi-linter" is now active!');
    context.subscriptions.push(vscode.commands.registerCommand('vscode-i18n-linter.findAllI18N', findAllI18N));
    let targetStrs: TargetStr[] = [];
    let finalLangObj = {};

    let activeEditor = vscode.window.activeTextEditor;
    if (activeEditor) {
        triggerUpdateDecorations(newTargetStrs => {
            targetStrs = newTargetStrs;
            console.log("targetStrs", targetStrs)
        });
    }

    let suggestion = []
    context.subscriptions.push(vscode.commands.registerTextEditorCommand('vscode-i18n-linter.findI18N', findI18N));

    // 识别到出错时点击小灯泡弹出的操作
    const hasLightBulb = getConfiguration('enableReplaceSuggestion');
    if (hasLightBulb) {
        context.subscriptions.push(
            vscode.languages.registerCodeActionsProvider(
                [
                    { scheme: 'file', language: 'typescriptreact' },
                    { scheme: 'file', language: 'html' },
                    { scheme: 'file', language: 'typescript' },
                    { scheme: 'file', language: 'javascriptreact' },
                    { scheme: 'file', language: 'javascript' },
                    { scheme: '*', language: 'vue' }
                ],
                {
                    provideCodeActions: function (document, range, context, token) {
                        console.log("range", range)
                        console.log("document", document)
                        console.log("token", token)
                        console.log("context", context)
                        const targetStr = targetStrs.find(t => range.intersection(t.range) !== undefined);
                        console.log("targetStr", targetStr)
                        if (targetStr) {
                            const sameTextStrs = targetStrs.filter(t => t.text === targetStr.text);
                            const text = targetStr.text;
                            const actions = [];
                            finalLangObj = getSuggestLangObj();
                            for (const key in finalLangObj) {
                                if (finalLangObj[key] === text) {
                                    actions.push({
                                        title: `抽取为 \`I18N.${key}\``,
                                        command: 'vscode-i18n-linter.extractI18N',
                                        arguments: [
                                            {
                                                targets: sameTextStrs,
                                                varName: `I18N.${key}`
                                            }
                                        ]
                                    });
                                }
                            }

                            return actions.concat({
                                title: `抽取为自定义 I18N 变量（共${sameTextStrs.length}处）`,
                                command: 'vscode-i18n-linter.extractI18N',
                                arguments: [
                                    {
                                        targets: sameTextStrs
                                    }
                                ]
                            });
                        }
                    }
                }
            )
        );
    }

    // 点击小灯泡后进行替换操作
    context.subscriptions.push(
        vscode.commands.registerCommand('vscode-i18n-linter.extractI18N', args => {
            return new Promise(resolve => {
                // 若变量名已确定则直接开始替换
                if (args.varName) {
                    return resolve(args.varName);
                }
                suggestion = getSuggestion()
                // 否则要求用户输入变量名
                return resolve(
                    vscode.window.showInputBox({
                        prompt: '请输入变量名，格式 `I18N.[page].[key]`，按 <回车> 启动替换',
                        value: `I18N.${suggestion.length ? suggestion.join('.') + '.' : ''}`,
                        validateInput(input) {
                            if (!input.match(/^I18N\.\w+\.\w+/)) {
                                return '变量名格式 `I18N.[page].[key]`，如 `I18N.dim.new`，[key] 中可包含更多 `.`';
                            }
                        }
                    })
                );
            }).then((val: string) => {
                // 没有输入变量名
                if (!val) {
                    return;
                }
                const finalArgs = Array.isArray(args.targets) ? args.targets : [args.targets];
                return finalArgs
                    .reverse()
                    .reduce((prev: Promise<any>, curr: TargetStr, index: number) => {
                        return prev.then(() => {
                            const isEditCommon = val.startsWith('I18N.common.');
                            return replaceAndUpdate(curr, val, !isEditCommon && index === 0 ? !args.varName : false);
                        });
                    }, Promise.resolve())
                    .then(
                        () => {
                            vscode.window.showInformationMessage(`成功替换 ${finalArgs.length} 处文案`);
                        },
                        err => {
                            console.log(err, 'err');
                        }
                    );
            });
        })
    );

    // 使用 cmd + shift + p 执行的公共文案替换
    context.subscriptions.push(
        vscode.commands.registerCommand('vscode-i18n-linter.replaceCommon', () => {
            const commandKeys = Object.keys(finalLangObj).filter(k => k.includes('common.'));
            if (targetStrs.length === 0 || commandKeys.length === 0) {
                vscode.window.showInformationMessage('没有找到可替换的公共文案');
                return;
            }
            const replaceableStrs = targetStrs.reduce((prev, curr) => {
                const key = findMatchKey(finalLangObj, curr.text);
                if (key && key.startsWith('common.')) {
                    return prev.concat({
                        target: curr,
                        key
                    });
                }

                return prev;
            }, []);

            if (replaceableStrs.length === 0) {
                vscode.window.showInformationMessage('没有找到可替换的公共文案');
                return;
            }

            vscode.window
                .showInformationMessage(
                    `共找到 ${replaceableStrs.length} 处可自动替换的文案，是否替换？`,
                    { modal: true },
                    'Yes'
                )
                .then(action => {
                    if (action === 'Yes') {
                        replaceableStrs
                            .reverse()
                            .reduce((prev: Promise<any>, obj) => {
                                return prev.then(() => {
                                    return replaceAndUpdate(obj.target, `I18N.${obj.key}`, false);
                                });
                            }, Promise.resolve())
                            .then(() => {
                                vscode.window.showInformationMessage('替换完成');
                            })
                            .catch(e => {
                                vscode.window.showErrorMessage(e.message);
                            });
                    }
                });
        })
    );
    const virtualMemory = {};
    // 一键替换所有中文
    context.subscriptions.push(
        vscode.commands.registerCommand('vscode-i18n-linter.kiwigo', () => {
            if (targetStrs.length === 0) {
                vscode.window.showInformationMessage('没有找到可替换的文案');
                return;
            }
            suggestion = getSuggestion()
            vscode.window
                .showInformationMessage(`共找到 ${targetStrs.length} 处可自动替换的文案，是否替换？`, { modal: true }, 'Yes')
                .then(action => {
                    if (action === 'Yes') {
                        // 翻译中文文案
                        const translatePromises = targetStrs.reduce((prev, curr) => {
                            // 避免翻译的字符里包含数字或者特殊字符等情况
                            const reg = /[^a-zA-Z\x00-\xff]+/g;
                            const findText = curr.text.match(reg);
                            const transText = findText.join('').slice(0, 4);
                            return prev.concat(translateText(transText));
                        }, []);

                        Promise.all(translatePromises).then(([...translateTexts]) => {
                            const replaceableStrs = targetStrs.reduce((prev, curr, i) => {
                                const key = findMatchKey(finalLangObj, curr.text);
                                if (!virtualMemory[curr.text]) {
                                    if (key) {
                                        virtualMemory[curr.text] = key;
                                        return prev.concat({
                                            target: curr,
                                            key
                                        });
                                    }
                                    const uuidKey = `${randomstring.generate({
                                        length: 4,
                                        charset: 'qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM'
                                    })}`;
                                    // const transText = translateTexts[i] ? _.camelCase(translateTexts[i]) : uuidKey;
                                    let transKey = `${suggestion.length ? suggestion.join('.') + '.' : ''}${'chineseSymbols'}`;
                                    let occurTime = 1;
                                    // 防止出现前四位相同但是整体文案不同的情况
                                    while (
                                        finalLangObj[transKey] !== curr.text &&
                                        _.keys(finalLangObj).includes(`${transKey}${occurTime >= 2 ? occurTime : ''}`)
                                    ) {
                                        occurTime++;
                                    }
                                    if (occurTime >= 2) {
                                        transKey = `${transKey}${occurTime}`;
                                    }
                                    virtualMemory[curr.text] = transKey;
                                    finalLangObj[transKey] = curr.text;
                                    return prev.concat({
                                        target: curr,
                                        key: transKey
                                    });
                                } else {
                                    return prev.concat({
                                        target: curr,
                                        key: virtualMemory[curr.text]
                                    });
                                }
                            }, []);

                            replaceableStrs
                                .reverse()
                                .reduce((prev: Promise<any>, obj) => {
                                    return prev.then(() => {
                                        return replaceAndUpdate(obj.target, `I18N.${obj.key}`, false);
                                    });
                                }, Promise.resolve())
                                .then(() => {
                                    vscode.window.showInformationMessage('替换完成');
                                })
                                .catch(e => {
                                    vscode.window.showErrorMessage(e.message);
                                });
                        });
                    }
                });
        })
    );

    // 当 切换文档 的时候重新检测当前文档中的中文文案
    context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor(editor => {
            activeEditor = editor;
            if (editor) {
                triggerUpdateDecorations(newTargetStrs => {
                    targetStrs = newTargetStrs;
                });
            }
        }, null)
    );

    // 当 文档发生变化时 的时候重新检测当前文档中的中文文案
    context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument(event => {
            if (activeEditor && event.document === activeEditor.document) {
                triggerUpdateDecorations(newTargetStrs => {
                    targetStrs = newTargetStrs;
                });
            }
        }, null)
    );
}
