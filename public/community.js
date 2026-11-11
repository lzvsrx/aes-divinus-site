'use strict';
(() => {
  const repository = 'https://github.com/lzvsrx/aes-divinus-site';
  const form = document.getElementById('feedback-form');
  if (form) form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const title = document.getElementById('feedback-title').value.trim();
    const body = document.getElementById('feedback-body').value.trim();
    const area = document.getElementById('feedback-area').value;
    const kind = document.getElementById('feedback-kind').value;
    const status = document.getElementById('feedback-status');
    if (title.length < 5 || title.length > 100 || body.length < 20 || body.length > 3000 ||
        !['enhancement', 'question', 'bug', 'accessibility'].includes(kind)) {
      status.textContent = 'Revise o título (5–100 caracteres), o texto (20–3000 caracteres) e o tipo.';
      return;
    }
    const url = new URL(repository + '/issues/new');
    url.searchParams.set('template', 'contribuicao.md');
    url.searchParams.set('title', title);
    url.searchParams.set('labels', 'community,' + kind);
    url.searchParams.set('body', `## Tipo\n${kind}\n\n## Parte do jogo\n${area}\n\n## Contribuição\n${body}\n\n---\nPreparado pela comunidade no site de Aes Divinus.`);
    if (url.href.length > 7500) {
      status.textContent = 'O texto ficou longo para abrir pelo link. Resuma a contribuição ou use o formulário direto do GitHub abaixo; seu texto continua aqui para copiar.';
      return;
    }
    window.location.assign(url.href);
  });

  const button = document.getElementById('load-topics');
  const filter = document.getElementById('topic-state');
  const list = document.getElementById('topics-list');
  const status = document.getElementById('topics-status');
  const more = document.getElementById('more-topics');
  let busy = false;
  async function load() {
    if (busy) return;
    busy = true;
    button.disabled = true;
    list.replaceChildren();
    status.textContent = 'Consultando as conversas públicas…';
    const state = ['open', 'closed', 'all'].includes(filter.value) ? filter.value : 'open';
    more.href = repository + '/issues?q=' + encodeURIComponent('is:issue' + (state === 'all' ? '' : ' is:' + state));
    const timeout = new AbortController();
    const timer = setTimeout(() => timeout.abort(), 15000);
    try {
      const response = await fetch(`https://api.github.com/repos/lzvsrx/aes-divinus-site/issues?state=${state}&sort=updated&direction=desc&per_page=30`, {
        headers: { Accept: 'application/vnd.github+json' }, credentials: 'omit', referrerPolicy: 'no-referrer', signal: timeout.signal
      });
      if (!response.ok) throw new Error(response.status === 403 || response.status === 429 ? 'limit' : 'unavailable');
      const data = await response.json();
      if (!Array.isArray(data)) throw new Error('invalid');
      const topics = data.filter(item => item && !item.pull_request && Number.isSafeInteger(item.number) && item.number > 0).slice(0, 30);
      for (const item of topics) {
        const card = document.createElement('article');
        card.className = 'topic-card';
        const heading = document.createElement('h3');
        const link = document.createElement('a');
        // Build trusted URLs ourselves; never insert user HTML or API URLs.
        link.href = `${repository}/issues/${item.number}`;
        link.textContent = `#${item.number} · ${String(item.title || 'Sem título').slice(0, 200)}`;
        heading.appendChild(link);
        const meta = document.createElement('p');
        const count = Number.isSafeInteger(item.comments) && item.comments >= 0 ? item.comments : 0;
        meta.textContent = `${item.state === 'closed' ? 'Encerrado' : 'Em aberto'} · ${String(item.user?.login || 'Participante').slice(0, 60)} · ${count} comentário(s)`;
        const excerpt = document.createElement('p');
        excerpt.textContent = String(item.body || 'Abra a conversa para participar.').slice(0, 600);
        const action = document.createElement('a');
        action.href = link.href;
        action.textContent = 'Ler respostas e comentar no GitHub →';
        card.append(heading, meta, excerpt, action);
        list.appendChild(card);
      }
      status.textContent = topics.length ? `${topics.length} tópico(s) nesta consulta. A lista mostra até 30 publicações recentes; a fila completa está no GitHub.` : 'Nenhum tópico nesta situação. Sua contribuição pode começar a conversa.';
    } catch (error) {
      status.textContent = error.message === 'limit' ? 'O GitHub limitou as consultas agora. Use o link abaixo para ler e comentar diretamente.' : 'Não foi possível carregar as conversas. Tente novamente ou abra os tópicos diretamente no GitHub.';
    } finally {
      clearTimeout(timer);
      busy = false;
      button.disabled = false;
    }
  }
  button.addEventListener('click', load);
  filter.addEventListener('change', () => { status.textContent = 'Filtro alterado. Clique em carregar para atualizar a lista.'; list.replaceChildren(); });
})();
