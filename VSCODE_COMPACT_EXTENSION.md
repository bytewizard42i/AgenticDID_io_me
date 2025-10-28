# Visual Studio Code Extension for Compact

**Official VS Code Extension Documentation**  
**Extension**: Visual Studio Code for Compact/Minokawa  
**Language**: Minokawa 0.18.0 / Compact  
**Updated**: October 28, 2025

> 🎨 **IDE support for Midnight smart contract development**

---

## Overview

The Visual Studio Code extension for Compact is a plugin that assists with writing and debugging smart contracts written in Midnight's Compact/Minokawa language.

**Capabilities**:
- Create new smart contracts from templates
- Syntax highlighting
- Code snippets
- Error highlighting
- Build task integration
- Problem matcher for compiler errors

---

## Installation

**Extension Name**: Visual Studio Code extension for Compact

**Installation**: Available from VS Code Marketplace

---

## Features

### 1. Syntax Highlighting

Smart contracts written in Compact/Minokawa have full syntax highlighting.

**Recognized Elements**:
- ✅ **Keywords**: `enum`, `struct`, `circuit`, `ledger`, `witness`, `export`, `import`, etc.
- ✅ **Literals**: String, boolean, numeric
- ✅ **Comments**: Single-line and multi-line
- ✅ **Parentheses**: Matching bracket pairs
- ✅ **Operators**: Arithmetic, comparison, logical

**Example**:
```compact
pragma language_version >= 0.17.0;

import CompactStandardLibrary;

enum State { ACTIVE, INACTIVE }

ledger counter: Counter;

export circuit increment(): [] {
  counter += 1;  // Fully highlighted!
}
```

![Syntax highlighting](syntax-highlighting.png)

---

### 2. Building Compact Source Files

#### NPM Script Method

Add build script to `package.json`:

```json
{
  "scripts": {
    "compact": "compact compile --vscode ./src/myContract.compact ./src/managed/myContract"
  }
}
```

**Key Points**:
- Uses `--vscode` flag to format errors for VS Code
- Omits newlines in error messages for proper rendering
- Assumes `compact` (compactc) is in PATH

**Usage**:
```bash
yarn compact
# or
npm run compact
```

---

#### VS Code Tasks (Recommended for Development)

Create `.vscode/tasks.json`:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Compile compact file to JS",
      "type": "shell",
      "command": "npx compact compile --vscode --skip-zk ${file} ${workspaceFolder}/src/managed",
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "never",
        "focus": false,
        "panel": "shared",
        "showReuseMessage": false,
        "clear": true,
        "revealProblems": "onProblem"
      },
      "problemMatcher": [
        "$compactException",
        "$compactInternal",
        "$compactCommandNotFound"
      ]
    }
  ]
}
```

**Benefits**:
- ✅ **`--skip-zk` flag**: Skip circuit generation for **fast** syntax checking
- ✅ **`${file}`**: Compiles currently open file
- ✅ **`revealProblems: "onProblem"`**: Shows errors automatically
- ✅ **Problem matcher**: Errors appear in **Problems** tab

**Usage**:
1. Open a `.compact` file
2. Press `Cmd+Shift+B` (Mac) or `Ctrl+Shift+B` (Windows/Linux)
3. Select "Compile compact file to JS"
4. Errors appear in **Problems** panel

---

### 3. Error Highlighting

With the problem matcher configured, compiler errors automatically appear in:
- ✅ **Problems panel** (bottom of VS Code)
- ✅ **Editor gutter** (red squiggly lines)
- ✅ **Inline error messages**

**Problem Matchers Available**:
- `$compactException` - Standard Compact compilation errors
- `$compactInternal` - Internal compiler errors
- `$compactCommandNotFound` - Compiler not found errors

**Example Error Display**:

```
Problems (3)
└── myContract.compact
    ├── line 42: potential witness-value disclosure must be declared but is not
    ├── line 58: operation has undefined for ledger field type Map
    └── line 73: expected right-hand-side to have type Uint<64>
```

![Code snippets and errors](code-snippets-errors.png)

---

## Code Snippets

The VS Code extension provides the following code snippets:

### Available Snippets

| Trigger | Description | Expands To |
|---------|-------------|------------|
| `ledger` or `state` | Ledger state field | `ledger fieldName: Type;` |
| `constructor` | Contract constructor | Full constructor template |
| `circuit` | Exported circuit | `export circuit name(): [] { }` |
| `witness` | Witness function | `witness name(): Type;` |
| `init` or `stdlib` | Import standard library | `import CompactStandardLibrary;` |
| `cond` | If statement | `if (condition) { }` |
| `for` | Map over vector | `map((x) => ..., vector)` |
| `fold` | Fold over vector | `fold((acc, x) => ..., init, vector)` |
| `enum` | Enum definition | Full enum template |
| `struct` | Struct definition | Full struct template |
| `module` | Module definition | Full module template |
| `assert` | Assertion | `assert(condition, "message");` |
| `pragma` | Language version | `pragma language_version >= 0.17.0;` |
| **`compact`** | **Full contract template** | **Complete skeleton** |

---

### Snippet Examples

#### 1. Ledger State (`ledger`)

**Trigger**: Type `ledger` and press Tab

**Expands to**:
```compact
ledger fieldName: Type;
```

---

#### 2. Circuit (`circuit`)

**Trigger**: Type `circuit` and press Tab

**Expands to**:
```compact
export circuit circuitName(param: Type): ReturnType {
  // Circuit body
}
```

---

#### 3. Import Standard Library (`init` or `stdlib`)

**Trigger**: Type `init` or `stdlib` and press Tab

**Expands to**:
```compact
import CompactStandardLibrary;
```

---

#### 4. Constructor

**Trigger**: Type `constructor` and press Tab

**Expands to**:
```compact
constructor(param: Type) {
  // Initialize ledger state
}
```

---

#### 5. Witness

**Trigger**: Type `witness` and press Tab

**Expands to**:
```compact
witness functionName(): ReturnType;
```

---

#### 6. Full Contract Template (`compact`)

**Trigger**: Type `compact` and press Tab

**Expands to**: Complete contract skeleton with:
- Pragma declaration
- Import statement
- Sample enum
- Sample struct
- Ledger declarations
- Constructor
- Sample circuit

---

### Using Snippets

**Method 1: Typing**
1. Start typing the snippet trigger (e.g., `ledger`)
2. VS Code shows autocomplete suggestions
3. Press `Tab` or `Enter` to expand

**Method 2: IntelliSense**
1. Press `Ctrl+Space` (Windows/Linux) or `Cmd+Space` (Mac)
2. Browse available snippets
3. Select and press `Enter`

![Code snippets and errors](code-snippets-errors.png)

---

## Creating a New Contract

### Using File Template

Create a complete new smart contract from scratch:

**Steps**:
1. Create new file or open existing `.compact` file
2. Open Command Palette: `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
3. Select **"Snippets: Fill File with Snippet"**
4. Select **"Compact"**

⚠️ **Warning**: If performed in existing file, **contents will be overwritten**!

**Generated Skeleton**:
```compact
pragma language_version >= 0.17.0;

import CompactStandardLibrary;

enum State {
  INITIAL,
  ACTIVE
}

struct Config {
  value: Uint<64>;
  enabled: Boolean;
}

ledger state: State;
ledger config: Config;

constructor(initialValue: Uint<64>) {
  state = State.INITIAL;
  config = Config { value: initialValue, enabled: true };
}

export circuit activate(): [] {
  assert(state == State.INITIAL, "Already active");
  state = State.ACTIVE;
}
```

![File template](file-template.png)

---

## Best Practices

### Development Workflow

1. **Use VS Code Tasks** for fast compilation:
   - Configure `.vscode/tasks.json` with `--skip-zk`
   - Bind to keyboard shortcut
   - Errors appear instantly in Problems panel

2. **Use Snippets** for boilerplate:
   - Type `compact` for new contracts
   - Use `ledger`, `circuit`, `witness` for components
   - Less typing, fewer errors

3. **Enable Auto-Save**:
   - Set `"files.autoSave": "afterDelay"`
   - Pair with file watcher task for instant feedback

---

### Recommended `.vscode/settings.json`

```json
{
  "files.autoSave": "afterDelay",
  "files.autoSaveDelay": 1000,
  "editor.formatOnSave": false,
  "editor.tabSize": 2,
  "[compact]": {
    "editor.defaultFormatter": null
  }
}
```

---

### Recommended `.vscode/tasks.json`

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Compile Compact (Fast)",
      "type": "shell",
      "command": "compactc --vscode --skip-zk ${file} ${workspaceFolder}/output",
      "group": {
        "kind": "build",
        "isDefault": true
      },
      "presentation": {
        "reveal": "never",
        "revealProblems": "onProblem"
      },
      "problemMatcher": [
        "$compactException",
        "$compactInternal",
        "$compactCommandNotFound"
      ]
    },
    {
      "label": "Compile Compact (Full)",
      "type": "shell",
      "command": "compactc --vscode ${file} ${workspaceFolder}/output",
      "group": "build",
      "presentation": {
        "reveal": "always"
      },
      "problemMatcher": [
        "$compactException",
        "$compactInternal",
        "$compactCommandNotFound"
      ]
    }
  ]
}
```

**Usage**:
- `Cmd+Shift+B` → Fast compilation (default)
- Select "Compile Compact (Full)" for complete build

---

## Integration with Our Scripts

### Update `scripts/compile-contracts.sh`

Add VS Code flag when running in VS Code:

```bash
#!/bin/bash

# Detect if running in VS Code terminal
VSCODE_FLAG=""
if [ -n "$VSCODE_PID" ]; then
  VSCODE_FLAG="--vscode"
fi

compactc $VSCODE_FLAG --skip-zk contracts/MyContract.compact output/
```

---

### NPM Scripts for VS Code

```json
{
  "scripts": {
    "compile": "compactc --vscode contracts/*.compact output/",
    "compile:dev": "compactc --vscode --skip-zk contracts/*.compact output/",
    "compile:watch": "nodemon --watch contracts --ext compact --exec 'npm run compile:dev'"
  }
}
```

---

## Troubleshooting

### Issue: Snippets don't appear

**Solution**:
1. Ensure file has `.compact` extension
2. Check language mode is set to "Compact"
3. Reload VS Code: `Cmd+Shift+P` → "Developer: Reload Window"

---

### Issue: Errors don't appear in Problems panel

**Solution**:
1. Verify `problemMatcher` is configured in `tasks.json`
2. Ensure `--vscode` flag is used in compile command
3. Check Output panel for raw compiler messages

---

### Issue: Build task not found

**Solution**:
1. Create `.vscode/tasks.json` in project root
2. Reload VS Code
3. Try build command again

---

### Issue: Compiler not found

**Error**: `compactCommandNotFound`

**Solution**:
1. Ensure `compactc` is installed and in PATH
2. Or use `npx compact` in task command
3. Or use Docker-based task

---

## Advanced Configuration

### Docker-based Task

For projects using Docker:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Compile Compact (Docker)",
      "type": "shell",
      "command": "docker run --rm -v ${workspaceFolder}:/work midnightnetwork/compactc:latest 'compactc --vscode --skip-zk /work/${relativeFile} /work/output'",
      "group": "build",
      "problemMatcher": [
        "$compactException",
        "$compactInternal"
      ]
    }
  ]
}
```

---

### Watch Mode Task

Automatically compile on file save:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Watch Compact Files",
      "type": "shell",
      "command": "nodemon --watch contracts --ext compact --exec 'compactc --vscode --skip-zk contracts/*.compact output/'",
      "isBackground": true,
      "problemMatcher": [
        "$compactException"
      ]
    }
  ]
}
```

**Requires**: `npm install -D nodemon`

---

## Keyboard Shortcuts

### Recommended Custom Keybindings

Add to `.vscode/keybindings.json`:

```json
[
  {
    "key": "cmd+b",
    "command": "workbench.action.tasks.build",
    "when": "editorLangId == compact"
  },
  {
    "key": "cmd+shift+i",
    "command": "editor.action.insertSnippet",
    "when": "editorTextFocus && editorLangId == compact"
  }
]
```

---

## Extension Settings

The extension may provide settings (check VS Code settings):

**Common Settings**:
- `compact.compilerPath` - Path to compactc compiler
- `compact.enableLinting` - Enable/disable error checking
- `compact.lintOnSave` - Run compiler on file save

---

## Related Documentation

- **Compiler Manual**: COMPACTC_MANUAL.md
- **Language Reference**: MINOKAWA_LANGUAGE_REFERENCE.md
- **Standard Library**: COMPACT_STANDARD_LIBRARY.md

---

## Quick Reference

### Essential Snippets
- `compact` - Full contract template
- `init` - Import standard library
- `ledger` - Add ledger field
- `circuit` - Add circuit
- `witness` - Add witness

### Build Commands
```bash
# Fast (skip ZK)
Cmd+Shift+B → Select "Compile compact file to JS"

# Full build
Run task: "Compile Compact (Full)"
```

### Problem Matchers
```json
"problemMatcher": [
  "$compactException",
  "$compactInternal",
  "$compactCommandNotFound"
]
```

---

## License

The Visual Studio Code extension for Compact is distributed under the **Apache 2.0 license**.

---

**Status**: ✅ Complete VS Code Extension Reference  
**Source**: Official Midnight Documentation  
**Extension**: Visual Studio Code for Compact  
**Last Updated**: October 28, 2025
