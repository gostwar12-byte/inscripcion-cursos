Add-Type -AssemblyName System.IO.Compression.FileSystem

@('GEN.docx','cosas que piden.docx') | ForEach-Object {
    $fname = $_
    Write-Output "Processing $fname..."
    try{
        $z = [IO.Compression.ZipFile]::OpenRead($fname)
        $docEntry = $z.Entries | Where-Object { $_.FullName -eq 'word/document.xml' }
        if($docEntry){
            $stream = $docEntry.Open()
            $reader = New-Object System.IO.StreamReader($stream)
            $xml = $reader.ReadToEnd()
            $plain = $xml -replace '<[^>]+>', ''
            $outfile = $fname -replace '\.docx', '.txt'
            Set-Content -Path $outfile -Value $plain
            Write-Output "Saved to $outfile"
            $reader.Dispose()
            $stream.Dispose()
        }
        $z.Dispose()
    } catch {
        Write-Output "Error: $($_.Exception.Message)"
    }
}
