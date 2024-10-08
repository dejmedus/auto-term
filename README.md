<div align="center">
  <h2>Auto Terminal</h2>
</div>

Run sets of terminal commands in bulk. Quickly set up terminal tabs, run command flows, navigate directories, and more.

![demo gif](https://github.com/dejmedus/gifs/blob/main/auto-term-demo.gif?raw=true)

### Usage

1. Open your workspace in VS Code.
2. Create a [`terminal.config.json`](#terminal-configuration) file in the root of your workspace.
3. Open the command palette `cmd + shift + p`
4. Type `Auto Terminal: Action` and select an action.


### Terminal Configuration File

Start by defining terminal configurations, either:

- create a `terminal.config.json` file at the root of your workspace

- select a template file:
  - Open the command palette `cmd + shift + p`
  - Select [`Auto Terminal: Template`](#terminal-configuration-templates)

Example:

```json
{
  // action name
  "setup": [
    {
      "tab": "frontend", // terminal tab name
      "commands": ["cd Frontend", "npm i", "clear", "code app/page.tsx"], // array of commands
      "description": "Install npm packages" // optional description
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
  // If Auto Terminal: Run Open Commands On Startup setting is true, "open" commands will run on workspace launch
  "open": [
    {
      "tab": "git",
      "commands": ["git branch"],
      "description": "Display the current branch"
    },
    {
      "tab": "frontend",
      "commands": ["cd Frontend"],
      "description": "Open a terminal for frontend"
    },
    {
      "tab": "backend",
      "commands": ["cd Backend", "source venv/bin/activate"],
      "description": "Open a terminal for backend"
    }
  ],
  "start": [
    {
      "tab": "frontend",
      "commands": ["clear", "npm run dev"],
      "description": "Run the frontend"
    },
    {
      "tab": "backend",
      "commands": ["clear", "python manage.py runserver"],
      "description": "Run the backend"
    }
  ]
}
```

### Terminal Configuration Templates

#### Add a template `terminal.config.json` file to your workspace:

1. Open the command palette. `cmd + shift + p`
2. Type `Auto Terminal: Template` and select a template option.

#### Add re-usable custom templates:

1. Open your User settings `cmd + ,`
2. Search for `Auto Terminal: Custom Templates`
3. Add a new key-value pair to the customTemplates object, where the key is the template name and the value is the template itself.

```json
"autoTerminal.customTemplates": {
    "custom template name": {
      "actionName": [
        {
          "tab": "",
          "commands": [],
          "description": ""
        }
      ],
      "actionName2": [
        {
          "tab": "",
          "commands": [],
          "description": ""
        }
      ]
    }
  }
```

4. The custom template will now appear as an option when running command `Auto Terminal: Template`

### Extra Settings

#### Auto Run Commands on Startup

When the `Auto Terminal: Run Open Commands On Startup` setting is enabled any commands specified inside the "open" action in your `terminal.config.json` file will be automatically executed when you open your workspace.

#### Quick Run Actions From Terminal

When the `Auto Terminal: Add Quick Run To Terminal` setting is enabled a button to quickly run `Auto Term: Action` will be added to the terminal menu bar.

#### To enable:

1. Open your workspace settings (Code/File > Settings/Preferences > Settings).
2. Search for `Auto Terminal: Run Open Commands On Startup` or `Add Quick Run To Terminal`.
3. Check the box to enable the setting.

### Special Commands

Special commands that can be used to perform actions beyond standard command input. These always begin with "\*".

| Command | Description               | Usage                                        |
| ------- | ------------------------- | -------------------------------------------- |
| \*stop  | Stops a running process.  | `"commands": ["*stop"]`                      |
| \*close | Closes the terminal.      | `"commands": ["*close"]`                     |
| \*delay | Delays next command.      | `"commands": ["*delay 1000"]`                |
| \*alert | Creates a notification.\* | `"commands": ["*alert remember to open PR"]` |

<!-- | \*cd    | Change dir if not already in it | `"commands": ["*cd path/to/directory"]`      | -->
<!-- | \*echo  | Send text to terminal.    | `"commands": ["*echo remember to pull changes"]` | -->


_\* there can only be 3 alert windows open at a time_

#### Tips:

- If an existing terminal tab can't be found a new one will be created.