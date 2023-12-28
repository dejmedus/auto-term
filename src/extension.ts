// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import path from "path";
import fs from "fs";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "auto-term" is now active!');

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand(
    "extension.openTerminals",
    () => {
      openTerminals();
    }
  );

  context.subscriptions.push(disposable);
}

function openTerminals() {
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];

  if (!workspaceFolder) {
    vscode.window.showErrorMessage("No workspace found.");
    return;
  }

  const configFile = path.join(
    workspaceFolder.uri.fsPath,
    "terminalConfigurations.json"
  );

  if (!fs.existsSync(configFile)) {
    vscode.window.showErrorMessage(
      "terminalConfigurations.json not found in the workspace."
    );
    return;
  }

  try {
    const terminalConfigurations = require(configFile);

    if (!Array.isArray(terminalConfigurations)) {
      vscode.window.showErrorMessage(
        "Invalid terminalConfigurations file format."
      );
      return;
    }

    terminalConfigurations.forEach(
      (config: { name: string; command: string }) => {
        if (
          typeof config.name === "string" &&
          typeof config.command === "string"
        ) {
          const terminal = vscode.window.createTerminal({ name: config.name });
          terminal.show();
          terminal.sendText(config.command);
        } else {
          vscode.window.showErrorMessage(
            `Invalid terminal configuration format. ${config}`
          );
        }
      }
    );
  } catch (error) {
    vscode.window.showErrorMessage(
      `Error reading terminalConfigurations: ${error}`
    );
  }
}

// This method is called when your extension is deactivated
export function deactivate() {}
