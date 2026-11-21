// Genera assets/terminal.svg: una terminal que escribe sola (solo CSS, sin scripts: GitHub la muestra como imagen).
const fs = require('fs');
const path = require('path');

const out = process.argv[2];
const W = 860, FS = 17, CW = FS * 0.6, LH = 29, X0 = 40, TOP = 52;
const C = {
  bg: '#0d1117', bar: '#161b22', line: '#30363d', text: '#e6edf3', dim: '#8b949e',
  green: '#7ee787', blue: '#79c0ff', orange: '#ff8a5c', purple: '#d2a8ff', yellow: '#f2cc60', cyan: '#56d4dd',
};
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// guion: órdenes que se escriben y lo que responden
const script = [
  { cmd: 'whoami', out: [[['Julio Soria', C.text, 1], [' · Madrid, España', C.dim]]] },
  { cmd: 'cat sobre-mi.txt', out: [
    [['Estudiante en ', C.text], ['U-tad', C.cyan, 1], ['. Me gustan las webs, las herramientas y los juegos.', C.text]],
    [['Creador de ', C.text], ['DesguaPro', C.orange, 1], [', software para desguaces de coches y motos.', C.text]],
  ] },
  { cmd: 'ls proyectos/', out: [[['desguaproterm/', C.orange, 1], ['  precia/', C.purple, 1], ['  bildyapp-api/', C.blue, 1], ['  juego-algoritmos/', C.green, 1]]] },
  { cmd: './desguaproterm', out: [[['●', C.green], [' 4 sesiones de Claude Code a la vez  ', C.text], ['●', C.yellow], [' 1 te necesita', C.dim]]] },
];

const PROMPT_LEN = 'julio@madrid:~$ '.length;
const CHAR = 0.065, BEFORE = 0.35, AFTER_TYPE = 0.25, AFTER_OUT = 0.5;
let t = 0.6, y = TOP + 34;
const body = [], css = [];
let n = 0;

const prompt = (yy) => `<text x="${X0}" y="${yy}" textLength="${(PROMPT_LEN - 1) * CW}" lengthAdjust="spacingAndGlyphs">` +
  `<tspan fill="${C.green}" font-weight="700">julio@madrid</tspan><tspan fill="${C.text}">:</tspan>` +
  `<tspan fill="${C.blue}" font-weight="700">~</tspan><tspan fill="${C.text}">$</tspan></text>`;

for (const step of script) {
  const k = n++;
  const len = step.cmd.length, dist = len * CW, cx = X0 + PROMPT_LEN * CW;
  const typeStart = t + BEFORE, typeDur = Math.max(0.3, len * CHAR);
  css.push(`@keyframes t${k}{to{transform:translateX(${dist.toFixed(1)}px)}}`);
  body.push(`<g class="show" style="animation-delay:${t.toFixed(2)}s">${prompt(y)}` +
    `<text x="${cx}" y="${y}" fill="${C.text}" textLength="${dist}" lengthAdjust="spacingAndGlyphs">${esc(step.cmd)}</text>` +
    `<rect class="tapa" x="${cx}" y="${y - LH + 8}" width="${dist + 6}" height="${LH}" fill="${C.bg}" style="animation:t${k} ${typeDur.toFixed(2)}s steps(${len}) ${typeStart.toFixed(2)}s forwards"/>` +
    `<rect class="cur" x="${cx}" y="${y - FS + 2}" width="${CW}" height="${FS + 3}" style="animation:t${k} ${typeDur.toFixed(2)}s steps(${len}) ${typeStart.toFixed(2)}s forwards,off .01s ${(typeStart + typeDur + 0.05).toFixed(2)}s forwards"/></g>`);
  t = typeStart + typeDur + AFTER_TYPE;
  y += LH;
  for (const line of step.out) {
    const spans = line.map(([s, c, b]) => `<tspan fill="${c}"${b ? ' font-weight="700"' : ''}>${esc(s)}</tspan>`).join('');
    body.push(`<g class="show" style="animation-delay:${t.toFixed(2)}s"><text x="${X0}" y="${y}" xml:space="preserve">${spans}</text></g>`);
    y += LH;
    t += 0.08;
  }
  y += 8;
  t += AFTER_OUT;
}
// última línea: prompt con el cursor parpadeando
body.push(`<g class="show" style="animation-delay:${t.toFixed(2)}s">${prompt(y)}` +
  `<rect class="cur blink" x="${X0 + PROMPT_LEN * CW}" y="${y - FS + 2}" width="${CW}" height="${FS + 3}" style="animation-delay:${t.toFixed(2)}s"/></g>`);

const H = y + 30;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="titulo">
<title id="titulo">julio@madrid: Julio Soria, de Madrid. Estudiante en U-tad y creador de DesguaPro. Proyectos: desguaproterm, precia, bildyapp-api y juego-algoritmos.</title>
<defs>
  <linearGradient id="acento" x1="0" x2="1"><stop offset="0" stop-color="${C.orange}"/><stop offset=".5" stop-color="${C.purple}"/><stop offset="1" stop-color="${C.blue}"/></linearGradient>
  <filter id="sombra" x="-5%" y="-5%" width="110%" height="115%"><feDropShadow dx="0" dy="6" stdDeviation="7" flood-color="#000" flood-opacity=".35"/></filter>
</defs>
<style>
  text{font-family:ui-monospace,SFMono-Regular,'Cascadia Code','JetBrains Mono',Consolas,Menlo,monospace;font-size:${FS}px;white-space:pre}
  .show{opacity:0;animation:show .25s ease-out forwards}
  .cur{fill:${C.orange}}
  .blink{animation:blink 1.1s step-end infinite}
  @keyframes show{from{opacity:0;transform:translateY(3px)}to{opacity:1;transform:none}}
  @keyframes off{to{opacity:0}}
  @keyframes blink{50%{opacity:0}}
  ${css.join('\n  ')}
  @media (prefers-reduced-motion:reduce){.show{animation:none;opacity:1}.tapa,.cur:not(.blink){display:none}.blink{animation:none}}
</style>
<rect x="10" y="8" width="${W - 20}" height="${H - 22}" rx="12" fill="${C.bg}" filter="url(#sombra)"/>
<rect x="10" y="8" width="${W - 20}" height="${H - 22}" rx="12" fill="${C.bg}" stroke="${C.line}"/>
<path d="M10 20a12 12 0 0 1 12-12h${W - 44}a12 12 0 0 1 12 12v20H10z" fill="${C.bar}"/>
<rect x="10" y="40" width="${W - 20}" height="2" fill="url(#acento)" opacity=".85"/>
<circle cx="34" cy="24" r="6" fill="#ff5f57"/><circle cx="54" cy="24" r="6" fill="#febc2e"/><circle cx="74" cy="24" r="6" fill="#28c840"/>
<text x="${W / 2}" y="29" text-anchor="middle" fill="${C.dim}" style="font-size:13px">julio@madrid: ~</text>
${body.join('\n')}
</svg>
`;
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, svg);
console.log(`ok ${W}x${H}, termina a los ${t.toFixed(1)} s`);
