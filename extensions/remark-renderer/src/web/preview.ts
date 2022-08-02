import * as vscode from 'vscode';
import { getPipeline } from './remarkRenderer';
import WebResource from './webresource';
const throttle = require('lodash.throttle');
import myThrottle from '../../utils/myThrottle';
const renderer = getPipeline();

export default class MarkdownPreview {
    private readonly _webviewPanel: vscode.WebviewPanel;
    private readonly _editor: vscode.TextEditor | undefined;
	private readonly _context: vscode.ExtensionContext;
	public isFromWebview: boolean = false;
    constructor(
        webviewPanel: vscode.WebviewPanel,
        editor: vscode.TextEditor | undefined,
		context: vscode.ExtensionContext
    ){
        this._webviewPanel = webviewPanel;
        this._editor = editor;
		this._context = context;
		this._webviewPanel.webview.html = this.getHtml(this._editor?.document.getText()?? "*No preview available*");
		this.handleMessage();
	}
	private setIsFromWebView = myThrottle(()=>{
		this.isFromWebview = false;
	},100);
    public handleMessage(){
        this._webviewPanel.webview.onDidReceiveMessage(
			(message) => {
			  switch (message.command){
				case 'revealLine':
					if(!this._editor) return;
					this.isFromWebview = true;
					const {line} = message;
					if(!line) return;					
					const sourceLine = Math.floor(line);
					const fraction = line - sourceLine;
					const text = this._editor.document.lineAt(sourceLine).text;
					const start = Math.floor(fraction * text.length);
					this._editor.revealRange(
						new vscode.Range(sourceLine, start, sourceLine + 1, 0),
						vscode.TextEditorRevealType.AtTop);
					this.setIsFromWebView();
			  }
			}
		);
    }
	public getHtml(md: string) : string {
		const html = renderer.processSync(md).toString();
		const webRes = new WebResource(this._webviewPanel.webview, this._context.extensionUri);
		return webRes.genRenderHtml(html);
	}
	
}