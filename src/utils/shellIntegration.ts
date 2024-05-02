import vscode from "vscode";

export async function sendCommandToShell(
  command: string,
  terminal: vscode.Terminal
) {
  const execution = terminal.shellIntegration?.executeCommand(command);

  await new Promise<void>((resolve, reject) => {
    const disposable = vscode.window.onDidEndTerminalShellExecution(
      (event: vscode.TerminalShellExecutionEndEvent) => {
        if (event.execution === execution) {
          if (event.exitCode !== 0) {
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

export function noShellIntegrationDialog(
  commands: any,
  currentTerminal: vscode.Terminal
) {
  vscode.window
    .showInformationMessage(
      "Cannot find terminal shell integration.",
      {
        modal: true,
        detail:
          "Without shell integration, some commands may not work correctly. Enable in settings or try again.",
      },
      { title: "Open Settings" }
      //   { title: "Continue" }
    )
    .then((selection) => {
      if (selection) {
        if (selection.title === "Open Settings") {
          vscode.commands.executeCommand(
            "workbench.action.openSettings",
            "terminal.integrated.shellIntegration"
          );
        }
        // } else if (selection.title === "Continue") {
        //   runCommandLoop(commands, currentTerminal, runLegacyLoop = true);
        // }
      }
    });
}

export async function isShellIntegrationEnabled(terminal: vscode.Terminal) {
  const shellIntegrationEnabled: boolean | undefined = await vscode.workspace
    .getConfiguration("terminal.integrated.shellIntegration")
    .get("enabled");

  if (shellIntegrationEnabled === undefined) {
    // console.log("Cannot find shell integration settings");
    return false;
  }

  if (!shellIntegrationEnabled) {
    // console.log(
    //   "Shell integration NOT settings enabled:",
    //   shellIntegrationEnabled
    // );
    return false;
  }

  if (terminal.shellIntegration) {
    return true;
  }
  // console.log("terminal", terminal.name, "is NOT ready");

  // terminal.shellIntegration will always be undefined immediately after the terminal is created.
  return await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: "Auto Term: Waiting for shell integration...",
      cancellable: false,
    },
    async (progress) => {
      const shellIntegrationActivated = new Promise<boolean>((resolve) => {
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
        return await Promise.race([shellIntegrationActivated, timeout]);
      } catch (error) {
        // console.error("could not find shell integration error", error);
        return false;
      }
    }
  );
}
