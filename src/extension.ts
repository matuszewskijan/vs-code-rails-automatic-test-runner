// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
const cp = require('child_process');

export function activate(context: vscode.ExtensionContext) {
	let testsOutput = vscode.window.createOutputChannel("Tests");

	let onFileSave = vscode.workspace.onDidSaveTextDocument(async (document: vscode.TextDocument) => {
		if (document.languageId === "ruby" && document.uri.scheme === "file") {
			const workspaceFolder = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders[0]

			if (!workspaceFolder) {
				vscode.window.showErrorMessage("Rails Automatic Test runner won't work without Workspace");
				return;
			}

			const workspacePath = workspaceFolder.uri.path;
			const documentAbsolutePath = document.uri.path;
			const documentRelativePath = documentAbsolutePath.replace(workspacePath, '');
			const relativeTestPath = documentRelativePath.replace('/app/', '/spec/').replace('.rb', '_spec.rb');
			const absoluteTestPath = workspacePath + relativeTestPath;

			let testExists;
			try {
				await vscode.workspace.fs.stat(vscode.Uri.file(absoluteTestPath))
				testExists = true;
			} catch(e) {
				testExists = false;
			}

			if (testExists) {
				testsOutput.clear()
				cp.exec(
					`bundle exec rspec ./${relativeTestPath}`,
					{ timeout: 10000, cwd: workspacePath },
					(err: string, stdout: string, stderr:string) => {
						if (stdout) {
							testsOutput.appendLine(stdout);
						} else if (stderr) {
							testsOutput.appendLine(stdout);
						} else if (err) {
							vscode.window.showErrorMessage('Rails Automatic Test runner error: ' + err);
						}

						testsOutput.show();
					}
				);
			} else {
				if (!documentAbsolutePath.includes('/spec')) {
					vscode.window.showErrorMessage("Rails Automatic Test runner: no corresponding test file found.");
				}
			}
		}
	});

	context.subscriptions.push(onFileSave);
}

export function deactivate() {}
