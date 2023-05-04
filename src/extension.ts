// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
const cp = require('child_process');

export function activate(context: vscode.ExtensionContext) {
	let testsOutput = vscode.window.createOutputChannel("Tests");

	let onFileSave = vscode.workspace.onDidSaveTextDocument(async (document: vscode.TextDocument) => {
		const configuration = vscode.workspace.getConfiguration('railsAutomaticTestRunner');
		const testsFilenameSuffix = _testFilenameSuffix(configuration);
		const testsDirectory = configuration.testsDirectory;

		if (document.languageId === "ruby" && document.uri.scheme === "file") {
			const workspaceFolder = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders[0];

			if (!workspaceFolder) {
				vscode.window.showErrorMessage("Rails Automatic Test runner won't work without Workspace");
				return;
			}

			const workspacePath = workspaceFolder.uri.path;
			const documentAbsolutePath = document.uri.path;
			const documentRelativePath = documentAbsolutePath.replace(workspacePath, '');
			const relativeTestPath = documentRelativePath.replace('/app/', `/${testsDirectory}/`).replace('.rb', testsFilenameSuffix);
			const absoluteTestPath = workspacePath + relativeTestPath;

			const fileInIgnoredDir = configuration.ignoredDirs.some((ignoredDir: string) => {
				return relativeTestPath.includes(ignoredDir)
			})

			if (fileInIgnoredDir) { return; }

			let testExists;
			try {
				await vscode.workspace.fs.stat(vscode.Uri.file(absoluteTestPath));
				testExists = true;
			} catch(e) {
				testExists = false;
			}

			if (testExists) {
				const command = createCommand(configuration, relativeTestPath);
				testsOutput.clear();
				if (configuration.automaticOutputDisplay) { testsOutput.show(); }

				let terminal = vscode.window.terminals.find(t => t.name === 'Rails Test Runner')
				if (terminal === undefined) {
					terminal = vscode.window.createTerminal('Rails Test Runner');
				}

				if (configuration.automaticOutputDisplay) { terminal.show(); }

				terminal.sendText(command)
			} else {
				if (!documentAbsolutePath.includes(`/${testsDirectory}`)) {
					vscode.window.showErrorMessage("Rails Automatic Test runner: no corresponding test file found.");
				}
			}
		}
	});

	context.subscriptions.push(onFileSave);
}

function createCommand(configuration: vscode.WorkspaceConfiguration, testPath: string) {
	let command = [];
	if (configuration.envVariables) { command.push(configuration.envVariables); }
	if (configuration.bundleExec) { command.push("bundle exec"); }
	if (configuration.framework === 'rspec') {
		command.push("rspec");
	} else if (configuration.framework === 'minitest') {
		command.push("rails test");
	}

	let formattedTestPath = testPath;
	if (testPath.charAt(0) === '/') { formattedTestPath = formattedTestPath.substring(1); }
	command.push(formattedTestPath);

	if (configuration.args) { command.push(configuration.args); }

	return command.join(' ');
}

function _testFilenameSuffix(configuration: vscode.WorkspaceConfiguration): string {
	if (configuration.framework === 'rspec') {
		return '_spec.rb';
	} else if (configuration.framework === 'minitest') {
		return '_test.rb';
	} else {
		return '_spec.rb';
	}
}

export function deactivate() {}
