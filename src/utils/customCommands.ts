import * as fs from "fs";
import * as path from "path";
import { window, workspace, Terminal, TerminalShellExecution } from "vscode";

export type CommandResult =
  | { type: "execution"; execution: TerminalShellExecution | undefined }
  | { type: "cancel" }
  | { type: "continue" }
  | { type: "error"; error: Error };

type ExecuteCommand = (
  command: string,
  terminal: Terminal
) => TerminalShellExecution | undefined;

type CustomCommand = (
  terminal: Terminal,
  args: string[],
  executeCommand: ExecuteCommand
) => Promise<CommandResult>;

type CustomCommands = {
  [key: string]: CustomCommand;
};

const customCommands: CustomCommands = {
  "*stop": handleStop,
  "*close": handleClose,
  "*alert": alertMessage,
  "*echo": echo,
  "*delay": handleDelay,
  "*cd": changeDirectory,
  "*focus": focus,
};

async function handleStop(
  terminal: Terminal,
  args: string[],
  executeCommand: ExecuteCommand
): Promise<CommandResult> {
  const pid = await terminal.processId;
  const execution = executeCommand(`kill -SIGINT ${pid}`, terminal);
  return { type: "execution", execution };
}

async function handleClose(terminal: Terminal): Promise<CommandResult> {
  return await new Promise<CommandResult>((resolve) => {
    const closeTerminalListener = window.onDidCloseTerminal(
      (closedTerminal) => {
        if (closedTerminal === terminal) {
          closeTerminalListener.dispose();
          resolve({ type: "cancel" });
        }
      }
    );

    terminal.dispose();
  });
}

async function echo(
  terminal: Terminal,
  args: string[],
  executeCommand: ExecuteCommand
): Promise<CommandResult> {
  const message = args.join(" ");
  const execution = executeCommand(`echo "${message}"\n`, terminal);
  return { type: "execution", execution };
}

async function alertMessage(
  terminal: Terminal,
  args: string[]
): Promise<CommandResult> {
  const message = args.join(" ");
  window.showInformationMessage(message);
  await delay(1000);
  return { type: "continue" };
}

async function handleDelay(
  terminal: Terminal,
  args: string[]
): Promise<CommandResult> {
  const seconds = Number(args[0]);
  await delay(seconds);
  return { type: "continue" };
}

async function changeDirectory(
  terminal: Terminal,
  args: string[],
  executeCommand: ExecuteCommand
): Promise<CommandResult> {
  const targetPath = args[0];

  const workspacePath = workspace.workspaceFolders?.[0]?.uri.fsPath || "";
  const resolvedPath = path.isAbsolute(targetPath)
    ? targetPath
    : path.join(workspacePath, targetPath);
  const cwdUri = terminal.shellIntegration?.cwd;
  const currentDir = cwdUri ? cwdUri.fsPath : workspacePath;

  if (
    path.resolve(currentDir) === path.resolve(resolvedPath) ||
    !fs.existsSync(resolvedPath) ||
    !fs.statSync(resolvedPath).isDirectory()
  ) {
    return { type: "continue" };
  }

  const execution = executeCommand(`cd ${targetPath}`, terminal);
  return { type: "execution", execution };
}

async function focus(terminal: Terminal): Promise<CommandResult> {
  terminal.show();
  return { type: "continue" };
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default customCommands;
