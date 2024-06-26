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
  let actionsDisposable = vscode.commands.registerCommand(
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

  let templatesDisposable = vscode.commands.registerCommand(
    "extension.getTemplate",
    () => {
      // custom templates from settings
      const config = vscode.workspace.getConfiguration("autoTerminal");
      const customTemplates = config.get("customTemplates") || {};
      const customTemplateNames = Object.keys(customTemplates);

      // Default templates from the extension
      const templatesDir = path.join(__dirname, "templates");
      const defaultTemplates = fs.readdirSync(templatesDir);

      const templateOptions = [...defaultTemplates, ...customTemplateNames];

      vscode.window.showQuickPick(templateOptions).then((selectedOption) => {
        if (selectedOption) {
          // vscode.window.showInformationMessage(
          //   `Selected Template: ${selectedOption}`
          // );

          const templateFile: string = customTemplateNames.includes(
            selectedOption
          )
            ? JSON.stringify(
                customTemplates[selectedOption as keyof typeof customTemplates],
                null,
                2
              )
            : getTemplateFile(selectedOption);

          if (!templateFile) {
            vscode.window.showErrorMessage("Template file not found.");
            return;
          }

          if (vscode.workspace.workspaceFolders === undefined) {
            vscode.window.showErrorMessage("No workspace found");
            return;
          }

          const workspacePath = vscode.workspace.workspaceFolders[0].uri.fsPath;

          const templateConfigPath = path.join(
            workspacePath,
            "terminal.config.json"
          );

          // console.log("templateConfigPath", templateConfigPath);
          fs.writeFileSync(templateConfigPath, templateFile);
        }
      });
    }
  );

  context.subscriptions.push(actionsDisposable);
  context.subscriptions.push(usageGuideDisposable);
  context.subscriptions.push(templatesDisposable);

  const runOpenCommandsOnStartup: boolean | undefined = vscode.workspace
    .getConfiguration("autoTerminal")
    .get("runOpenCommandsOnStartup");

  if (runOpenCommandsOnStartup === undefined) {
    console.error("Cannot find open on start settings");
  }

  if (runOpenCommandsOnStartup) {
    const configFile = getConfigFile(true);

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
