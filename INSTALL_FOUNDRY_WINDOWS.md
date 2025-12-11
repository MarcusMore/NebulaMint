# Installing Foundry on Windows

## Method 1: Using Git Bash (Recommended)

1. **Install Git for Windows** (if not already installed):
   - Download from: https://git-scm.com/download/win
   - During installation, make sure to select "Git Bash Here" option

2. **Open Git Bash** in your project directory

3. **Install Foundry:**
   ```bash
   curl -L https://foundry.paradigm.xyz | bash
   foundryup
   ```

4. **Verify installation:**
   ```bash
   forge --version
   ```

## Method 2: Using PowerShell (Alternative)

1. **Install Scoop** (Windows package manager):
   ```powershell
   Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
   irm get.scoop.sh | iex
   ```

2. **Install Foundry via Scoop:**
   ```powershell
   scoop install foundry
   ```

3. **Verify installation:**
   ```powershell
   forge --version
   ```

## Method 3: Manual Installation

1. **Download Foundry binaries:**
   - Visit: https://github.com/foundry-rs/foundry/releases
   - Download the latest Windows release (foundry_nightly_windows_amd64.tar.gz)

2. **Extract and add to PATH:**
   - Extract the archive
   - Add the extracted folder to your system PATH
   - Or place `forge.exe`, `cast.exe`, and `anvil.exe` in a folder already in PATH

## Verify Installation

After installation, verify with:
```powershell
forge --version
cast --version
anvil --version
```

## Next Steps

Once Foundry is installed, continue with contract deployment:
1. See [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment steps
2. Or see [SETUP_CONTRACT.md](./SETUP_CONTRACT.md) for contract setup

