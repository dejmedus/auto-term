import * as vscode from "vscode";

import runCommands from "../utils/runCommands";
import getConfigFile from "../utils/getConfigFile";

/**
 * This function retrieves the config file and runs the commands associated with the action.
 * If the action is not found in the configuration file, it shows an error message.
 *
 * @param action - The action to perform. This should be a key in the terminal.config.json file.
 */
export default function manageTerminals(action: string) {
  const configFile = getConfigFile();

  if (!configFile) {
    return;
  }

  if (configFile[action]) {
    runCommands(configFile[action]);
  } else {
    vscode.window.showErrorMessage(
      `Action not found in the configuration file: ${action}`
    );
  }
}
