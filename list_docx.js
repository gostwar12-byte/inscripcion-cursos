const fs = require('fs');

// Use PowerShell to list and extract docx content
const files = ['GEN.docx', 'cosas que piden.docx'];

files.forEach(fname => {
  console.log(`\n========== ${fname} ==========`);
  try {
    // List entries in zip
    const cmd = `powershell -NoProfile -Command "
      Add-Type -AssemblyName System.IO.Compression.FileSystem;
      $z = [IO.Compression.ZipFile]::OpenRead('${fname}');
      Write-Output 'Entries:';
      $z.Entries | ForEach-Object { Write-Output $_.FullName };
      $z.Close()
    "`;
    
    const { execSync } = require('child_process');
    const output = execSync(cmd, { encoding: 'utf-8', stdio: 'pipe' });
    console.log(output);
  } catch(e) {
    console.log('Error: ' + e.message);
  }
});
