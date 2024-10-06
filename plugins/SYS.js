import os from 'os';
import { exec } from 'child_process';

// Función para formatear el tiempo en horas, minutos y segundos
function formatUptime(uptime) {
  const seconds = Math.floor(uptime % 60);
  const minutes = Math.floor((uptime / 60) % 60);
  const hours = Math.floor((uptime / 3600) % 24);
  return `${hours} horas, ${minutes} minutos, ${seconds} segundos`;
}

// Detección de versiones y Python
function getVersions(callback) {
  exec('node -v', (err, nodeVersion) => {
    if (err) nodeVersion = '✖️';
    exec('npm -v', (err, npmVersion) => {
      if (err) npmVersion = '✖️';
      exec('ffmpeg -version', (err, ffmpegVersion) => {
        if (err) ffmpegVersion = '✖️';
        // Detección automática de Python (python, python3, py)
        exec('python --version || python3 --version || py --version', (err, pythonVersion) => {
          if (err) pythonVersion = '✖️';
          exec('pip --version || pip3 --version', (err, pipVersion) => {
            if (err) pipVersion = '✖️';
            exec('choco -v', (err, chocoVersion) => {
              if (err) chocoVersion = '✖️';
              callback({ nodeVersion, npmVersion, ffmpegVersion, pythonVersion, pipVersion, chocoVersion });
            });
          });
        });
      });
    });
  });
}

// Obtener información del sistema en Linux
function getLinuxInfo(callback) {
  exec('cat /etc/os-release', (err, osInfo) => {
    if (err) osInfo = '✖️';
    callback(osInfo.trim());
  });
}

// Obtener información de almacenamiento
function getStorageInfo() {
  const drives = os.totalmem(); // Simulación; en producción puedes usar bibliotecas específicas para esto
  const freeSpace = os.freemem(); // Simulación también
  return {
    totalStorage: (drives / (1024 ** 3)).toFixed(2) + ' GB',
    freeStorage: (freeSpace / (1024 ** 3)).toFixed(2) + ' GB'
  };
}

// Obtener información de la batería (solo si está disponible)
function getBatteryInfo(callback) {
  if (os.platform() === 'linux' || os.platform() === 'darwin') {
    exec('upower -i $(upower -e | grep BAT)', (err, batteryInfo) => {
      if (err) return callback('✖️ No disponible');
      callback(batteryInfo);
    });
  } else if (os.platform() === 'win32') {
    exec('WMIC Path Win32_Battery Get EstimatedChargeRemaining', (err, batteryInfo) => {
      if (err) return callback('✖️ No disponible');
      callback(`🔋 ${batteryInfo.trim()}%`);
    });
  } else {
    callback('✖️ No disponible');
  }
}

// Plugin para obtener la información del sistema
async function systemInfoPlugin(m, extra) {
  try {
    const systemInfo = {
      platform: os.platform(),
      cpuArch: os.arch(),
      cpus: os.cpus().length,
      totalMemory: (os.totalmem() / (1024 ** 3)).toFixed(2) + ' GB', // Total RAM en GB
      freeMemory: (os.freemem() / (1024 ** 3)).toFixed(2) + ' GB',   // RAM libre en GB
      uptime: formatUptime(os.uptime()),                             // Tiempo de actividad
      osVersion: os.release(),                                       // Versión del SO
      loadAverage: os.loadavg().map(load => load.toFixed(2)).join(', '), // Carga promedio
      storage: getStorageInfo()                                      // Almacenamiento
    };

    // Obtener todas las versiones y batería
    getVersions((versions) => {
      getBatteryInfo((batteryStatus) => {
        getLinuxInfo((linuxInfo) => {
          let infoMessage = `*📊 Información del Sistema*\n\n`;
          infoMessage += `🌐 - **Plataforma**: ${systemInfo.platform}\n`;
          infoMessage += `💻 - **Arquitectura CPU**: ${systemInfo.cpuArch}\n`;
          infoMessage += `🧠 - **Núcleos CPU**: ${systemInfo.cpus}\n`;
          infoMessage += `🗄️ - **Memoria Total**: ${systemInfo.totalMemory}\n`;
          infoMessage += `🗃️ - **Memoria Libre**: ${systemInfo.freeMemory}\n`;
          infoMessage += `⏱️ - **Tiempo de Actividad**: ${systemInfo.uptime}\n`;
          infoMessage += `📀 - **Versión del SO**: ${systemInfo.osVersion}\n`;
          infoMessage += `📊 - **Carga Promedio (1, 5, 15 min)**: ${systemInfo.loadAverage}\n`;
          infoMessage += `🔋 - **Estado de la Batería**: ${batteryStatus}\n`;

          if (os.platform() === 'linux') {
            infoMessage += `🐧 - **Distribución Linux**:\n${linuxInfo}\n`;
          }

          infoMessage += `💾 - **Almacenamiento Total**: ${systemInfo.storage.totalStorage}\n`;
          infoMessage += `📂 - **Almacenamiento Libre**: ${systemInfo.storage.freeStorage}\n\n`;

          infoMessage += `*🛠️ Versiones de Herramientas*\n\n`;
          infoMessage += `📦 - **Node.js**: ${versions.nodeVersion.trim()}\n`;
          infoMessage += `📦 - **npm**: ${versions.npmVersion.trim()}\n`;
          infoMessage += `🎥 - **ffmpeg**: ${versions.ffmpegVersion.split('\n')[0]}\n`; // Solo primera linea
          infoMessage += `🐍 - **Python**: ${versions.pythonVersion.trim()}\n`;
          infoMessage += `📦 - **pip**: ${versions.pipVersion.trim()}\n`;
          infoMessage += `🍫 - **Chocolatey**: ${versions.chocoVersion.trim()}\n`;

          extra.conn.sendMessage(m.chat, { text: infoMessage });
        });
      });
    });
  } catch (error) {
    console.error('Falla Plugin sysinfo:', error);
    await extra.conn.sendMessage(m.chat, { text: 'ERROR' });
  }
}

// Definir el comando del plugin
systemInfoPlugin.command = ['sysinfo']; 

export default systemInfoPlugin;
