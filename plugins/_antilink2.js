import fs from 'fs';
const linkRegex = /https:/i;

export async function before(m, { conn, isAdmin, isBotAdmin, text }) {
  const idioma = global.db.data.users[m.sender].language || global.defaultLenguaje;
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`));
  const tradutor = _translate.plugins._antilink2;

  if (m.isBaileys && m.fromMe) {
    return !0;
  }
  if (!m.isGroup) return !1;

  const chat = global.db.data.chats[m.chat];
  const delet = m.key.participant;
  const bang = m.key.id;
  const bot = global.db.data.settings[this.user.jid] || {};
  const user = `@${m.sender.split`@`[0]}`;
  const isGroupLink = linkRegex.exec(m.text);

  if (!isGroupLink || isAdmin) return true;

  // Archivo ./src/allowlink.txt con !link permitido, no ! no permitido.
  let allowedLinks = [];
  let blockedLinks = [];

  try {
    const linksFromFile = fs.readFileSync('./src/allowlink.txt', 'utf-8').split('\n').filter(Boolean);
    
    for (const link of linksFromFile) {
      if (link.startsWith('!')) {
        allowedLinks.push(link.slice(1).trim());  // Eliminar el '!' al inicio
      } else {
        blockedLinks.push(link.trim());
      }
    }
  } catch (error) {
    console.error('Error al leer allowlink.txt:', error);
  }

  let isAllowed = false;
  for (const allowedLink of allowedLinks) {
    if (m.text.includes(allowedLink)) {
      isAllowed = true;
      break;
    }
  }

  let isBlocked = false;
  for (const blockedLink of blockedLinks) {
    if (m.text.includes(blockedLink)) {
      isBlocked = true;
      break;
    }
  }

  if (isAllowed) {
    return true;
  }

  if (isBlocked && chat.antiLink2 && !isAdmin) {
    if (isBotAdmin) {
      await this.sendMessage(m.chat, { text: tradutor.texto1, mentions: [m.sender] }, { quoted: m });
      await conn.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: false, id: bang, participant: delet } });
      
      const responseb = await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove');
      if (responseb[0].status === '404') return;
    } else {
      return m.reply(tradutor.texto2); 
    }
  }

  return true;
}
