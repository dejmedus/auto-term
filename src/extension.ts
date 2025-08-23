import { workspace, ExtensionContext } from "vscode";

import getConfigFile, { IConfigFile } from "./utils/getConfigFile";
import runAction from "./utils/runAction";

import actionDisposable from "./commands/action";
import showUsageGuideDisposable from "./commands/showUsageGuide";
import getTemplateDisposable from "./commands/getTemplate";

async function activate(context: ExtensionContext) {
  const configFile = getConfigFile(true, true);

  if (!configFile) {
    activateSubscriptions(context);
    return;
  }

  await runOpenCommands(configFile);
  activateSubscriptions(context);
}

async function runOpenCommands(configFile: IConfigFile) {
  const runOpenCommandsOnStartup: boolean | undefined = workspace
    .getConfiguration("autoTerminal")
    .get("runOpenCommandsOnStartup");

  if (runOpenCommandsOnStartup) {
    if (configFile.hasOwnProperty("open")) {
      await runAction("open", configFile);
    }
  }
}

function activateSubscriptions(context: ExtensionContext) {
  context.subscriptions.push(actionDisposable);
  context.subscriptions.push(showUsageGuideDisposable(context));
  context.subscriptions.push(getTemplateDisposable);
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
