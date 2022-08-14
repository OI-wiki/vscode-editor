import * as vscode from 'vscode';
import { getPipeline } from './remarkRenderer';
import WebResource from './webresource';
const throttle = require('lodash.throttle');
import myThrottle from '../../utils/myThrottle';
import MagicString from 'magic-string';
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
		this.initWebviewHtml();
		this.handleMessage();
	}
	private async initWebviewHtml(){
		this._webviewPanel.webview.html = await this.getHtml(this._editor?.document.getText()?? "*No preview available*");
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
	public async getHtml(md: string) : Promise<string> {
		md = await this.insertSnippets(md);
		const html = renderer.processSync(md).toString();
		const webRes = new WebResource(this._webviewPanel.webview, this._context.extensionUri);
		return webRes.genRenderHtml(html);
	}
	public async insertSnippets(rawText:string):Promise<string>{
		const s = new MagicString(rawText);
		// get rootpath
		const rootPath = vscode.workspace.workspaceFolders ??[];
		// match every import file grammar
		for(const item of rawText.matchAll(/--8<--\s*(.*)/g)){
			const start = item.index ?? 0;
			const end = start + item[0].length;
			const filePath = item[1].slice(1,-1);
			const uri = vscode.Uri.joinPath(rootPath[0].uri,filePath);
			const uint8arr = await vscode.workspace.fs.readFile(uri);
			// transform uint8arr to string
			const content = String.fromCharCode.apply(null,Array.from(uint8arr));
			s.overwrite(start,end,content);
		}
		return s.toString();
	}
}