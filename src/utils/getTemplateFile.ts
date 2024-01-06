import * as fs from "fs";
import * as path from "path";

export default function getTemplateFile(templateName: string): string {
  const extensionPath = path.join(__dirname, "..");
  const templateDir = path.join(extensionPath, "templates");
  const templateFilePath = path.join(templateDir, templateName);

  if (!fs.existsSync(templateFilePath)) {
    throw new Error(`Template file '${templateName}' not found.`);
  }

  const templateContent = fs.readFileSync(templateFilePath, "utf8");

  return templateContent;
}
