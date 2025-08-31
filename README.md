<div align="center">
  <h2>Auto Terminal</h2>
</div>

> There is a known [bug effecting VSCode shell integration when using zsh on MacOS](https://github.com/microsoft/vscode/issues/248799). To work around it set tab `shell` to `bash` in `terminal.config.json`

Run sets of terminal commands in bulk. Quickly set up terminal tabs, run command flows, navigate directories, and more

![demo gif](https://github.com/dejmedus/gifs/blob/main/auto-term-demo.gif?raw=true)

### Usage

1. Open your workspace in VS Code.
2. Create a [`terminal.config.json`](#terminal-configuration) file at the root of your workspace.
3. Open the command palette (<kbd>Ctrl</kbd>/<kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>P</kbd>)
4. Type `Auto Terminal: Action` and select an action


### Terminal Configuration File

Start by defining terminal configurations, either:

- Create a `terminal.config.json` file at the root of your workspace
- Select a template file:
  - Open the command palette (<kbd>Ctrl</kbd>/<kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>P</kbd>)
  - Select [`Auto Terminal: Template`](#terminal-configuration-templates)

Example:

```
{
  // action name
  "setup": [
    {
      "tab": "frontend", // terminal tab name
      "commands": ["cd Frontend", "npm i", "clear", "code app/page.tsx"], // array of commands
      "header": "Frontend", // optional terminal header
      "icon": "branch", // optional tab icon
      "color": "pink", // optional icon color
    },
    {
      "tab": "backend",
      "commands": [
        "cd Backend",
        "source venv/bin/activate",
        "pip install -r requirements.txt",
        "clear"
      ],
      "description": "Install requirements.txt"
    }
  ],
  // If `Run Open Commands On Startup` is enabled, 
  // open action will run on workspace launch
  "open": [
    {
      "tab": "git",
      "commands": ["git branch", "*alert remember to create a branch],
    },
  ],
}
```

### Terminal Configuration Templates

#### Add a template `terminal.config.json` file to your workspace:

1. Open the command palette
2. Type `Auto Terminal: Template` and select a template option

#### Add reusable custom templates:

1. Open your User settings (<kbd>Ctrl</kbd>/<kbd>Cmd</kbd>+ <kbd>,</kbd>)
2. Search for `Auto Terminal: Custom Templates`
3. Add a new key-value pair to the customTemplates object, where the key is the template name and the value is the template itself

```json
"autoTerminal.customTemplates": {
    "custom template name": {
      "actionName": [
        {
          "tab": "",
          "commands": [],
        }
      ],
      "actionName2": [
        {
          "tab": "",
          "commands": [],
        }
      ]
    }
  }
```

4. The custom template will now appear as an option when running command `Auto Terminal: Template`

### Extra Settings

#### Auto Run Commands on Startup

When the `Auto Terminal: Run Open Commands On Startup` setting is enabled any commands specified inside the **open** action in your `terminal.config.json` file will be automatically executed when you open your workspace

#### Quick Run Actions From Terminal

When the `Auto Terminal: Add Quick Run To Terminal` setting is enabled a button to quickly run `Auto Term: Action` will be added to the terminal menu bar

#### To enable:

1. Open your workspace settings (`Code`/`File` > `Preferences` > `Settings`)
2. Search for `Auto Terminal: Run Open Commands On Startup` or `Add Quick Run To Terminal`
3. Check the box to enable the setting

### Helper Commands

Helper commands that can be used to perform actions beyond standard command input. These always begin with `*`

| Command | Description                                                                             | Usage                                            |
| ------- | --------------------------------------------------------------------------------------- | ------------------------------------------------ |
| \*stop  | Stops a running process                                                                 | `"commands": ["*stop"]`                          |
| \*close | Closes the terminal                                                                     | `"commands": ["*close"]`                         |
| \*focus | Focus on the Terminal                                                                   | `"commands": ["*focus"]`                         |
| \*delay | Delays next command                                                                     | `"commands": ["*delay 1000"]`                    |
| \*alert | Creates a notification                                                                  | `"commands": ["*alert remember to open PR"]`     |
| \*cd    | Change directory if not already in it. Fails gracefully if the directory does not exist | `"commands": ["*cd path/to/directory"]`          |
| \*echo  | Send text to terminal.                                                                  | `"commands": ["*echo remember to pull changes"]` |


_\* there can only be 3 alert windows open at a time_
