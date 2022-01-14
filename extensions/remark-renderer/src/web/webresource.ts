import * as vscode from 'vscode';

const webFont = `@font-face {
  font-family:"Material Icons";
  font-style:normal;
  font-weight:400;
  src:local("Material Icons"),local("MaterialIcons-Regular"),url("%woff%") format("woff2");`;

export default class WebResource {
  private webview: vscode.Webview;
  private extensionUrl: vscode.Uri;

  constructor(webview: vscode.Webview, extensionUrl: vscode.Uri) {
    this.webview = webview;
    this.extensionUrl = extensionUrl;
  }

  getPath(...path : string[]) {
    return this.webview.asWebviewUri(vscode.Uri.joinPath(this.extensionUrl, ...path));
  }
  getStyleLink(...stylePath : string[]) {
    const url = this.getPath(...stylePath);
    return `<link href="${url}" rel="stylesheet">`;
  }

  getFont() {
    const fontPath = this.webview.asWebviewUri(vscode.Uri.joinPath(this.extensionUrl, "media", "MaterialIcons-Regular.woff2"));
    return `<style>
      ${webFont.replace("%woff%", fontPath.toString())}
    </style>
    `;
  }

  genRenderHtml(content: string): string {
    return `<!DOCTYPE html>
		<html lang="en">
		  <head>
			  <meta charset="UTF-8">
			  <meta name="viewport" content="width=device-width, initial-scale=1.0">
			  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${this.webview.cspSource} https:; script-src https://cdn.jsdelivr.net ${this.webview.cspSource}; style-src 'unsafe-inline' https://cdn.jsdelivr.net ${this.webview.cspSource}; font-src https://cdn.jsdelivr.net ${this.webview.cspSource};" />
			  <title>Render Preview</title>
        <script src="${this.getPath("media", "script.js")}"></script>
        ${this.getStyleLink("media", "style.css")}
			  ${this.getStyleLink("media", "material.css")}
        ${this.getFont()}
		  </head>
		  <body>
			  <article class="md-typeset">
				  ${content}
			  </article>
		  </body>
      <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
	  </html>`;
  }

}
