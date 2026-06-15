const fs = require('fs');
const { execSync } = require('child_process');

// Use PowerShell to extract and display docx content
const files = ['GEN.docx', 'cosas que piden.docx'];

files.forEach(fname => {
  console.log(`\n========== ${fname} ==========`);
  try {
    // Use unzip via PowerShell or system command
    const cmd = `powershell -NoProfile -Command "
      Add-Type -AssemblyName System.IO.Compression.FileSystem;
      $z = [IO.Compression.ZipFile]::OpenRead('${fname}');
      $e = $z.Entries | Where-Object { $_.FullName -eq 'word/document.xml' };
      if($e) {
        $r = $e[0].Open();
        $text = (New-Object System.IO.StreamReader($r)).ReadToEnd();
        $plain = $text -replace '<[^>]+>', '';
        $plain.Substring(0, [Math]::Min(5000, $plain.Length));
        $r.Close();
        $z.Close()
      }
    "`;
    
    const output = execSync(cmd, { encoding: 'utf-8' });
    console.log(output.substring(0, 5000));
  } catch(e) {
    console.log('Error: ' + e.message);
  }
});
