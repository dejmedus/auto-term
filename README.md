# Auto-Term

Auto-Term is a Visual Studio Code extension that allows you to automate the process of opening and configuring multiple terminal tabs when you open a workspace. This is useful for quickly setting up terminals, running commands, navigating directories, and more.

## Usage

1. Open your workspace in Visual Studio Code.
2. Press `Ctrl+Shift+P` to open the command palette.
3. Type `Auto Term: <action>` or `Auto Term: Action` and select an action.
4. Auto-Term will read your terminal configurations and run the specified commands.

## Configuration

You can define your terminal configurations in a `terminal.config.json` file in the root of your workspace. The file should be structured by action, each containing and array of terminal tab commands.

Create a `terminal.config.json` file from template using command `Auto Term: Template`

Example:

```json
{
  // Here, setup will open two terminal tabs: frontend and backend, then installs needed packages
  "setup": [
    {
      "name": "frontend",
      "commands": ["cd Frontend", "npm i", "clear"],
      "description": "Install npm packages"
    },
    {
      "name": "backend",
      "commands": [
        "cd Backend",
        "source venv/bin/activate",
        "pip install -r requirements.txt",
        "python manage migrate",
        "clear"
      ],
      "description": "Install requirements.txt"
    }
  ],
  "open": [
    {
      "name": "git",
      "commands": ["git branch"],
      "description": "Display the current branch"
    },
    {
      "name": "frontend",
      "commands": ["cd Frontend"],
      "description": "Open a terminal for frontend"
    },
    {
      "name": "backend",
      "commands": ["cd Backend", "source venv/bin/activate"],
      "description": "Open a terminal for backend"
    }
  ],
  "start": [
    {
      "name": "frontend",
      "commands": ["clear", "npm run dev"],
      "description": "Run the frontend"
    },
    {
      "name": "backend",
      "commands": ["clear", "python manage.py runserver"],
      "description": "Run the backend"
    }
  ],
  "restart": [
    {
      "name": "frontend",
      "commands": ["*STOP", "clear", "npm run dev"],
      "description": "Restart the frontend"
    },
    {
      "name": "backend",
      "commands": ["*STOP", "clear", "python manage.py runserver"],
      "description": "Restart the backend"
    }
  ],
  "reminder": [
    {
      "name": "git",
      "commands": ["echo 'remember to pull new changes from main'"],
      "description": "Reminder"
    }
  ]
}
```

#### Special commands

Auto-Term provides special commands that can be utilized to perform specific actions beyond standard text input. Here are some notable commands:

- "*STOP" : Use this command to gracefully stop a running process. Usage:`"commands": ["*STOP", "clear"]` will stop the associated process and clear the terminal.
- "*CLOSE": Employ this command to close a terminal. It's useful for cleaning up unnecessary terminals. Usage: `"commands": ["*CLOSE"]`

#### Tips:

- If an existing terminal of "name" cannot be found a new terminal will be created.
- Press `Ctrl+Shift+P` and type `Auto Term: Show usage guide` to view an overview of your `terminal.config.json` commands
