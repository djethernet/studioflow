# --------------------------------------------
# Check if Node is installed
# --------------------------------------------
$node = Get-Command node -ErrorAction SilentlyContinue

if (-not $node) {
    Write-Host "Node.js not found, installing via winget..."
    winget install OpenJS.NodeJS.LTS -e --source winget
} else {
    Write-Host "? Node.js already installed. Skipping install."
}

# --------------------------------------------
# Install project dependencies
# --------------------------------------------
Write-Host "Installing project dependencies..."
npm install

# --------------------------------------------
# Done
# --------------------------------------------
Write-Host "------------------------------------"
Write-Host "? Setup complete!"
Write-Host "To start the app: npm run dev"
Write-Host "------------------------------------"
