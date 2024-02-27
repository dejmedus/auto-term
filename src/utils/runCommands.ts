import vscode from "vscode";
import customCommands from "./customCommands";

export default function runCommands(tabConfig: any) {
  try {
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
        runCommandLoop(commands, newTerminal);
      } else {
        runCommandLoop(commands, existingTerminal);
      }
    });
  } catch (error) {
    vscode.window.showErrorMessage(
      `Error reading terminalConfigurations: ${error}`
    );
  }
}

function runCommandLoop(commands: any, terminal: any) {
  terminal.show();
  commands.forEach((command: string) => {
    if (command.startsWith("*")) {
      const [commandType, ...args] = command.toLowerCase().split(" ");

      customCommands[commandType.toLowerCase()](terminal, args);
    } else {
      terminal.sendText(command);
    }
  });
}
