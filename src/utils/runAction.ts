import { window, Terminal } from "vscode";
import { runInNewTerminal, runInCurrentTerminal } from "./terminalHelpers";

type ActionConfig = (
  | { tab: string; description?: string; commands: string[] }
  | { name: string; description?: string; commands: string[] }
)[];

type Action = string;

/**
 * Retrieves the config file and runs the selected action.
 * If the action is not found in the configuration file, it shows an error message.
 *
 * @param action - Name of the action to perform. This should be a key in the terminal.config.json file.
 * @param configFile - The terminal.config.json file.
 */
export default async function runAction(
  action: Action,
  configFile: { [key: Action]: ActionConfig }
) {
  const actionConfig: ActionConfig = configFile[action];

  if (!actionConfig) {
    window.showErrorMessage(
      `Action ${action} not found in the configuration file`
    );
    return;
  }

  if (!isValidConfig(actionConfig)) {
    window.showErrorMessage("Invalid terminal configurations file format.");
    return;
  }

  try {
    for (const terminalConfig of actionConfig) {
      // terminal.config.json allows for either "tab" or "name" to be used as the terminal name
      const terminalName =
        "tab" in terminalConfig ? terminalConfig.tab : terminalConfig.name;

      const existingTerminal = window.terminals.find(
        (terminal: Terminal) => terminal.name === terminalName
      );

      existingTerminal
        ? await runInCurrentTerminal(existingTerminal, terminalConfig.commands)
        : await runInNewTerminal(terminalName, terminalConfig.commands);
    }
  } catch (error) {
    window.showErrorMessage(`Error reading terminal configurations: ${error}`);
  }
}

const isValidConfig = (actionConfig: ActionConfig) => {
  return (
    Array.isArray(actionConfig) &&
    actionConfig.every(
      (item) =>
        ("tab" in item || "name" in item) &&
        Array.isArray(item.commands) &&
        item.commands.every((command: any) => typeof command === "string")
    )
  );
};
