import vscode from "vscode";
import path from "path";
import fs from "fs";

export default function getConfigFile() {
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];

  if (!workspaceFolder) {
    vscode.window.showErrorMessage("No workspace found.");
    return;
  }

  const configFile = path.join(
    workspaceFolder.uri.fsPath,
    "terminal.config.json"
  );

  if (!fs.existsSync(configFile)) {
    vscode.window.showErrorMessage(
      "terminal.config.json not found in the workspace."
    );
    return;
  }

  const terminalConfigurations = require(configFile);

  return terminalConfigurations;
}
