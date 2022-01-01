import { getBuiltInExtensions } from "./vscode/build/lib/builtInExtensions.js";
import { scanBuiltinExtensions } from "./vscode/build/lib/extensions.js";
import { chdir } from "process";

const EXTENSIONS_ROOT = "./vscode/extensions";

export async function getExtensions() {
    const allExtensions = [];
    
    chdir("./vscode");
    await getBuiltInExtensions();
    const extensions = scanBuiltinExtensions(EXTENSIONS_ROOT);
    chdir("..");
    
    allExtensions.push(...extensions);

    // additional extensions
    // allExtensions.push(...);

    return allExtensions;
}