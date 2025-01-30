// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import ollama from 'ollama';
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "louzzy-ai" is now active !');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('louzzy-ai.start', () => {
		// The code you place here will be executed every time your command is executed
		const panel = vscode.window.createWebviewPanel(
			'deepChat',
			'Louzzy AI',
			vscode.ViewColumn.One,
			{ enableScripts: true }
		);

		panel.webview.html = getWebviewContent();
		let skip = 0;
		panel.webview.onDidReceiveMessage(async (message: any) => {
			if (message.command === 'chat') {
				const userPrompt = message.prompt;
				let responseText = '';
				try {
					const streamResponse = await ollama.chat({
						model: 'deepseek-r1:latest',
						messages: [{ role: 'user', content: userPrompt }],
						stream: true
					});

					for await (const part of streamResponse) {
						responseText += part.message.content;
						
						panel.webview.postMessage({ command: 'chatResponse', text: responseText });
					}
					panel.webview.postMessage({ command: 'chatResponseEnd' });
					skip = 0;
				} catch (error: any) {
					panel.webview.postMessage({ command: 'chatResponse', text: `Error: ${String(error)}` });
				}
			}
		});
	});

	context.subscriptions.push(disposable);
}

function getWebviewContent() {
	return /*html*/`
	<!DOCTYPE html>
	<html lang="en">
	<head>
		<meta charset="UTF-8">
		<style>
			body { font-family: sans-serif; margin: 1rem; color: white }
			#prompt { width: 100%; box-sizing: border-box; border-radius: 8px; padding: 0.5rem; margin-bottom: 0.5rem; }
			#response { margin-top: 1rem; min-height: 50vh; }
			button { padding: 0.5rem 1rem; border: none; background-color: #007acc; color: white; border-radius: 8px; cursor: pointer; }
			button:hover { background-color: #005f80; }
			.user-message { color: #007acc; border: 1px solid #007acc; background-color:rgb(27, 27, 27); padding: 2vh; border-radius: 8px; margin-bottom: 2vh;}
			.ai-message { color:rgb(105, 179, 194); border: 1px solid #00aacc;  background-color:rgb(20, 20, 20); padding: 2vh; border-radius: 8px; }
			pre { background-color: #333; padding: 1rem; border-radius: 8px; overflow-x: auto; }
			code { color: #dcdcaa; }
		</style>
		<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.5.1/styles/atom-one-dark.min.css">
		<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.5.1/highlight.min.js"></script>
		<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
	</head>
	<body>
		<h2>Chat with Louzzy AI</h2>
		<textarea id="prompt" rows="3" placeholder="Ask something..."></textarea><br />
		<button id="askBtn">Ask</button>
		<div id="response"></div>

		<script>
			const vscode = acquireVsCodeApi();
			let messageId = 0;
			document.getElementById('askBtn').addEventListener('click', () => {
				const promptElement = document.getElementById('prompt');
				const prompt = promptElement.value;
				
				const responseDiv = document.getElementById('response');

				responseDiv.innerHTML = '<div class="user-message" id="message_' + messageId.toString() + '">You: ' + prompt + '</div>';
				messageId++;
				responseDiv.innerHTML += '<div class="ai-message" id="message_' + messageId.toString() + '">AI: </div>';

				vscode.postMessage({ command: 'chat', prompt });

				promptElement.disabled = true;
			});

			document.getElementById('prompt').addEventListener('keydown', (event) => {
				if (event.key === 'Enter' && !event.shiftKey) {
					event.preventDefault();
					document.getElementById('askBtn').click();
				}
			});

			window.addEventListener('message', event => {
				const { command, text } = event.data;
				const responseElement = document.getElementById('message_' + messageId.toString());
				if (command === 'chatResponse') {
					responseElement.innerHTML = marked.parse(text);
					document.querySelectorAll('pre code').forEach((block) => {
						hljs.highlightElement(block);
					});
				} else if (command === 'chatResponseEnd') {
					document.getElementById('prompt').value = '';
					document.getElementById('prompt').disabled = false;
					messageId++;
				}
			});
		</script>
	</body>
	</html>`;
}

// This method is called when your extension is deactivated
export function deactivate() {}
