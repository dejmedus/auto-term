import runCommands from "./utils/runCommands";
import getConfigFile from "./utils/getConfigFile";

import * as vscode from "vscode";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "auto-term" is now active!');
  const configFile = getConfigFile();

  if (!configFile) {
    return;
  }

  let disposable = vscode.commands.registerCommand(
    "extension.manageTerminals",
    (action) => {
      if (configFile[action]) {
        runCommands(configFile, action);
      } else {
        vscode.window.showErrorMessage(
          `Action not found in the configuration file: ${action}`
        );
      }
    }
  );

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
function deactivate() {}

// Export the activate and deactivate functions
module.exports = {
  activate,
  deactivate,
};
