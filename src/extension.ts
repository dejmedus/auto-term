import path from "path";
import fs from "fs";
import * as vscode from "vscode";

import runCommands from "./utils/runCommands";
import getConfigFile from "./utils/getConfigFile";
import generateUsageGuideHTML from "./utils/webview";
import getTemplateFile from "./utils/getTemplateFile";

function manageTerminals(action: string) {
  const configFile = getConfigFile();

  if (!configFile) {
    return;
  }

  if (configFile[action]) {
    runCommands(configFile[action]);
  } else {
    vscode.window.showErrorMessage(
      `Action not found in the configuration file: ${action}`
    );
  }
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "auto-term" is now active!');

  let setupDisposable = vscode.commands.registerCommand(
    "extension.setupTerminals",
    () => manageTerminals("setup")
  );
  let openDisposable = vscode.commands.registerCommand(
    "extension.openTerminals",
    () => manageTerminals("open")
  );
  let startDisposable = vscode.commands.registerCommand(
    "extension.startTerminals",
    () => manageTerminals("start")
  );
  let stopDisposable = vscode.commands.registerCommand(
    "extension.stopTerminals",
    () => manageTerminals("stop")
  );
  let restartDisposable = vscode.commands.registerCommand(
    "extension.restartTerminals",
    () => manageTerminals("restart")
  );
  let closeDisposable = vscode.commands.registerCommand(
    "extension.closeTerminals",
    () => manageTerminals("close")
  );

  context.subscriptions.push(setupDisposable);
  context.subscriptions.push(openDisposable);
  context.subscriptions.push(startDisposable);
  context.subscriptions.push(stopDisposable);
  context.subscriptions.push(restartDisposable);
  context.subscriptions.push(closeDisposable);

  const customActionDisposable = vscode.commands.registerCommand(
    "extension.customActions",
    async () => {
      const action = await vscode.window.showInputBox({
        placeHolder: "Enter action name (e.g., 'open', 'close')",
        prompt: "Enter the action name to manage terminals",
      });

      if (action) {
        manageTerminals(action);
      }
    }
  );

  context.subscriptions.push(customActionDisposable);

  let usageGuideDisposable = vscode.commands.registerCommand(
    "extension.showUsageGuide",
    () => {
      const configFile = getConfigFile();

      if (!configFile) {
        vscode.window.showErrorMessage("Configuration file not found.");
        return;
      }

      const panel = vscode.window.createWebviewPanel(
        "usageGuide",
        "Usage Guide",
        vscode.ViewColumn.One,
        {}
      );

      panel.webview.onDidReceiveMessage(
        (message) => {
          if (message.command === "refresh") {
            const updatedContent = generateUsageGuideHTML(getConfigFile());
            panel.webview.html = updatedContent;
          }
        },
        undefined,
        context.subscriptions
      );

      const usageGuideContent = generateUsageGuideHTML(configFile);
      panel.webview.html = usageGuideContent;
    }
  );

  context.subscriptions.push(usageGuideDisposable);

  let templatesDisposable = vscode.commands.registerCommand(
    "extension.getTemplate",
    () => {
      const templatesDir = path.join(__dirname, "templates");
      const templateOptions = fs.readdirSync(templatesDir);

      vscode.window.showQuickPick(templateOptions).then((selectedOption) => {
        if (selectedOption) {
          vscode.window.showInformationMessage(
            `Selected option: ${selectedOption}`
          );
          const templateFile: string = getTemplateFile(selectedOption);

          if (!templateFile) {
            vscode.window.showErrorMessage("Template file not found.");
            return;
          }

          console.log("templateFile", templateFile);

          if (vscode.workspace.workspaceFolders === undefined) {
            vscode.window.showErrorMessage("No workspace found");
            return;
          }

          const workspacePath = vscode.workspace.workspaceFolders[0].uri.fsPath;

          const templateConfigPath = path.join(
            workspacePath,
            "template.config.json"
          );

          console.log("templateConfigPath", templateConfigPath);

          fs.writeFileSync(
            templateConfigPath,
            JSON.stringify(templateFile, null, 2)
          );
        }
      });
    }
  );

  context.subscriptions.push(templatesDisposable);
}

// This method is called when your extension is deactivated
function deactivate() {}

// Export the activate and deactivate functions
module.exports = {
  activate,
  deactivate,
};
