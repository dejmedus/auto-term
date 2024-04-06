import * as fs from "fs";
import * as path from "path";

/**
 * This function retrieves the content of a template file.
 * @param templateName - The name of the template file to retrieve.
 * @returns The content of the template file as a string.
 * @throws {Error} If the template file does not exist.
 */
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
