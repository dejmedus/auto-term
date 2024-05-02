import vscode from "vscode";
import customCommands from "./customCommands";
import {
  sendCommandToShell,
  isShellIntegrationEnabled,
  noShellIntegrationDialog,
} from "./shellIntegration";

type ActionConfig = (
  | { tab: string; description?: string; commands: string[] }
  | { name: string; description?: string; commands: string[] }
)[];

/**
 * Runs each terminal's array of commands, as specified in the actionConfig.
 * @param {ActionConfig} actionConfig - An array of terminal config objects
 * Each terminal config object should have:
 * - a 'tab' property specifying the terminal name,
 * - a 'commands' property with an array of strings, each string being a command to run in that terminal,
 * - (optional) 'description' property providing a brief description of the terminal configuration.
 * @throws {Error} If the actionConfig parameter is not an array.
 */
export default async function runAction(actionConfig: ActionConfig) {
  try {
    if (!isValidConfig(actionConfig)) {
      vscode.window.showErrorMessage(
        "Invalid terminalConfigurations file format."
      );
      return;
    }

    for (const config of actionConfig) {
      const terminalName = "tab" in config ? config.tab : config.name;

      // if (!config.tab && config.name) {
      //   vscode.window.showWarningMessage(
      //     "Please use 'tab' instead of 'name' in the configuration file. (deprecated 0.0.6)"
      //   );
      // }

      const existingTerminal = vscode.window.terminals.find(
        (terminal: any) => terminal.name === terminalName
      );

      const currentTerminal =
        existingTerminal ||
        vscode.window.createTerminal({
          name: terminalName,
        });

      const terminalHasShellIntegration = await isShellIntegrationEnabled(
        currentTerminal
      );

      // console.log("terminalHasShellIntegration", terminalHasShellIntegration);

      const commands = config.commands;

      if (terminalHasShellIntegration) {
        runCommandLoop(commands, currentTerminal);
      } else {
        noShellIntegrationDialog(commands, currentTerminal);
      }
    }
  } catch (error) {
    vscode.window.showErrorMessage(
      `Error reading terminalConfigurations: ${error}`
    );
  }
}

async function runCommandLoop(
  commands: string[],
  terminal: vscode.Terminal,
  runLegacyLoop = false
) {
  terminal.show();

  // commands = runLegacyLoop ? sortCommands(commands) : commands;

  for (const command of commands) {
    const [commandType, ...args] = command.split(" ");
    // console.log("trying", command);
    try {
      if (commandType in customCommands) {
        if (!customCommands[commandType.toLowerCase()]) {
          vscode.window.showErrorMessage(
            `Command ${commandType} not found in special commands.`
          );
          break;
        }
        await customCommands[commandType.toLowerCase()](terminal, args);
      } else {
        await sendCommandToShell(command, terminal);
      }
    } catch (e) {
      vscode.window.showErrorMessage(
        `[${command}] failed in ${terminal.name} terminal`
      );
      break;
    } finally {
      console.log("resolved", command);
    }
  }
}

export const sortCommands = (commands: string[]) => {
  return commands.reduce(
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
};

const isValidConfig = (actionConfig: ActionConfig) => {
  return (
    Array.isArray(actionConfig) &&
    actionConfig.every(
      (item) =>
        ("tab" in item || "name" in item) &&
        Array.isArray(item.commands) &&
        item.commands.every((command: any) => typeof command === "string")
    )
  );
};
