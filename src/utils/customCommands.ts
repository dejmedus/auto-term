import vscode from "vscode";
import { sendCommandToShell } from "./shellIntegration";

const customCommands: {
  [key: string]: (terminal: any, args: string[]) => Promise<void>;
} = {
  "*stop": handleStop,
  "*close": handleClose,
  "*alert": alertMessage,
  "*echo": echo,
};

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function handleStop(terminal: vscode.Terminal) {
  const pid = await terminal.processId;
  await sendCommandToShell(`kill -SIGINT ${pid}`, terminal);
}

async function handleClose(terminal: vscode.Terminal) {
  await new Promise<void>((resolve) => {
    const disposable = vscode.window.onDidCloseTerminal((closedTerminal) => {
      if (closedTerminal === terminal) {
        disposable.dispose();
        resolve();
      }
    });

    terminal.dispose();
  });
}

async function echo(terminal: vscode.Terminal, args: string[]) {
  const message = args.join(" ");
  await sendCommandToShell(`echo "${message}"\n`, terminal);
}

async function alertMessage(terminal: vscode.Terminal, args: string[]) {
  // vscode only allows 3 notifications open at a time
  const message = args.join(" ");
  vscode.window.showInformationMessage(message);
  await delay(1000);
}

export default customCommands;
