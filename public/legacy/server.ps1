$ErrorActionPreference = "Stop"
$Port = 8765
$BaseDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$BaseFull = [System.IO.Path]::GetFullPath($BaseDir).TrimEnd('\') + '\'
$BackupDir = Join-Path $BaseDir "yedekler"
$MaxBodyBytes = 10MB
$MaxLogoBytes = 2MB
$Utf8NoBom = New-Object System.Text.UTF8Encoding($false)

if (-not (Test-Path $BackupDir)) { New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null }

$Listener = New-Object System.Net.HttpListener
$Listener.Prefixes.Add("http://127.0.0.1:$Port/")

function Send-Response {
    param($Context, [byte[]]$Bytes, [string]$ContentType = "text/plain; charset=utf-8", [int]$StatusCode = 200)
    $Response = $Context.Response
    $Response.StatusCode = $StatusCode
    $Response.ContentType = $ContentType
    $Response.Headers.Add("Cache-Control", "no-store, no-cache, must-revalidate")
    $Response.Headers.Add("X-Content-Type-Options", "nosniff")
    $Response.ContentLength64 = $Bytes.Length
    $Response.OutputStream.Write($Bytes, 0, $Bytes.Length)
    $Response.OutputStream.Close()
}
function Send-Json {
    param($Context, $Payload, [int]$StatusCode = 200)
    $Json = ConvertTo-Json -InputObject $Payload -Depth 50 -Compress
    Send-Response -Context $Context -Bytes $Utf8NoBom.GetBytes($Json) -ContentType "application/json; charset=utf-8" -StatusCode $StatusCode
}
function Read-RequestBody {
    param($Request)
    if ($Request.ContentLength64 -lt 0 -or $Request.ContentLength64 -gt $MaxBodyBytes) { throw "İstek gövdesi sınırı aşıldı (en fazla 10 MB)." }
    $Reader = New-Object System.IO.StreamReader($Request.InputStream, [System.Text.Encoding]::UTF8)
    try { return $Reader.ReadToEnd() } finally { $Reader.Close() }
}
function Write-AtomicText {
    param([string]$Path, [string]$Content)
    $Temp = "$Path.tmp.$([Guid]::NewGuid().ToString('N'))"
    try {
        [System.IO.File]::WriteAllText($Temp, $Content, $Utf8NoBom)
        if (Test-Path -LiteralPath $Path) {
            # File.Replace is atomic on the same volume; fallback remains same-volume Move-Item.
            try { [System.IO.File]::Replace($Temp, $Path, $null) }
            catch { Move-Item -LiteralPath $Temp -Destination $Path -Force }
        } else { Move-Item -LiteralPath $Temp -Destination $Path -Force }
    } finally { if (Test-Path -LiteralPath $Temp) { Remove-Item -LiteralPath $Temp -Force -ErrorAction SilentlyContinue } }
}
function Backup-File {
    param([string]$Path, [string]$Prefix)
    if (Test-Path -LiteralPath $Path -PathType Leaf) {
        $Stamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss-fff"
        $Dest = Join-Path $BackupDir ("{0}_{1}.bak" -f $Prefix, $Stamp)
        Copy-Item -LiteralPath $Path -Destination $Dest
        $OldBackups = Get-ChildItem -LiteralPath $BackupDir -Filter ("{0}_*.bak" -f $Prefix) -File | Sort-Object LastWriteTime -Descending | Select-Object -Skip 40
        foreach ($OldFile in $OldBackups) { Remove-Item -LiteralPath $OldFile.FullName -Force -ErrorAction SilentlyContinue }
    }
}
function Read-AssignedJson {
    param([string]$FileName, [string]$VariableName, $Fallback)
    $Path = Join-Path $BaseDir $FileName
    if (-not (Test-Path -LiteralPath $Path)) { return $Fallback }
    $Raw = [System.IO.File]::ReadAllText($Path, [System.Text.Encoding]::UTF8)
    $Pattern = '(?s)window\.' + [Regex]::Escape($VariableName) + '\s*=\s*(.*?);\s*$'
    $Match = [Regex]::Match($Raw, $Pattern)
    if (-not $Match.Success) { return $Fallback }
    try {
        $JsonText = $Match.Groups[1].Value.Trim()
        $Parsed = ConvertFrom-Json -InputObject $JsonText
        if ($JsonText.StartsWith('[')) { return ,@($Parsed) }
        return $Parsed
    } catch { return $Fallback }
}
function Get-CurrentSystemPayload {
    $LogoPath = Join-Path $BaseDir "logo.png"
    $LogoData = $null
    if (Test-Path -LiteralPath $LogoPath) {
        try { $LogoData = "data:image/png;base64," + [Convert]::ToBase64String([System.IO.File]::ReadAllBytes($LogoPath)) } catch {}
    }
    return @{
        version = 16
        backupType = "KONDES_FULL_SYSTEM"
        createdAt = (Get-Date).ToString("o")
        quotes = (Read-AssignedJson "teklifler.js" "KONDES_TEKLIFLER" @())
        provisionQuotes = (Read-AssignedJson "provizyon.js" "KONDES_PROVIZYON" @())
        trash = (Read-AssignedJson "silinenler.js" "KONDES_SILINENLER" @())
        crm = (Read-AssignedJson "crm.js" "KONDES_CRM" @{ customers = @(); payments = @() })
        settings = (Read-AssignedJson "ayarlar.js" "KONDES_AYARLAR" @{})
        logoDataUrl = $LogoData
    }
}
function Save-FullSnapshot {
    param([string]$Reason = "otomatik")
    $Stamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss-fff"
    $Payload = Get-CurrentSystemPayload
    $Payload.reason = $Reason
    $Json = ConvertTo-Json -InputObject $Payload -Depth 50
    $Suffix = [Guid]::NewGuid().ToString('N').Substring(0, 6)
    $Path = Join-Path $BackupDir ("system_{0}_{1}.json" -f $Stamp, $Suffix)
    Write-AtomicText -Path $Path -Content $Json
    # Retain a bounded number of full snapshots; per-file .bak retention is handled by Backup-File.
    $Old = Get-ChildItem -LiteralPath $BackupDir -Filter "system_*.json" -File | Sort-Object LastWriteTime -Descending | Select-Object -Skip 80
    foreach ($File in $Old) { Remove-Item -LiteralPath $File.FullName -Force -ErrorAction SilentlyContinue }
}
function Get-SafeBackupPath {
    param([string]$Name)
    if ([string]::IsNullOrWhiteSpace($Name) -or $Name -match '[\\/:]' -or $Name -match '\.\.') { return $null }
    $Candidate = [System.IO.Path]::GetFullPath((Join-Path $BackupDir $Name))
    $BackupFull = [System.IO.Path]::GetFullPath($BackupDir).TrimEnd('\') + '\'
    if (-not $Candidate.StartsWith($BackupFull, [System.StringComparison]::OrdinalIgnoreCase)) { return $null }
    return $Candidate
}
function Save-JsonDataFile {
    param([string]$FileName, [string]$VariableName, $Value, [string]$BackupPrefix)
    $Path = Join-Path $BaseDir $FileName
    Backup-File -Path $Path -Prefix $BackupPrefix
    $Json = ConvertTo-Json -InputObject $Value -Depth 50
    Write-AtomicText -Path $Path -Content ("window.{0} = {1};`r`n" -f $VariableName, $Json)
}
function Restore-FullPayload {
    param($Payload)
    if ($null -eq $Payload -or $Payload.backupType -ne "KONDES_FULL_SYSTEM") { throw "Bu dosya geçerli tam KON-DES sistem yedeği değil." }
    if ($null -eq $Payload.settings -or $null -eq $Payload.crm -or $null -eq $Payload.quotes) { throw "Yedek dosyasında zorunlu alanlar eksik." }
    Save-JsonDataFile "ayarlar.js" "KONDES_AYARLAR" $Payload.settings "ayarlar"
    Save-JsonDataFile "teklifler.js" "KONDES_TEKLIFLER" @($Payload.quotes) "teklifler"
    $Prov = @(); if ($null -ne $Payload.provisionQuotes) { $Prov = @($Payload.provisionQuotes) }
    Save-JsonDataFile "provizyon.js" "KONDES_PROVIZYON" $Prov "provizyon"
    $Trash = @(); if ($null -ne $Payload.trash) { $Trash = @($Payload.trash) }
    Save-JsonDataFile "silinenler.js" "KONDES_SILINENLER" $Trash "silinenler"
    Save-JsonDataFile "crm.js" "KONDES_CRM" $Payload.crm "crm"
    if ($Payload.logoDataUrl) {
        $Clean = [string]$Payload.logoDataUrl -replace '^data:image\/(png|jpeg|jpg);base64,', ''
        $Bytes = [Convert]::FromBase64String($Clean)
        if ($Bytes.Length -gt $MaxLogoBytes) { throw "Yedekteki logo boyutu sınırı aşıyor." }
        $LogoPath = Join-Path $BaseDir "logo.png"
        Backup-File -Path $LogoPath -Prefix "logo"
        $Temp = "$LogoPath.tmp.$([Guid]::NewGuid().ToString('N'))"
        [System.IO.File]::WriteAllBytes($Temp, $Bytes)
        Move-Item -LiteralPath $Temp -Destination $LogoPath -Force
    }
}

try { $Listener.Start() } catch { Write-Host "8765 portu açılamadı. Başka bir KON-DES sunucusu çalışıyor olabilir." -ForegroundColor Red; exit 1 }
Write-Host "KON-DES METAL yerel sunucusu: http://127.0.0.1:$Port/" -ForegroundColor Green

while ($Listener.IsListening) {
    $Context = $null
    try {
        $Context = $Listener.GetContext()
        $Request = $Context.Request
        $Path = $Request.Url.AbsolutePath

        if ($Request.HttpMethod -eq "GET") {
            if ($Path -eq "/" -or $Path -eq "") { $Path = "/Teklif_Hazirla.html" }
            if ($Path -eq "/api/ping") { Send-Json $Context @{ ok = $true; mode = "local-server"; version = 3; backup = $true }; continue }

            if ($Path -eq "/api/backups") {
                $Items = @()
                Get-ChildItem -LiteralPath $BackupDir -File | Where-Object { $_.Name -like "system_*.json" -or $_.Extension -eq ".bak" } | Sort-Object LastWriteTime -Descending | ForEach-Object {
                    $Items += @{
                        name = $_.Name
                        createdAt = $_.LastWriteTime.ToString("yyyy-MM-dd HH:mm:ss")
                        size = $_.Length
                        sizeLabel = ("{0:N1} KB" -f ($_.Length / 1KB))
                        canRestore = ($_.Name -like "system_*.json")
                    }
                }
                Send-Json $Context @{ ok = $true; backups = $Items }; continue
            }
            if ($Path -eq "/api/backup") {
                $Name = [string]$Request.QueryString["name"]
                $BackupPath = Get-SafeBackupPath $Name
                if (-not $BackupPath -or -not (Test-Path -LiteralPath $BackupPath -PathType Leaf)) { Send-Json $Context @{ ok = $false; message = "Yedek bulunamadı." } 404; continue }
                $Ext = [System.IO.Path]::GetExtension($BackupPath).ToLowerInvariant()
                $Type = if ($Ext -eq ".json") { "application/json; charset=utf-8" } else { "application/octet-stream" }
                Send-Response $Context ([System.IO.File]::ReadAllBytes($BackupPath)) $Type 200; continue
            }

            $Relative = [Uri]::UnescapeDataString($Path.TrimStart('/')).Replace('/', '\')
            $FilePath = [System.IO.Path]::GetFullPath((Join-Path $BaseDir $Relative))
            if (-not $FilePath.StartsWith($BaseFull, [System.StringComparison]::OrdinalIgnoreCase)) { Send-Response $Context $Utf8NoBom.GetBytes("Forbidden") "text/plain; charset=utf-8" 403; continue }
            if (Test-Path -LiteralPath $FilePath -PathType Leaf) {
                $Ext = [System.IO.Path]::GetExtension($FilePath).ToLowerInvariant()
                $Mime = switch ($Ext) {
                    ".html" { "text/html; charset=utf-8" }
                    ".js" { "application/javascript; charset=utf-8" }
                    ".mjs" { "application/javascript; charset=utf-8" }
                    ".css" { "text/css; charset=utf-8" }
                    ".json" { "application/json; charset=utf-8" }
                    ".png" { "image/png" }
                    ".jpg" { "image/jpeg" }
                    ".jpeg" { "image/jpeg" }
                    ".svg" { "image/svg+xml" }
                    ".ico" { "image/x-icon" }
                    default { "application/octet-stream" }
                }
                Send-Response $Context ([System.IO.File]::ReadAllBytes($FilePath)) $Mime 200
            } else { Send-Response $Context $Utf8NoBom.GetBytes("Dosya bulunamadi") "text/plain; charset=utf-8" 404 }
            continue
        }

        if ($Request.HttpMethod -ne "POST") { Send-Json $Context @{ ok = $false; error = "method_not_allowed" } 405; continue }
        $Origin = [string]$Request.Headers["Origin"]
        if ($Origin -and $Origin -notin @(("http://127.0.0.1:{0}" -f $Port), ("http://localhost:{0}" -f $Port))) {
            Send-Json $Context @{ ok = $false; error = "origin_not_allowed" } 403
            continue
        }
        $Body = Read-RequestBody $Request
        if ([string]::IsNullOrWhiteSpace($Body)) { throw "Boş istek gövdesi." }

        if ($Path -eq "/api/restore-backup") {
            $ReqData = ConvertFrom-Json -InputObject $Body
            $BackupPath = Get-SafeBackupPath ([string]$ReqData.name)
            if (-not $BackupPath -or [System.IO.Path]::GetExtension($BackupPath) -ne ".json" -or -not (Test-Path -LiteralPath $BackupPath)) { throw "Geri yüklenebilir tam sistem yedeği bulunamadı." }
            Save-FullSnapshot "geri_yukleme_oncesi"
            $Payload = ConvertFrom-Json -InputObject ([System.IO.File]::ReadAllText($BackupPath, [System.Text.Encoding]::UTF8))
            Restore-FullPayload $Payload
            Send-Json $Context @{ ok = $true; message = "Tam sistem yedeği geri yüklendi." }; continue
        }

        if ($Path -in @("/api/save-settings", "/api/save-quotes", "/api/save-provisions", "/api/save-trash", "/api/save-crm", "/api/save-logo")) {
            Save-FullSnapshot ("once_" + ($Path.Trim('/').Replace('/','_')))
        }

        if ($Path -eq "/api/save-settings") {
            $Payload = ConvertFrom-Json -InputObject $Body
            if ($null -eq $Payload.firma -or $null -eq $Payload.sistemler) { throw "Geçersiz ayarlar şeması." }
            Save-JsonDataFile "ayarlar.js" "KONDES_AYARLAR" $Payload "ayarlar"
            Send-Json $Context @{ ok = $true; message = "Ayarlar atomik kaydedildi; tam sistem anlık yedeği alındı." }; continue
        }
        if ($Path -eq "/api/save-quotes") {
            $Payload = ConvertFrom-Json -InputObject $Body
            if (-not $Body.TrimStart().StartsWith('[')) { throw "Teklif geçmişi JSON dizisi olmalıdır." }
            Save-JsonDataFile "teklifler.js" "KONDES_TEKLIFLER" @($Payload) "teklifler"
            Send-Json $Context @{ ok = $true; message = "Teklifler atomik kaydedildi." }; continue
        }
        if ($Path -eq "/api/save-provisions") {
            $Payload = ConvertFrom-Json -InputObject $Body
            if (-not $Body.TrimStart().StartsWith('[')) { throw "Provizyon listesi JSON dizisi olmalıdır." }
            Save-JsonDataFile "provizyon.js" "KONDES_PROVIZYON" @($Payload) "provizyon"
            Send-Json $Context @{ ok = $true; message = "Provizyon listesi kaydedildi." }; continue
        }
        if ($Path -eq "/api/save-trash") {
            $Payload = ConvertFrom-Json -InputObject $Body
            if (-not $Body.TrimStart().StartsWith('[')) { throw "Silinenler JSON dizisi olmalıdır." }
            Save-JsonDataFile "silinenler.js" "KONDES_SILINENLER" @($Payload) "silinenler"
            Send-Json $Context @{ ok = $true; message = "Silinenler kaydedildi." }; continue
        }
        if ($Path -eq "/api/save-logo") {
            $Payload = ConvertFrom-Json -InputObject $Body
            if ([string]::IsNullOrWhiteSpace([string]$Payload.base64)) { throw "Logo verisi eksik." }
            $Clean = [string]$Payload.base64 -replace '^data:image\/(png|jpeg|jpg);base64,', ''
            $Bytes = [Convert]::FromBase64String($Clean)
            if ($Bytes.Length -gt $MaxLogoBytes) { throw "Logo boyutu sınırı aşıldı." }
            $LogoPath = Join-Path $BaseDir "logo.png"
            Backup-File $LogoPath "logo"
            $Temp = "$LogoPath.tmp.$([Guid]::NewGuid().ToString('N'))"
            [System.IO.File]::WriteAllBytes($Temp, $Bytes)
            Move-Item -LiteralPath $Temp -Destination $LogoPath -Force
            Send-Json $Context @{ ok = $true; message = "Logo kaydedildi." }; continue
        }
        if ($Path -eq "/api/save-crm") {
            $Payload = ConvertFrom-Json -InputObject $Body
            if ($null -eq $Payload.customers -or $null -eq $Payload.payments) { throw "Geçersiz CRM şeması." }
            Save-JsonDataFile "crm.js" "KONDES_CRM" $Payload "crm"
            Send-Json $Context @{ ok = $true; message = "CRM kaydedildi." }; continue
        }
        Send-Json $Context @{ ok = $false; error = "not_found" } 404
    } catch {
        if ($Context) { try { Send-Json $Context @{ ok = $false; error = "request_failed"; message = $_.Exception.Message } 400 } catch {} }
    }
}
