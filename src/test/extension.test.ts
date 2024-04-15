import * as assert from "assert";
import * as vscode from "vscode";
import * as myExtension from "../extension";
import * as fs from "fs";
import * as path from "path";
import getTemplateFile from "../utils/getTemplateFile";
import { sortCommands } from "../utils/runCommands";

suite("Extension Test Suite", () => {
  test("settings config is found", () => {
    const runOpenCommandsOnStartup: boolean | undefined = vscode.workspace
      .getConfiguration("autoTerminal")
      .get("runOpenCommandsOnStartup");

    assert.ok(
      runOpenCommandsOnStartup === true || runOpenCommandsOnStartup === false
    );

    const customTemplates = vscode.workspace
      .getConfiguration("autoTerminal")
      .get("customTemplates");
    assert.ok(
      customTemplates === undefined || typeof customTemplates === "object"
    );
  });

  test("extension commands are found", () => {
    vscode.commands.getCommands(true).then((commands) => {
      const templateCommandExists = commands.includes("extension.getTemplate");
      const guideCommandExists = commands.includes("extension.showUsageGuide");
      const actionCommandExists = commands.includes("extension.action");

      assert.strictEqual(actionCommandExists, true);
      assert.strictEqual(guideCommandExists, true);
      assert.strictEqual(templateCommandExists, true);
    });
  });

  test("getTemplateFile returns correct template content", () => {
    const templateContent = getTemplateFile("default.json");
    const expectedContent = fs.readFileSync(
      path.join(__dirname, "..", "templates", "default.json"),
      "utf8"
    );
    assert.strictEqual(templateContent, expectedContent);
  });

  test("commands are correctly chained", () => {
    const expectedChain = ["*close", "cd folder && npm run dev", "*stop"];
    const chain = sortCommands(["*close", "cd folder", "npm run dev", "*stop"]);

    assert.deepStrictEqual(expectedChain, chain);
  });
});
