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
    this.initScrollStorytelling();
    this.initCountdownTimer();
    this.initTiltCards();
    this.initAudioAmbience();
    this.initGuestBook();
    this.initFaqAccordion();
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
   * 3. ANIMAÇÕES SEGURAS (SEM OCULTAR NENHUM CONTEÚDO)
   * ------------------------------------------------------------------ */
  initScrollStorytelling() {
    if (typeof gsap === "undefined") return;

    // Animação de entrada suave apenas no Hero inicial
    // NENHUMA seção do site fica com opacity: 0 ou é ocultada por ScrollTrigger!
    try {
      const heroTl = gsap.timeline({ defaults: { ease: "power2.out" } });
      heroTl
        .from(".hero-invite-tag", { y: -15, duration: 0.6, delay: 0.1 })
        .from(".hero-heart-svg", { scale: 0.8, duration: 0.4 }, "-=0.2")
        .from(".hero-cursive-title", { y: 15, duration: 0.6 }, "-=0.2")
        .from(".hero-big-number", { scale: 0.85, duration: 0.7, ease: "back.out(1.4)" }, "-=0.3")
        .from(".hero-subtitle", { y: 15, duration: 0.5 }, "-=0.2");
    } catch (e) {
      console.warn("Animação Hero ignorada:", e);
    }
  }

  /* ------------------------------------------------------------------
   * 4. EFEITO 3D TILT NOS CARDS DE PRESENTES
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
   * 5. CONTADOR REGRESSIVO EM TEMPO REAL
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
   * 6. MURAL INTERATIVO DE RECADOS & FELICITAÇÕES
   * ------------------------------------------------------------------ */
  initGuestBook() {
    const form = document.getElementById("guestBookForm");
    const grid = document.getElementById("guestBookGrid");
    if (!form || !grid) return;

    // Recados padrão iniciais de carinho
    const defaultMessages = [
      {
        nome: "Mariana & Família",
        texto: "Millena querida, 40 anos com essa energia maravilhosa e esse sorriso iluminado! Que esse novo ciclo venha com saúde e muito pagode!",
        data: "Hoje"
      },
      {
        nome: "Renato & Paulinha",
        texto: "Já estamos na contagem regressiva para essa feijoada incrível! Parabéns por essa trajetória tão linda e inspiradora!",
        data: "Ontem"
      },
      {
        nome: "Tia Lúcia",
        texto: "Minha sobrinha linda, de repente 40! Deus te abençoe abundantemente. Mal posso esperar pelo abraço no dia 03/04!",
        data: "2 dias atrás"
      }
    ];

    const getStoredMessages = () => {
      try {
        const stored = localStorage.getItem("dr40_guest_book");
        return stored ? JSON.parse(stored) : defaultMessages;
      } catch (e) {
        return defaultMessages;
      }
    };

    const renderMessages = () => {
      const messages = getStoredMessages();
      grid.innerHTML = "";

      messages.forEach((msg) => {
        const card = document.createElement("div");
        card.className = "guest-note-card";
        card.innerHTML = `
          <div class="note-pin">📌</div>
          <p class="note-text">"${msg.texto}"</p>
          <div class="note-footer">
            <strong class="note-author">${msg.nome}</strong>
            <span class="note-time">${msg.data}</span>
          </div>
        `;
        grid.appendChild(card);
      });
    };

    renderMessages();

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
        toast.textContent = "Seu recado foi publicado no mural! 💖";
        toast.classList.add("show");
        setTimeout(() => toast.classList.remove("show"), 3500);
      }
    });
  }

  /* ------------------------------------------------------------------
   * 7. FAQ EXPANSÍVEL (PERGUNTAS FREQUENTES)
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
   * 8. SOM DE AMBIENTE OPCIONAL (WEB AUDIO API - LEVE E PROCEDURAL)
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
