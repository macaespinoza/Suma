const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '../frontend/src');

const replacements = [
  // Glassmorphism backgrounds (old dark rgba -> new Onyx rgba)
  { from: /rgba\(24, 25, 30, (0\.\d+)\)/g, to: 'rgba(19, 22, 20, $1)' },
  { from: /rgba\(14, 15, 18, (0\.\d+)\)/g, to: 'rgba(19, 22, 20, $1)' },

  // White subtle backgrounds -> warm white subtle
  { from: /rgba\(255, 255, 255, 0\.04\)/g, to: 'rgba(255, 248, 240, 0.05)' },
  { from: /rgba\(255, 255, 255, 0\.02\)/g, to: 'rgba(255, 248, 240, 0.03)' },
  { from: /rgba\(255, 255, 255, 0\.08\)/g, to: 'rgba(255, 248, 240, 0.08)' },

  // Error / Pumpkin (old red-orange hsla)
  { from: /hsla\(8, 100%, 69%, 0\.08\)/g, to: 'var(--color-pumpkin-spice-light)' },
  { from: /hsla\(8, 100%, 69%, 0\.12\)/g, to: 'var(--color-pumpkin-spice-light)' },
  { from: /hsla\(8, 100%, 69%, 0\.2\)/g, to: 'var(--color-pumpkin-spice)' },
  { from: /hsla\(8, 100%, 69%, 0\.15\)/g, to: 'var(--color-pumpkin-spice)' },

  // Success / Spring Green (old teal hsla)
  { from: /hsla\(152, 52%, 58%, 0\.08\)/g, to: 'var(--color-spring-green-light)' },
  { from: /hsla\(152, 52%, 58%, 0\.1\)/g, to: 'var(--color-spring-green-light)' },
  { from: /hsla\(152, 52%, 58%, 0\.12\)/g, to: 'var(--color-spring-green-light)' },
  { from: /hsla\(152, 52%, 58%, 0\.15\)/g, to: 'var(--color-spring-green-light)' },

  // Info / Warning / School Bus Yellow (old purple hsla)
  { from: /hsla\(262, 100%, 72%, 0\.08\)/g, to: 'var(--color-school-bus-yellow-light)' },
  { from: /hsla\(262, 100%, 72%, 0\.1\)/g, to: 'var(--color-school-bus-yellow-light)' },
  { from: /hsla\(262, 100%, 72%, 0\.12\)/g, to: 'var(--color-school-bus-yellow-light)' },
  { from: /hsla\(262, 100%, 72%, 0\.15\)/g, to: 'var(--color-school-bus-yellow)' },

  // Hot Pink (old purple rgba)
  { from: /rgba\(163, 112, 255, 0\.08\)/g, to: 'var(--color-hot-pink-web-light)' },
  { from: /rgba\(163, 112, 255, 0\.15\)/g, to: 'var(--color-hot-pink-web)' },

  // Legacy shadow glows
  { from: /rgba\(92, 203, 158, 0\.4\)/g, to: 'rgba(77, 237, 151, 0.4)' },
  { from: /rgba\(255, 122, 96, 0\.4\)/g, to: 'rgba(255, 115, 0, 0.4)' },

  // Invalid hsla(var())
  { from: /hsla\(var\(--color-primario-hsl\), 0\.04\)/g, to: 'var(--color-spring-green-light)' },

  // Hardcoded blue/purple colors in Calendario
  { from: /color: #3b82f6; \/\* Azul \*\//g, to: 'color: var(--color-school-bus-yellow)' },
  { from: /border-left: 2px solid #3b82f6;/g, to: 'border-left: 2px solid var(--color-school-bus-yellow);' },
  { from: /color: #8b5cf6; \/\* Morado \*\//g, to: 'color: var(--color-hot-pink-web)' },
  { from: /border-left: 2px solid #8b5cf6;/g, to: 'border-left: 2px solid var(--color-hot-pink-web);' },

  // Border 1px -> 1.5px in module files (selective, only structural elements)
  // We will do this manually for key files to avoid breaking layout.
];

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
    } else if (entry.name.endsWith('.module.css')) {
      let content = fs.readFileSync(fullPath, 'utf-8');
      let modified = false;
      for (const r of replacements) {
        if (r.from.test(content)) {
          content = content.replace(r.from, r.to);
          modified = true;
        }
      }
      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf-8');
        console.log('Updated:', fullPath);
      }
    }
  }
}

walk(root);
console.log('Rebrand masivo completado en todos los .module.css');
