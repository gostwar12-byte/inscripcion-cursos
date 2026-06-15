Add-Type -AssemblyName System.IO.Compression.FileSystem

$files = @('GEN.docx','cosas que piden.docx')

foreach($f in $files){
    Write-Output "========== $f =========="
    try{
        $z = [IO.Compression.ZipFile]::OpenRead($f)
        Write-Output "Entries in ZIP:"
        $z.Entries | ForEach-Object { Write-Output $_.FullName }
        
        # Try to read document.xml
        $docEntry = $z.Entries | Where-Object { $_.FullName -eq 'word/document.xml' }
        if($docEntry){
            $stream = $docEntry.Open()
            $reader = New-Object System.IO.StreamReader($stream)
            $xml = $reader.ReadToEnd()
            Write-Output "`n--- Document Content ---"
            # Strip XML tags
            $plain = $xml -replace '<[^>]+>', ''
            Write-Output $plain.Substring(0, [Math]::Min(3000, $plain.Length))
            $reader.Close()
            $stream.Close()
        } else {
            Write-Output "No word/document.xml found"
        }
        $z.Close()
    } catch {
        Write-Output "Error: $($_.Exception.Message)"
    }
}
