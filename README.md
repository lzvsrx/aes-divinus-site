# Site público de Aes Divinus

Site estático em português para GitHub Pages. Arquivos públicos em `public/`; HTML, CSS e JavaScript sem dependências de runtime ou ferramentas de build. Não publica o código-fonte privado do jogo.

O site apresenta a versão Windows e aponta para seu ZIP no GitHub Releases do repositório público `lzvsrx/aes-divinus-site`. A versão atual não é um port para navegador. Imagens são capturas reais fornecidas pelo projeto.

Prévia: `python -m http.server 8787 --bind 127.0.0.1 --directory website/public`.

Validação: `python website/check_site.py`.

Na atualização, gere `public/release.json` a partir do ZIP real, envie primeiro o arquivo para Releases e publique o site com a mesma versão. Nunca copie `.git`, credenciais, saves ou os PDFs originais para este repositório público. O fonte completo e a biblioteca de autoria permanecem no repositório privado do jogo; o pacote jogável contém a narrativa distribuída pelo próprio jogo.

Universo e conteúdo do jogo: Luiz Otavio Valenzi Sousa / LZASANTOSWORLDSGAMES. Este arquivo não atribui licença pública ao universo.
