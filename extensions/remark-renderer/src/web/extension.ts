import * as vscode from 'vscode';
import { getPipeline } from './remarkRenderer';
import WebResource from './webresource';

const renderer = getPipeline();

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('remark-renderer.rendererView', () => {
		const text = vscode.window.activeTextEditor?.document.getText() ?? "*No preview available*";
		const panel = vscode.window.createWebviewPanel(
			'mdRenderer',
			'Preview',
			vscode.ViewColumn.Beside,
			{
				enableScripts: true,
			}
		);
		// panel.webview.onDidReceiveMessage(
		// 	(message) => {
		// 	  console.log('message',message);
		// 	  vscode.commands.executeCommand(
		// 		`_mume.${message.command}`,
		// 		...message.args,
		// 	  );
		// 	},
		// 	null,
		// 	context.subscriptions,
		//   );
		panel.webview.html = getHtml(panel.webview, text, context.extensionUri);
		vscode.window.onDidChangeTextEditorSelection((e:vscode.TextEditorSelectionChangeEvent)=>{
			const newText = e.textEditor.document.getText();
			panel.webview.html = getHtml(panel.webview, newText, context.extensionUri);
		});
		vscode.window.onDidChangeTextEditorVisibleRanges((e)=>{
			const topLine = getTopVisibleLine(e.textEditor);
			const bottomLine = getBottomVisibleLine(e.textEditor);
			let midLine;
			if(topLine&&bottomLine){
				midLine = Math.floor((topLine + bottomLine) / 2);
			}
			panel.webview.postMessage({
				command: "changeTextEditorSelection",
				line: midLine,
			});
		});
	});

	context.subscriptions.push(disposable);
	
}

function getHtml(webview: vscode.Webview, md: string, extensionUri: vscode.Uri) : string {
	const html = renderer.processSync(md).toString();
	const webRes = new WebResource(webview, extensionUri);
	return webRes.genRenderHtml(html);
}
function getTopVisibleLine(
	editor: vscode.TextEditor,
  ): number | undefined {
	if (!editor["visibleRanges"].length) {
	  return undefined;
	}
	const firstVisiblePosition = editor["visibleRanges"][0].start;
	const lineNumber = firstVisiblePosition.line;
	const line = editor.document.lineAt(lineNumber);
	const progress = firstVisiblePosition.character / (line.text.length + 2);
	return lineNumber + progress;
  }
function getBottomVisibleLine(
editor: vscode.TextEditor,
): number | undefined {
	if (!editor["visibleRanges"].length) {
		return undefined;
	}

	const firstVisiblePosition = editor["visibleRanges"][0].end;
	const lineNumber = firstVisiblePosition.line;
	let text = "";
	if (lineNumber < editor.document.lineCount) {
		text = editor.document.lineAt(lineNumber).text;
	}
	const progress = firstVisiblePosition.character / (text.length + 2);
	return lineNumber + progress;
}
export function deactivate() {}
