import vscode, { window, Terminal } from "vscode";
import customCommands, { CommandResult } from "./customCommands";

export async function runInCurrentTerminal(
  terminal: Terminal,
  commands: string[]
) {
  terminal.show();
  runCommandLoop(terminal, commands);
}

export async function runInNewTerminal(
  terminalName: string,
  commands: string[]
) {
  const newTerminal = window.createTerminal({
    name: terminalName,
  });

  newTerminal.show();

  await new Promise<void>(() => {
    const shellIntegrationListener = window.onDidChangeTerminalShellIntegration(
      async ({ terminal, shellIntegration }) => {
        if (terminal === newTerminal) {
          shellIntegrationListener.dispose();

          await runCommandLoop(terminal, commands);
        }
      }
    );
  });
}

export async function runCommandLoop(
  terminal: Terminal,
  commands: string[]
): Promise<void> {
  if (!terminal.shellIntegration) {
    console.error("SOMETHING HAS GONE WRONG");
    return Promise.reject(new Error("Shell integration is missing"));
  }

  try {
    for (const command of commands) {
      await new Promise<void>(async (resolve, reject) => {
        const commandResult: CommandResult = await runCommand(
          terminal,
          command
        );

        // console.log("command result", commandResult);

        if (commandResult.type === "error") {
          window.showErrorMessage(
            `Command ${command} failed in ${terminal.name} terminal`
          );
          reject(commandResult.error);
        }

        if (commandResult.type === "cancel") {
          // break out of loop
          reject();
        }

        if (commandResult.type === "continue") {
          // continue to next command
          resolve();
        }

        if (commandResult.type === "execution") {
          const execution = commandResult.execution;

          // if execution is undefined, the command failed, break out of loop
          if (!execution) {
            window.showErrorMessage(
              `Command ${command} failed in ${terminal.name} terminal`
            );
            reject(new Error(`Execution is undefined for command ${command}`));
          }

          const executionListener = window.onDidEndTerminalShellExecution(
            (event) => {
              if (
                event.execution === execution &&
                event.terminal === terminal
              ) {
                executionListener.dispose();
                // console.log(`Command ${command} exit code ${event.exitCode}`);
                // should undefined be treated as error?
                if (event.exitCode === 1) {
                  window.showErrorMessage(
                    `Command ${command} failed in ${terminal.name} terminal`
                  );
                  reject(
                    new Error(`Command ${command} failed with exit code 1`)
                  );
                } else {
                  resolve();
                }
              }
            }
          );
        }
      });
    }
  } catch (err) {
    // exit loop due to error or command exit code 1
  }
}

export async function runCommand(
  terminal: Terminal,
  command: string
): Promise<CommandResult> {
  const [commandType, ...args] = command.split(" ");
  const commandTypeLowerCase = commandType.toLowerCase();

  try {
    if (commandTypeLowerCase in customCommands) {
      if (!customCommands[commandTypeLowerCase]) {
        window.showErrorMessage(
          `Command ${commandType} not found in special commands.`
        );
      }

      return await customCommands[commandTypeLowerCase](
        terminal,
        args,
        (command, terminal) =>
          terminal.shellIntegration?.executeCommand(command)
      );
    } else {
      return {
        type: "execution",
        execution: terminal.shellIntegration?.executeCommand(command),
      };
    }
  } catch (err: any) {
    window.showErrorMessage(`[${command}] failed in ${terminal.name} terminal`);

    return { type: "error", error: err };
  }
}

export function noShellIntegrationDialog() {
  window
    .showInformationMessage(
      "Auto Term: terminal shell integration",
      {
        modal: true,
        detail:
          "Without shell integration, some commands may not work correctly. Enable in settings or try again.",
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
          // close modal
          return;
        }
      }
    });
}
