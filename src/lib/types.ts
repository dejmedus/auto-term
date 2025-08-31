export type TerminalConfig =
  | {
      tab: string;
      description?: string;
      commands: string[];
      header?: string;
      color?: string;
      icon?: string;
      shell?: string;
      hidden?: boolean;
    }
  | {
      name: string;
      description?: string;
      commands: string[];
      header?: string;
      color?: string;
      icon?: string;
      shell?: string;
      hidden?: boolean;
    };

export type ActionConfig = TerminalConfig[];

export type Action = string;
