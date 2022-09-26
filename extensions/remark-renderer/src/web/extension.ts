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
			line: editor["visibleRanges"][0].start.line,
		});
		const textEditorSelectionChange = throttle(async (e:vscode.TextEditorSelectionChangeEvent)=>{
			if (!e.textEditor.document.fileName.endsWith('.md')) return;
			const newText = e.textEditor.document.getText();
			// if (content === newText) return;
			// content = newText;		
			const content = await markdownPreview.getHtmlContent(newText);
			panel.webview.postMessage({
				command: 'updateContent',
				content
			});
		},50);
		const textEditorVisibleRangesChange = throttle((e:vscode.TextEditorVisibleRangesChangeEvent)=>{
			
			if(markdownPreview.isFromWebview) return;
			panel.webview.postMessage({
				command: "changeTextEditorSelection",
				// line:midLine,
				line: e.textEditor["visibleRanges"][0].start.line,
			});
		},16)
		vscode.window.onDidChangeTextEditorSelection(textEditorSelectionChange);
		
		vscode.window.onDidChangeTextEditorVisibleRanges(textEditorVisibleRangesChange)
	});

	context.subscriptions.push(disposable);
	
}

export function deactivate() {}
