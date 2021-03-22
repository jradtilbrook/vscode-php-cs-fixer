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
            // TODO: handle cancelling token thing (is this used if its run quickly sequentially?)
            // exit early if no changes have been made
            if (!document.isDirty) {
                return [];
            }

            const args = [
                'fix',
                '--dry-run',
                '--diff',
                '--diff-format=udiff',
                '--format=json',
                '--rules=@PSR12',
                '-',
            ];
            const opts = {
                cwd: path.dirname(document.fileName),
                env: process.env,
            };
            let fixer = spawn(`${homedir()}/Developer/he/megatron/vendor/bin/php-cs-fixer`, args, opts);
            fixer.stdin.write(document.getText());
            fixer.stdin.end();

            return new Promise<vscode.TextEdit[]>((resolve, reject) => {
                fixer.on('error', err => {
                    console.log(err);
                    reject();
                });

                fixer.on('exit', () => {
                    let rawOutput = '';
                    // process the output stream from php-cs-fixer
                    fixer.stdout.on('data', chunk => {
                        rawOutput += chunk.toString();
                    });
                    fixer.stdout.on('end', () => {
                        let json: PHPCSFixerOutput = JSON.parse(rawOutput);
                        console.log(json.files[0]?.diff ?? 'no diff');
                        // get the whole document range to apply over
                        const lastLine = document.lineAt(document.lineCount - 1).range.end;
                        const range = new vscode.Range(document.positionAt(0), lastLine);

                        // apply the generate diff patch from php-cs-fixer to the whole document
                        let output = applyPatch(document.getText(), json.files[0]?.diff ?? '');
                        console.log(output);

                        resolve([new vscode.TextEdit(range, output)]);
                    });
                });
            });
        }
    });
}

// this method is called when your extension is deactivated
export function deactivate() {}
