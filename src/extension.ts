import vscode from 'vscode';
import { command } from './contrib/command';
import { decorate } from './contrib/decoration';

function activate(context: vscode.ExtensionContext) {
  decorate(context);
  command(context);
}

function deactivate() {}

export { activate, deactivate };
