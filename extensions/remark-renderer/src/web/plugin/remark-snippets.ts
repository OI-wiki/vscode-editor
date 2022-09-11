import {visit} from 'unist-util-visit';
import * as vscode from 'vscode';

export default async function remarkSnippets() {
  
  return (tree:any) => {
    visit(tree, (node) => {
        if (node.value) {
            // get rootpath
            const rootPath = vscode.workspace.workspaceFolders ??[];
            // match every import file grammar
            Array.from(node.value.matchAll(/--8<--\s*(.*)/g)).forEach(async (item) => {
                console.log('remarksnippets');
                
                const filePath = item[1].trim().slice(1,-1);
                const uri = vscode.Uri.joinPath(rootPath[0].uri,filePath);
                console.log(uri);
                
                try {
                    const uint8arr = await vscode.workspace.fs.readFile(uri);
                    // transform uint8arr to string
                    const content = String.fromCharCode.apply(null,Array.from(uint8arr));
                    node.value = content
                    console.log(node);
                } catch(err){
                    console.log(err);
                }
            })
        }
    });
  };
}