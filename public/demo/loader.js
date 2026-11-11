'use strict';
const canvas = document.getElementById('canvas');
const status = document.getElementById('status');
const progress = document.getElementById('progress');
const panel = document.getElementById('loading');
function fail(error) {
  status.textContent = 'Não foi possível iniciar o jogo. Verifique sua conexão e o suporte a WebGL 2 / WebAssembly. Recarregue para tentar novamente ou baixe a versão Windows.';
  progress.hidden = true;
  console.error(error);
}
fetch('config.json').then(response => {
  if (!response.ok) throw new Error('Configuração indisponível');
  return response.json();
}).then(config => {
  const missing = Engine.getMissingFeatures({ threads: false });
  if (missing.length) throw new Error(missing.join(', '));
  const engine = new Engine({ ...config, canvas, persistentPaths: [], ensureCrossOriginIsolationHeaders: false });
  return engine.startGame({
    onProgress(current, total) {
      if (total > 0) { progress.max = total; progress.value = current; status.textContent = `Carregando demonstração: ${Math.floor(current / total * 100)}%.`; }
    }
  }).then(() => { panel.hidden = true; canvas.focus(); });
}).catch(fail);
