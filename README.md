# Site publico de Aes Divinus

Site estatico em portugues publicado no GitHub Pages: https://lzvsrx.github.io/aes-divinus-site/

`public/index.html` apresenta o projeto e incorpora, apenas depois de um clique, a demonstracao real Godot em `public/demo/`. `public/guide.html` explica a historia, as seis acoes, formacao, juramentos, controles e reconstrucao. O ensaio e temporario, nao avanca a campanha nem transfere saves. A campanha Windows continua disponivel no GitHub Releases.

## Desenvolvimento

Previa: `python -m http.server 8787 --bind 127.0.0.1 --directory website/public`.
Validacao no projeto: `python website/check_site.py` e `node website/check_interactions.mjs`.
No checkout publico, execute `python check_site.py` e `node check_interactions.mjs`.

Para reconstruir o jogo web no projeto privado Windows: `python tools/setup_godot.py` e `python tools/export_web.py`. O preset Web Demo usa Godot 4.6.3, Compatibility, sem threads e sem extensoes nativas; a feature web_demo seleciona uma cena propria e desativa persistencia antes de ler o banco. O shell externo tem CSP com wasm-unsafe-eval para compilar WebAssembly, sem liberar eval JavaScript. O Windows mantem seu fluxo original e SQLite. O navegador precisa de WebGL 2 e WebAssembly; desempenho e audio dependem do dispositivo. Nao usa service worker, conta, analytics ou servidor de jogo.

O pacote de execucao PCK inclui conteudo e bytecode distribuiveis do jogo. Ele nao deve ser tratado como segredo. O repositorio-fonte e os PDFs originais permanecem privados. O script tools/stage_website.py copia somente uma lista explicita de arquivos publicos para build/site-public. Revise a diferenca antes do push. Nunca copie credenciais, bancos de usuario ou PDFs originais.

Os testes verificam paginas, arquivos locais, ancora, metadados, tamanhos do pacote, compilacao WASM e ciclo de carregamento/parada. O projeto privado tambem executa o teste de integracao web_demo_runner: intro, juramento, batalha, resultado e reinicio. A verificacao visual no navegador nao pode ser substituida por esses testes.

Para atualizar a versao Windows, gere release.json a partir do ZIP real e envie primeiro o pacote ao GitHub Releases. A demonstracao web pode evoluir sem alterar o ZIP Windows ja publicado.

Universo: Luiz Otavio Valenzi Sousa / LZASANTOSWORLDSGAMES. Esta distribuicao nao concede licenca publica ao universo. Godot Engine e componentes de terceiros: avisos em public/demo/GODOT_LICENSE.txt e GODOT_COPYRIGHT.txt.
