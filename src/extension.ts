import { workspace, ExtensionContext } from "vscode";

import getConfigFile, { IConfigFile } from "./utils/getConfigFile";
import runAction from "./utils/runAction";
import { log } from "./utils/logger";

import actionDisposable from "./commands/action";
import showUsageGuideDisposable from "./commands/showUsageGuide";
import getTemplateDisposable from "./commands/getTemplate";

export let extensionContext: ExtensionContext;

async function activate(context: ExtensionContext) {
  extensionContext = context;

  log.info("Auto Terminal started!");

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
    if ("open" in configFile) {
      log.info("Running open commands");
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
