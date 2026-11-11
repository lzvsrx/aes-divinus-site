'use strict';
const start = document.getElementById('start-demo');
const stop = document.getElementById('stop-demo');
const full = document.getElementById('fullscreen-demo');
const stage = document.getElementById('demo-stage');
const cover = document.getElementById('demo-cover');
const status = document.getElementById('demo-status');
let frame = null;
start.addEventListener('click', () => {
  if (frame) return;
  frame = document.createElement('iframe');
  frame.title = 'Primeiras Ordens — demonstração jogável de Aes Divinus';
  frame.src = 'demo/game.html';
  frame.allow = 'autoplay; fullscreen';
  frame.addEventListener('load', () => { status.textContent = 'Área do jogo aberta. Aguarde a barra de carregamento; clique dentro do jogo para usar o teclado.'; });
  cover.hidden = true;
  stage.appendChild(frame);
  stop.hidden = false;
  full.hidden = !stage.requestFullscreen;
  status.textContent = 'Abrindo demonstração… O primeiro carregamento baixa aproximadamente 38 MB.';
});
stop.addEventListener('click', () => {
  if (document.fullscreenElement === stage) document.exitFullscreen().catch(() => {});
  if (frame) frame.remove();
  frame = null;
  cover.hidden = false;
  stop.hidden = true;
  full.hidden = true;
  status.textContent = 'Demonstração encerrada. Você pode começar uma nova partida.';
  start.focus();
});
full.addEventListener('click', () => {
  if (stage.requestFullscreen) stage.requestFullscreen().catch(() => { status.textContent = 'O navegador não permitiu ampliar. Use o link para abrir em página própria.'; });
});
