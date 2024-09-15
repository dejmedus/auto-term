# Change Log

## Upcoming

- yaml config files
- templates for common workflows

## 0.0.7

- better command chaining
  - fixes: long running commands executing out of order
  - requires: "terminal.integrated.shellIntegration.enabled": true
- alert on command error/failure
- [`Auto Terminal: Add Quick Run To Terminal`](README.md#quick-run-actions-from-terminal) settings toggle. Quick run `Auto Term: Action` from the terminal menu bar
- setup/use walkthrough
- special command `*alert`
- fix: no workspace error when vscode is launched without an open repo

## 0.0.6

- "name" key changed to "tab" in terminal.config files for better readability
- better intellisense in `terminal.config.json` files
- [`Auto Terminal: Run Open Commands On Startup`](README.md#auto-run-commands-on-startup) settings toggle. Automatically run "open" commands when a workspace is launched
- define custom templates in User settings with [`Auto Terminal: Custom Templates`](README.md#add-re-usable-custom-templates)
- updated extension icon

## 0.0.5

- Bug fixes:
  - New terminals support special commands (*CLOSE/*STOP)
  - Special commands no longer require capitalization

## 0.0.4

- Create `terminal.config.json` file from template with `Auto Term: Template`
