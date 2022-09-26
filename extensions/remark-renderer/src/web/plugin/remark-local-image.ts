import {visit} from 'unist-util-visit';
import * as vscode from 'vscode';

export default function remarkLocalImage(webviewPanel: vscode.WebviewPanel) {
  return () => {
    return (tree:any) => {
      visit(tree, (node) => {
          if (node.type === 'image') {
            const documentUri = vscode.window.activeTextEditor?.document.uri!;
            const uri = vscode.Uri.joinPath(documentUri, node.url);
            const src = webviewPanel.webview.asWebviewUri(uri);
            node.url = src.toString();
          }
      });
    }; 
  };
}