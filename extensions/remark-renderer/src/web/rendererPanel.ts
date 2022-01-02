import * as vscode from "vscode";
import { renderHtml } from "./remarkRenderer";

export default class RendererPanel {
	/**
	 * Track the currently panel. Only allow a single panel to exist at a time.
	 */
	public static currentPanel: RendererPanel | undefined;

	public static readonly viewType = 'catCoding';

	private readonly _panel: vscode.WebviewPanel;
	private readonly _extensionUri: vscode.Uri;
	private _disposables: vscode.Disposable[] = [];

	public static createOrShow(extensionUri: vscode.Uri) {
		const column = vscode.window.activeTextEditor
			? vscode.window.activeTextEditor.viewColumn
			: undefined;

		// If we already have a panel, show it.
		if (RendererPanel.currentPanel) {
			RendererPanel.currentPanel._panel.reveal(column);
			return;
		}

		// Otherwise, create a new panel.
		const panel = vscode.window.createWebviewPanel(
			RendererPanel.viewType,
			'Cat Coding',
			column || vscode.ViewColumn.One,
			getWebviewOptions(extensionUri),
		);

		RendererPanel.currentPanel = new RendererPanel(panel, extensionUri);
	}

	public static revive(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
		RendererPanel.currentPanel = new RendererPanel(panel, extensionUri);
	}

	private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
		this._panel = panel;
		this._extensionUri = extensionUri;

		// Set the webview's initial html content
		this._update();

		// Listen for when the panel is disposed
		// This happens when the user closes the panel or when the panel is closed programmatically
		this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

		// Update the content based on view changes
		this._panel.onDidChangeViewState(
			e => {
				if (this._panel.visible) {
					this._update();
				}
			},
			null,
			this._disposables
		);
	}

	public dispose() {
		RendererPanel.currentPanel = undefined;

		this._panel.dispose();

		while (this._disposables.length) {
			const x = this._disposables.pop();
			if (x) {
				x.dispose();
			}
		}
	}

    private _update() {
		const renderBody = renderHtml("# h1");
        this._getHtmlForWebview(this._panel.webview, renderBody);
    }

	private _getHtmlForWebview(webview: vscode.Webview, renderBody: string) {
		const styleResetPath = vscode.Uri.joinPath(this._extensionUri, 'media', 'style.css');
		const stylesResetUri = webview.asWebviewUri(styleResetPath);

		return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<!--
					Use a content security policy to only allow loading images from https or from our extension directory,
					and only allow scripts that have a specific nonce.
				-->
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; img-src ${webview.cspSource} https:;">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<link href="${stylesResetUri}" rel="stylesheet">
				<title>Cat Coding</title>
			</head>
			<body>
                <article>
                    ${renderBody}
                </article>
			</body>
			</html>`;
	}
}

function getWebviewOptions(extensionUri: vscode.Uri): (vscode.WebviewPanelOptions & vscode.WebviewOptions) | undefined {
    return {
        enableScripts: false
    };
}
