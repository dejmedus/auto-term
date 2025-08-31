import path from "path";
import fs from "fs";
import { window, commands, workspace } from "vscode";

let getTemplateDisposable = commands.registerCommand(
  "extension.getTemplate",
  () => {
    const config = workspace.getConfiguration("autoTerminal");
    const customTemplates: { [key: string]: {} } =
      config.get("customTemplates") || {};
    const customTemplateNames = Object.keys(customTemplates);

    const templatesDir = path.join(__dirname, "../templates");
    const defaultTemplateNames = fs.readdirSync(templatesDir);

    const templateOptions = [
      ...defaultTemplateNames,
      ...customTemplateNames,
    ].map((templateName) => {
      return templateName.replace(".json", "");
    });

    window.showQuickPick(templateOptions).then((selectedOption) => {
      if (!selectedOption) return;

      const templateFile = customTemplateNames.includes(selectedOption)
        ? JSON.stringify(customTemplates[selectedOption], null, 2)
        : getTemplateFile(selectedOption + ".json");

      if (!templateFile) {
        window.showErrorMessage("Template file not found.");
        return;
      }

      if (workspace.workspaceFolders === undefined) {
        window.showErrorMessage("No workspace found");
        return;
      }

      const workspacePath = workspace.workspaceFolders[0].uri.fsPath;

      const templateConfigPath = path.join(
        workspacePath,
        "terminal.config.json"
      );

      fs.writeFileSync(templateConfigPath, templateFile);
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
    window.showErrorMessage(`Template file '${templateName}' not found.`);
  }

  const templateContent = fs.readFileSync(templateFilePath, "utf8");

  return templateContent;
}

export default getTemplateDisposable;
