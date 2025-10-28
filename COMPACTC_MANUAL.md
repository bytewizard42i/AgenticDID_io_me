# Compact Compiler Manual Page (compactc)

**Official Manual for compactc**  
**Compiler Version**: 0.26.0  
**Language Version**: Minokawa 0.18.0  
**Updated**: October 28, 2025

---

## NAME

**compactc** - The Minokawa (Compact) smart contract compiler

---

## OVERVIEW

The Compact compiler, `compactc`, takes as input a Compact source program in a specified source file and translates it into several target files in a specified directory.

---

## SYNOPSIS

```bash
compactc [flags...] sourcepath targetpath
```

**Parameters**:
- `flags...` - Optional compilation flags (see [FLAGS](#flags))
- `sourcepath` - Path to Compact source file (`.compact`)
- `targetpath` - Target directory for compiled output

---

## DESCRIPTION

### Input

- **`sourcepath`**: Identifies a file containing a Compact source program
- Must be a `.compact` file

### Output

- **`targetpath`**: Identifies target directory for output files
- Target directory is **created if it does not already exist**

### Generated Files

The compiler produces the following target files, where `sourceroot` is the name of the source file without extension:

#### TypeScript/JavaScript Output

| File | Description |
|------|-------------|
| `targetdir/contract/index.d.cts` | TypeScript type-definition file |
| `targetdir/contract/index.cjs` | JavaScript source file |
| `targetdir/contract/index.cjs.map` | JavaScript source-map file |

#### Zero-Knowledge Circuit Files

For each exported circuit `circuitname`:

| File | Description |
|------|-------------|
| `targetdir/zkir/circuitname.zkir` | ZK/IR circuit file |
| `targetdir/keys/circuitname.prover` | Proving key |
| `targetdir/keys/circuitname.verifier` | Verifier key |

---

## File Inclusion and Module Imports

### Include Files

```compact
include 'name';
```

Includes another Compact source file.

### Import Modules

```compact
import name;          // Import by name
import 'name';        // Import by pathname
```

Imports an externally defined module.

### File Resolution

**Default behavior**:
- Compiler looks for files in the **current working directory**
- Full filename: `name.compact`

**With `COMPACT_PATH` environment variable**:
- Set to colon-separated list (semicolon on Windows): `dirpath:...:dirpath`
- Compiler searches each `dirpath/name.compact` in order
- Stops when file is found or all paths exhausted

**Example**:
```bash
# Unix/Linux/macOS
export COMPACT_PATH="/path/to/libs:/other/path/to/libs"

# Windows
set COMPACT_PATH="C:\path\to\libs;C:\other\path\to\libs"
```

### Standard Library

Every Compact source program **should import** the standard library:

```compact
import CompactStandardLibrary;
```

**Best Practice**: Place at the top of the program.

---

## FLAGS

### Help and Version Information

#### `--help`
Prints help text and exits.

```bash
compactc --help
```

#### `--version`
Prints the compiler version and exits.

```bash
compactc --version
# Output: 0.26.0
```

#### `--language-version`
Prints the language version and exits.

```bash
compactc --language-version
# Output: 0.18.0
```

---

### Compilation Options

#### `--skip-zk`
Skip generation of proving keys.

**Use Case**: 
- Debugging TypeScript output only
- Proving key generation is time-consuming
- Faster compilation during development

**Note**: Compiler also automatically skips proving key generation (with warning) when it cannot find `zkir`.

**Example**:
```bash
compactc --skip-zk src/test.compact obj/test
```

**Output**: TypeScript/JavaScript files + zkir files, **but NO keys/**

---

#### `--no-communications-commitment`
Omit the contract communications commitment.

**Purpose**: Disables data integrity for contract-to-contract calls.

⚠️ **Warning**: Only use when cross-contract calls are not needed.

---

#### `--sourceRoot <value>`
Override the `sourceRoot` field in generated source-map file.

**Default**: Compiler determines value from source and target pathnames.

**Use Case**: When deployed application structure differs from build structure.

**Example**:
```bash
compactc --sourceRoot "/app/src" src/test.compact obj/test
```

---

#### `--vscode`
Format error messages for VS Code extension.

**Effect**: Omits newlines from error messages for proper VS Code rendering.

**Use Case**: When using the VS Code extension for Compact.

---

#### `--trace-passes`
Print compiler tracing information.

**Audience**: Compiler developers

**Use Case**: Debugging compiler internals.

⚠️ **Not for general use**

---

## EXAMPLES

### Example 1: Full Compilation

**Source**: `src/test.compact` contains a well-formed Compact program exporting circuits `foo` and `bar`.

**Command**:
```bash
compactc src/test.compact obj/test
```

**Output**:
```
obj/test/
├── contract/
│   ├── index.d.cts
│   ├── index.cjs
│   └── index.cjs.map
├── zkir/
│   ├── foo.zkir
│   └── bar.zkir
└── keys/
    ├── foo.prover
    ├── foo.verifier
    ├── bar.prover
    └── bar.verifier
```

---

### Example 2: Skip Proving Keys (Development)

**Command**:
```bash
compactc --skip-zk src/test.compact obj/test
```

**Output**:
```
obj/test/
├── contract/
│   ├── index.d.cts
│   ├── index.cjs
│   └── index.cjs.map
└── zkir/
    ├── foo.zkir
    └── bar.zkir
```

**Note**: No `keys/` directory (proving keys not generated).

---

### Example 3: Multiple Flags

```bash
compactc --skip-zk --vscode src/contract.compact build/output
```

Combines:
- Skip proving key generation
- Format errors for VS Code

---

## Common Usage Patterns

### Development Workflow

```bash
# Fast iteration (skip ZK key generation)
compactc --skip-zk contracts/MyContract.compact output/

# Full build for testing
compactc contracts/MyContract.compact output/
```

---

### Docker Usage

```bash
docker run --rm \
  -v "$(pwd)/contracts:/contracts" \
  -v "$(pwd)/output:/output" \
  midnightnetwork/compactc:latest \
  "compactc --skip-zk /contracts/MyContract.compact /output/MyContract"
```

---

### CI/CD Pipeline

```bash
#!/bin/bash
# Compile all contracts

for contract in contracts/*.compact; do
  basename=$(basename "$contract" .compact)
  compactc "$contract" "output/$basename"
done
```

---

## Output File Details

### TypeScript Type Definition (`index.d.cts`)

Contains:
- Exported user-defined types
- `Witnesses<T>` interface
- `ImpureCircuits<T>` interface
- `PureCircuits` interface
- `Circuits<T>` interface
- `Contract<T, W>` class
- `Ledger` type
- `ledger()` function

**Use**: Import in TypeScript/JavaScript DApp code

---

### JavaScript Source (`index.cjs`)

Contains:
- Compiled circuit implementations
- Runtime support code
- Contract class implementation

**Format**: CommonJS module

---

### Source Map (`index.cjs.map`)

Maps compiled JavaScript back to original Compact source for debugging.

**Configure**: Use `--sourceRoot` flag to adjust paths

---

### ZK/IR Circuit Files (`*.zkir`)

Intermediate representation of zero-knowledge circuits.

**One file per exported circuit**

**Used**: By proving key generation

---

### Proving Keys (`*.prover`, `*.verifier`)

Zero-knowledge proving and verification keys.

**Generated**: One pair per exported circuit

**Size**: Can be large (megabytes per circuit)

**Generation Time**: Can be slow (use `--skip-zk` during development)

---

## Environment Variables

### `COMPACT_PATH`

**Purpose**: Search path for include files and imported modules

**Format**: 
- Unix/Linux/macOS: Colon-separated paths
  ```bash
  export COMPACT_PATH="/path1:/path2:/path3"
  ```
- Windows: Semicolon-separated paths
  ```cmd
  set COMPACT_PATH="C:\path1;C:\path2;C:\path3"
  ```

**Search Order**:
1. Current working directory (if `COMPACT_PATH` not set)
2. Each directory in `COMPACT_PATH` (left to right)

**File Lookup**: `dirpath/name.compact`

---

## Error Handling

### Missing Source File

```bash
compactc nonexistent.compact output/
```

**Error**: Source file not found

---

### Compilation Errors

**Default Format**:
```
Exception: test.compact line 42 char 10:
  potential witness-value disclosure must be declared but is not:
    ...
```

**VS Code Format** (with `--vscode`):
```
test.compact line 42 char 10: potential witness-value disclosure...
```

---

### Missing Dependencies

If imported module not found in `COMPACT_PATH`:

**Error**: Module not found: `ModuleName`

**Solution**: 
- Check `COMPACT_PATH` is set correctly
- Verify module file exists at `path/ModuleName.compact`

---

## Performance Tips

### Development

1. **Use `--skip-zk`** during active development
2. Only generate keys for final testing

### CI/CD

1. **Cache `keys/` directory** if contracts unchanged
2. Proving keys are deterministic (same contract = same keys)

### Large Projects

1. **Set `COMPACT_PATH`** to avoid relative path complexity
2. **Organize modules** into logical directories

---

## Troubleshooting

### Issue: Proving keys fail to generate

**Symptoms**: Warning message, no `keys/` directory

**Possible Causes**:
- `zkir` binary not found in PATH
- Insufficient memory
- Corrupted zkir files

**Solutions**:
- Use `--skip-zk` to confirm TypeScript generation works
- Check system resources
- Re-compile without `--skip-zk`

---

### Issue: Source maps don't work

**Symptom**: Debugger shows wrong line numbers

**Cause**: `sourceRoot` in source map doesn't match deployed structure

**Solution**: Use `--sourceRoot` flag to correct path

---

### Issue: Module not found during compilation

**Symptom**: Error importing module

**Cause**: `COMPACT_PATH` not set or incorrect

**Solution**:
```bash
export COMPACT_PATH="/path/to/modules"
compactc source.compact output/
```

---

## Integration Examples

### NPM/Package.json

```json
{
  "scripts": {
    "compile": "compactc contracts/MyContract.compact output/",
    "compile:dev": "compactc --skip-zk contracts/MyContract.compact output/",
    "compile:all": "for f in contracts/*.compact; do compactc $f output/$(basename $f .compact); done"
  }
}
```

---

### Makefile

```makefile
CONTRACTS := $(wildcard contracts/*.compact)
OUTPUTS := $(patsubst contracts/%.compact,output/%,$(CONTRACTS))

.PHONY: all clean dev

all: $(OUTPUTS)

dev: FLAGS := --skip-zk
dev: $(OUTPUTS)

output/%: contracts/%.compact
	mkdir -p output
	compactc $(FLAGS) $< $@

clean:
	rm -rf output/
```

---

## Related Documentation

- **Language Reference**: MINOKAWA_LANGUAGE_REFERENCE.md
- **Standard Library**: COMPACT_STANDARD_LIBRARY.md
- **Compiler Guide**: MINOKAWA_COMPILER_GUIDE.md
- **Version Info**: MINOKAWA_COMPILER_0.26.0_RELEASE_NOTES.md

---

## Quick Reference

### Basic Compilation
```bash
compactc source.compact output/
```

### Development Mode
```bash
compactc --skip-zk source.compact output/
```

### Check Version
```bash
compactc --version           # Compiler version
compactc --language-version  # Language version
```

### With Environment
```bash
export COMPACT_PATH="/path/to/modules"
compactc source.compact output/
```

### Docker
```bash
docker run --rm \
  -v "$(pwd):/work" \
  midnightnetwork/compactc:latest \
  "compactc /work/source.compact /work/output/"
```

---

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | Compilation error |
| 2 | Invalid arguments |
| 255 | Internal compiler error |

---

**Status**: ✅ Complete Compiler Manual Reference  
**Source**: Official Midnight Documentation  
**Version**: compactc 0.26.0 / Minokawa 0.18.0  
**Last Updated**: October 28, 2025
