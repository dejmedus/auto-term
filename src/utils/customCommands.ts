import vscode from "vscode";

const customCommands: {
  [key: string]: (terminal: any, args: string[]) => void;
} = {
  "*stop": handleStop,
  "*close": handleClose,
  "*open_file": openFile,
};

function handleStop(terminal: vscode.Terminal) {
  const pid = terminal.processId;
  terminal.sendText(`kill -SIGINT ${pid}`);
}

function handleClose(terminal: vscode.Terminal) {
  terminal.dispose();
}

function openFile(terminal: vscode.Terminal, args: string[]) {
  const fileName = args[0];
  vscode.workspace
    .openTextDocument(fileName)
    .then((doc: vscode.TextDocument) => {
      vscode.window.showTextDocument(doc);
    });
}

export default customCommands;
