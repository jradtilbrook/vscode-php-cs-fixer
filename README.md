# php-cs-fixer

![Tests](https://github.com/jradtilbrook/vscode-php-cs-fixer/actions/workflows/test.yaml/badge.svg)

This extension provides document formatting using [PHP CS Fixer](https://github.com/FriendsOfPHP/PHP-CS-Fixer).

## Features

- Lint your PHP using PHP CS Fixer
    - Including formatting on save
- Using the configuration file present in the project root
- Uses the PHP CS Fixer version present in `vendor`

## Requirements

You must have PHP CS Fixer installed in you project (this extension looks for the binary at `vendor/bin/php-cs-fixer`).

Rules are read from the standard configuration files; `.php_cs` or `.php_cs.dist`.

## Extension Settings

There are no specific configuration settings provided by this extension. Configuration is done through the `.php_cs` file.

However, to configure this extension as the default formatter for PHP and to format on save, include this in your `settings.json`:

```json
    "[php]": {
        "editor.formatOnSave": true,
        "editor.defaultFormatter": "jradtilbrook.php-cs-fixer",
    },
```

## Development

### Get up and running straight away

* Press `F5` to open a new window with your extension loaded.
* Run your command from the command palette by pressing (`Ctrl+Shift+P` or `Cmd+Shift+P` on Mac) and typing `Hello World`.
* Set breakpoints in your code inside `src/extension.ts` to debug your extension.
* Find output from your extension in the debug console.

### Make changes

* You can relaunch the extension from the debug toolbar after changing code in `src/extension.ts`.
* You can also reload (`Ctrl+R` or `Cmd+R` on Mac) the VS Code window with your extension to load your changes.

### Run tests

* Open the debug viewlet (`Ctrl+Shift+D` or `Cmd+Shift+D` on Mac) and from the launch configuration dropdown pick `Extension Tests`.
* Press `F5` to run the tests in a new window with your extension loaded.
* See the output of the test result in the debug console.
* Make changes to `src/test/suite/extension.test.ts` or create new test files inside the `test/suite` folder.
  * The provided test runner will only consider files matching the name pattern `**.test.ts`.
  * You can create folders inside the `test` folder to structure your tests any way you want.
