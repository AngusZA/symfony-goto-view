'use strict';

import { workspace, TextDocument, Uri, ExtensionContext, WorkspaceConfiguration } from 'vscode';
import * as fs from "fs";
import * as path from "path";

export function getFilePath(text: string, document: TextDocument) {
    let paths = getFilePaths(text, document);
    return paths.length > 0 ? paths[0] : null;
}

export function getFilePaths(text: string, document: TextDocument) {
    let workspaceFolder = workspace.getWorkspaceFolder(document.uri)?.uri.fsPath || '';
    let config = workspace.getConfiguration('symfony_goto_view');
    let paths = scanViewPaths(workspaceFolder, config);
    let file = text.replace(/\"|\'/g, '').split('::');
    let result = [];

    for (let item in paths) {
        let showPath = paths[item] + `/${file[0]}`;
        if (file.length > 1) {
            if (item !== file[0]) {
                continue;
            } else {
                showPath = paths[item] + `/${file[1]}`;
            }
        }
        
        let filePath = workspaceFolder + showPath;

        if (fs.existsSync(filePath)) {
            result.push({
                "name": item,
                "showPath": showPath,
                "fileUri": Uri.file(filePath)
            });            
        }
        
    }

    return result;
}

function scanViewPaths(workspaceFolder: string, config: WorkspaceConfiguration) {
    let folders = Object.assign({}, config.folders);

    let bundlePath = path.join(workspaceFolder, 'src');
    if (fs.existsSync(bundlePath)) {
        fs.readdirSync(bundlePath).forEach(element => {
            let file = path.join(bundlePath, element, 'Resources/views');
            if (fs.existsSync(file) && fs.statSync(file).isDirectory()) {
                folders[element.toLowerCase()] = `/src/${element}/Resources/views`;
            }
        });
    }  

    return folders;
}
