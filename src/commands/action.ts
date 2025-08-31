import { commands, window, workspace, Memento } from "vscode";

import runAction from "../utils/runAction";
import getConfigFile, { IConfigFile } from "../utils/getConfigFile";
import { extensionContext } from "../extension";
import { noShellIntegrationDialog } from "../utils/terminalHelpers";
import { log } from "../utils/logger";

let actionDisposable = commands.registerCommand(
  "extension.action",
  async () => {
    const shellIntegrationEnabled: boolean | undefined = await workspace
      .getConfiguration("terminal.integrated.shellIntegration")
      .get("enabled");

    if (!shellIntegrationEnabled) {
      log.warn("Shell integration disabled");
      noShellIntegrationDialog();
      return;
    }

    const configFile = getConfigFile();
    if (!configFile) {
      log.warn("Config file could not be loaded");
      return;
    }
    const { globalState } = extensionContext;
    const actionOptions = getActionOrder(globalState, configFile);

    window.showQuickPick(actionOptions).then(async (selectedAction) => {
      if (selectedAction) {
        log.info(`Action selected: ${selectedAction}`);
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
