$url = "http://127.0.0.1:4173/"
$outDir = "artifacts/lighthouse"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

npx lighthouse $url `
  --quiet `
  --only-categories=performance,accessibility,best-practices,seo `
  --form-factor=mobile `
  --screenEmulation.mobile=true `
  --screenEmulation.width=375 `
  --screenEmulation.height=812 `
  --screenEmulation.deviceScaleFactor=2 `
  --output=json `
  --output=html `
  --output-path="$outDir/lighthouse-mobile"

Write-Host "Lighthouse reports saved to $outDir"

