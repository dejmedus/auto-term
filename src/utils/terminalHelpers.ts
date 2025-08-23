import {
  commands,
  window,
  Terminal,
  TerminalOptions,
  ThemeColor,
  ThemeIcon,
} from "vscode";

import { TerminalConfig } from "../lib/types";
import customCommands, { CommandResult } from "./customCommands";

export async function runInCurrentTerminal(
  terminal: Terminal,
  terminalConfig: TerminalConfig
) {
  const { commands, hidden } = terminalConfig;

  !hidden && terminal.show();
  await runCommandLoop(terminal, commands, hidden);
}

export async function runInNewTerminal(
  terminalName: string,
  terminalConfig: TerminalConfig
) {
  const { header, color, icon, commands, shell, hidden } = terminalConfig;

  const terminalColor = `terminal.ansi${color}`;
  const terminalIcon = icon ?? "terminal";

  const terminalOptions: TerminalOptions = {
    name: terminalName,
    iconPath: new ThemeIcon(terminalIcon),
    isTransient: true,
    hideFromUser: hidden ?? false,
    shellArgs: ["-l", "-i"],
  };

  if (color) terminalOptions.color = new ThemeColor(terminalColor);
  if (shell) terminalOptions.shellPath = shell;
  if (header) {
    const reset = "\x1b[0m";
    const dim = "\x1b[2m";

    terminalOptions.message = ` ${dim}${header}\n${reset}`;
  }

  const newTerminal = window.createTerminal(terminalOptions);
  !hidden && newTerminal.show();

  await new Promise<void>((resolve) => {
    const shellIntegrationListener = window.onDidChangeTerminalShellIntegration(
      async ({ terminal, shellIntegration }) => {
        if (terminal === newTerminal) {
          shellIntegrationListener.dispose();

          await runCommandLoop(terminal, commands, hidden);
          resolve();
        }
      }
    );
  });
}

export async function runCommandLoop(
  terminal: Terminal,
  commands: string[],
  hidden = false
): Promise<void> {
  try {
    for (const command of commands) {
      await new Promise<void>(async (resolve, reject) => {
        const commandResult: CommandResult = await runCommand(
          terminal,
          command
        );

        if (commandResult.type === "error") {
          window.showErrorMessage(
            `Command ${command} failed in ${terminal.name} terminal`
          );
          !hidden && terminal.show();
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

          if (!execution) {
            window.showErrorMessage(
              `Command ${command} failed in ${terminal.name} terminal`
            );
            !hidden && terminal.show();
            reject(new Error(`Execution is undefined for command ${command}`));
          }

          const executionListener = window.onDidEndTerminalShellExecution(
            (event) => {
              if (
                event.execution === execution &&
                event.terminal === terminal
              ) {
                executionListener.dispose();

                if (event.exitCode === 1) {
                  window.showErrorMessage(
                    `Command ${command} failed in ${terminal.name} terminal`
                  );
                  !hidden && terminal.show();
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
        return { type: "error", error: new Error("Custom command not found") };
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
          commands.executeCommand(
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
