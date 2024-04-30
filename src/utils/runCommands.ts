import vscode from "vscode";
import customCommands from "./customCommands";

type TabConfig = (
  | { tab: string; description?: string; commands: string[] }
  | { name: string; description?: string; commands: string[] }
)[];

/**
 * This function runs a set of commands in a specified terminal tab.
 * @param {TabConfig} tabConfig - An array of configuration objects for each terminal tab. Each object should have a 'tab' or 'name' property for the terminal name, and a 'commands' property with an array of commands to run.
 * @throws {Error} If the tabConfig parameter is not an array.
 */
export default async function runCommands(tabConfig: TabConfig) {
  try {
    if (!isValidConfig(tabConfig)) {
      vscode.window.showErrorMessage(
        "Invalid terminalConfigurations file format."
      );
      return;
    }

    for (const config of tabConfig) {
      const terminalName = "tab" in config ? config.tab : config.name;

      // if (!config.tab && config.name) {
      //   vscode.window.showWarningMessage(
      //     "Please use 'tab' instead of 'name' in the configuration file. (deprecated 0.0.6)"
      //   );
      // }

      const commands = config.commands;

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

      console.log("terminalHasShellIntegration", terminalHasShellIntegration);

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

async function runCommandLoop(commands: string[], terminal: vscode.Terminal) {
  terminal.show();

  // commands = terminal.shellIntegration ? commands : sortCommands(commands);

  for (const command of commands) {
    if (command.startsWith("*")) {
      const [commandType, ...args] = command.split(" ");

      if (!customCommands[commandType.toLowerCase()]) {
        vscode.window.showErrorMessage(
          `Command ${commandType} not found in special commands.`
        );
        return;
      }

      console.log("trying", command);
      await customCommands[commandType.toLowerCase()](terminal, args);
      console.log("resolved", command);
    } else {
      // if (terminal.shellIntegration) {
      //   await sendCommandToShell(command, terminal);
      // } else {
      //   terminal.sendText(command);
      // }
      console.log("trying", command);
      await sendCommandToShell(command, terminal);
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

const isValidConfig = (tabConfig: TabConfig) => {
  return (
    Array.isArray(tabConfig) &&
    tabConfig.every(
      (item) =>
        ("tab" in item || "name" in item) &&
        Array.isArray(item.commands) &&
        item.commands.every((command: any) => typeof command === "string")
    )
  );
};

function noShellIntegrationDialog(
  commands: any,
  currentTerminal: vscode.Terminal
) {
  vscode.window
    .showInformationMessage(
      "Shell integration is not enabled",
      {
        modal: true,
        detail: `Without shell integration, some commands may not work correctly. Please enable in settings.`,
      },
      { title: "Open Settings" },
      { title: "Continue" }
    )
    .then((selection) => {
      if (selection) {
        if (selection.title === "Open Settings") {
          vscode.commands.executeCommand(
            "workbench.action.openSettings",
            "terminal.integrated.shellIntegration"
          );
        } else if (selection.title === "Continue") {
          runCommandLoop(commands, currentTerminal);
        }
      }
    });
}

async function sendCommandToShell(command: string, terminal: vscode.Terminal) {
  const execution = terminal.shellIntegration?.executeCommand(command);

  await new Promise<void>((resolve, reject) => {
    const disposable = vscode.window.onDidEndTerminalShellExecution(
      (event: vscode.TerminalShellExecutionEndEvent) => {
        if (event.execution === execution) {
          console.log("resolved", command);

          if (event.exitCode !== 0) {
            vscode.window.showErrorMessage(`Auto Terminal: ${command} failed`);
            disposable.dispose();
            reject();
          }

          disposable.dispose();
          resolve();
        }
      }
    );
  });
}

async function isShellIntegrationEnabled(terminal: vscode.Terminal) {
  const shellIntegrationEnabled: boolean | undefined = await vscode.workspace
    .getConfiguration("terminal.integrated.shellIntegration")
    .get("enabled");

  if (shellIntegrationEnabled === undefined) {
    console.log("Cannot find shell integration settings");
  } else {
    console.log("shell integration enabled", shellIntegrationEnabled);
  }

  return shellIntegrationEnabled;

  // terminal.shellIntegration will always be undefined immediately after the terminal is created. Listen to window.onDidStartTerminalShellIntegration to be notified when shell integration is activated for a terminal.
  return await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: "Auto Terminal: Searching for shell integration...",
      cancellable: false,
    },
    async (progress) => {
      if (!shellIntegrationEnabled) {
        return false;
      }
      const shellExecutionStarted = new Promise<boolean>((resolve) => {
        const disposable = vscode.window.onDidStartTerminalShellExecution(
          (event) => {
            if (event.terminal === terminal) {
              disposable.dispose();
              resolve(true);
            }
          }
        );
      });
      const timeout = new Promise<boolean>((resolve) => {
        setTimeout(() => resolve(false), 4000);
      });
      try {
        return await Promise.race([shellExecutionStarted, timeout]);
      } catch (error) {
        console.error(error);
        return false;
      }
    }
  );
}
