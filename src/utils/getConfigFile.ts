import vscode from "vscode";
import path from "path";
import fs from "fs";

export interface IConfigFile {
  [key: string]: Array<
    | {
        name: string;
        commands: string[];
        description?: string;
      }
    | {
        tab: string;
        commands: string[];
        description?: string;
      }
  >;
}

/**
 * Retrieves the configuration file.
 * @param allowMissingConfig - If true, no error messages will be displayed when the configuration file is missing. Defaults to false.
 * @param allowMissingWorkspace - If true, no error messages will be displayed when a workspace is missing. Defaults to false.
 */
export default function getConfigFile(
  allowMissingConfig: boolean = false,
  allowMissingWorkspace: boolean = false
): IConfigFile | undefined {
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];

  if (!workspaceFolder) {
    if (!allowMissingWorkspace) {
      vscode.window.showErrorMessage("No workspace found.");
    }
    return;
  }

  const terminalConfig = path.join(
    workspaceFolder.uri.fsPath,
    "terminal.config.json"
  );

  if (!fs.existsSync(terminalConfig)) {
    !allowMissingConfig &&
      vscode.window.showErrorMessage(
        "terminal.config.json not found in the workspace."
      );

    return;
  }

  const configFile: IConfigFile = JSON.parse(
    fs.readFileSync(terminalConfig, "utf8")
  );

  return configFile;
}

export function getConfigTabNames(config: IConfigFile): string[] {
  const tabNames = new Set<string>();

  for (const key in config) {
    for (const term of config[key]) {
      const tabName = "tab" in term ? term.tab : term.name;
      tabNames.add(tabName);
    }
  }

  return Array.from(tabNames);
}
