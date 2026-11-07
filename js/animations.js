/**
 * ====================================================================
 * DE REPENTE 40! — MOTOR DE ANIMAÇÕES, SCROLL NATIVO 60FPS & CANVAS 3D
 * ====================================================================
 * Utiliza rolagem nativa ultra-fluida e leve com aceleração por hardware,
 * integrada ao GSAP ScrollTrigger, Canvas de Pétalas 3D, 3D Tilt nos Cards
 * e Mural Interativo de Recados.
 */

class SiteAnimations {
  constructor() {
    this.petalsCanvas = null;
    this.ctx = null;
    this.petals = [];
    this.mouse = { x: -1000, y: -1000 };
    this.animationFrameId = null;

    this.initSmoothNavigation();
    this.initPetalsCanvas();
    this.initHeroRevolve3DStage();
    this.initPartySectionAnimations();
    this.initEventDetailsAnimations();
    this.initCountdownTimer();
    this.initTiltCards();
    this.initAudioAmbience();
    this.initGuestBook();
    this.initFaqAccordion();

    // Garante recálculo perfeito dos gatilhos 3D do ScrollTrigger após carregamento de imagens e fontes
    if (typeof ScrollTrigger !== "undefined") {
      window.addEventListener("load", () => {
        setTimeout(() => ScrollTrigger.refresh(), 150);
      });
      setTimeout(() => ScrollTrigger.refresh(), 1200);
    }
  }

  /* ------------------------------------------------------------------
   * 1. NAVEGAÇÃO FLUIDA & SCROLL SUAVE NATIVO (SEM TRAVAMENTO)
   * ------------------------------------------------------------------ */
  initSmoothNavigation() {
    // Scroll suave nativo para links com âncora (#)
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", (e) => {
        const targetId = anchor.getAttribute("href");
        if (!targetId || targetId === "#") return;
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    });

    // Sombra dinâmica no Header ao rolar a página
    const header = document.querySelector(".site-header");
    if (header) {
      window.addEventListener("scroll", () => {
        if (window.scrollY > 40) {
          header.classList.add("scrolled");
        } else {
          header.classList.remove("scrolled");
        }
      }, { passive: true });
    }
  }

  /* ------------------------------------------------------------------
   * 2. CANVAS DE PÉTALAS 3D, FOLHAGENS & BRILHOS (LEVE E OTIMIZADO)
   * ------------------------------------------------------------------ */
  initPetalsCanvas() {
    this.petalsCanvas = document.getElementById("petalsCanvas");
    if (!this.petalsCanvas) return;
    this.ctx = this.petalsCanvas.getContext("2d");

    let resizeTimeout;
    const resize = () => {
      this.petalsCanvas.width = window.innerWidth;
      this.petalsCanvas.height = window.innerHeight;
    };
    resize();

    window.addEventListener("resize", () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(resize, 150);
    }, { passive: true });

    window.addEventListener("mousemove", (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    }, { passive: true });

    // Quantidade balanceada para garantir 60fps cravados em qualquer celular ou PC
    const count = window.innerWidth < 768 ? 20 : 36;
    this.petals = [];
    for (let i = 0; i < count; i++) {
      this.petals.push(this.createPetal(true));
    }

    this.renderPetals();
  }

  createPetal(initial = false) {
    const width = this.petalsCanvas ? this.petalsCanvas.width : window.innerWidth;
    const height = this.petalsCanvas ? this.petalsCanvas.height : window.innerHeight;

    const types = ["petal-terracotta", "petal-cream", "leaf-olive", "sparkle-gold"];
    const type = types[Math.floor(Math.random() * types.length)];

    return {
      x: Math.random() * width,
      y: initial ? Math.random() * height : -25,
      size: type === "sparkle-gold" ? Math.random() * 3 + 2 : Math.random() * 14 + 8,
      type: type,
      speedY: Math.random() * 1.1 + 0.5,
      speedX: (Math.random() - 0.5) * 0.7,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.025,
      oscillation: Math.random() * Math.PI * 2,
      oscillationSpeed: Math.random() * 0.02 + 0.01,
      opacity: Math.random() * 0.45 + 0.35,
      scaleZ: Math.random() * 0.5 + 0.7
    };
  }

  renderPetals() {
    if (!this.ctx || !this.petalsCanvas) return;
    const ctx = this.ctx;
    const width = this.petalsCanvas.width;
    const height = this.petalsCanvas.height;

    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < this.petals.length; i++) {
      const p = this.petals[i];
      p.y += p.speedY * p.scaleZ;
      p.oscillation += p.oscillationSpeed;
      p.x += Math.sin(p.oscillation) * 0.6 + p.speedX;
      p.rotation += p.rotationSpeed;

      // Desvio suave ao aproximar o mouse
      const dx = p.x - this.mouse.x;
      const dy = p.y - this.mouse.y;
      const distSq = dx * dx + dy * dy;
      if (distSq < 6400) { // 80px
        const dist = Math.sqrt(distSq);
        p.x += (dx / dist) * 1.8;
        p.y += (dy / dist) * 1.8;
      }

      if (p.y > height + 30 || p.x < -30 || p.x > width + 30) {
        Object.assign(p, this.createPetal(false));
      }

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.scale(p.scaleZ, p.scaleZ * Math.cos(p.oscillation));
      ctx.globalAlpha = p.opacity;

      if (p.type === "sparkle-gold") {
        ctx.fillStyle = "#E5A93C";
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === "leaf-olive") {
        ctx.fillStyle = "#6E7346";
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size * 0.45, p.size * 0.9, Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === "petal-terracotta") {
        ctx.fillStyle = "#C84B1C";
        ctx.beginPath();
        ctx.moveTo(0, -p.size);
        ctx.bezierCurveTo(p.size * 0.9, -p.size * 0.5, p.size * 0.8, p.size * 0.7, 0, p.size);
        ctx.bezierCurveTo(-p.size * 0.8, p.size * 0.7, -p.size * 0.9, -p.size * 0.5, 0, -p.size);
        ctx.fill();
      } else {
        ctx.fillStyle = "#F7E6D2";
        ctx.beginPath();
        ctx.moveTo(0, -p.size);
        ctx.bezierCurveTo(p.size * 0.7, -p.size * 0.4, p.size * 0.6, p.size * 0.6, 0, p.size * 0.8);
        ctx.bezierCurveTo(-p.size * 0.6, p.size * 0.6, -p.size * 0.7, -p.size * 0.4, 0, -p.size);
        ctx.fill();
      }

      ctx.restore();
    }

    this.animationFrameId = requestAnimationFrame(() => this.renderPetals());
  }

  /* ------------------------------------------------------------------
   * 3. PALCO 3D GIRATÓRIO (EFEITO "DAR A VOLTA")
   * O anexo 1 (Hero) gira para a esquerda enquanto a seção 2 (Carta)
   * simultaneamente gira da direita para o centro, como uma só cena 3D!
   * ------------------------------------------------------------------ */
  initHeroRevolve3DStage() {
    const stage = document.querySelector(".hero-revolve-stage");
    const rotator = document.querySelector(".stage-rotator-3d");
    const faceHero = document.querySelector(".stage-face-hero");
    const faceLetter = document.querySelector(".stage-face-letter");

    if (!stage || !rotator || !faceHero || !faceLetter) return;

    if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
      gsap.registerPlugin(ScrollTrigger);

      // Posição inicial: Rotator em 0deg, Hero em frente, Carta oculta à direita (+90deg)
      gsap.set(rotator, { rotateY: 0 });
      gsap.set(faceHero, { opacity: 1, pointerEvents: "auto" });
      gsap.set(faceLetter, { opacity: 0, pointerEvents: "none" });

      // Cria a timeline sincronizada com o scroll que executa a volta fluida como uma só seção
      const revolveTl = gsap.timeline({
        scrollTrigger: {
          trigger: stage,
          start: "top top",
          end: "+=1200", // Distância confortável: Hero -> Giro 3D -> Leitura da Carta
          pin: true,
          scrub: 0.6, // Inércia ultra-suave e reativa
          anticipatePin: 1,
          onUpdate: (self) => {
            // Habilita interatividade quando a carta estiver na frente
            if (self.progress > 0.45) {
              faceLetter.style.pointerEvents = "auto";
              faceHero.style.pointerEvents = "none";
            } else {
              faceLetter.style.pointerEvents = "none";
              faceHero.style.pointerEvents = "auto";
            }
          }
        }
      });

      // 1. Buffer inicial: o Hero repousa estático até o scroll intencional começar (0.0 a 0.12)
      // 2. Giro 3D simultâneo do palco (0.12 a 0.68):
      //    O palco gira -90deg em bloco unificado.
      //    Hero (0deg -> -90deg) gira para a esquerda saindo.
      //    Carta (+90deg -> 0deg) simultaneamente gira da direita entrando de frente!
      revolveTl.to(rotator, {
        rotateY: -90,
        ease: "power1.inOut",
        duration: 0.56
      }, 0.12);

      // Transição sutil de opacidade para refinamento nas bordas do giro 3D:
      revolveTl.to(faceHero, {
        opacity: 0,
        ease: "power1.in",
        duration: 0.35
      }, 0.22);

      revolveTl.to(faceLetter, {
        opacity: 1,
        ease: "power1.out",
        duration: 0.35
      }, 0.32);

      // 3. Buffer de leitura (0.68 a 1.0):
      //    A carta permanece estática e centralizada para leitura antes de continuar o scroll do site.
    }
  }

  /* ------------------------------------------------------------------
   * 4. ANIMAÇÕES DA FEIJOADA & GIRO ESFÉRICO 3D ("COMO SE FOSSE UMA BOLA")
   * ------------------------------------------------------------------ */
  initPartySectionAnimations() {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

    // 1. "Teremos uma deliciosa" aparece suavemente com o scroll
    gsap.fromTo(".party-pre-title",
      { opacity: 0, y: 24 },
      {
        opacity: 1,
        y: 0,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".party-intro-wrap",
          start: "top 82%",
          end: "top 58%",
          scrub: 0.5
        }
      }
    );

    // 2. "Feijoada e muito Pagode!" cresce de zoom zero (scale: 0) até o tamanho atual com o scroll
    gsap.fromTo(".party-banner-container",
      { scale: 0, opacity: 0, transformOrigin: "center center" },
      {
        scale: 1,
        opacity: 1,
        ease: "power1.out",
        scrollTrigger: {
          trigger: ".party-intro-wrap",
          start: "top 78%",
          end: "top 44%",
          scrub: 0.6
        }
      }
    );

    // 3. Palco Esférico 3D dos 4 Cards ("Giro circular como se fosse uma bola")
    const ballStage = document.querySelector(".party-ball-stage");
    const ballRotator = document.querySelector(".ball-rotator-3d");
    const ballFaces = document.querySelectorAll(".ball-face");
    const ballDots = document.querySelectorAll(".ball-dot");

    if (!ballStage || !ballRotator || !ballFaces.length) return;

    if (typeof ScrollToPlugin !== "undefined") {
      gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
    } else {
      gsap.registerPlugin(ScrollTrigger);
    }

    const ballTl = gsap.timeline({
      scrollTrigger: {
        trigger: ballStage,
        start: "center center",
        end: "+=750",
        pin: true,
        scrub: 0.6,
        anticipatePin: 1,
        onUpdate: (self) => {
          const progress = self.progress;
          // Identifica qual card está em foco com precisão nos 4 pontos de parada
          const activeIndex = Math.min(3, Math.round(progress * 3));

          ballDots.forEach((dot, idx) => {
            dot.classList.toggle("active", idx === activeIndex);
          });

          ballFaces.forEach((face, idx) => {
            face.classList.toggle("active-face", idx === activeIndex);
          });
        }
      }
    });

    // Rotação orbital linear: cada 1/3 de progresso gira rigorosamente 90 graus
    // Progresso 0/3 (0.00) = 0deg   -> Card 0 (Feijoada) 100% rente à tela no centro
    // Progresso 1/3 (0.33) = -90deg  -> Card 1 (Pagode) 100% rente à tela no centro
    // Progresso 2/3 (0.66) = -180deg -> Card 2 (Open Bar) 100% rente à tela no centro
    // Progresso 3/3 (1.00) = -270deg -> Card 3 (Doces) 100% rente à tela no centro
    ballTl.to(ballRotator, {
      rotateY: -270,
      ease: "none",
      duration: 1
    });

    // Navegação interativa por clique nas pílulas inferiores: exatamente 1 card por clique
    ballDots.forEach((dot, idx) => {
      dot.addEventListener("click", (e) => {
        e.preventDefault();
        const st = ballTl.scrollTrigger;
        if (!st) return;

        // Cada card corresponde rigorosamente a 1/3 do percurso (0, 1/3, 2/3, 1)
        const targetProgress = idx / 3;
        const targetScroll = Math.round(st.start + targetProgress * (st.end - st.start));

        // Atualiza imediatamente o destaque da pílula e da face ativa
        ballDots.forEach((d, i) => d.classList.toggle("active", i === idx));
        ballFaces.forEach((f, i) => f.classList.toggle("active-face", i === idx));

        // Transição suave com GSAP ScrollToPlugin: sem salto duplo, parando no centro exato
        if (typeof gsap.plugins !== "undefined" && gsap.plugins.scrollTo) {
          gsap.to(window, {
            scrollTo: { y: targetScroll, autoKill: false },
            duration: 0.65,
            ease: "power2.inOut"
          });
        } else {
          window.scrollTo({
            top: targetScroll,
            behavior: "smooth"
          });
        }
      });
    });
  }

  /* ------------------------------------------------------------------
   * 5. COREOGRAFIA DE MONTAGEM E DESMONTAGEM (VAI E VOLTA) DOS CARDS
   * Os 4 elementos chegam no centro da tela, se montam, pausam para leitura
   * e depois se desmontam da mesma forma (vai e volta) conforme o scroll!
   * ------------------------------------------------------------------ */
  initEventDetailsAnimations() {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

    const assemblyStage = document.querySelector(".info-assembly-stage");
    const cardDia = document.querySelector(".card-info-dia");
    const cardHorario = document.querySelector(".card-info-horario");
    const cardLocal = document.querySelector(".card-info-local");
    const cardContador = document.querySelector(".card-info-contador");

    if (!assemblyStage || !cardDia || !cardHorario || !cardLocal || !cardContador) return;

    // Estado inicial: desmontados ligeiramente afastados (sem criar vazio gigante)
    gsap.set(cardDia, { x: -140, y: -20, rotate: -8, scale: 0.88, opacity: 0 });
    gsap.set(cardHorario, { y: -90, scale: 0.88, opacity: 0 });
    gsap.set(cardLocal, { x: 140, y: -20, rotate: 8, scale: 0.88, opacity: 0 });
    gsap.set(cardContador, { y: 100, scale: 0.88, opacity: 0 });

    const detailsTl = gsap.timeline({
      scrollTrigger: {
        trigger: assemblyStage,
        start: "top 85%", // Inicia montagem assim que entra na tela (zero espaço vazio)
        end: "bottom 15%",
        scrub: 0.5
      }
    });

    // FASE 1: MONTAGEM NO CENTRO (0.00 até 0.35)
    detailsTl.to(cardDia, {
      x: 0,
      y: 0,
      rotate: 0,
      scale: 1,
      opacity: 1,
      duration: 0.35,
      ease: "power1.out"
    }, 0.00);

    detailsTl.to(cardHorario, {
      y: 0,
      scale: 1,
      opacity: 1,
      duration: 0.35,
      ease: "power1.out"
    }, 0.05);

    detailsTl.to(cardLocal, {
      x: 0,
      y: 0,
      rotate: 0,
      scale: 1,
      opacity: 1,
      duration: 0.35,
      ease: "power1.out"
    }, 0.10);

    detailsTl.to(cardContador, {
      y: 0,
      scale: 1,
      opacity: 1,
      duration: 0.35,
      ease: "power1.out"
    }, 0.15);

    // FASE 2: PLATÔ DE LEITURA (0.35 até 0.70)
    // Permanece 100% montado no centro para leitura
    detailsTl.to({}, { duration: 0.35 }, 0.35);

    // FASE 3: DESMONTAGEM / VAI E VOLTA (0.70 até 1.00)
    detailsTl.to(cardDia, {
      x: -140,
      y: -20,
      rotate: -8,
      scale: 0.88,
      opacity: 0,
      duration: 0.30,
      ease: "power1.in"
    }, 0.70);

    detailsTl.to(cardHorario, {
      y: -90,
      scale: 0.88,
      opacity: 0,
      duration: 0.30,
      ease: "power1.in"
    }, 0.70);

    detailsTl.to(cardLocal, {
      x: 140,
      y: -20,
      rotate: 8,
      scale: 0.88,
      opacity: 0,
      duration: 0.30,
      ease: "power1.in"
    }, 0.70);

    detailsTl.to(cardContador, {
      y: 100,
      scale: 0.88,
      opacity: 0,
      duration: 0.30,
      ease: "power1.in"
    }, 0.70);
  }

  /* ------------------------------------------------------------------
   * 6. EFEITO 3D TILT NOS CARDS DE PRESENTES
   * ------------------------------------------------------------------ */
  initTiltCards() {
    const cards = document.querySelectorAll(".gift-card");

    cards.forEach((card) => {
      if (card.dataset.hasTilt) return;
      card.dataset.hasTilt = "true";

      const handleMove = (e) => {
        const rect = card.getBoundingClientRect();
        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        const clientY = e.clientY || (e.touches && e.touches[0].clientY);

        if (!clientX || !clientY) return;

        const x = clientX - rect.left;
        const y = clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -6;
        const rotateY = ((x - centerX) / centerX) * 6;

        card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-5px) scale3d(1.02, 1.02, 1.02)`;
      };

      const handleLeave = () => {
        card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px) scale3d(1, 1, 1)`;
        card.style.transition = "transform 0.4s ease-out";
      };

      const handleEnter = () => {
        card.style.transition = "transform 0.08s ease-out";
      };

      card.addEventListener("mousemove", handleMove);
      card.addEventListener("mouseleave", handleLeave);
      card.addEventListener("mouseenter", handleEnter);
    });
  }

  /* ------------------------------------------------------------------
   * 7. CONTADOR REGRESSIVO EM TEMPO REAL
   * ------------------------------------------------------------------ */
  initCountdownTimer() {
    const daysEl = document.getElementById("cdDays");
    const hoursEl = document.getElementById("cdHours");
    const minutesEl = document.getElementById("cdMinutes");
    const secondsEl = document.getElementById("cdSeconds");

    if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

    const targetDate = window.SITE_CONFIG ? window.SITE_CONFIG.evento.dataContador : new Date(2027, 3, 3, 13, 0, 0);

    const updateTimer = () => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;

      if (distance < 0) {
        daysEl.textContent = "00";
        hoursEl.textContent = "00";
        minutesEl.textContent = "00";
        secondsEl.textContent = "00";
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      daysEl.textContent = String(days).padStart(2, "0");
      hoursEl.textContent = String(hours).padStart(2, "0");
      minutesEl.textContent = String(minutes).padStart(2, "0");
      secondsEl.textContent = String(seconds).padStart(2, "0");
    };

    updateTimer();
    setInterval(updateTimer, 1000);
  }

  /* ------------------------------------------------------------------
   * 8. MURAL INTERATIVO DE RECADOS & FELICITAÇÕES (PAPEL & CALIGRAFIA)
   * ------------------------------------------------------------------ */
  initGuestBook() {
    const form = document.getElementById("guestBookForm");
    const feed = document.getElementById("guestBookFeed");
    const modal = document.getElementById("allMessagesModal");
    const modalFeed = document.getElementById("modalMuralFeed");
    const openAllBtn = document.getElementById("openAllMessagesBtn");
    const totalBadge = document.getElementById("totalMessagesBadge");
    const searchInput = document.getElementById("muralSearchInput");

    if (!form || !feed) return;

    // Limite de bilhetes exibidos em formato de cards na página principal
    const MAX_VISIBLE_FEED = 6;

    // Recados padrão iniciais de carinho
    const defaultMessages = [
      {
        nome: "Mariana & Família",
        texto: "Millena querida, 40 anos com essa energia maravilhosa e esse sorriso iluminado! Que esse novo ciclo venha com saúde, paz e muito pagode!",
        data: "Hoje"
      },
      {
        nome: "Renato & Paulinha",
        texto: "Já estamos na contagem regressiva para essa feijoada incrível! Parabéns por essa trajetória tão linda e inspiradora, amiga!",
        data: "Ontem"
      },
      {
        nome: "Tia Lúcia",
        texto: "Minha sobrinha linda, de repente 40! Deus te abençoe abundantemente. Mal posso esperar pelo abraço no dia 03/04!",
        data: "2 dias atrás"
      },
      {
        nome: "Doutor André & Bia",
        texto: "Parabéns pelos 40 anos, Millena! Que seja um dia inesquecível de celebração, música boa e rodeada de quem te quer bem!",
        data: "3 dias atrás"
      }
    ];

    const getStoredMessages = () => {
      try {
        const stored = localStorage.getItem("dr40_guest_book");
        if (stored) {
          const parsed = JSON.parse(stored);
          // Remove recados de teste antigos ("Você é linda demais")
          const filtered = parsed.filter((m) => {
            const txt = (m.texto || "").toLowerCase();
            return !txt.includes("linda demais");
          });
          if (filtered.length !== parsed.length) {
            localStorage.setItem("dr40_guest_book", JSON.stringify(filtered));
          }
          return filtered;
        }
        return defaultMessages;
      } catch (e) {
        return defaultMessages;
      }
    };

    const createNoteElement = (msg) => {
      const card = document.createElement("div");
      card.className = "guest-note-paper";
      card.innerHTML = `
        <div class="note-real-pin" aria-hidden="true"></div>
        <p class="note-handwriting">"${msg.texto}"</p>
        <div class="note-paper-footer">
          <span class="note-author-hand">— ${msg.nome}</span>
          <span class="note-date-hand">${msg.data}</span>
        </div>
      `;
      return card;
    };

    const renderMessages = (filter = "") => {
      const messages = getStoredMessages();

      // 1. Atualiza o contador de mensagens no botão
      if (totalBadge) {
        totalBadge.textContent = messages.length;
      }

      // 2. Renderiza os bilhetes no feed vertical da página principal (limitado a MAX_VISIBLE_FEED)
      feed.innerHTML = "";
      const visibleList = messages.slice(0, MAX_VISIBLE_FEED);
      visibleList.forEach((msg) => {
        feed.appendChild(createNoteElement(msg));
      });

      // 3. Renderiza a lista completa no modal / pop-up (com suporte a busca)
      if (modalFeed) {
        modalFeed.innerHTML = "";
        const filtered = messages.filter((msg) => {
          if (!filter) return true;
          const search = filter.toLowerCase();
          return (
            (msg.nome && msg.nome.toLowerCase().includes(search)) ||
            (msg.texto && msg.texto.toLowerCase().includes(search))
          );
        });

        if (filtered.length === 0) {
          modalFeed.innerHTML = `<p class="empty-mural-msg">Nenhum recadinho encontrado com esse termo... 💌</p>`;
        } else {
          filtered.forEach((msg) => {
            modalFeed.appendChild(createNoteElement(msg));
          });
        }
      }
    };

    renderMessages();

    // Controle de abertura da Pop-up / Modal com todas as mensagens
    if (openAllBtn && modal) {
      openAllBtn.addEventListener("click", () => {
        modal.classList.add("active");
        document.body.style.overflow = "hidden";
        if (searchInput) searchInput.value = "";
        renderMessages();
      });
    }

    // Fechamento da Pop-up ao clicar no botão de fechar ou no backdrop
    if (modal) {
      const closeBtns = modal.querySelectorAll("[data-close-modal]");
      const closeModal = () => {
        modal.classList.remove("active");
        document.body.style.overflow = "";
      };

      closeBtns.forEach((btn) => btn.addEventListener("click", closeModal));

      modal.addEventListener("click", (e) => {
        if (e.target === modal) closeModal();
      });

      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && modal.classList.contains("active")) {
          closeModal();
        }
      });
    }

    // Busca instantânea em tempo real dentro da Pop-up
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        renderMessages(e.target.value.trim());
      });
    }

    // Envio de novo recadinho no mural
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const nameInput = document.getElementById("gbAuthor");
      const textInput = document.getElementById("gbMessage");
      if (!nameInput || !textInput) return;

      const name = nameInput.value.trim();
      const text = textInput.value.trim();

      if (!name || !text) return;

      const current = getStoredMessages();
      current.unshift({
        nome: name,
        texto: text,
        data: "Agora mesmo"
      });

      try {
        localStorage.setItem("dr40_guest_book", JSON.stringify(current));
      } catch (err) {}

      renderMessages();
      nameInput.value = "";
      textInput.value = "";

      const toast = document.getElementById("toastNotification");
      if (toast) {
        toast.textContent = "Seu recado foi preso no mural com todo carinho! 💌✨";
        toast.classList.add("show");
        setTimeout(() => toast.classList.remove("show"), 3500);
      }

      // Rola suavemente até o feed de mensagens para ver o bilhete recém-colado
      feed.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  }

  /* ------------------------------------------------------------------
   * 9. FAQ EXPANSÍVEL (PERGUNTAS FREQUENTES)
   * ------------------------------------------------------------------ */
  initFaqAccordion() {
    const items = document.querySelectorAll(".faq-item");
    items.forEach((item) => {
      const btn = item.querySelector(".faq-question");
      if (!btn) return;
      btn.addEventListener("click", () => {
        const isOpen = item.classList.contains("open");
        items.forEach((i) => i.classList.remove("open"));
        if (!isOpen) item.classList.add("open");
      });
    });
  }

  /* ------------------------------------------------------------------
   * 10. SOM DE AMBIENTE OPCIONAL (WEB AUDIO API - LEVE E PROCEDURAL)
   * ------------------------------------------------------------------ */
  initAudioAmbience() {
    const audioBtn = document.getElementById("audioToggleBtn");
    if (!audioBtn) return;

    let isPlaying = false;
    let audioCtx = null;
    let loopInterval = null;

    const playFestiveChime = () => {
      if (!isPlaying || !audioCtx) return;
      const notes = [261.63, 329.63, 392.00, 523.25, 659.25];
      const note = notes[Math.floor(Math.random() * notes.length)];

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(note, audioCtx.currentTime);

      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1.2);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 1.2);
    };

    audioBtn.addEventListener("click", () => {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === "suspended") {
        audioCtx.resume();
      }

      isPlaying = !isPlaying;
      audioBtn.classList.toggle("is-playing", isPlaying);

      if (isPlaying) {
        playFestiveChime();
        loopInterval = setInterval(playFestiveChime, 2500);
      } else {
        if (loopInterval) clearInterval(loopInterval);
      }
    });
  }
}

window.SiteAnimations = SiteAnimations;
