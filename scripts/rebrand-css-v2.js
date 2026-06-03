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
  // Hex hardcodeados restantes
  { regex: /#7c3aed/g, repl: 'var(--color-primario)' },
  { regex: /#4ade80/g, repl: 'var(--color-exito)' },
  { regex: /#fbbf24/g, repl: 'var(--color-advertencia)' },
  { regex: /#c084fc/g, repl: 'var(--color-primario)' },
  { regex: /#f87171/g, repl: 'var(--color-error)' },
  // rgba indigo antiguo
  { regex: /rgba\(81,\s*34,\s*167,\s*0\.08\)/g, repl: 'rgba(163, 112, 255, 0.08)' },
  { regex: /rgba\(81,\s*34,\s*167,\s*0\.15\)/g, repl: 'rgba(163, 112, 255, 0.15)' },
  // rgba negro para skeletons en fondo oscuro → blanco muy transparente
  { regex: /rgba\(0,\s*0,\s*0,\s*0\.02\)/g, repl: 'rgba(255, 255, 255, 0.02)' },
  { regex: /rgba\(0,\s*0,\s*0,\s*0\.04\)/g, repl: 'rgba(255, 255, 255, 0.04)' },
  { regex: /rgba\(0,\s*0,\s*0,\s*0\.08\)/g, repl: 'rgba(255, 255, 255, 0.08)' },
  // rgba colores de glow antiguos
  { regex: /rgba\(45,\s*134,\s*89,\s*0\.4\)/g, repl: 'rgba(92, 203, 158, 0.4)' },
  { regex: /rgba\(245,\s*77,\s*11,\s*0\.4\)/g, repl: 'rgba(255, 122, 96, 0.4)' },
  // Limpiar comentarios sueltos de Dark Mode
  { regex: /\/\*\s*---\s*Dark\s*Mode\s*---\s*\*\/\s*$/gm, repl: '' },
];

let totalCambios = 0;

recorrer(raiz, (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  for (const { regex, repl } of reemplazos) {
    content = content.replace(regex, repl);
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    totalCambios++;
    console.log('Actualizado:', filePath);
  }
});

console.log(`\nTotal archivos modificados: ${totalCambios}`);
