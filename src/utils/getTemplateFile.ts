import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";

export default function getTemplateFile(templateName: string) {
  const extensionPath = path.join(__dirname, "..");

  const templateDir = path.join(extensionPath, "templates");

  console.log("templateDir", templateDir);

  const templateFilePath = path.join(templateDir, templateName);

  console.log("templateFilePath", templateFilePath);

  if (!fs.existsSync(templateFilePath)) {
    throw new Error(`Template file '${templateName}' not found.`);
  }

  const templateContent = fs.readFileSync(templateFilePath, "utf8");
  return templateContent;
}
