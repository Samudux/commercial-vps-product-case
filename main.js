/* =============================================
   COMMERCIAL VPS — main.js  v2.1
   (smooth scroll limpo + restante igual)
   ============================================= */

(function () {
  'use strict';

  var WHATSAPP_NUMBER = '5511983714384'; /* +55 11 98371-4384 */
  var WHATSAPP_MSG_DEFAULT = 'Olá! Quero uma orientação técnica inicial.';

  function buildWhatsAppURL(msg) {
    return 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(msg || WHATSAPP_MSG_DEFAULT);
  }

  /* --- CINEMA INTRO ---
     bar: 2.7s CSS | JS delay: 2800ms | fade: 0.5s
     reduced-motion: 200ms | fail-safe: 4000ms
  */
  function runCinema() {
    var overlay = document.getElementById('cinema-overlay');
    if (!overlay) return;

    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var delay   = reduced ? 200 : 2800;

    var logoImg = overlay.querySelector('.cinema-logo-img');
    if (logoImg) {
      logoImg.addEventListener('error', function () {
        logoImg.style.display = 'none';
        var fb = overlay.querySelector('.cinema-logo-fallback');
        if (fb) fb.style.display = 'inline';
      });
    }

    function dismiss() {
      overlay.classList.add('fade-out');
      overlay.addEventListener('transitionend', function () {
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      }, { once: true });
    }

    var failSafe = setTimeout(function () {
      var el = document.getElementById('cinema-overlay');
      if (el && el.parentNode) { el.style.transition = 'none'; el.parentNode.removeChild(el); }
    }, 4000);

    setTimeout(function () {
      clearTimeout(failSafe);
      dismiss();
    }, delay);
  }

  /* --- MOBILE NAV --- */
  function initMobileNav() {
    var hamburger = document.querySelector('.nav-hamburger');
    var mobileNav = document.getElementById('mobile-nav');
    if (!hamburger || !mobileNav) return;

    hamburger.addEventListener('click', function () {
      var open = mobileNav.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', String(open));
      hamburger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    });

    mobileNav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        mobileNav.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });

    document.addEventListener('click', function (e) {
      if (!hamburger.contains(e.target) && !mobileNav.contains(e.target)) {
        mobileNav.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* --- NAV/FOOTER LOGO IMAGE FALLBACK --- */
  function initNavLogo() {
    document.querySelectorAll('.nav-logo-img, .footer-logo-img, .cinema-logo-img').forEach(function (img) {
      img.addEventListener('error', function () {
        img.style.display = 'none';
        var fb = img.nextElementSibling;
        if (fb) fb.style.display = 'inline';
      });
    });
  }

  /* --- ACCORDION --- */
  function initAccordions() {
    document.querySelectorAll('.accordion-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var item   = btn.closest('.accordion-item');
        var isOpen = item.classList.contains('open');
        var parent = item.parentElement;
        parent.querySelectorAll('.accordion-item.open').forEach(function (oi) {
          oi.classList.remove('open');
          oi.querySelector('.accordion-btn').setAttribute('aria-expanded', 'false');
        });
        if (!isOpen) { item.classList.add('open'); btn.setAttribute('aria-expanded', 'true'); }
      });
    });
  }

  /* --- ACTIVE NAV --- */
  function setActiveNav() {
    var path = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a, #mobile-nav a').forEach(function (a) {
      if (a.getAttribute('href') === path) { a.classList.add('active'); a.setAttribute('aria-current', 'page'); }
    });
  }

  /* --- CONTACT FORM --- */
  function initContactForm() {
    var form = document.getElementById('contact-form');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = form.querySelector('[type="submit"]');
      var orig = btn.textContent;
      btn.textContent = 'Mensagem enviada ✓'; btn.disabled = true;
      btn.style.background = '#16a34a'; btn.style.borderColor = '#16a34a';
      setTimeout(function () {
        btn.textContent = orig; btn.disabled = false;
        btn.style.background = ''; btn.style.borderColor = '';
        form.reset();
      }, 4000);
    });
  }

  /* --- WHATSAPP — wire all .js-whatsapp elements --- */
  function initWhatsApp() {
    document.querySelectorAll('.js-whatsapp').forEach(function (el) {
      var msg = el.dataset.msg || WHATSAPP_MSG_DEFAULT;
      el.setAttribute('href', buildWhatsAppURL(msg));
      el.setAttribute('target', '_blank');
      el.setAttribute('rel', 'noopener noreferrer');
    });
  }

  /* --- SMOOTH SCROLL (sem inline onclick) --- */
  function initSmoothScroll() {
    document.querySelectorAll('.js-scroll[data-scroll]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        var sel = el.getAttribute('data-scroll');
        var target = sel ? document.querySelector(sel) : null;
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  /* --- MODAL — ASSISTENTE POR INDÚSTRIA --- */
  function initModal() {
    var overlay = document.getElementById('ia-modal');
    if (!overlay) return;

    var modal    = overlay.querySelector('.modal');
    var btnClose = overlay.querySelector('.modal-close');
    var answers  = { setor: '', desafio: '', urgencia: '' };

    var steps = {
      1: { label: 'Passo 1 de 3 — Setor', question: 'Qual é o seu setor industrial?', key: 'setor',
           options: ['Óleo & Gás','Energia Elétrica','Mineração','Construção / Naval','Petroquímica / Siderurgia','Outro'] },
      2: { label: 'Passo 2 de 3 — Desafio', question: 'Qual é o principal desafio?', key: 'desafio',
           options: ['Torque / Aperto controlado','Tensionamento de parafusos','Calibração de instrumentos','Assistência técnica / reparo','Projeto de engenharia'] },
      3: { label: 'Passo 3 de 3 — Urgência', question: 'Qual é o prazo da necessidade?', key: 'urgencia',
           options: ['Urgente — parada de planta','Nesta semana','Neste mês / sem urgência'] }
    };

    var resultMap = {
      'Torque / Aperto controlado':      'Nosso time pode indicar sistemas de torque hidráulico ou pneumático adequados ao seu contexto. A especificação correta depende de torque-alvo, diâmetro de parafuso e condições operacionais.',
      'Tensionamento de parafusos':      'Para tensionamento, avaliamos carga de trabalho, comprimento e requisito normativo. Sistemas hidráulicos de tensionamento podem ser indicados dependendo do cenário.',
      'Calibração de instrumentos':      'Nosso laboratório RBC pode calibrar chaves de torque, transdutores e instrumentos de pressão. Informe tipo e quantidade para orçamento.',
      'Assistência técnica / reparo':    'Abrimos OS com diagnóstico técnico antes de qualquer intervenção. Atendemos em oficina e em campo, com laudo e peças originais.',
      'Projeto de engenharia':           'Para projetos, precisamos entender o contexto operacional completo. Nosso time retorna com análise técnica preliminar sem compromisso.'
    };

    function openModal() {
      answers = { setor: '', desafio: '', urgencia: '' };
      renderStep(1);
      overlay.classList.add('open');
      overlay.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      setTimeout(function () {
        var f = modal.querySelector('.modal-opt, .modal-close');
        if (f) f.focus();
      }, 100);
    }

    function closeModal() {
      overlay.classList.remove('open');
      overlay.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    document.querySelectorAll('.js-open-modal').forEach(function (b) { b.addEventListener('click', openModal); });
    if (btnClose) btnClose.addEventListener('click', closeModal);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) closeModal(); });

    document.addEventListener('keydown', function (e) {
      if (!overlay.classList.contains('open')) return;
      if (e.key === 'Escape') { closeModal(); return; }
      if (e.key === 'Tab') {
        var foc = Array.prototype.slice.call(modal.querySelectorAll('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])'));
        if (!foc.length) return;
        if (e.shiftKey) { if (document.activeElement === foc[0]) { e.preventDefault(); foc[foc.length-1].focus(); } }
        else            { if (document.activeElement === foc[foc.length-1]) { e.preventDefault(); foc[0].focus(); } }
      }
    });

    function buildWAMsg() {
      return 'Olá! Preenchi o assistente da Commercial VPS:\n• Setor: ' + answers.setor + '\n• Desafio: ' + answers.desafio + '\n• Urgência: ' + answers.urgencia + '\nGostaria de uma orientação técnica.';
    }

    function renderStep(step) {
      var body = modal.querySelector('.modal-body');
      if (!body) return;

      var dots = modal.querySelectorAll('.progress-dot');
      dots.forEach(function (d, i) { d.classList.toggle('done', i < step); });

      var html = '';

      if (step <= 3) {
        var cfg = steps[step];
        html += '<div class="modal-step-label">' + cfg.label + '</div>';
        html += '<p style="font-size:15px;font-weight:600;margin-bottom:14px;color:var(--col-text);">' + cfg.question + '</p>';
        html += '<div class="modal-options">';
        cfg.options.forEach(function (opt) {
          html += '<button class="modal-opt" data-key="' + cfg.key + '" data-val="' + opt + '">' + opt + '</button>';
        });
        html += '</div><div class="modal-footer">';
        if (step > 1) html += '<button class="btn btn-secondary btn-sm js-modal-back">← Voltar</button>';
        html += '</div>';

        body.innerHTML = html;

        body.querySelectorAll('.modal-opt').forEach(function (opt) {
          opt.addEventListener('click', function () {
            answers[opt.dataset.key] = opt.dataset.val;
            renderStep(step + 1);
          });
        });

        var back = body.querySelector('.js-modal-back');
        if (back) back.addEventListener('click', function () { renderStep(step - 1); });

      } else {
        var result = resultMap[answers.desafio] || 'Nossa equipe analisará sua demanda e retornará com orientação técnica adequada.';
        var waURL  = buildWhatsAppURL(buildWAMsg());

        html += '<div class="modal-step-label">Direção inicial</div>';
        html += '<div class="modal-result"><h4>Com base nas suas respostas:</h4><p>' + result + '</p></div>';
        html += '<p style="font-size:11px;color:var(--col-text-3);margin-bottom:16px;line-height:1.5;">⚠️ Conceito / MVP — orientação inicial sujeita à validação técnica com especialista. Sem compromisso técnico.</p>';
        html += '<div class="modal-footer">';
        html += '<a href="' + waURL + '" target="_blank" rel="noopener" class="btn btn-whatsapp">';
        html += '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.374 0 0 5.373 0 12c0 2.119.552 4.109 1.512 5.841L.046 23.96l6.292-1.449C8.003 23.476 9.96 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818c-1.847 0-3.623-.498-5.158-1.364l-.369-.22-3.832.881.914-3.741-.242-.386A9.821 9.821 0 012.182 12c0-5.422 4.396-9.818 9.818-9.818 5.422 0 9.818 4.396 9.818 9.818 0 5.422-4.396 9.818-9.818 9.818z"/></svg>';
        html += 'Enviar via WhatsApp</a>';
        html += '<button class="btn btn-secondary btn-sm js-modal-restart">Recomeçar</button>';
        html += '</div>';

        body.innerHTML = html;
        var restart = body.querySelector('.js-modal-restart');
        if (restart) restart.addEventListener('click', function () { answers = {setor:'',desafio:'',urgencia:''}; renderStep(1); });
      }

      setTimeout(function () {
        var f = modal.querySelector('.modal-opt, .btn-whatsapp');
        if (f) f.focus();
      }, 50);
    }
  }

  /* --- SCROLL REVEAL --- */
  function initReveal() {
    if (!('IntersectionObserver' in window)) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var s = document.createElement('style');
    s.textContent = '.reveal{opacity:0;transform:translateY(18px);transition:opacity 0.5s ease,transform 0.5s ease}.reveal.visible{opacity:1;transform:none}';
    document.head.appendChild(s);
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
    }, { threshold: 0.1 });
    document.querySelectorAll('.card,.stat-block,.step,.section-header,.micro-case,.setor-card,.ia-step').forEach(function (el) {
      el.classList.add('reveal'); obs.observe(el);
    });
  }

  /* --- INIT --- */
  document.addEventListener('DOMContentLoaded', function () {
    runCinema();
    initMobileNav();
    initNavLogo();
    initAccordions();
    setActiveNav();
    initContactForm();
    initWhatsApp();
    initSmoothScroll();
    initModal();
    initReveal();
  });

})();