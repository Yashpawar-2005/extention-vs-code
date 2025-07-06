import * as vscode from 'vscode';
import express from 'express';
import websocket from 'ws';
import path from 'path';

let aiTerminal: vscode.Terminal | null = null;


const fileFunction=async(parsed:any)=>{
			const filePath = parsed.filePath;
		const content = parsed.fileContent;

		const Uri = vscode.Uri.file(filePath);
		const dirname = path.dirname(filePath);
			try {
			await vscode.workspace.fs.stat(vscode.Uri.file(dirname));
		} catch {
			await vscode.workspace.fs.createDirectory(vscode.Uri.file(dirname));
		}
		
		await vscode.workspace.fs.writeFile(Uri, Buffer.from(content, 'utf8'));
		const document = await vscode.workspace.openTextDocument(Uri);
		await vscode.window.showTextDocument(document);
		}



export function activate(context: vscode.ExtensionContext) {
	console.log('Extension "start" is now active!');

	const disposable = vscode.commands.registerCommand('start.helloWorld', () => {
		vscode.window.showInformationMessage('Hello World from start!');
	});
	context.subscriptions.push(disposable);

	const wss = new websocket.Server({ port: 9091 });

	wss.on('connection', (ws) => {
		console.log('WebSocket client connected');
		vscode.window.showInformationMessage('WS Extension Activated');
		ws.send("hi from WebSocket server");
		
ws.on('message', async(message) => {
	console.log('Raw message received:', message.toString());

	let parsed;
	try {
		parsed = JSON.parse(message.toString());
	} catch (err) {
		ws.send(` Failed to parse message: ${err}`);
		return;
	}

	if (parsed.type === "file") {
		
		await fileFunction(parsed)
		ws.send(`File being parsed is ${parsed.filePath}`);
	} 
	else if (parsed.type === "command") {
		if (!aiTerminal) {
			aiTerminal = vscode.window.createTerminal({
				name: "Mera terminal hai kya kar lega",
				hideFromUser: false
			});
		}
		aiTerminal.show(true);
		aiTerminal.sendText(parsed.command);
		ws.send(`Server executed command: ${parsed.command}`);
	} else {
		ws.send(`Unknown message type received: ${message.toString()}`);
	}
});


		ws.on('close', () => {
			console.log('WebSocket client disconnected');
		}); 	

		ws.on('error', (error) => {
			console.error('WebSocket error:', error);
		});
	});

	console.log('WebSocket server started on port 9091');

	const app = express();
	app.use(express.json());

	app.get('/', (req, res) => {
		res.json({ message: "teri mkc" });
	});

	app.post('/command', async (req, res) => {
		const command: string = req.body.command;

		if (!aiTerminal) {
			aiTerminal = vscode.window.createTerminal({
				name: "AI Terminal",
				hideFromUser: false
			});
		}

		aiTerminal.show(true);
		aiTerminal.sendText(command);

		res.json({ status: `Command "${command}" sent to AI Terminal.` });
	});

	app.post('/file', async (req, res) => {
		const filePath = req.body.path;
		const content = req.body.content;

		const Uri = vscode.Uri.file(filePath);
		const dirname = path.dirname(filePath);

		try {
			await vscode.workspace.fs.stat(vscode.Uri.file(dirname));
		} catch {
			await vscode.workspace.fs.createDirectory(vscode.Uri.file(dirname));
		}

		await vscode.workspace.fs.writeFile(Uri, Buffer.from(content, 'utf8'));
		res.json({ status: `File written to ${filePath}` });
	});

	app.listen(9090, () => {
		console.log('Express server running on http://localhost:9090');
	});
}

export function deactivate() {
	if (aiTerminal) {
		aiTerminal.dispose();
		aiTerminal = null;
	}
}
