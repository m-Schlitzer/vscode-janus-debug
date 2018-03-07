import * as nodeDoc from 'node-documents-scripting';
import * as os from 'os';
import * as path from 'path';
import * as vscode from 'vscode';
import * as helpers from './helpers';
import * as intellisense from './intellisense';
import * as serverCommands from './serverCommands';

// tslint:disable-next-line:no-var-requires
const fs = require('fs-extra');

const uMage = "\u{1F9D9}: ";

export async function downloadCreateProject(loginData: nodeDoc.ConnectionInformation, param: any, extensionPath: string): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
        const wizard = uMage + "A project  containing all server scripts will be created! This will take a few seconds...";
        let answer = await vscode.window.showQuickPick(["Continue", "Cancel"], {placeHolder: wizard});
        if (answer !== "Continue") {
            return resolve();
        }

        let fsPath;
        if (param) {
            fsPath = param._fsPath;
        }
        if (!fsPath) {
            let workspaceFolder = "";
            if (vscode.workspace && vscode.workspace.workspaceFolders) {
                workspaceFolder = vscode.workspace.workspaceFolders[0].uri.fsPath;
            }
            fsPath = await vscode.window.showInputBox({value: workspaceFolder});
        }
        if (!fsPath) {
            return resolve();
        }
        let folderContent;
        try {
            folderContent = fs.readdirSync(fsPath);
        } catch (err) {
            vscode.window.showErrorMessage(uMage + err);
            return resolve();
        }
        if (folderContent && folderContent.length > 1 || (folderContent.length === 1 && folderContent[0] !== ".vscode-janus-debug")) {
            vscode.window.showErrorMessage(uMage + "Start again with an empty folder please");
            return resolve();
        }
        const src = path.join(fsPath, "src");
        fs.emptyDirSync(src);

        const extensionSettings = vscode.workspace.getConfiguration('vscode-janus-debug');

        answer = await vscode.window.showQuickPick(["Yes", "No"], {placeHolder: uMage + "Create subfolders from categories?"});
        if ("Yes" === answer) {
            extensionSettings.update('categories', true);
        }

        // execute Download All command
        vscode.window.setStatusBarMessage("Establishing connection to server...");
        try {
            await serverCommands.downloadAllSelected(loginData, src, false);
        } catch (err) {
            vscode.window.setStatusBarMessage("");
            vscode.window.showErrorMessage(uMage + `The connection to ${loginData.server} cannot be established, please check if the server is runing`);

            // clean up everything from Download All command
            // but keep the activation file
            fs.emptyDirSync(fsPath);
            loginData.resetLoginData();
            fs.writeFileSync(path.join(fsPath, helpers.CACHE_FILE), "");

            return resolve();
        }
        helpers.showWarning(loginData);
        await intellisense.getAllTypings(loginData, true);

        const source = path.join(extensionPath, "portalscript", "templates", "jsconfig.json");
        const dest = path.join(fsPath, "jsconfig.json");
        fs.copySync(source, dest);

        const browsers = [
            "iexplore",
            "mozilla",
            "chrome",
            "safari",
            "firefox"
          ];
        const browser = await vscode.window.showQuickPick(browsers, {placeHolder: uMage + "Please select your favourite browser for documentation"});
        extensionSettings.update('browser', browser);

        vscode.window.showInformationMessage(uMage + "Finished! When you want to rename folder 'src', you should also rename it in 'jsconfig.json'");

        return resolve();
    });
}
