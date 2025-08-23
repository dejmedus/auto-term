export type TerminalConfig =
  | {
      tab: string;
      description?: string;
      commands: string[];
      header?: string;
      color?: string;
      icon?: string;
      shell?: string;
    }
  | {
      name: string;
      description?: string;
      commands: string[];
      header?: string;
      color?: string;
      icon?: string;
      shell?: string;
    };

export type ActionConfig = TerminalConfig[];

export type Action = string;
