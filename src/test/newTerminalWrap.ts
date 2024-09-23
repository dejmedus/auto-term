import { window, Terminal, TerminalShellIntegration } from "vscode";

export function newTerminalWrap(
  testLogic: (
    terminal: Terminal,
    shellIntegration: TerminalShellIntegration
  ) => Promise<void>,
  terminalName = "tab"
) {
  return async function (this: Mocha.Context) {
    this.timeout(20000);

    const newTerminal = window.createTerminal({
      name: terminalName,
    });

    newTerminal.show();

    await new Promise<void>((resolve) => {
      const shellIntegrationListener =
        window.onDidChangeTerminalShellIntegration(
          async ({ terminal, shellIntegration }) => {
            if (terminal === newTerminal) {
              shellIntegrationListener.dispose();

              await testLogic(terminal, shellIntegration);
              resolve();
            }
          }
        );
    });
  };
}
