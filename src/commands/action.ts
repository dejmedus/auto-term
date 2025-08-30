import { commands, window, workspace, Memento } from "vscode";

import { extensionContext } from "../extension";
import runAction from "../utils/runAction";
import getConfigFile, { IConfigFile } from "../utils/getConfigFile";
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
    if (!configFile) return;
    const { globalState } = extensionContext;
    const actionOptions = getActionOrder(globalState, configFile);

    window.showQuickPick(actionOptions).then(async (selectedAction) => {
      if (selectedAction) {
        setActionOrder(globalState, selectedAction, actionOptions);
        await runAction(selectedAction, configFile);
      }
    });
  }
);

function getActionOrder(
  globalState: Memento,
  configFile: IConfigFile
): string[] {
  const actionConfig = Object.keys(configFile);
  const lastConfigHash = globalState.get("lastConfigHash");
  const curConfigHash = JSON.stringify([...actionConfig].sort());

  if (lastConfigHash !== curConfigHash) {
    globalState.update("actionOrder", actionConfig);
    globalState.update("lastConfigHash", curConfigHash);
    return actionConfig;
  }

  const curActionOrder = globalState.get("actionOrder", []);

  if (curActionOrder.length === 0) {
    globalState.update("actionOrder", actionConfig);
    return actionConfig;
  }

  return curActionOrder;
}

function setActionOrder(
  globalState: Memento,
  action: string,
  lastUsedOrder: string[]
) {
  const newOrder = [action, ...lastUsedOrder.filter((item) => item !== action)];
  globalState.update("actionOrder", newOrder);
}

export default actionDisposable;
