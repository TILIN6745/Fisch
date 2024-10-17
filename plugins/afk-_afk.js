export function before(m) {
  const datas = global;
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje;
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`));
  const tradutor = _translate.plugins.afk__afk;

  const user = global.db.data.users[m.sender];
  if (user.afk > -1) {
    m.reply(`${tradutor.texto2[0]} ${user.afkReason ? `${tradutor.texto2[1]}` + user.afkReason : ''}*

    *${tradutor.texto2[2]} ${(new Date() - user.afk).toTimeString()}*`.trim());
    user.afk = -1;
    user.afkReason = '';
  }

  const jids = [...new Set([...(m.mentionedJid || []), ...(m.quoted ? [m.quoted.sender] : [])])];

  for (const jid of jids) {
    const mentionedUser = global.db.data.users[jid];
    if (!mentionedUser) {
      continue;
    }
    const afkTime = mentionedUser.afk;
    if (!afkTime || afkTime < 0) {
      continue;
    }
    const reason = mentionedUser.afkReason || '';
    
    m.reply(`${tradutor.texto1[0]}

    *—◉ ${tradutor.texto1[1]}*      
    *—◉ ${reason ? `${tradutor.texto1[2]}` + reason : `${tradutor.texto1[3]}`}*
    *—◉ ${tradutor.texto1[4]} ${(new Date() - afkTime).toTimeString()}*`.trim());

    if (m.mentionedJid.includes(jid) || (m.quoted && m.quoted.sender === jid)) {
      m.delete();
    }
  }
  return true;
}
