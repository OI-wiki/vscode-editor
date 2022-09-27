import * as vscode from 'vscode';
import MarkdownPreview from './preview';

const throttle = require('lodash.throttle');

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('remark-renderer.rendererView', () => {
		new MarkdownPreview(context);
	});

	context.subscriptions.push(disposable);
	
}

export function deactivate() {}
