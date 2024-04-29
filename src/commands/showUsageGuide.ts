import * as vscode from "vscode";

import getConfigFile from "@/utils/getConfigFile";

export function showUsageGuideDisposable(context: vscode.ExtensionContext) {
  return vscode.commands.registerCommand("extension.showUsageGuide", () => {
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
  });
}

/**
 * This function generates HTML for a usage guide based on a configuration object.
 * @param configFile - An object containing the configuration for each section of the usage guide. Each key in the object represents a section, and the value is an array of configuration objects for that section.
 * @returns A string of HTML representing the usage guide.
 */
function generateUsageGuideHTML(configFile: any) {
  const sections = Object.keys(configFile);
  const sectionList = sections
    .map(
      (section) => `
          <h4>${section}</h4>
          <ul>
            ${generateSectionList(configFile[section])}
          </ul>
        `
    )
    .join("");

  return `
        <div>
          ${sectionList}
        </div>
      `;
}

function generateSectionList(section: any) {
  return section
    .map(
      (config: any) => `
          <li>
            <strong>${config.tab || config.name}: </strong> 
            ${config.description || ""}
            <code>${generateCommandList(config.commands)}</code>
          </li>
        `
    )
    .join("");
}

function generateCommandList(commands: any) {
  return commands.map((command: any) => command).join("; ");
}

export default showUsageGuideDisposable;
