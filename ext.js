import { getBuiltInExtensions } from "./vscode/build/lib/builtInExtensions.js";
import { scanBuiltinExtensions } from "./vscode/build/lib/extensions.js";
import { chdir } from "process";
import fse from "fs-extra";

const EXTENSIONS_ROOT = "./extensions";

const wantExtensions = [
    'configuration-editing',
    'cpp',
    'csharp',
    'markdown',
    'html',
    'html-language-features',
    'markdown-basics',
    'markdown-language-features',
    'markdown-math',
    'theme-defaults',
    'python',
    'search-result',
    'yaml',
];

async function getCustomExtensions() {
    const customExts = [];
    for(const ext of fse.readdirSync("./extensions")) {
        const dir = `./extensions/${ext}`;

        if (!fse.existsSync(`${dir}/package.json`)) continue;

        const packageJSON = JSON.parse((await fse.readFile(`${dir}/package.json`)));

        let packageNLS = {};
        if (fse.existsSync(`${dir}/package.nls.json`)) {
            packageNLS = JSON.parse((await fse.readFile(`${dir}/package.nls.json`)));
        }

        customExts.push({
            customPath: dir,
            packageJSON,
            packageNLS,
            extensionPath: ext,
        });
    }
    return customExts;
}

export async function scanExtensions() {
    const allExtensions = [];
    
    chdir("./vscode");
    await getBuiltInExtensions();
    const extensions = scanBuiltinExtensions(EXTENSIONS_ROOT);
    chdir("..");
    
    allExtensions.push(...extensions);
    return allExtensions;
}

// customize vscode bundled extensions
export async function getWantedExtensions() {
    const allExtensions = [];
    for (const f of wantExtensions) {
        const dir = `./vscode/extensions/${f}`;
        if (fse.existsSync(dir)) {
            const packageJSON = JSON.parse((await fse.readFile(`${dir}/package.json`)));
            const packageNLS = JSON.parse((await fse.readFile(`${dir}/package.nls.json`)));
            
            allExtensions.push({
                packageJSON,
                packageNLS,
                extensionPath: f
            })
        }
    }
    
    return allExtensions;
}

export async function getExtensions() {
    return [...await scanExtensions(), ...await getCustomExtensions()];
}
