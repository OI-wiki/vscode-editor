import fse from "fs-extra";
const { mkdir, rm, existsSync, copy, readFile, writeFile } = fse;

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

    if(existsSync("./vscode")) {
        await rm("./vscode", { recursive: true, force: true });
    }
}

async function prepareInstall() {
    run(`git clone -b ${VSCODE_VERSION} --depth=1 ${VSCODE_REPO} ./vscode`);
    run(`yarn install`, './vscode');
    run(`yarn install`, './extensions');
}

async function buildVSCode() {

    const gulpfilePath = "./vscode/build/gulpfile.vscode.js";
    const gulpfile = (await readFile(gulpfilePath, { encoding: "utf8", flag: "r" }))
        .replace(
            /vs\/workbench\/workbench.desktop.main/g,
            "vs/workbench/workbench.web.api"
        )
        .replace(
            /buildfile.workbenchDesktop/g,
            "buildfile.workbenchWeb,buildfile.keyboardMaps"
        );
    
    await writeFile(gulpfilePath, gulpfile);
    
    await copy("./build-shadow", "./vscode")

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
            `./public/extensions/${ext.extensionPath}`, 
            {
                // web extensions do not require a node_modules to run
                // and node_modules is flooding too much files in the build
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

await main();