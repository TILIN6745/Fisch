import os from 'os';
import { exec } from 'child_process';
import { generateWAMessageFromContent } from 'baileys';
import fs from 'fs';
import { performance } from 'perf_hooks';

function formatUptime(uptime) {
  const seconds = Math.floor(uptime % 60);
  const minutes = Math.floor((uptime / 60) % 60);
  const hours = Math.floor((uptime / 3600) % 24);
  return `${hours} horas, ${minutes} minutos, ${seconds} segundos`;
}

function getVersions(callback) {
  exec('node -v', (err, nodeVersion) => {
    if (err) nodeVersion = '✖️';
    exec('npm -v', (err, npmVersion) => {
      if (err) npmVersion = '✖️';
      exec('ffmpeg -version', (err, ffmpegVersion) => {
        if (err) ffmpegVersion = '✖️';
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

async function getSystemInfo(callback) {
  const systemInfo = {
    platform: os.platform(),
    cpuArch: os.arch(),
    cpus: os.cpus().length,
    totalMemory: (os.totalmem() / (1024 ** 3)).toFixed(2) + ' GB', // Total RAM en GB
    freeMemory: (os.freemem() / (1024 ** 3)).toFixed(2) + ' GB',   // RAM libre en GB
    uptime: formatUptime(os.uptime()),                             // Tiempo de actividad
    osVersion: os.release(),                                       // Versión del SO
    loadAverage: os.loadavg().map(load => load.toFixed(2)).join(', ') // Carga promedio
  };

  getVersions((versions) => {
    callback(systemInfo, versions);
  });
}

function getBotInfo(conn, m, callback) {
  const _uptime = process.uptime() * 1000;
  const uptime = clockString(_uptime);
  const totalusrReg = Object.values(global.db.data.users).filter((user) => user.registered == true).length;
  const totalusr = Object.keys(global.db.data.users).length;
  const chats = Object.entries(conn.chats).filter(
    ([id, data]) => id && data.isChats,
  );
  const groups = chats.filter(([id]) => id.endsWith('@g.us'));
  const used = process.memoryUsage();
  const { restrict, antiCall, antiprivado, modejadibot } = global.db.data.settings[conn.user.jid] || {};
  const { autoread, gconly, pconly, self } = global.opts || {};

  const old = performance.now();
  const neww = performance.now();
  const rtime = (neww - old).toFixed(3);

  const botInfo = {
    uptime,
    totalusrReg,
    totalusr,
    groupsCount: groups.length,
    chatsCount: chats.length,
    rtime,
    autoread,
    restrict,
    pconly,
    gconly,
    antiprivado,
    antiCall,
    modejadibot
  };

  callback(botInfo);
}

const handler = async (m, { conn }) => {
  getSystemInfo((systemInfo, versions) => {
    getBotInfo(conn, m, (botInfo) => {
      let infoMessage = `> *📊 Información del Sistema*\n\n`;
      infoMessage += `- 🌐 *Plataforma*: _${systemInfo.platform}_\n`;
      infoMessage += `- 💻 *Arquitectura CPU*: ${systemInfo.cpuArch}\n`;
      infoMessage += `- 🧠 *Núcleos CPU*: ${systemInfo.cpus}\n`;
      infoMessage += `- 🗄️ *Memoria Total*: ${systemInfo.totalMemory}\n`;
      infoMessage += `- 🗃️ *Memoria Libre*: ${systemInfo.freeMemory}\n`;
      infoMessage += `- ⏱️ *Tiempo de Actividad*: ${systemInfo.uptime}\n`;
      infoMessage += `- 📀 *Versión del SO*: ${systemInfo.osVersion}\n`;
      infoMessage += `- 📊 *Carga Promedio (1, 5, 15 min)*: ${systemInfo.loadAverage}\n\n`;

      infoMessage += `> *💻 Información del Bot*\n\n`;
      infoMessage += `- ⏲️ *Uptime*: ${botInfo.uptime}\n`;
      infoMessage += `- 👥 *Usuarios Registrados*: ${botInfo.totalusrReg}\n`;
      infoMessage += `- 👤 *Usuarios Totales*: ${botInfo.totalusr}\n`;
      infoMessage += `- 🏘️ *Grupos*: ${botInfo.groupsCount}\n`;
      infoMessage += `- 📨 *Chats*: ${botInfo.chatsCount}\n`;
      infoMessage += `- ⏱️ *Tiempo de Respuesta*: ${botInfo.rtime} ms\n\n`;

      infoMessage += `> *🛠️ Versiones de Herramientas*\n\n`;
      infoMessage += `- ☕ *Node.js*: ${versions.nodeVersion.trim()}\n`;
      infoMessage += `- 📦 *NPM*: ${versions.npmVersion.trim()}\n`;
      infoMessage += `- 🎥 *FFmpeg*: ${versions.ffmpegVersion.split('\n')[0]}\n`; // Solo primera linea
      infoMessage += `- 🐍 *Python*: ${versions.pythonVersion.trim()}\n`;
      infoMessage += `- 📦 *PIP*: ${versions.pipVersion.trim()}\n`;
      infoMessage += `- 🍫 *Chocolatey*: ${versions.chocoVersion.trim()}\n`;

      conn.sendMessage(m.chat, { text: infoMessage });
    });
  });
};

function clockString(ms) {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor(ms / 60000) % 60;
  const s = Math.floor(ms / 1000) % 60;
  return [h, m, s].map((v) => v.toString().padStart(2, 0)).join(':');
}

handler.command = /^(host|sysinfo)$/i;
export default handler;
