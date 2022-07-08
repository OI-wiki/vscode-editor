import fse from "fs-extra";
const { rm, existsSync, copy, readFile, writeFile, access } = fse;

import { execSync } from 'child_process';

const VSCODE_REPO = "https://github.com/microsoft/vscode";
const VSCODE_VERSION = "1.63.2";

function run(command, cwd=".") {
    execSync(command, { stdio: "inherit", cwd });
}

async function clean() {
    console.log("build: cleaning workspace");
    if (existsSync("./public")) {
        await rm("./public", { recursive: true, force: true });
    }

    // if(existsSync("./vscode")) {
    //     await rm("./vscode", { recursive: true, force: true });
    // }
}

async function prepareInstall() {
    if(!existsSync("./vscode")) run(`git clone -b ${VSCODE_VERSION} --depth=1 ${VSCODE_REPO} ./vscode`);
    run(`yarn install`, './vscode');
    run(`yarn install`, './extensions');
}

async function buildVSCode() {

    run(`git reset --hard`, './vscode');
    // run(`git apply ../patches/*.patch`, './vscode');
    await copy('./product.json', './vscode/product.json');


    run(`yarn gulp compile-build`, './vscode');
    run(`yarn gulp minify-vscode`, './vscode');
    run(`yarn compile-web`, './vscode');
    run(`yarn workspaces run package-web`, "./extensions");
}

function escapeAttribute(value) {
	return value.replace(/"/g, '&quot;');
}

async function build() {
    await copy("./vscode/out-vscode-min/vs", "./public/vs");
    await copy("./shadow", "./public");

    const webConfig = JSON.parse((await readFile("./webConfig.json")).toString());
    
    // copy some non-packaged dependencies
    await copy("./vscode/node_modules/vscode-textmate/release/main.js", "./public/vscode-textmate.js");
    await copy("./vscode/node_modules/vscode-oniguruma/release/main.js", "./public/vscode-oniguruma.js");
    await copy("./vscode/node_modules/vscode-oniguruma/release/onig.wasm", "./public/onig.wasm");


    // write extensions list to another file to avoid long inline html meta
    const { getExtensions } = await import('./ext.js');
    const extensions = await getExtensions();
    for (const ext of extensions) {
        await copy(
            ext.customPath ?? `./vscode/extensions/${ext.extensionPath}`, 
            `./public/extensions/${ext.extensionPath}`, {
                // web extensions do not require a node_modules to run
                filter: (f) => f.indexOf('node_modules') == -1
            });
    }

    const extJs = `var __extensions = ${JSON.stringify(extensions)}`;
    await writeFile("./public/extensions.js", extJs);
    
    const newIndex = (await readFile("./public/index.html")).toString()
        .replace("{{WORKBENCH_WEB_CONFIGURATION}}", () => escapeAttribute(JSON.stringify(webConfig)))
		.replace("{{WORKBENCH_AUTH_SESSION}}", () => "")
		.replace("{{WEBVIEW_ENDPOINT}}", "");
    await writeFile("./public/index.html", newIndex)
}

async function main() {
    const cmd = process.argv?.[2];
    if (cmd) {
        switch (cmd) {
            case "clean": await clean(); return;
            case "prepare": await prepareInstall(); return;
            case "vsc": await buildVSCode(); return;
            case "build": await build(); return;
            default: console.log("unrecognized command", cmd); return;
        }
    }
    await clean();
    await prepareInstall();
    await buildVSCode();
    await build();
}

main();