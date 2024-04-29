import * as vscode from "vscode";

import manageTerminals from "@/utils/manageTerminals";
import getConfigFile from "@/utils/getConfigFile";

let actionDisposable = vscode.commands.registerCommand(
  "extension.action",
  () => {
    const configFile = getConfigFile();

    if (!configFile) {
      vscode.window.showErrorMessage("terminal.config file not found.");
      return;
    }

    const actionOptions = Object.keys(configFile);

    vscode.window.showQuickPick(actionOptions).then((selectedOption) => {
      if (selectedOption) {
        manageTerminals(selectedOption);
      }
    });
  }
);

export default actionDisposable;
