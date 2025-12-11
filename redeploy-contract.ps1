# Redeploy ImageNFT Contract to Arc Testnet
# This script redeploys the contract with the latest code

Write-Host "=== ImageNFT Contract Redeployment ===" -ForegroundColor Green
Write-Host ""

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "❌ .env file not found!" -ForegroundColor Red
    Write-Host "Please create .env file with:" -ForegroundColor Yellow
    Write-Host "  ARC_TESTNET_RPC_URL=https://rpc.testnet.arc.network" -ForegroundColor White
    Write-Host "  PRIVATE_KEY=0x...your_private_key..." -ForegroundColor White
    exit 1
}

# Load environment variables
$envContent = Get-Content ".env" -Raw
if ($envContent -notmatch "PRIVATE_KEY=0x[0-9a-fA-F]{64}") {
    Write-Host "❌ PRIVATE_KEY not found or invalid in .env" -ForegroundColor Red
    Write-Host "Please add your private key to .env file" -ForegroundColor Yellow
    exit 1
}

# Extract PRIVATE_KEY from .env
$privateKey = ($envContent | Select-String -Pattern "PRIVATE_KEY=(0x[0-9a-fA-F]{64})").Matches.Groups[1].Value
$rpcUrl = "https://rpc.testnet.arc.network"

Write-Host "✅ Environment variables loaded" -ForegroundColor Green
Write-Host "   RPC URL: $rpcUrl" -ForegroundColor Cyan
Write-Host ""

# Check if forge is available
$forgeVersion = & forge --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Foundry (forge) is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Foundry first. See DEPLOYMENT.md" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Foundry found: $forgeVersion" -ForegroundColor Green
Write-Host ""

# Build contract
Write-Host "📦 Building contract..." -ForegroundColor Cyan
& forge build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Contract built successfully" -ForegroundColor Green
Write-Host ""

# Deploy contract
Write-Host "🚀 Deploying contract to Arc Testnet..." -ForegroundColor Cyan
Write-Host "   Constructor args: 'Arc Image NFTs' 'AINFT' 'https://ipfs.io/ipfs/' 0" -ForegroundColor Gray
Write-Host ""

$deployOutput = & forge create contracts/ImageNFT.sol:ImageNFT `
    --rpc-url $rpcUrl `
    --private-key $privateKey `
    --constructor-args "Arc Image NFTs" "AINFT" "https://ipfs.io/ipfs/" 0 `
    --broadcast 2>&1

Write-Host $deployOutput

# Extract contract address from output
$contractAddress = ($deployOutput | Select-String -Pattern "Deployed to: (0x[a-fA-F0-9]{40})").Matches.Groups[1].Value

if ($contractAddress) {
    Write-Host ""
    Write-Host "✅ Contract deployed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📝 Contract Address: $contractAddress" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "🔗 View on ArcScan:" -ForegroundColor Yellow
    Write-Host "   https://testnet.arcscan.app/address/$contractAddress" -ForegroundColor White
    Write-Host ""
    Write-Host "⚠️  IMPORTANT: Update your .env file:" -ForegroundColor Yellow
    Write-Host "   VITE_CONTRACT_ADDRESS=$contractAddress" -ForegroundColor White
    Write-Host ""
    Write-Host "Then restart your dev server!" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "⚠️  Could not extract contract address from output" -ForegroundColor Yellow
    Write-Host "Please check the output above for the contract address" -ForegroundColor White
    Write-Host "Look for a line like: 'Deployed to: 0x...'" -ForegroundColor White
}

