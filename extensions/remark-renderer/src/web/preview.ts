import * as vscode from 'vscode';
export default class MarkdownPreview {
    private readonly _webviewPanel: vscode.WebviewPanel;
    private readonly _editor: vscode.TextEditor | undefined;
    constructor(
        webview: vscode.WebviewPanel,
        editor: vscode.TextEditor | undefined
    ){
        this._webviewPanel = webview;
        this._editor = editor;
    }
    public handleMessage(){
        this._webviewPanel.webview.onDidReceiveMessage(
			(message) => {
			  console.log(message.source);
			  
			  switch (message.command){
				case 'revealLine':
					if(!this._editor) return;
					const {line} = message;
					const sourceLine = Math.floor(line);
					const fraction = line - sourceLine;
					const text = this._editor.document.lineAt(sourceLine).text;
					const start = Math.floor(fraction * text.length);
					this._editor.revealRange(
						new vscode.Range(sourceLine, start, sourceLine + 1, 0),
						vscode.TextEditorRevealType.AtTop);
			  }
			}
		);
    }
}