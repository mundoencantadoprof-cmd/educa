# Alfabetizando: app iPhone (App Store)


Versão para iPhone e iPad, separada da versão Android (`app-alfabetizando/`).
Mesmas regras: Trilha do Meu Nome toda grátis, itens 1, 2 e 3 das outras trilhas grátis
e a compra única `trilhas_completas` (R$ 19,90) pela App Store, com pergunta para o adulto antes.

Esta pasta é só do iPhone: mudar algo aqui não muda o app Android, e vice-versa.

## Pastas

| Pasta | O que é |
|---|---|
| `conteudo/` | As 11 páginas do Alfabetizando (index + 10 trilhas). |
| `web/premium.js` | Bloqueio dos itens e compra pela App Store. |
| `scripts/` | Monta `www/` com as páginas + o bloqueio (igual ao Android). |
| `assets/` | Ícone e tela de abertura. |
| `ios/` | Projeto iPhone/iPad (Capacitor), aberto no Xcode. |

## Como atualizar

1. Mude os arquivos desta pasta (por exemplo, copie as páginas novas para `conteudo/`).
2. Ao salvar no GitHub, ele confere sozinho se o app compila.
3. Para mandar a versão nova à Apple: **Actions > App iPhone > Run workflow**.
   Antes, aumente a versão em `ios/App/App.xcodeproj/project.pbxproj` (`MARKETING_VERSION`, por exemplo 1.0 para 1.1).

Não precisa de Mac: o GitHub monta o app num Mac dele (`.github/workflows/app-ios.yml`).

- A cada mudança na pasta do app, ele só confere se o app para iPhone compila.
- Em **Actions > App iPhone > Run workflow**, ele monta a versão assinada e envia
  para o App Store Connect, onde ela aparece no TestFlight.

### O que fazer no lado da Apple

1. Entrar no **Programa de Desenvolvedores da Apple** (US$ 99 por ano) em developer.apple.com.
2. Em **Certificates, Identifiers & Profiles > Identifiers**, criar o App ID
   `br.org.educaanap.alfabetizando` (o mesmo nome do Android).
3. No **App Store Connect**, criar o app "Alfabetizando" com esse App ID, idioma português (Brasil).
4. Em **Contratos, impostos e dados bancários**, aceitar o contrato de **apps pagos**
   (sem ele a compra não aparece).
5. No app, em **Compras dentro do app**, criar o produto **Não consumível** com ID
   `trilhas_completas`, preço R$ 19,90.
6. Em **Usuários e acesso > Integrações > Chaves da API do App Store Connect**, criar uma chave
   com acesso **Admin** e baixar o arquivo `.p8` (só dá para baixar uma vez).
7. No GitHub, em **Settings > Secrets and variables > Actions**, criar 4 segredos:
   - `APPLE_TEAM_ID`: o Team ID (em developer.apple.com > Membership).
   - `ASC_KEY_ID`: o Key ID da chave.
   - `ASC_ISSUER_ID`: o Issuer ID (aparece no topo da página das chaves).
   - `ASC_KEY_P8`: o conteúdo inteiro do arquivo `.p8` (abrir no Bloco de Notas e copiar).
8. Rodar **Actions > App iPhone > Run workflow**. Depois de alguns minutos a versão aparece
   no TestFlight para testar num iPhone; dali, é só enviar para revisão da Apple.
9. Na ficha da loja: categoria **Educação**, faixa **Crianças até 5 anos**, link da política de privacidade
   e capturas de tela de iPhone (6,9") e iPad (13").

Para testar a compra sem pagar, use uma conta de teste "Sandbox" (App Store Connect > Usuários e acesso > Sandbox).
