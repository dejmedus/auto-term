import * as vscode from "vscode";

import runAction from "./runAction";
import getConfigFile from "../utils/getConfigFile";

/**
 * Retrieves the config file and runs the selected action.
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
    runAction(configFile[action]);
  } else {
    vscode.window.showErrorMessage(
      `Action not found in the configuration file: ${action}`
    );
  }
}
