<#
.SYNOPSIS
    Batch TypeScript Conversion Script for Math.js (Windows PowerShell)

.DESCRIPTION
    Automates the conversion of JavaScript files to TypeScript using jscodeshift
    codemods with proper error handling and progress tracking.

.PARAMETER Category
    Convert all files in a category (arithmetic, matrix, etc.)

.PARAMETER File
    Convert a single file

.PARAMETER Phase
    Convert files for a specific refactoring phase (2, 3, 4, etc.)

.PARAMETER ListFile
    Convert files listed in a text file (one per line)

.PARAMETER DryRun
    Preview changes without modifying files

.PARAMETER SkipTests
    Skip running tests after conversion

.PARAMETER Parallel
    Run conversions in parallel (faster)

.EXAMPLE
    .\tools\batch-convert.ps1 -Category arithmetic
    .\tools\batch-convert.ps1 -File src\function\arithmetic\add.js
    .\tools\batch-convert.ps1 -Phase 2
    .\tools\batch-convert.ps1 -ListFile files.txt -DryRun

.NOTES
    Requires: Node.js, npm, jscodeshift
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [string]$Category,

    [Parameter(Mandatory=$false)]
    [string]$File,

    [Parameter(Mandatory=$false)]
    [int]$Phase,

    [Parameter(Mandatory=$false)]
    [string]$ListFile,

    [Parameter(Mandatory=$false)]
    [switch]$DryRun,

    [Parameter(Mandatory=$false)]
    [switch]$SkipTests,

    [Parameter(Mandatory=$false)]
    [switch]$Parallel
)

# Configuration
$TransformScript = "tools\transform-mathjs-to-ts.js"
$ErrorActionPreference = "Stop"

# Statistics
$script:SuccessCount = 0
$script:FailureCount = 0

# Logging functions
function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Check prerequisites
function Test-Prerequisites {
    Write-Info "Checking prerequisites..."

    # Check jscodeshift
    try {
        $null = Get-Command npx -ErrorAction Stop
    } catch {
        Write-Error "npx not found. Install Node.js from https://nodejs.org/"
        exit 1
    }

    # Check transform script
    if (-not (Test-Path $TransformScript)) {
        Write-Error "Transform script not found: $TransformScript"
        exit 1
    }

    Write-Success "Prerequisites satisfied"
}

# Get files to convert
function Get-FilesToConvert {
    $files = @()

    if ($File) {
        # Single file mode
        $files = @($File)
    }
    elseif ($Category) {
        # Category mode
        Write-Info "Finding files in category: $Category"
        $files = Get-ChildItem -Path "src\function\$Category" -Filter *.js -Recurse | ForEach-Object { $_.FullName }
    }
    elseif ($Phase) {
        # Phase mode
        Write-Info "Finding files for Phase $Phase"

        switch ($Phase) {
            2 {
                # Phase 2: High-performance functions
                $files = @(
                    "src\function\arithmetic\multiply.js",
                    "src\function\arithmetic\divide.js",
                    "src\function\matrix\dot.js",
                    "src\function\matrix\multiply.js",
                    "src\function\algebra\lup.js",
                    "src\function\algebra\qr.js",
                    "src\function\statistics\mean.js",
                    "src\function\statistics\std.js"
                )
            }
            3 {
                # Phase 3: Type system
                $files = Get-ChildItem -Path "src\type" -Filter *.js -Recurse | ForEach-Object { $_.FullName }
            }
            4 {
                # Phase 4: Utilities
                $files = Get-ChildItem -Path "src\utils" -Filter *.js -Recurse | ForEach-Object { $_.FullName }
            }
            default {
                Write-Error "Phase $Phase not configured"
                exit 1
            }
        }
    }
    elseif ($ListFile) {
        # List file mode
        if (-not (Test-Path $ListFile)) {
            Write-Error "List file not found: $ListFile"
            exit 1
        }
        $files = Get-Content $ListFile | Where-Object { $_.Trim() -ne "" }
    }
    else {
        Write-Error "No files specified. Use -Category, -File, -Phase, or -ListFile"
        exit 1
    }

    # Filter JavaScript files only
    $files = $files | Where-Object { $_ -match '\.js$' }

    if ($files.Count -eq 0) {
        Write-Warning "No JavaScript files found to convert"
        exit 0
    }

    return $files
}

# Convert a single file
function ConvertFile {
    param([string]$FilePath)

    $tsFile = $FilePath -replace '\.js$', '.ts'

    Write-Info "Converting: $FilePath"

    # Build jscodeshift arguments
    $args = @(
        "jscodeshift",
        "-t", $TransformScript,
        $FilePath,
        "--extensions=js",
        "--parser=babel"
    )

    if ($DryRun) {
        $args += @("--dry", "--print")
    }

    # Run transformation
    try {
        $output = & npx @args 2>&1

        if ($LASTEXITCODE -eq 0) {
            if (-not $DryRun) {
                # Rename .js to .ts
                Move-Item -Path $FilePath -Destination $tsFile -Force
                Write-Success "✓ Converted: $FilePath → $tsFile"
                $script:SuccessCount++
                return $true
            }
            else {
                Write-Info "✓ [DRY RUN] Would convert: $FilePath"
                return $true
            }
        }
        else {
            Write-Error "✗ Transform failed: $FilePath"
            Write-Host $output
            $script:FailureCount++
            return $false
        }
    }
    catch {
        Write-Error "✗ Exception during transformation: $FilePath"
        Write-Host $_.Exception.Message
        $script:FailureCount++
        return $false
    }
}

# Update factory indexes
function Update-FactoryIndexes {
    param([string]$TsFile)

    $filename = [System.IO.Path]::GetFileNameWithoutExtension($TsFile)

    Write-Info "Updating factory indexes for: $filename"

    # Update factoriesAny.js
    if (Test-Path "src\factoriesAny.js") {
        $content = Get-Content "src\factoriesAny.js" -Raw
        $updated = $content -replace "from '(.*)$filename\.js'", "from '`$1$filename.ts'"
        if ($content -ne $updated) {
            Set-Content "src\factoriesAny.js" -Value $updated
            Write-Success "Updated factoriesAny.js"
        }
    }

    # Update factoriesNumber.js
    if (Test-Path "src\factoriesNumber.js") {
        $content = Get-Content "src\factoriesNumber.js" -Raw
        $updated = $content -replace "from '(.*)$filename\.js'", "from '`$1$filename.ts'"
        if ($content -ne $updated) {
            Set-Content "src\factoriesNumber.js" -Value $updated
            Write-Success "Updated factoriesNumber.js"
        }
    }
}

# Run tests for converted files
function Test-ConvertedFile {
    param([string]$TsFile)

    if ($SkipTests) {
        Write-Info "Skipping tests (--skip-tests flag)"
        return $true
    }

    $filename = [System.IO.Path]::GetFileNameWithoutExtension($TsFile)

    Write-Info "Running tests for: $filename"

    # Find test file
    $testFiles = Get-ChildItem -Path "test\unit-tests" -Filter "$filename.test.js" -Recurse -ErrorAction SilentlyContinue

    if ($testFiles.Count -gt 0) {
        try {
            $output = & npm test -- --grep $filename 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Success "✓ Tests passed: $filename"
                return $true
            }
            else {
                Write-Error "✗ Tests failed: $filename"
                return $false
            }
        }
        catch {
            Write-Warning "Could not run tests for: $filename"
            return $true
        }
    }
    else {
        Write-Warning "No test file found for: $filename"
        return $true
    }
}

# Compile TypeScript
function Invoke-TypeScriptCompile {
    Write-Info "Compiling TypeScript..."

    try {
        $output = & npm run compile:ts 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Success "TypeScript compilation successful"
            return $true
        }
        else {
            Write-Error "TypeScript compilation failed"
            Write-Host $output
            return $false
        }
    }
    catch {
        Write-Error "Exception during TypeScript compilation"
        Write-Host $_.Exception.Message
        return $false
    }
}

# Main function
function Main {
    Write-Host ""
    Write-Info "╔════════════════════════════════════════════════════════════╗"
    Write-Info "║       Math.js Batch TypeScript Conversion Script          ║"
    Write-Info "╚════════════════════════════════════════════════════════════╝"
    Write-Host ""

    Test-Prerequisites

    # Get files to convert
    $files = Get-FilesToConvert
    $totalFiles = $files.Count

    Write-Info "Found $totalFiles file(s) to convert"
    Write-Host ""

    # Confirmation
    if (-not $DryRun) {
        $response = Read-Host "This will modify $totalFiles file(s). Continue? [y/N]"
        if ($response -notmatch '^[Yy]$') {
            Write-Info "Aborted by user"
            exit 0
        }
    }

    # Start timer
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()

    # Convert files
    for ($i = 0; $i -lt $files.Count; $i++) {
        $file = $files[$i]
        $progress = $i + 1

        Write-Host ""
        Write-Info "──────────────────────────────────────────────────────────"
        Write-Info "Progress: [$progress/$totalFiles] Converting: $file"
        Write-Info "──────────────────────────────────────────────────────────"

        if (ConvertFile -FilePath $file) {
            if (-not $DryRun) {
                $tsFile = $file -replace '\.js$', '.ts'
                Update-FactoryIndexes -TsFile $tsFile

                $testResult = Test-ConvertedFile -TsFile $tsFile
                if (-not $testResult) {
                    Write-Warning "Tests failed, but continuing..."
                }
            }
        }
    }

    # Compile TypeScript
    if (-not $DryRun -and $script:SuccessCount -gt 0) {
        Write-Host ""
        $compileResult = Invoke-TypeScriptCompile
        if (-not $compileResult) {
            Write-Warning "Compilation failed, but conversions completed"
        }
    }

    # Stop timer
    $stopwatch.Stop()
    $duration = [math]::Round($stopwatch.Elapsed.TotalSeconds, 2)

    # Summary
    Write-Host ""
    Write-Info "════════════════════════════════════════════════════════════"
    Write-Info "                    CONVERSION SUMMARY"
    Write-Info "════════════════════════════════════════════════════════════"
    Write-Success "Successfully converted: $script:SuccessCount/$totalFiles files"

    if ($script:FailureCount -gt 0) {
        Write-Error "Failed conversions: $script:FailureCount/$totalFiles files"
    }

    Write-Info "Time elapsed: ${duration}s"
    Write-Info "════════════════════════════════════════════════════════════"
    Write-Host ""

    if ($script:FailureCount -gt 0) {
        exit 1
    }
}

# Run main
Main
