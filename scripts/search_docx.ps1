Add-Type -AssemblyName System.IO.Compression.FileSystem
$base = 'C:\Users\Easy\Documents\inscripcion-cursos'
$file1 = Join-Path $base 'GEN.docx'
$file2 = Join-Path $base 'cosas que piden.docx'
$files = @($file1, $file2)
foreach($f in $files){
    Write-Output "--- $f ---"
    try{
        $z=[IO.Compression.ZipFile]::OpenRead($f)
        $e=$z.Entries | Where-Object { $_.FullName -eq 'word/document.xml' }
        if($e){
            $r=$e[0].Open()
            $text=(New-Object System.IO.StreamReader($r)).ReadToEnd()
            $m=Select-String -InputObject $text -Pattern 'prueba|pruebas|test|tests|E2E|haz las pruebas|inscripciones' -CaseSensitive:$false
            if($m){ $m | ForEach-Object { $_.Line } } else { Write-Output 'No matches' }
        } else { Write-Output 'No document.xml' }
    } catch {
        Write-Output "Error: $($_.Exception.Message)"
    }
}
