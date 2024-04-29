import * as vscode from "vscode";

import manageTerminals from "@/utils/manageTerminals";
import getConfigFile from "@/utils/getConfigFile";

import actionDisposable from "@/commands/action";
import showUsageGuideDisposable from "@/commands/showUsageGuide";
import getTemplateDisposable from "@/commands/getTemplate";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(actionDisposable);
  context.subscriptions.push(showUsageGuideDisposable(context));
  context.subscriptions.push(getTemplateDisposable);

  const runOpenCommandsOnStartup: boolean | undefined = vscode.workspace
    .getConfiguration("autoTerminal")
    .get("runOpenCommandsOnStartup");

  if (runOpenCommandsOnStartup === undefined) {
    console.error("Cannot find open on start settings");
  }

  if (runOpenCommandsOnStartup) {
    const configFile = getConfigFile(true, true);

    if (configFile) {
      if (configFile.hasOwnProperty("open")) {
        manageTerminals("open");
      }
    }
  }
}

// This method is called when your extension is deactivated
function deactivate() {}

// Export the activate and deactivate functions
module.exports = {
  activate,
  deactivate,
};
