# Deployment Script for ImageNFT Contract
# Run this in PowerShell: .\deploy.ps1

$env:Path += ";$env:USERPROFILE\.foundry\bin"

$PRIVATE_KEY = "0x49cdd56f70fa07141fb9ea502c81d1e266d1db164217318515f70151b558f5af"

Write-Host "=== Deploying ImageNFT Contract to Arc Testnet ===" -ForegroundColor Cyan
Write-Host ""

$result = forge create contracts/ImageNFT.sol:ImageNFT `
    --rpc-url https://rpc.testnet.arc.network `
    --private-key $PRIVATE_KEY `
    --constructor-args "Arc Image NFTs" "AINFT" "https://ipfs.io/ipfs/" 0 `
    --broadcast

Write-Host ""
Write-Host "=== Deployment Complete ===" -ForegroundColor Yellow

# Extract contract address from output
if ($result -match "Deployed to:\s*(0x[a-fA-F0-9]{40})") {
    $contractAddress = $matches[1]
    Write-Host "Contract Address: $contractAddress" -ForegroundColor Green
    Write-Host ""
    Write-Host "Updating .env file..." -ForegroundColor Yellow
    
    # Update .env file
    $envContent = Get-Content .env -Raw
    if ($envContent -match "VITE_CONTRACT_ADDRESS=") {
        $newContent = $envContent -replace "VITE_CONTRACT_ADDRESS=.*", "VITE_CONTRACT_ADDRESS=$contractAddress"
    } else {
        $newContent = $envContent + "`nVITE_CONTRACT_ADDRESS=$contractAddress"
    }
    $newContent | Set-Content .env -NoNewline
    Write-Host "✓ .env file updated with contract address!" -ForegroundColor Green
} else {
    Write-Host "Could not extract contract address from output." -ForegroundColor Red
    Write-Host "Please check the output above and manually update .env with the contract address." -ForegroundColor Yellow
}

Write-Host ""
if ($contractAddress) {
    Write-Host "View your contract on ArcScan:" -ForegroundColor Cyan
    Write-Host "https://testnet.arcscan.app/address/$contractAddress" -ForegroundColor Blue
}

