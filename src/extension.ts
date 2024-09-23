import * as vscode from "vscode";

import getConfigFile, { getConfigTabNames } from "./utils/getConfigFile";
import runAction from "./utils/runAction";

import actionDisposable from "./commands/action";
import showUsageGuideDisposable from "./commands/showUsageGuide";
import getTemplateDisposable from "./commands/getTemplate";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
async function activate(context: vscode.ExtensionContext) {
  const configFile = getConfigFile(true, true);

  if (!configFile) {
    activateSubscriptions(context);
    return;
  }

  const tabNames = getConfigTabNames(configFile);
  const terminals = vscode.window.terminals;
  for (const terminal of terminals) {
    if (tabNames.includes(terminal.name) && !terminal.shellIntegration) {
      terminal.sendText(": # Auto Term");
    }
  }

  activateSubscriptions(context);

  const runOpenCommandsOnStartup: boolean | undefined = vscode.workspace
    .getConfiguration("autoTerminal")
    .get("runOpenCommandsOnStartup");

  if (runOpenCommandsOnStartup) {
    if (configFile.hasOwnProperty("open")) {
      await runAction("open", configFile);
    }
  }
}

function activateSubscriptions(context: vscode.ExtensionContext) {
  context.subscriptions.push(actionDisposable);
  context.subscriptions.push(showUsageGuideDisposable(context));
  context.subscriptions.push(getTemplateDisposable);
}

// This method is called when your extension is deactivated
function deactivate() {}

// Export the activate and deactivate functions
module.exports = {
  activate,
  deactivate,
};
