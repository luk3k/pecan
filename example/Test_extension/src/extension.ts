// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

const decorationType1 = vscode.window.createTextEditorDecorationType({
	backgroundColor: '#fff'
});
const decorationType2 = vscode.window.createTextEditorDecorationType({
	backgroundColor: '#aaa'
});

export function activate(ctx: vscode.ExtensionContext) {
	
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "test" is now active!');

	let save = vscode.workspace.onWillSaveTextDocument(event => {
		const openEditor = vscode.window.visibleTextEditors.filter(
			editor => editor.document.uri === event.document.uri
		  )[0]

		const ranges = [new vscode.Range(0, 3, 0, 6), new vscode.Range(1, 3, 1, 6)];
		openEditor.setDecorations(decorationType1, ranges);
	});

	let change = vscode.workspace.onDidChangeTextDocument(event => {
		const openEditor = vscode.window.visibleTextEditors.filter(
			editor => editor.document.uri === event.document.uri
		  )[0]

		const ranges = [new vscode.Range(0, 6, 0, 9), new vscode.Range(1, 6, 1, 9)];
		openEditor.setDecorations(decorationType2, ranges);
	});

	let r = new vscode.Range(0, 5, 0, 3);

	ctx.subscriptions.push(save);
	ctx.subscriptions.push(change);
}

// this method is called when your extension is deactivated
export function deactivate() {}
