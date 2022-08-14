import * as vscode from 'vscode';
import WebResource from './webresource';
import MarkdownPreview from './preview';

const throttle = require('lodash.throttle');

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('remark-renderer.rendererView', () => {
		const editor = vscode.window.activeTextEditor;
		if(editor?.document.languageId !== 'markdown') {
			vscode.window.showErrorMessage("It's not a markdown file");
			return;
		}
		const panel = vscode.window.createWebviewPanel(
			'mdRenderer',
			'Preview',
			vscode.ViewColumn.Beside,
			{
				enableScripts: true,
			}
		);
		const markdownPreview = new MarkdownPreview(panel,editor,context);
		// init preview line
		panel.webview.postMessage({
			command: "changeTextEditorSelection",
			// line:midLine,
			line: editor["visibleRanges"][0].start.line,
		});
		vscode.window.onDidChangeTextEditorSelection(throttle(async (e:vscode.TextEditorSelectionChangeEvent)=>{
			const newText = e.textEditor.document.getText();
			panel.webview.html = await markdownPreview.getHtml(newText);
		}),10000);
		vscode.window.onDidChangeTextEditorVisibleRanges(throttle((e:vscode.TextEditorVisibleRangesChangeEvent)=>{
			// const topLine = getTopVisibleLine(e.textEditor);
			// const bottomLine = getBottomVisibleLine(e.textEditor);
			// let midLine;
			// if(topLine&&bottomLine){
			// 	midLine = Math.floor((topLine + bottomLine) / 2);
			// }
			if(markdownPreview.isFromWebview) return;
			panel.webview.postMessage({
				command: "changeTextEditorSelection",
				// line:midLine,
				line: e.textEditor["visibleRanges"][0].start.line,
			});
		}),100);
	});

	context.subscriptions.push(disposable);
	
}

export function deactivate() {}
