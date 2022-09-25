import * as vscode from 'vscode';
import { getPipeline } from './remarkRenderer';
import WebResource from './webresource';
const throttle = require('lodash.throttle');
import { stringifyEntities } from 'stringify-entities';
import delayThrottle from '../../utils/delayThrottle';
import MagicString from 'magic-string';
const renderer = getPipeline();

export default class MarkdownPreview {
    private readonly _webviewPanel: vscode.WebviewPanel;
    private readonly _editor: vscode.TextEditor | undefined;
	private readonly _context: vscode.ExtensionContext;
	private webRes:WebResource;
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
		this.webRes = new WebResource(this._webviewPanel.webview, this._context.extensionUri);
	}
	private async initWebviewHtml(){
		this._webviewPanel.webview.html = await this.getHtml(this._editor?.document.getText()?? "*No preview available*");
	}
	private setIsFromWebView = delayThrottle(()=>{
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
		const htmlContent = await this.getHtmlContent(md);
		return this.webRes.genRenderHtml(htmlContent);
	}
	public async getHtmlContent(md:string): Promise<string>{
		const html = renderer.processSync(md).toString();
		const content =  await this.insertSnippets(html);
		return this.webRes.getBody(content);
	}
	public async insertSnippets(rawText:string):Promise<string>{
		const s = new MagicString(rawText);
		// get rootpath
		const rootPath = vscode.workspace.workspaceFolders ??[];
		// match every import file grammar
		for(const item of rawText.matchAll(/--8&#x3C;--\s*['"](.*)['"]/g)){
			const start = item.index ?? 0;
			const end = start + item[0].length;
			const filePath = item[1].trim();
			const uri = vscode.Uri.joinPath(rootPath[0].uri,filePath);
			try {
				const uint8arr = await vscode.workspace.fs.readFile(uri);
				// transform uint8arr to string
				let content = new TextDecoder('utf-8').decode(uint8arr);
				content = stringifyEntities(content,{subset:['<','&']})
				s.overwrite(start,end,content);
			} catch(err){
				console.log(err);
			}
		}
		return s.toString();
	}
}