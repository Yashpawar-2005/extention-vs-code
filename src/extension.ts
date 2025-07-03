import * as vscode from 'vscode';
import express from 'express'; // works with "type": "module" OR tsconfig settings

export function activate(context: vscode.ExtensionContext) {
	console.log('Extension "start" is now active!');

	// Register a command
	const disposable = vscode.commands.registerCommand('start.helloWorld', () => {
		vscode.window.showInformationMessage('Hello World from start!');
	});
	context.subscriptions.push(disposable);

	// ✅ Start Express inside activation
	const app = express();
	app.use(express.json());

	app.get('/', (req, res) => {
		res.json({ message: "hi" });
	});

	app.listen(9090, () => {
		console.log('Express server running on http://localhost:5173');
	});
}

export function deactivate() {}
