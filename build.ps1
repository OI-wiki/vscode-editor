#!/usr/bin/env powershell -File

$VSCodeRepo = 'https://github.com/microsoft/vscode'
$VSCodeVersion = '1.69.2'
$ErrorActionPreference = "Stop"

function Clear-VeEnvironment {
    if (Test-Path ./vscode) {
        Remove-Item -Recurse -Force ./vscode
        Write-Output Cleaning up vscode repository.
    }

    if (Test-Path ./build) {
        Remove-Item -Recurse -Force ./build
        Write-Output Cleaning up build folder.
    }
}

function Get-VeVSCodeRepository {
    git clone -b $VSCodeVersion --depth=1 $VSCodeRepo ./vscode
    Push-Location ./vscode
    yarn install
    Pop-Location

    Push-Location ./extensions
    yarn install
    Pop-Location
}

function Build-VeEditor {
    
    if (Test-Path ./vscode-web) {
        Remove-Item -Recurse -Force ./vscode-web
    }

    # Build our extensions first to avoid problems. 
    Push-Location ./extensions
    yarn workspaces run package-web
    Pop-Location

    Push-Location ./vscode
    git reset --hard
    # remove untracked files
    git clean -fd
    Get-ChildItem -Path ../patches | ForEach-Object { git apply $_.FullName }
    
    foreach ($dir in (Get-ChildItem -Path ../extensions)) {
        if (!$dir.Attributes.HasFlag([System.IO.FileAttributes]::Directory)) {
            continue
        }

        if ($dir.Name -eq 'node_modules') {
            continue
        }

        Copy-Item -Recurse -Destination "./extensions/" "$($dir.FullName)"
    }

    yarn gulp vscode-web-min
    Pop-Location

    if (Test-Path ./public) {
        Remove-Item -Recurse -Force ./public
    }
    
    Copy-Item -Recurse ./shadow/* ./vscode-web/
}

