import * as vscode from 'vscode';
import express from 'express'; // works with "type": "module" OR tsconfig settings
import path from 'path';
export function activate(context: vscode.ExtensionContext) {
	console.log('Extension "start" is now active!');

	
	const disposable = vscode.commands.registerCommand('start.helloWorld', () => {
		vscode.window.showInformationMessage('Hello World from start!');
	});
	context.subscriptions.push(disposable);

	
	const app = express();
	app.use(express.json());

	app.get('/', (req, res) => {
		res.json({ message: "hi" });
	});

	app.post('/command',async(req,res)=>{
		const command:string=req.body.command;
		const aiTerminal = vscode.window.createTerminal({
		name: "AI Terminal",
		hideFromUser: false
	});
		aiTerminal.show();
		await vscode.commands.executeCommand("AI Terminal",command)
	})
	app.post('/file',async(req,res)=>{
		const path=req.body.path
		const content=req.body.content
		const Uri=vscode.Uri.file(path)
		const dirname=path.dirname(path)
		  try {
		await vscode.workspace.fs.stat(vscode.Uri.file(dirname));
	  } catch {
		await vscode.workspace.fs.createDirectory(vscode.Uri.file(dirname));
	  }
		await vscode.workspace.fs.writeFile(path,Buffer.from(content, 'utf8'))
	})

	app.listen(9090, () => {
		console.log('Express server running on http://localhost:5173');
	});
}

export function deactivate() {}
