const fs = require('fs');
const path = require('path');

const raiz = path.join(__dirname, '..', 'frontend', 'src');

function recorrer(dir, callback) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      recorrer(full, callback);
    } else if (ent.name.endsWith('.module.css')) {
      callback(full);
    }
  }
}

const reemplazos = [
  // Antiguo primario naranjo (hsla 33) → nuevo primario lila (aprox)
  { regex: /hsla\(33,\s*95%,\s*54%,/g, repl: 'hsla(262, 100%, 72%,' },
  // Antiguo secundario/indigo (hsla 279) → nuevo primario lila
  { regex: /hsla\(279,\s*38%,\s*50%,/g, repl: 'hsla(262, 100%, 72%,' },
  // Antiguo éxito verde oscuro (hsla 142) → nuevo éxito mint
  { regex: /hsla\(142,\s*71%,\s*35%,/g, repl: 'hsla(152, 52%, 58%,' },
  // Antiguo error/crimson (hsla 17) → nuevo error terracota
  { regex: /hsla\(17,\s*92%,\s*50%,/g, repl: 'hsla(8, 100%, 69%,' },
  // Antiguo error rojo (hsla 0) → nuevo error terracota
  { regex: /hsla\(0,\s*72%,\s*51%,/g, repl: 'hsla(8, 100%, 69%,' },
  // Antiguo info amatista (hsla 210) → nuevo primario lila (aprox)
  { regex: /hsla\(210,\s*100%,\s*50%,/g, repl: 'hsla(262, 100%, 72%,' },
  // Hex hardcodeados conocidos
  { regex: /#236945/g, repl: 'var(--color-exito)' },
  { regex: /#a56cc9/g, repl: 'var(--color-primario)' },
  // Glassmorphism claro (rgba blanco) → oscuro sutil
  { regex: /rgba\(255,\s*255,\s*255,\s*0\.9\)/g, repl: 'rgba(24, 25, 30, 0.9)' },
  { regex: /rgba\(255,\s*255,\s*255,\s*0\.8\)/g, repl: 'rgba(24, 25, 30, 0.8)' },
  { regex: /rgba\(255,\s*255,\s*255,\s*0\.7\)/g, repl: 'rgba(24, 25, 30, 0.7)' },
  { regex: /rgba\(255,\s*255,\s*255,\s*0\.65\)/g, repl: 'rgba(24, 25, 30, 0.65)' },
  { regex: /rgba\(255,\s*255,\s*255,\s*0\.6\)/g, repl: 'rgba(24, 25, 30, 0.6)' },
  { regex: /rgba\(255,\s*255,\s*255,\s*0\.55\)/g, repl: 'rgba(24, 25, 30, 0.55)' },
  { regex: /rgba\(255,\s*255,\s*255,\s*0\.5\)/g, repl: 'rgba(24, 25, 30, 0.5)' },
  { regex: /rgba\(255,\s*255,\s*255,\s*0\.45\)/g, repl: 'rgba(24, 25, 30, 0.45)' },
  { regex: /rgba\(255,\s*255,\s*255,\s*0\.04\)/g, repl: 'rgba(14, 15, 18, 0.04)' },
  // Glassmorphism violeta oscuro antiguo → neutro oscuro
  { regex: /rgba\(36,\s*24,\s*54,\s*0\.9\)/g, repl: 'rgba(24, 25, 30, 0.9)' },
  { regex: /rgba\(36,\s*24,\s*54,\s*0\.8\)/g, repl: 'rgba(24, 25, 30, 0.8)' },
  { regex: /rgba\(36,\s*24,\s*54,\s*0\.65\)/g, repl: 'rgba(24, 25, 30, 0.65)' },
  { regex: /rgba\(36,\s*24,\s*54,\s*0\.6\)/g, repl: 'rgba(24, 25, 30, 0.6)' },
  { regex: /rgba\(36,\s*24,\s*54,\s*0\.5\)/g, repl: 'rgba(24, 25, 30, 0.5)' },
  { regex: /rgba\(36,\s*24,\s*54,\s*0\.45\)/g, repl: 'rgba(24, 25, 30, 0.45)' },
  // Otros violetas oscuros
  { regex: /rgba\(26,\s*16,\s*37,\s*0\.45\)/g, repl: 'rgba(14, 15, 18, 0.45)' },
  { regex: /rgba\(20,\s*12,\s*30,\s*0\.95\)/g, repl: 'rgba(14, 15, 18, 0.95)' },
  { regex: /rgba\(20,\s*12,\s*30,\s*0\.8\)/g, repl: 'rgba(14, 15, 18, 0.8)' },
  { regex: /rgba\(10,\s*5,\s*15,\s*0\.6\)/g, repl: 'rgba(14, 15, 18, 0.6)' },
  // Antiguo primario naranjo rgba
  { regex: /rgba\(249,\s*149,\s*26,\s*0\.08\)/g, repl: 'rgba(163, 112, 255, 0.08)' },
  // Antiguo secundario violeta rgba
  { regex: /rgba\(142,\s*79,\s*176,\s*0\.12\)/g, repl: 'rgba(163, 112, 255, 0.12)' },
  { regex: /rgba\(142,\s*79,\s*176,\s*0\.2\)/g, repl: 'rgba(163, 112, 255, 0.2)' },
  // Antiguo acento rosa rgba
  { regex: /rgba\(213,\s*22,\s*92,\s*0\.25\)/g, repl: 'rgba(255, 122, 96, 0.25)' },
  // Gradientes clasicos problematicos: simplificar a var(--color-superficie)
  // Nota: los gradientes que usan variables globales se mantienen, pero los que
  // mezclan con #a56cc9 o similares ya fueron reemplazados arriba.
  // Eliminamos @media prefers-color-scheme: dark ya que es dark-only.
];

let totalCambios = 0;

recorrer(raiz, (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  for (const { regex, repl } of reemplazos) {
    content = content.replace(regex, repl);
  }

  // Eliminar bloques @media (prefers-color-scheme: dark) { ... }
  // Usamos una regex simple para removerlos completamente (no anidados profundamente)
  content = content.replace(/@media\s*\(\s*prefers-color-scheme:\s*dark\s*\)\s*\{[\s\S]*?\n\}/g, '');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    totalCambios++;
    console.log('Actualizado:', filePath);
  }
});

console.log(`\nTotal archivos modificados: ${totalCambios}`);
