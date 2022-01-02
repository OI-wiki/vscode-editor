import * as vscode from 'vscode';
import { getPipeline } from './remarkRenderer';

const renderer = getPipeline();

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('remark-renderer.rendererView', () => {
		const text = vscode.window.activeTextEditor?.document.getText() ?? "*No preview available*";
		
		const panel = vscode.window.createWebviewPanel(
			'mdRenderer',
			'Remark Renderer',
			vscode.ViewColumn.Beside,
			{}
		);

		panel.webview.html = getHtml(panel.webview, text, context.extensionUri);
	});

	context.subscriptions.push(disposable);
}

function getHtml(webview: vscode.Webview, md: string, extensionUri: vscode.Uri) : string {
	const html = renderer.processSync(md).toString();
	const styleUri = vscode.Uri.joinPath(extensionUri, 'media', 'style.css');

	return `<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource} https:; script-src ${webview.cspSource}; style-src ${webview.cspSource};" />
			<title>Render Preview</title>
			<link href="${webview.asWebviewUri(styleUri)}" rel="stylesheet">
		</head>
		<body>
			<article>
				${html}
			</article>
		</body>
	</html>`;
}

export function deactivate() {}
