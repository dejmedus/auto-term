import vscode from "vscode";
import path from "path";
import fs from "fs";

/**
 * This function retrieves the configuration file.
 * @param allowMissingConfig - If true, no error messages will be displayed when the configuration file is missing. Defaults to false.
 * @param allowMissingWorkspace - If true, no error messages will be displayed when a workspace is missing. Defaults to false.
 */
export default function getConfigFile(
  allowMissingConfig: boolean = false,
  allowMissingWorkspace: boolean = false
) {
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];

  if (!workspaceFolder) {
    if (!allowMissingWorkspace) {
      vscode.window.showErrorMessage("No workspace found.");
    }
    return;
  }

  const configFile = path.join(
    workspaceFolder.uri.fsPath,
    "terminal.config.json"
  );

  if (!fs.existsSync(configFile)) {
    if (!allowMissingConfig) {
      vscode.window.showErrorMessage(
        "terminal.config.json not found in the workspace."
      );
    }
    return;
  }

  const terminalConfigurations = JSON.parse(
    fs.readFileSync(configFile, "utf8")
  );

  return terminalConfigurations;
}
