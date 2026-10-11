/* Brincando com as Letras (site): trilhas fechadas como no app da Play Store.
   Regra: a Trilha do Meu Nome é toda grátis; nas outras, os itens 1, 2 e 3
   ficam abertos e, do item 4 em diante, aparece um cadeado até a compra.
   A compra é feita na loja do portal. Depois do pagamento (Pix conferido no
   painel ou Mercado Pago), o e-mail do cliente ganha "letras" em acessos/{email}
   no Firestore, e aqui o adulto entra com a conta Google para liberar. */
(function () {
  'use strict';

  var MUNDO = 'letras';
  var GRATIS = 3;                                   // itens abertos por trilha
  var TRILHA_LIVRE = /(^|\/)trilha\.html$/;         // Trilha do Meu Nome: inteira grátis
  var CHAVE = 'me:acesso-letras';
  var PROMO_ATE = new Date('2026-10-31T23:59:59-03:00').getTime();
  function preco() { return Date.now() <= PROMO_ATE ? 'R$ 9,95' : 'R$ 19,90'; }
  var SDK = 'https://www.gstatic.com/firebasejs/10.12.2/';

  function liberado() { try { return localStorage.getItem(CHAVE) === '1'; } catch (e) { return false; } }
  function marcarLiberado() {
    try { localStorage.setItem(CHAVE, '1'); } catch (e) {}
    document.documentElement.classList.add('alf-premium');
    fecharAviso();
    atualizarMapa();
    var b = document.getElementById('alfBtnHub'); if (b) b.remove();
  }

  // Vai para a loja do portal com o mundo já no carrinho.
  function irParaLoja() {
    try {
      var c = JSON.parse(localStorage.getItem('me:carrinho') || '[]');
      if (!Array.isArray(c)) c = [];
      if (c.indexOf(MUNDO) < 0 && c.indexOf('colecao') < 0) c.push(MUNDO);
      localStorage.setItem('me:carrinho', JSON.stringify(c));
    } catch (e) {}
    location.href = '/#loja';
  }

  // Entra com a conta Google e confere se o e-mail tem o mundo liberado.
  function conferirCompra(msg) {
    var cfg = window.ME_CONFIG || {};
    if (!cfg.firebase) { msg.textContent = 'A conferência ainda não está ligada neste endereço.'; return; }
    msg.textContent = 'Abrindo o login do Google…';
    Promise.all([import(SDK + 'firebase-app.js'), import(SDK + 'firebase-auth.js'), import(SDK + 'firebase-firestore.js')])
      .then(function (m) {
        var app = m[0].getApps().length ? m[0].getApp() : m[0].initializeApp(cfg.firebase);
        var A = m[1], F = m[2], auth = A.getAuth(app);
        return A.signInWithPopup(auth, new A.GoogleAuthProvider()).then(function (r) {
          var email = String(r.user.email || '').toLowerCase();
          msg.textContent = 'Procurando sua compra…';
          return F.getDoc(F.doc(F.getFirestore(app), 'acessos', email)).then(function (d) {
            var mundos = (d.exists() && d.data().mundos) || [];
            if (mundos.indexOf(MUNDO) >= 0) marcarLiberado();
            else msg.textContent = 'Ainda não há compra liberada para ' + email + '. Se você pagou por Pix, a liberação acontece assim que o pagamento é conferido.';
          });
        });
      })
      .catch(function (e) {
        msg.textContent = e && e.code === 'auth/popup-closed-by-user' ? '' : 'Não foi possível conferir agora. Verifique a internet e tente de novo.';
      });
  }

  /* ---------- Aviso de compra, com pergunta para o adulto ---------- */
  var CSS = '' +
    '.alf-ov{position:fixed;inset:0;z-index:99999;background:rgba(31,42,68,.55);display:grid;place-items:center;padding:16px;font-family:Nunito,system-ui,sans-serif}' +
    '.alf-cx{background:#fff;color:#1f2a44;border-radius:28px;max-width:420px;width:100%;padding:26px 22px 20px;text-align:center;box-shadow:0 10px 0 rgba(31,42,68,.25)}' +
    '.alf-cx .alf-ic{font-size:64px;line-height:1}' +
    '.alf-cx h2{font-family:"Baloo 2",Nunito,sans-serif;font-size:26px;margin:8px 0 6px;line-height:1.15}' +
    '.alf-cx p{font-size:17px;margin:0 0 14px;line-height:1.4}' +
    '.alf-cx .alf-q{font-size:22px;font-weight:800;margin:6px 0 10px}' +
    '.alf-op{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-bottom:12px}' +
    '.alf-op button{min-width:64px;font:800 22px/1 Nunito,sans-serif;padding:14px 10px;border-radius:16px;border:3px solid #2490D6;background:#fff;color:#1f2a44}' +
    '.alf-b{display:block;width:100%;margin:8px 0 0;font:800 18px/1.2 Nunito,sans-serif;padding:14px;border-radius:18px;border:0;background:#2490D6;color:#fff}' +
    '.alf-b.sec{background:#eef3fb;color:#1f2a44}.alf-b.ter{background:none;color:#5b6577;font-weight:700}' +
    '.alf-dica{font-size:14px!important;color:#5b6577;margin:8px 0 0!important}' +
    '.alf-msg{min-height:1.2em;font-size:15px;color:#c0392b;margin:8px 0 0}' +
    '.stop.alf-pago .pad{filter:grayscale(.75);opacity:.75}' +
    '.stop.alf-pago .lockb{display:none}' +
    '.stop.alf-pago .alf-cad{position:absolute;z-index:3;top:-14px;left:calc(50% + 18px);width:44px;height:44px;border-radius:50%;background:#FFC531;border:3px solid #fff;display:grid;place-items:center;font-size:24px;box-shadow:0 3px 0 rgba(31,42,68,.25)}' +
    '.alf-hub{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin:0 0 18px;padding:14px 16px;border-radius:22px;background:#FFF4CC;border:3px solid #FFC531;color:#1f2a44;font-family:Nunito,system-ui,sans-serif}' +
    '.alf-hub-ic{font-size:34px}.alf-hub-tx{flex:1 1 180px;display:flex;flex-direction:column;gap:2px;font-size:15px;line-height:1.35}.alf-hub-tx b{font-size:17px}' +
    '.alf-hub .alf-b{width:auto;margin:0;padding:12px 20px}';
  function estilo() { if (document.getElementById('alfCss')) return; var s = document.createElement('style'); s.id = 'alfCss'; s.textContent = CSS; document.head.appendChild(s); }

  var aviso = null;
  function fecharAviso() { if (aviso) { aviso.remove(); aviso = null; } }
  function el(tag, cls, txt) { var n = document.createElement(tag); if (cls) n.className = cls; if (txt != null) n.textContent = txt; return n; }

  function abrirAviso() {
    estilo(); fecharAviso();
    try { window.speechSynthesis && speechSynthesis.cancel(); } catch (e) {}
    aviso = el('div', 'alf-ov'); aviso.setAttribute('role', 'dialog'); aviso.setAttribute('aria-modal', 'true');
    var cx = el('div', 'alf-cx'); aviso.appendChild(cx);
    aviso.addEventListener('click', function (e) { if (e.target === aviso) fecharAviso(); });
    document.body.appendChild(aviso);
    passoAdulto(cx);
  }

  // Pergunta simples para que só um adulto chegue à tela de compra.
  function passoAdulto(cx) {
    var a = 3 + Math.floor(Math.random() * 6), b = 4 + Math.floor(Math.random() * 5), certo = a + b;
    var ops = [certo, certo + 1, certo - 2].sort(function () { return Math.random() - .5; });
    cx.innerHTML = '';
    cx.appendChild(el('div', 'alf-ic', '🔒'));
    cx.appendChild(el('h2', null, 'Esta brincadeira está trancadinha'));
    cx.appendChild(el('p', null, 'Chame um adulto para liberar. Adulto, responda:'));
    cx.appendChild(el('div', 'alf-q', 'Quanto é ' + a + ' + ' + b + '?'));
    var op = el('div', 'alf-op'); cx.appendChild(op);
    var msg = el('div', 'alf-msg');
    ops.forEach(function (v) {
      var bt = el('button', null, String(v)); bt.type = 'button';
      bt.onclick = function () { if (v === certo) passoCompra(cx); else { msg.textContent = 'Resposta errada. Tente de novo.'; setTimeout(function () { if (aviso) passoAdulto(cx); }, 900); } };
      op.appendChild(bt);
    });
    cx.appendChild(msg);
    var fechar = el('button', 'alf-b ter', 'Agora não'); fechar.type = 'button'; fechar.onclick = fecharAviso; cx.appendChild(fechar);
  }

  function passoCompra(cx) {
    cx.innerHTML = '';
    cx.appendChild(el('div', 'alf-ic', '🎁'));
    cx.appendChild(el('h2', null, 'Libere todas as trilhas'));
    cx.appendChild(el('p', null, 'A Trilha do Meu Nome é toda grátis, e nas outras os itens 1, 2 e 3 também. Com uma compra única, as 10 trilhas ficam liberadas por completo.'));
    cx.appendChild(el('p', 'alf-preco', 'Pagamento único de ' + preco() + ', sem assinatura.'));
    var msg = el('div', 'alf-msg');
    var comprar = el('button', 'alf-b', 'Comprar por ' + preco()); comprar.type = 'button'; comprar.onclick = irParaLoja;
    var conferir = el('button', 'alf-b sec', 'Já comprei: entrar com Google'); conferir.type = 'button';
    conferir.onclick = function () { conferirCompra(msg); };
    var dica = el('p', 'alf-dica', 'Use o mesmo e-mail que você informou na compra.');
    var fechar = el('button', 'alf-b ter', 'Agora não'); fechar.type = 'button'; fechar.onclick = fecharAviso;
    [comprar, conferir, dica, msg, fechar].forEach(function (n) { cx.appendChild(n); });
  }

  /* ---------- Bloqueio dentro das trilhas ---------- */
  function jogos() { try { return window.AlfJogos ? window.AlfJogos() : null; } catch (e) { return null; } }
  function trilhaLivre() { return TRILHA_LIVRE.test(location.pathname); }
  function trancado(id) {
    var G = jogos(); if (!G || liberado() || trilhaLivre()) return false;
    var i = G.findIndex(function (g) { return g.id === id; });
    return i >= GRATIS;
  }

  // Cadeado nas paradas do mapa (do item 4 em diante).
  function atualizarMapa() {
    var G = jogos(); if (!G) return;
    var livre = liberado() || trilhaLivre();
    document.querySelectorAll('.stop').forEach(function (b) {
      var rot = b.getAttribute('aria-label') || '', idx = -1, maior = 0;
      G.forEach(function (g, i) { if (rot.indexOf(g.t) === 0 && g.t.length > maior) { maior = g.t.length; idx = i; } });
      var pago = !livre && idx >= GRATIS;
      b.classList.toggle('alf-pago', pago);
      // Itens grátis ficam abertos desde o início, sem esperar o anterior.
      if (idx >= 0 && idx < GRATIS && b.classList.contains('locked')) {
        b.classList.remove('locked', 'pending');
        var lk = b.querySelector('.lockb'); if (lk) lk.remove();
        b.setAttribute('aria-label', G[idx].t);
      }
      var cad = b.querySelector('.alf-cad');
      if (pago && !cad) b.appendChild(el('span', 'alf-cad', '🔒'));
      if (!pago && cad) cad.remove();
    });
  }

  function instalarTrilha() {
    if (!window.AlfJogos) return false;
    // Chamado pela página no início de openGame: true = não abre o item.
    window.AlfTrava = function (G, id) { if (!trancado(id)) return false; abrirAviso(); return true; };
    document.addEventListener('click', function (e) {
      if (liberado() || !e.target.closest || !e.target.closest('.stop.alf-pago')) return;
      e.preventDefault(); e.stopImmediatePropagation(); abrirAviso();
    }, true);
    var agendado = false;
    new MutationObserver(function () {
      if (agendado) return; agendado = true;
      requestAnimationFrame(function () { agendado = false; atualizarMapa(); });
    }).observe(document.body, { childList: true, subtree: true });
    atualizarMapa();
    return true;
  }

  // Na página inicial: faixa acima da lista de atividades para o adulto liberar tudo.
  function instalarInicio() {
    var lista = document.getElementById('acts');
    if (liberado() || !lista) return;
    var f = el('div', 'alf-hub'); f.id = 'alfBtnHub';
    f.appendChild(el('span', 'alf-hub-ic', '🔓'));
    var t = el('div', 'alf-hub-tx');
    t.appendChild(el('b', null, 'Trilha do Meu Nome grátis e itens 1, 2 e 3 das outras'));
    t.appendChild(el('span', null, 'Libere as 10 trilhas completas com uma compra única de ' + preco() + '.'));
    f.appendChild(t);
    var b = el('button', 'alf-b', 'Liberar tudo'); b.type = 'button'; b.onclick = abrirAviso; f.appendChild(b);
    lista.parentNode.insertBefore(f, lista);
  }

  estilo();
  if (liberado()) document.documentElement.classList.add('alf-premium');
  if (!instalarTrilha()) instalarInicio();
  window.MundoLetras = { abrirAviso: abrirAviso, liberado: liberado };
})();
