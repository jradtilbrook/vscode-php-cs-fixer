import * as vscode from 'vscode';
import { spawn } from 'child_process';
import { homedir } from 'os';
import { applyPatch } from 'diff';
import * as path from 'path';
import * as fs from 'fs';

interface PHPCSFixerOutput {
    files: PHPCSFixerDiff[];
    memory: Number;
    time: {
        total: Number;
    }
}

interface PHPCSFixerDiff {
    name: string;
    diff: string;
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    vscode.languages.registerDocumentFormattingEditProvider('php', {
        provideDocumentFormattingEdits(document: vscode.TextDocument): vscode.ProviderResult<vscode.TextEdit[]> {
            return new Promise<vscode.TextEdit[]>((resolve, reject) => {
                // exit early if no changes have been made
                if (!document.isDirty) {
                    return resolve([]);
                }

                // determine the working directory to run php-cs-fixer from
                // this allows it to read the configuration file if its present
                let workingDir = path.dirname(document.fileName);
                if (vscode.workspace.workspaceFolders !== undefined) {
                    workingDir = vscode.workspace.workspaceFolders[0].uri.fsPath;
                }

                // if a vendored php-cs-fixer doesnt exist
                if (!fs.existsSync(`${workingDir}/vendor/bin/php-cs-fixer`)) {
                    return reject('No php-cs-fixer binary found');
                }

                const args = [
                    'fix',
                    '--dry-run',
                    '--diff',
                    '--diff-format=udiff',
                    '--format=json',
                    '--allow-risky=yes',
                    '-',
                ];
                const opts = {
                    cwd: workingDir,
                    env: process.env,
                };
                // expect to use the vendored php-cs-fixer
                let fixer = spawn(`${workingDir}/vendor/bin/php-cs-fixer`, args, opts);
                fixer.stdin.write(document.getText());
                fixer.stdin.end();

                fixer.on('error', err => {
                    console.log(err);
                    reject(err);
                });

                fixer.on('exit', () => {
                    let rawOutput = '';
                    // process the output stream from php-cs-fixer
                    fixer.stdout.on('data', chunk => {
                        rawOutput += chunk.toString();
                    });
                    fixer.stdout.on('end', () => {
                        try {
                            let json: PHPCSFixerOutput = JSON.parse(rawOutput);
                            console.log(json.files[0]?.diff ?? 'no diff');
                            // get the whole document range to apply over
                            const lastLine = document.lineAt(document.lineCount - 1).range.end;
                            const range = new vscode.Range(document.positionAt(0), lastLine);

                            // apply the generate diff patch from php-cs-fixer to the whole document
                            let output = applyPatch(document.getText(), json.files[0]?.diff ?? '');
                            console.log(output);

                            return resolve([new vscode.TextEdit(range, output)]);
                        } catch (error) {
                            return reject(error);
                        }
                    });
                });
            });
        }
    });
}

// this method is called when your extension is deactivated
export function deactivate() {}
