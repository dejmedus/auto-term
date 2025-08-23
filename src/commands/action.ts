import { commands, window, workspace } from "vscode";

import runAction from "../utils/runAction";
import getConfigFile from "../utils/getConfigFile";
import { noShellIntegrationDialog } from "../utils/terminalHelpers";

let actionDisposable = commands.registerCommand(
  "extension.action",
  async () => {
    const shellIntegrationEnabled: boolean | undefined = await workspace
      .getConfiguration("terminal.integrated.shellIntegration")
      .get("enabled");

    if (!shellIntegrationEnabled) {
      noShellIntegrationDialog();
      return;
    }

    const configFile = getConfigFile();

    if (!configFile) {
      return;
    }
    const actionOptions = Object.keys(configFile);

    window.showQuickPick(actionOptions).then(async (selectedAction) => {
      if (selectedAction) {
        await runAction(selectedAction, configFile);
      }
    });
  }
);

export default actionDisposable;
