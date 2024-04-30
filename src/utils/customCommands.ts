import vscode from "vscode";

const customCommands: {
  [key: string]: (terminal: any, args: string[]) => Promise<void>;
} = {
  "*stop": handleStop,
  "*close": handleClose,
  "*alert": alertMessage,
  "*echo": echo,
};

async function handleStop(terminal: vscode.Terminal) {
  const pid = await terminal.processId;
  terminal.sendText(`kill -SIGINT ${pid}`);
}

async function handleClose(terminal: vscode.Terminal) {
  terminal.dispose();
}

async function echo(terminal: vscode.Terminal, args: string[]) {
  const message = args.join(" ");
  terminal.sendText(`echo "${message}"\n`);
}

async function alertMessage(terminal: vscode.Terminal, args: string[]) {
  // vscode only allows 3 notifications open at a time
  const message = args.join(" ");
  vscode.window.showInformationMessage(message);
}

export default customCommands;
