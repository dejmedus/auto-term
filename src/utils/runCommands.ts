import vscode from "vscode";
import customCommands from "./customCommands";

/**
 * This function runs a set of commands in a specified terminal tab.
 * @param tabConfig - An array of configuration objects for each terminal tab. Each object should have a 'tab' or 'name' property for the terminal name, and a 'commands' property with an array of commands to run.
 * @throws {Error} If the tabConfig parameter is not an array.
 */
export default function runCommands(tabConfig: any) {
  try {
    if (!Array.isArray(tabConfig)) {
      vscode.window.showErrorMessage(
        "Invalid terminalConfigurations file format."
      );
      return;
    }

    tabConfig.forEach((config) => {
      const terminalName = config.tab || config.name;

      // if (!config.tab && config.name) {
      //   vscode.window.showWarningMessage(
      //     "Please use 'tab' instead of 'name' in the configuration file. (deprecated 0.0.6)"
      //   );
      // }

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

function runCommandLoop(commands: string[], terminal: vscode.Terminal) {
  terminal.show();

  commands = sortCommands(commands);

  commands.forEach((command: string) => {
    if (command.startsWith("*")) {
      const [commandType, ...args] = command.split(" ");

      if (!customCommands[commandType.toLowerCase()]) {
        vscode.window.showErrorMessage(
          `Command ${commandType} not found in special commands.`
        );
        return;
      }

      customCommands[commandType.toLowerCase()](terminal, args);
    } else {
      terminal.sendText(command);
    }
  });
}

const sortCommands = (commands: string[]) =>
  commands.reduce(
    (acc: { result: string[]; curString: string }, command, i) => {
      if (command.startsWith("*")) {
        // if custom command
        if (acc.curString) {
          acc.result.push(acc.curString.trim());
          acc.curString = "";
        }
        acc.result.push(command);
      } else {
        acc.curString += command;
        if (!commands[i + 1] || commands[i + 1].startsWith("*")) {
          // if the final command
          acc.result.push(acc.curString.trim());
          acc.curString = "";
          // } else if (commands[i + 1].startsWith("*")) {
          //   // if the next command is a custom command
          //   // acc.curString += " && clear";
          //   acc.result.push(acc.curString.trim());
          //   acc.curString = "";
        } else {
          // if the next command is a command
          acc.curString += " && ";
        }
      }
      return acc;
    },
    { result: [], curString: "" }
  ).result;
