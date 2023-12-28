# Auto-Term Extension for Visual Studio Code

Auto-Term is a Visual Studio Code extension that allows you to automate the process of opening and configuring multiple terminal tabs when you open a workspace. This is useful for quickly setting up terminals for different tasks, such as running commands, navigating directories, and more.

## Features

- Define terminal configurations in a JSON file.
- Open and configure multiple terminal tabs with a single command.

## Usage

1. Open your workspace in Visual Studio Code.
2. Press `Ctrl+Shift+P` to open the command palette.
3. Type "Open Terminals" and select the corresponding command.
4. Auto-Term will read your terminal configurations and open the specified terminals.

## Configuration

### Terminal Configurations File

You can define your terminal configurations in a `terminalConfigurations.json` file in the root of your workspace. The file should be an array of objects, each representing a terminal configuration. Example:

```json
[
  { "name": "git", "command": "git branch" },
  { "name": "frontend", "command": "cd frontend" },
  { "name": "backend", "command": "cd backend" }
]
```
