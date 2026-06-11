const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '../frontend/src');

const replacements = [
  // Remaining hsla values
  { from: /hsla\(262, 100%, 72%, 0\.04\)/g, to: 'var(--color-school-bus-yellow-light)' },
  { from: /hsla\(262, 100%, 72%, 0\.2\)/g, to: 'var(--color-school-bus-yellow)' },
  { from: /hsla\(152, 52%, 58%, 0\.2\)/g, to: 'var(--color-spring-green)' },
  { from: /hsla\(8, 100%, 69%, 0\.1\)/g, to: 'var(--color-pumpkin-spice-light)' },
  { from: /hsla\(8, 100%, 69%, 0\.3\)/g, to: 'var(--color-pumpkin-spice)' },

  // Remaining rgba(249, 149, 26, 0.2)
  { from: /rgba\(249, 149, 26, 0\.2\)/g, to: 'var(--color-school-bus-yellow)' },

  // Detalle gradient fix (blue-ish -> warm white)
  { from: /linear-gradient\(135deg, rgba\(19, 22, 20, 0\.9\), rgba\(240, 248, 255, 0\.5\)\)/g, to: 'linear-gradient(135deg, rgba(19, 22, 20, 0.9), rgba(255, 248, 240, 0.5))' },
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
        console.log('Updated v2:', fullPath);
      }
    }
  }
}

walk(root);
console.log('Rebrand v2 completado.');
