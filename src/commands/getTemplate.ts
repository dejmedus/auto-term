import path from "path";
import fs from "fs";
import * as vscode from "vscode";

let getTemplateDisposable = vscode.commands.registerCommand(
  "extension.getTemplate",
  () => {
    // custom templates from settings
    const config = vscode.workspace.getConfiguration("autoTerminal");
    const customTemplates = config.get("customTemplates") || {};
    const customTemplateNames = Object.keys(customTemplates);

    // default templates from the extension
    const templatesDir = path.join(__dirname, "templates");
    const defaultTemplates = fs.readdirSync(templatesDir);

    const templateOptions = [...defaultTemplates, ...customTemplateNames];

    vscode.window.showQuickPick(templateOptions).then((selectedOption) => {
      if (selectedOption) {
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

/**
 * This function retrieves the content of a template file.
 * @param templateName - The name of the template file to retrieve.
 * @returns The content of the template file as a string.
 * @throws {Error} If the template file does not exist.
 */
export function getTemplateFile(templateName: string): string {
  const extensionPath = path.join(__dirname, "..");
  const templateDir = path.join(extensionPath, "templates");
  const templateFilePath = path.join(templateDir, templateName);

  if (!fs.existsSync(templateFilePath)) {
    throw new Error(`Template file '${templateName}' not found.`);
  }

  const templateContent = fs.readFileSync(templateFilePath, "utf8");

  return templateContent;
}

export default getTemplateDisposable;
