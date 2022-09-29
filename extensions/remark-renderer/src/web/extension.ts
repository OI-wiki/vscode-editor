import * as vscode from 'vscode';
import MarkdownPreview from './preview';

const throttle = require('lodash.throttle');

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('remark-renderer.rendererView', () => {
		if(vscode.window.activeTextEditor?.document.languageId !== 'markdown') {
			vscode.window.showErrorMessage("It's not a markdown file");
			return;
		}
		new MarkdownPreview(context);
	});

	context.subscriptions.push(disposable);
	
}

export function deactivate() {}
