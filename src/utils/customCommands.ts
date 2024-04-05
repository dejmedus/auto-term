import vscode from "vscode";

const customCommands: {
  [key: string]: (terminal: any, args: string[]) => void;
} = {
  "*stop": handleStop,
  "*close": handleClose,
  "*open_file": openFile,
  "*alert": alertMessage,
  "*echo": echo,
};

async function handleStop(terminal: vscode.Terminal) {
  const pid = await terminal.processId;
  terminal.sendText(`kill -SIGINT ${pid}`);
}

function handleClose(terminal: vscode.Terminal) {
  terminal.dispose();
}

function openFile(terminal: vscode.Terminal, args: string[]) {
  if (args.length === 0) {
    vscode.window.showErrorMessage("No file name provided");
    return;
  }

  const fileName = args[0];
  if (
    !vscode.workspace.textDocuments.some((doc) => doc.fileName === fileName)
  ) {
    vscode.window.showErrorMessage(`File ${fileName} does not exist`);
    return;
  }

  vscode.workspace
    .openTextDocument(fileName)
    .then((doc: vscode.TextDocument) => {
      vscode.window.showTextDocument(doc);
    });
}

function echo(terminal: vscode.Terminal, args: string[]) {
  const message = args.join(" ");
  terminal.sendText(`echo "${message}"\n`);
}

function alertMessage(terminal: vscode.Terminal, args: string[]) {
  // vscode only allows 3 notifications open at a time
  const message = args.join(" ");
  vscode.window.showInformationMessage(message);
}

export default customCommands;
