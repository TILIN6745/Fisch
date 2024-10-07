const { exec } = require('child_process');


function runCommand(command, description) {
  return new Promise((resolve, reject) => {
    console.log(`Ejecutando: ${description}...`);
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error al ejecutar ${description}:`, error);
        reject(error);
        return;
      }
      if (stderr) {
        console.error(`Stderr al ejecutar ${description}:`, stderr);
      }
      console.log(`Resultado de ${description}:`, stdout);
      resolve(stdout);
    });
  });
}

// Instalar módulos de Python
async function installPythonDependencies() {
  try {
    await runCommand('pip install -U --pre "yt-dlp[default]"', 'Instalando yt-dlp');
  } catch (error) {
    console.error('Error en Modulos Opcionales, Algunos Plugins pueden no Funcionar.', error);
  }
}

installPythonDependencies();
