import fs from "fs";
import path from "path";
import assert from "assert";
import { workspace, commands } from "vscode";
import { spy, assert as sinonAssert } from "sinon";
import { newTerminalWrap } from "./newTerminalWrap";

import { runInCurrentTerminal, runCommand } from "../utils/terminalHelpers";
import { getTemplateFile } from "../commands/getTemplate";

suite("terminal helpers", () => {
  test(
    "runCommand",
    newTerminalWrap(async (terminal, shellIntegration) => {
      const shellIntegrationSpy = spy(shellIntegration, "executeCommand");

      const commands = ["echo 'woww tests'"];
      for (const command of commands) {
        await runCommand(terminal, command);
      }
      sinonAssert.calledWith(shellIntegrationSpy, "echo 'woww tests'");

      shellIntegrationSpy.restore();
    })
  );

  test(
    "runInCurrentTerminal",
    newTerminalWrap(async (terminal, shellIntegration) => {
      const shellIntegrationSpy = spy(shellIntegration, "executeCommand");

      await runCommand(terminal, "echo 'hi'");
      sinonAssert.calledWith(shellIntegrationSpy, "echo 'hi'");

      const commands = [
        "echo 'woww'",
        "*delay 5000",
        "npm init -y",
        "echo 'POTATO'",
      ];
      await runInCurrentTerminal(terminal, commands);

      sinonAssert.calledWith(shellIntegrationSpy, "echo 'woww'");
      sinonAssert.calledWith(shellIntegrationSpy, "npm init -y");
      sinonAssert.calledWith(shellIntegrationSpy, "echo 'POTATO'");

      shellIntegrationSpy.restore();
    }, "command loop")
  );

  test("returns correct type", async () => {
    newTerminalWrap(async (terminal, shellIntegration) => {
      const shellIntegrationSpy = spy(shellIntegration, "executeCommand");

      let returnValue = await runCommand(terminal, "*echo 'custom echo'");
      assert.equal(returnValue.type, "execution");

      returnValue = await runCommand(terminal, "*alert");
      assert.equal(returnValue.type, "continue");

      returnValue = await runCommand(terminal, "*potato");
      assert.equal(returnValue.type, "error");

      returnValue = await runCommand(terminal, "*stop");
      assert.equal(returnValue.type, "cancel");

      shellIntegrationSpy.restore();
    }, "return type");
  });
});

suite("Config", () => {
  test("settings config is found", () => {
    const runOpenCommandsOnStartup: boolean | undefined = workspace
      .getConfiguration("autoTerminal")
      .get("runOpenCommandsOnStartup");

    assert.strictEqual(typeof runOpenCommandsOnStartup, "boolean");

    const customTemplates = workspace
      .getConfiguration("autoTerminal")
      .get("customTemplates");

    assert.ok(typeof customTemplates === "object");
  });

  test("extension commands are found", () => {
    commands.getCommands(true).then((commands) => {
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
});
