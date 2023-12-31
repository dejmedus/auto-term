import vscode from "vscode";
import customCommands from "./customCommands";

export default function runCommands(configFile: any, actionName: string) {
  try {
    const tabConfig = configFile[actionName];

    if (!Array.isArray(tabConfig)) {
      vscode.window.showErrorMessage(
        "Invalid terminalConfigurations file format."
      );
      return;
    }

    tabConfig.forEach((config) => {
      const terminalName = config.name;
      const commands = config.commands;

      const existingTerminal = vscode.window.terminals.find(
        (terminal: any) => terminal.name === terminalName
      );

      if (!existingTerminal) {
        const newTerminal = vscode.window.createTerminal({
          name: terminalName,
        });
        newTerminal.show();
        commands.forEach((command: string) => {
          newTerminal.sendText(command);
        });
      } else {
        existingTerminal.show();
        commands.forEach((command: string) => {
          if (customCommands[command]) {
            customCommands[command](existingTerminal, []);
          } else {
            existingTerminal.sendText(command);
          }
        });
      }
    });
  } catch (error) {
    vscode.window.showErrorMessage(
      `Error reading terminalConfigurations: ${error}`
    );
  }
}
