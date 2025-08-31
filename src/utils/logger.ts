import { window } from "vscode";

export const log = window.createOutputChannel("Auto Terminal", { log: true });
