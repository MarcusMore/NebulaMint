# Contract Deployment Script for Arc Testnet
# This script automates the contract deployment process

Write-Host "=== Arc Testnet NFT Contract Deployment ===" -ForegroundColor Cyan
Write-Host ""

# Check if .env file exists
if (-not (Test-Path .env)) {
    Write-Host "❌ .env file not found!" -ForegroundColor Red
    Write-Host "Please create a .env file with PRIVATE_KEY and other required variables." -ForegroundColor Yellow
    exit 1
}

# Check for Foundry
Write-Host "Checking for Foundry..." -ForegroundColor Yellow

if (Get-Command forge -ErrorAction SilentlyContinue) {
    Write-Host "✓ Foundry is installed" -ForegroundColor Green
} else {
    Write-Host "❌ Foundry is not installed" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Foundry first:" -ForegroundColor Yellow
    Write-Host "1. Install Git for Windows: https://git-scm.com/download/win" -ForegroundColor White
    Write-Host "2. Open Git Bash in this directory" -ForegroundColor White
    Write-Host "3. Run: curl -L https://foundry.paradigm.xyz | bash" -ForegroundColor White
    Write-Host "4. Run: foundryup" -ForegroundColor White
    Write-Host ""
    Write-Host "Or use Scoop:" -ForegroundColor Yellow
    Write-Host "scoop install foundry" -ForegroundColor White
    exit 1
}

# Check for OpenZeppelin contracts
Write-Host ""
Write-Host "Checking for OpenZeppelin contracts..." -ForegroundColor Yellow
if (-not (Test-Path "lib\openzeppelin-contracts")) {
    Write-Host "Installing OpenZeppelin contracts..." -ForegroundColor Yellow
    forge install OpenZeppelin/openzeppelin-contracts --no-commit
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install OpenZeppelin contracts" -ForegroundColor Red
        exit 1
    }
    Write-Host "✓ OpenZeppelin contracts installed" -ForegroundColor Green
} else {
    Write-Host "✓ OpenZeppelin contracts already installed" -ForegroundColor Green
}

# Read .env file
Write-Host ""
Write-Host "Reading .env file..." -ForegroundColor Yellow
$envContent = Get-Content .env -Raw
$privateKey = ""
$rpcUrl = "https://rpc.testnet.arc.network"

# Extract PRIVATE_KEY
if ($envContent -match "PRIVATE_KEY=(.+)") {
    $privateKey = $matches[1].Trim()
    if ($privateKey -eq "" -or $privateKey -match "^\s*$") {
        Write-Host "❌ PRIVATE_KEY is empty in .env file" -ForegroundColor Red
        Write-Host "Please add your private key to .env: PRIVATE_KEY=0x..." -ForegroundColor Yellow
        exit 1
    }
} else {
    Write-Host "❌ PRIVATE_KEY not found in .env file" -ForegroundColor Red
    Write-Host "Please add: PRIVATE_KEY=0x...your_private_key..." -ForegroundColor Yellow
    exit 1
}

# Extract RPC URL if specified
if ($envContent -match "ARC_TESTNET_RPC_URL=(.+)") {
    $rpcUrl = ($matches[1] -split "`n" | Select-Object -First 1).Trim()
}

Write-Host "✓ Configuration loaded" -ForegroundColor Green

# Compile contract
Write-Host ""
Write-Host "Compiling contract..." -ForegroundColor Yellow
forge build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Contract compilation failed" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Contract compiled successfully" -ForegroundColor Green

# Deploy contract
Write-Host ""
Write-Host "Deploying contract to Arc Testnet..." -ForegroundColor Yellow
Write-Host "This may take a moment..." -ForegroundColor Gray

$deployOutput = forge create contracts/ImageNFT.sol:ImageNFT `
    --rpc-url $rpcUrl `
    --private-key $privateKey `
    --constructor-args "Arc Image NFTs" "AINFT" "https://ipfs.io/ipfs/" 0 `
    --broadcast 2>&1

$deployOutput | ForEach-Object { Write-Host $_ }

# Extract contract address from output
$contractAddress = ""
if ($deployOutput -match "Deployed to:\s*(0x[a-fA-F0-9]{40})") {
    $contractAddress = $matches[1]
} elseif ($deployOutput -match "(0x[a-fA-F0-9]{40})") {
    # Try to find any address in the output
    $addresses = [regex]::Matches($deployOutput, "0x[a-fA-F0-9]{40}")
    if ($addresses.Count -gt 0) {
        $contractAddress = $addresses[0].Value
    }
}

if ($contractAddress -ne "") {
    Write-Host ""
    Write-Host "✓ Contract deployed successfully!" -ForegroundColor Green
    Write-Host "Contract Address: $contractAddress" -ForegroundColor Cyan
    Write-Host ""
    
    # Update .env file
    Write-Host "Updating .env file..." -ForegroundColor Yellow
    $envLines = Get-Content .env
    $updated = $false
    $newEnvLines = @()
    
    foreach ($line in $envLines) {
        if ($line -match "^VITE_CONTRACT_ADDRESS=") {
            $newEnvLines += "VITE_CONTRACT_ADDRESS=$contractAddress"
            $updated = $true
        } else {
            $newEnvLines += $line
        }
    }
    
    if (-not $updated) {
        $newEnvLines += "VITE_CONTRACT_ADDRESS=$contractAddress"
    }
    
    $newEnvLines | Set-Content .env
    Write-Host "✓ .env file updated with contract address" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Restart your dev server (npm run dev)" -ForegroundColor White
    Write-Host "2. Connect your wallet to Arc Testnet" -ForegroundColor White
    Write-Host "3. Start minting NFTs!" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "⚠️  Could not automatically extract contract address" -ForegroundColor Yellow
    Write-Host "Please check the output above and manually add to .env:" -ForegroundColor Yellow
    Write-Host "VITE_CONTRACT_ADDRESS=0x..." -ForegroundColor White
}
