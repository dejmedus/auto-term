import * as vscode from "vscode";

import runAction from "../utils/runAction";
import getConfigFile from "../utils/getConfigFile";
import { noShellIntegrationDialog } from "../utils/terminalHelpers";

let actionDisposable = vscode.commands.registerCommand(
  "extension.action",
  async () => {
    const shellIntegrationEnabled: boolean | undefined = await vscode.workspace
      .getConfiguration("terminal.integrated.shellIntegration")
      .get("enabled");

    if (!shellIntegrationEnabled) {
      noShellIntegrationDialog();
      return;
    }

    const configFile = getConfigFile();

    if (!configFile) {
      vscode.window.showErrorMessage(
        `No configuration file found. Please create a terminal.config.json file in the root of your project.`
      );
      return;
    }
    const actionOptions = Object.keys(configFile);

    vscode.window.showQuickPick(actionOptions).then(async (selectedAction) => {
      if (selectedAction) {
        await runAction(selectedAction, configFile);
      }
    });
  }
);

export default actionDisposable;
