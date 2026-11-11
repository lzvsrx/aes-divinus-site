'use strict';
const oaths = {
  amparo: { angel: 'IUSDICTA / AMPARO', goal: 'Vença sem nenhum aliado cair.', benefit: 'Bandagens curam mais 8 pontos de vida.', cost: 'Ataques e habilidades causam menos 2 pontos de dano.', witness: 'ETHAN ARMAND', kept: 'Desta vez, sua palavra chegou ao campo conosco. É assim que quero lutar ao seu lado.', broken: 'Em Wood aprendemos o preço de confiar demais. Preciso ver o que fará depois desta promessa.' },
  lucidez: { angel: 'SATIAE / LUCIDEZ', goal: 'Vença depois de inspirar com duas vozes diferentes.', benefit: 'Acerto recebe mais 8 pontos percentuais, até o teto de 98%.', cost: 'O bônus de dano da habilidade cai de +8 para +4.', witness: 'ALBERT ROBERTS', kept: 'A fé em uma ordem cresce quando vemos quem a cumpre.', broken: 'Uma promessa não trata feridas. Da próxima vez, quero ver seus atos sustentarem suas palavras.' },
  decisao: { angel: 'GLOREGNI / DECISÃO', goal: 'Vença até o fim da quarta rodada.', benefit: 'Ataques e habilidades causam mais 3 pontos de dano.', cost: 'Bandagens curam menos 8 pontos de vida.', witness: 'DONOVAN MICHAEL', kept: 'Palavras são fáceis. Hoje você teve o cuidado de torná-las úteis.', broken: 'Você escolheu o risco. Agora terá de aceitar que nós também lembramos do resultado.' }
};
let selected = 'amparo';
let outcome = 'kept';
const tabs = [...document.querySelectorAll('[data-oath]')];
function renderOath() {
  const value = oaths[selected];
  const fields = { 'oath-angel': value.angel, 'oath-title': value.goal, 'oath-benefit': value.benefit, 'oath-cost': value.cost, 'oath-quote': `“${value[outcome]}”`, 'oath-witness': `${value.witness} / TESTEMUNHA`, 'oath-consequence': outcome === 'kept' ? 'Confiança +6 · influência +3 · memória de coragem +1.' : 'Confiança −6 · sem influência adicional · memória de medo inicial +1.' };
  Object.entries(fields).forEach(([id, text]) => { document.getElementById(id).textContent = text; });
  document.getElementById('oath-panel').setAttribute('aria-labelledby', `tab-${selected}`);
  tabs.forEach(tab => { const active = tab.dataset.oath === selected; tab.setAttribute('aria-selected', String(active)); tab.tabIndex = active ? 0 : -1; });
  document.querySelectorAll('[data-outcome]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.outcome === outcome)));
}
tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => { selected = tab.dataset.oath; renderOath(); });
  tab.addEventListener('keydown', event => {
    let next = index;
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = tabs.length - 1;
    else return;
    event.preventDefault(); selected = tabs[next].dataset.oath; renderOath(); tabs[next].focus();
  });
});
document.querySelectorAll('[data-outcome]').forEach(button => button.addEventListener('click', () => { outcome = button.dataset.outcome; renderOath(); }));
const dialog = document.getElementById('image-dialog');
document.querySelectorAll('[data-lightbox]').forEach(button => button.addEventListener('click', () => {
  document.getElementById('dialog-image').src = button.dataset.lightbox;
  document.getElementById('dialog-image').alt = button.dataset.caption;
  document.getElementById('dialog-caption').textContent = button.dataset.caption;
  dialog.showModal();
}));
document.getElementById('close-dialog').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
fetch('release.json').then(response => { if (!response.ok) throw new Error('metadata unavailable'); return response.json(); }).then(release => {
  if (!/^\d+\.\d+\.\d+$/.test(release.version) || !/^[a-f0-9]{64}$/.test(release.sha256)) return;
  const url = new URL(release.download_url);
  if (url.origin !== 'https://github.com' || !url.pathname.startsWith('/lzvsrx/aes-divinus-site/releases/download/')) return;
  document.querySelectorAll('[data-version]').forEach(node => { node.textContent = release.version; });
  document.getElementById('download-link').href = url.href;
  document.getElementById('download-size').textContent = `${(release.bytes / 1048576).toFixed(1).replace('.', ',')} MB`;
  document.getElementById('checksum-value').textContent = release.sha256;
}).catch(() => { /* The static download link remains usable if metadata is unavailable. */ });
