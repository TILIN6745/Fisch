import os from 'os';
import { exec } from 'child_process';

// Función para formatear el tiempo en horas, minutos y segundos
function formatUptime(uptime) {
  const seconds = Math.floor(uptime % 60);
  const minutes = Math.floor((uptime / 60) % 60);
  const hours = Math.floor((uptime / 3600) % 24);
  return `${hours} horas, ${minutes} minutos, ${seconds} segundos`;
}

// Función para obtener versiones de herramientas como Node.js, npm, ffmpeg, Python, pip, etc.
function getVersions(callback) {
  exec('node -v', (err, nodeVersion) => {
    if (err) nodeVersion = 'No disponible';
    exec('npm -v', (err, npmVersion) => {
      if (err) npmVersion = 'No disponible';
      exec('ffmpeg -version', (err, ffmpegVersion) => {
        if (err) ffmpegVersion = 'No disponible';
        exec('python --version', (err, pythonVersion) => {
          if (err) pythonVersion = 'No disponible';
          exec('pip --version', (err, pipVersion) => {
            if (err) pipVersion = 'No disponible';
            exec('choco -v', (err, chocoVersion) => {
              if (err) chocoVersion = 'No disponible';
              callback({ nodeVersion, npmVersion, ffmpegVersion, pythonVersion, pipVersion, chocoVersion });
            });
          });
        });
      });
    });
  });
}

// Definir el plugin
async function systemInfoPlugin(m, extra) {
  try {
    // Obtener información del sistema
    const systemInfo = {
      platform: os.platform(),
      cpuArch: os.arch(),
      cpus: os.cpus().length,
      totalMemory: (os.totalmem() / (1024 ** 3)).toFixed(2) + ' GB', // Total RAM en GB
      freeMemory: (os.freemem() / (1024 ** 3)).toFixed(2) + ' GB',   // RAM libre en GB
      uptime: formatUptime(os.uptime()),                             // Tiempo de actividad
      osVersion: os.release(),                                       // Versión del SO
      loadAverage: os.loadavg().map(load => load.toFixed(2)).join(', '), // Carga promedio
    };

    // Obtener versiones de herramientas
    getVersions((versions) => {
      // Generar el mensaje de respuesta
      let infoMessage = `*Información del Sistema*\n\n`;
      infoMessage += `- Plataforma: ${systemInfo.platform}\n`;
      infoMessage += `- Arquitectura CPU: ${systemInfo.cpuArch}\n`;
      infoMessage += `- Núcleos CPU: ${systemInfo.cpus}\n`;
      infoMessage += `- Memoria Total: ${systemInfo.totalMemory}\n`;
      infoMessage += `- Memoria Libre: ${systemInfo.freeMemory}\n`;
      infoMessage += `- Tiempo de Actividad: ${systemInfo.uptime}\n`;
      infoMessage += `- Versión del SO: ${systemInfo.osVersion}\n`;
      infoMessage += `- Carga Promedio (1, 5, 15 min): ${systemInfo.loadAverage}\n\n`;

      infoMessage += `*Versiones de Herramientas*\n\n`;
      infoMessage += `- Node.js: ${versions.nodeVersion.trim()}\n`;
      infoMessage += `- npm: ${versions.npmVersion.trim()}\n`;
      infoMessage += `- ffmpeg: ${versions.ffmpegVersion.split('\n')[0]}\n`; // Solo primera línea
      infoMessage += `- Python: ${versions.pythonVersion.trim()}\n`;
      infoMessage += `- pip: ${versions.pipVersion.trim()}\n`;
      infoMessage += `- Chocolatey: ${versions.chocoVersion.trim()}\n`;

      // Enviar la información al chat
      extra.conn.sendMessage(m.chat, { text: infoMessage });
    });
  } catch (error) {
    console.error('Error al obtener información del sistema:', error);
    await extra.conn.sendMessage(m.chat, { text: 'No se pudo obtener la información del sistema. Por favor, intenta de nuevo más tarde.' });
  }
}

// Definir el comando del plugin
systemInfoPlugin.command = ['sysinfo']; // El plugin se activará con este comando

export default systemInfoPlugin;
