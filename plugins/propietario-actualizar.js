// MR. De la Comunidad para la Comunidad. Prohibida su Venta.
// El Software se proporciona bajo los términos de la Licencia MIT, excepto que usted no puede:
// 1. Vender, revender o arrendar el Software.
// 2. Cobrar a otros por el acceso, la distribución o cualquier otro uso comercial del Software.
// 3. Usar el Software como parte de un producto comercial o una oferta de servicio.

// Tiene una falla en caso de que git no se complete correctamente o utilice el metodo ort con ediciond. Simplemente no mostrara el Resultado de Actualizacion Correcta. En un futuro puede ser que lo resuelva, no es grave.

import { execSync } from 'child_process';
import fs from 'fs';

const handler = async (m, { conn, text }) => {
  const datas = global;
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje;
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`));
  const tradutor = _translate.plugins.propietario_actualizar;

  await conn.reply(m.chat, '⌛ Comprobando...', m);

  try {

    const gitPullOutput = execSync('git pull' + (m.fromMe && text ? ' ' + text : ''));
    let messager = gitPullOutput.toString();
    
    if (messager.includes('Already up to date.')) {
      messager = tradutor.texto1; 
      await conn.reply(m.chat, messager, m);
      return;  
    }

    if (messager.includes('Updating')) {
      messager = tradutor.texto2 + gitPullOutput.toString(); 

      await conn.reply(m.chat, '⏳ Instalando...', m);

      try {
        // npm
        const npmInstallOutput = execSync('npm install --force');
        const npmInstallMessage = npmInstallOutput.toString();

        const finalMessage = `${messager}\n\n${tradutor.texto5}\n\n${npmInstallMessage}`;
        await conn.reply(m.chat, finalMessage, m);

      } catch (npmError) {
        console.error('Error en npm install:', npmError);
        await conn.reply(m.chat, '❌ Error en npm install.', m);
      }
    }

  } catch (error) {
    try {
      const status = execSync('git status --porcelain');
      if (status.length > 0) {
        const conflictedFiles = status
          .toString()
          .split('\n')
          .filter(line => line.trim() !== '')
          .map(line => {
            if (line.includes('.npm/') || line.includes('.cache/') || line.includes('tmp/') || line.includes('MysticSession/') || line.includes('npm-debug.log')) {
              return null;
            }
            return '*→ ' + line.slice(3) + '*';
          })
          .filter(Boolean);
        if (conflictedFiles.length > 0) {
          const errorMessage = `${tradutor.texto3} \n\n${conflictedFiles.join('\n')}.*`;
          await conn.reply(m.chat, errorMessage, m);
        }
      }
    } catch (statusError) {
      console.error(statusError);
      let errorMessage2 = tradutor.texto4;
      if (statusError.message) {
        errorMessage2 += '\n*- Mensaje de error:* ' + statusError.message;
      }
      await conn.reply(m.chat, errorMessage2, m);
    }
  }
};

handler.command = /^(update|actualizar|gitpull)$/i;
handler.rowner = true;

export default handler;
