/**
 * ====================================================================
 * DE REPENTE 40! — GERENCIADOR DA LISTA DE PRESENTES & MODAIS INTERATIVOS
 * ====================================================================
 */

class GiftManager {
  constructor() {
    this.config = window.SITE_CONFIG;
    this.currentCategory = "todas";
    this.selectedGift = null;
    this.reservedGifts = this.loadReservedGifts();
    this.qrCodeInstance = null;

    this.initElements();
    this.attachEvents();
    this.renderCategories();
    this.renderGifts();
  }

  loadReservedGifts() {
    try {
      const stored = localStorage.getItem("dr40_reserved_gifts");
      return stored ? JSON.parse(stored) : {};
    } catch (e) {
      return {};
    }
  }

  saveReservedGifts() {
    try {
      localStorage.setItem("dr40_reserved_gifts", JSON.stringify(this.reservedGifts));
    } catch (e) {
      console.warn("Não foi possível salvar no localStorage", e);
    }
  }

  initElements() {
    this.container = document.getElementById("giftsGrid");
    this.filtersContainer = document.getElementById("categoryFilters");
    this.pixModal = document.getElementById("pixModal");
    this.physicalModal = document.getElementById("physicalModal");
    this.toast = document.getElementById("toastNotification");
  }

  attachEvents() {
    // Fechar modais ao clicar no X ou fora do card
    document.querySelectorAll("[data-close-modal]").forEach(btn => {
      btn.addEventListener("click", () => this.closeAllModals());
    });

    [this.pixModal, this.physicalModal].forEach(modal => {
      if (!modal) return;
      modal.addEventListener("click", (e) => {
        if (e.target === modal) this.closeAllModals();
      });
    });

    // Tecla Escape para fechar modais
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") this.closeAllModals();
    });

    // Botão Copiar PIX
    const copyPixBtn = document.getElementById("copyPixBtn");
    if (copyPixBtn) {
      copyPixBtn.addEventListener("click", () => this.handleCopyPix());
    }

    // Formulário do Presente Físico
    const physicalForm = document.getElementById("physicalForm");
    if (physicalForm) {
      physicalForm.addEventListener("submit", (e) => this.handlePhysicalSubmit(e));
    }

    // Input dinâmico de valor na Cota Livre
    const customAmountInput = document.getElementById("customPixAmount");
    if (customAmountInput) {
      customAmountInput.addEventListener("input", (e) => {
        let val = parseFloat(e.target.value.replace(",", "."));
        if (!isNaN(val) && val > 0) {
          this.updatePixQRCode(val);
        }
      });
    }
  }

  renderCategories() {
    if (!this.filtersContainer) return;
    this.filtersContainer.innerHTML = "";

    this.config.categorias.forEach(cat => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `filter-pill ${this.currentCategory === cat.id ? "active" : ""}`;
      btn.textContent = cat.label;
      btn.addEventListener("click", () => {
        this.currentCategory = cat.id;
        document.querySelectorAll(".filter-pill").forEach(p => p.classList.remove("active"));
        btn.classList.add("active");
        this.renderGifts();
      });
      this.filtersContainer.appendChild(btn);
    });
  }

  formatCurrency(value) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(value);
  }

  renderGifts() {
    if (!this.container) return;
    this.container.innerHTML = "";

    const filtered = this.config.presentes.filter(item => {
      if (this.currentCategory === "todas") return true;
      return item.categoria === this.currentCategory;
    });

    if (filtered.length === 0) {
      this.container.innerHTML = `
        <div class="gifts-empty">
          <p>Nenhum presente encontrado nesta categoria.</p>
        </div>
      `;
      return;
    }

    filtered.forEach((gift, index) => {
      const isReserved = !!this.reservedGifts[gift.id];
      const card = document.createElement("div");
      card.className = `gift-card ${gift.destaque ? "featured" : ""} ${isReserved ? "is-reserved" : ""}`;
      card.setAttribute("data-gift-id", gift.id);

      const priceDisplay = gift.isLivre 
        ? `<span class="price-free">Você escolhe o valor</span>` 
        : `<span class="price-tag">${this.formatCurrency(gift.valor)}</span>`;

      const badgeHtml = gift.destaque 
        ? `<div class="card-badge">Destaque Especial ✨</div>`
        : isReserved
        ? `<div class="card-badge reserved">Escolhido por você 💖</div>`
        : "";

      card.innerHTML = `
        ${badgeHtml}
        <div class="card-image-wrap">
          <img src="${gift.imagem}" alt="${gift.titulo}" loading="lazy" class="card-image">
        </div>
        <div class="card-content">
          <h3 class="card-title">${gift.titulo}</h3>
          <p class="card-desc">${gift.descricao}</p>
          <div class="card-price-row">
            ${priceDisplay}
          </div>
          <div class="card-actions">
            <button type="button" class="btn-action btn-pix" data-action="pix">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14.54 18.23l-3.21-3.21 3.21-3.21a.75.75 0 0 0-1.06-1.06l-3.21 3.21-1.95-1.95a.75.75 0 0 0-1.06 1.06l2.48 2.48a.75.75 0 0 0 1.06 0l3.74-3.74a.75.75 0 0 0 0-1.06z"/>
                <path d="M12 2L2 12l10 10 10-10L12 2zm0 2.83L19.17 12 12 19.17 4.83 12 12 4.83z"/>
              </svg>
              <span>Presentear via PIX</span>
            </button>
            <button type="button" class="btn-action btn-outline" data-action="physical">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="8" width="18" height="13" rx="2"></rect>
                <path d="M12 8v13"></path>
                <path d="M19 12H5"></path>
                <path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.5 4.5 0 0 1 12 7.5 4.5 4.5 0 0 1 16.5 3 2.5 2.5 0 0 1 19 8"></path>
              </svg>
              <span>Dar Presente Físico</span>
            </button>
          </div>
        </div>
      `;

      // Eventos dos botões do card
      card.querySelector('[data-action="pix"]').addEventListener("click", () => this.openPixModal(gift));
      card.querySelector('[data-action="physical"]').addEventListener("click", () => this.openPhysicalModal(gift));

      this.container.appendChild(card);
    });

    // Inicializa o efeito 3D Tilt nos cards
    if (window.siteAnimationsInstance && typeof window.siteAnimationsInstance.initTiltCards === "function") {
      window.siteAnimationsInstance.initTiltCards();
    }
  }

  openPixModal(gift) {
    this.selectedGift = gift;
    const titleEl = document.getElementById("pixModalTitle");
    const descEl = document.getElementById("pixModalDesc");
    const amountWrap = document.getElementById("pixCustomAmountWrap");
    const customInput = document.getElementById("customPixAmount");
    const fixedAmountEl = document.getElementById("pixFixedAmount");

    if (titleEl) titleEl.textContent = gift.titulo;
    if (descEl) descEl.textContent = gift.descricao;

    if (gift.isLivre) {
      if (amountWrap) amountWrap.style.display = "block";
      if (fixedAmountEl) fixedAmountEl.style.display = "none";
      if (customInput) {
        customInput.value = "100.00";
        this.updatePixQRCode(100.00);
      }
    } else {
      if (amountWrap) amountWrap.style.display = "none";
      if (fixedAmountEl) {
        fixedAmountEl.style.display = "block";
        fixedAmountEl.textContent = this.formatCurrency(gift.valor);
      }
      this.updatePixQRCode(gift.valor);
    }

    // Configura o link do WhatsApp para envio do comprovante
    this.updateWhatsAppPixLink(gift.isLivre ? 100 : gift.valor);

    if (this.pixModal) {
      this.pixModal.classList.add("active");
      document.body.classList.add("modal-open");
    }
  }

  updatePixQRCode(valor) {
    if (!this.selectedGift) return;

    try {
      const payload = window.PixEngine.generatePayload({
        chave: this.config.pix.chave,
        nome: this.config.pix.nomeTitular,
        cidade: this.config.pix.cidadeTitular,
        valor: valor,
        txId: this.config.pix.txIdPadrao,
        descricao: `Presente 40 anos: ${this.selectedGift.titulo}`
      });

      this.currentPixPayload = payload;

      const codeInput = document.getElementById("pixCopyCode");
      if (codeInput) codeInput.value = payload;

      // Renderiza QRCode usando biblioteca QRCode.js ou canvas fallback
      const qrContainer = document.getElementById("pixQrCodeContainer");
      if (qrContainer) {
        qrContainer.innerHTML = "";
        if (typeof QRCode !== "undefined") {
          this.qrCodeInstance = new QRCode(qrContainer, {
            text: payload,
            width: 210,
            height: 210,
            colorDark: "#4A1A0A", // Marrom café do convite
            colorLight: "#FFFFFF",
            correctLevel: QRCode.CorrectLevel.M
          });
        } else {
          // Fallback gracioso com API de QR Code pública confiável
          const img = document.createElement("img");
          img.src = `https://api.qrserver.com/v1/create-qr-code/?size=210x210&data=${encodeURIComponent(payload)}&color=4A1A0A`;
          img.alt = "QR Code PIX";
          img.width = 210;
          img.height = 210;
          img.className = "qr-image-fallback";
          qrContainer.appendChild(img);
        }
      }

      this.updateWhatsAppPixLink(valor);
    } catch (err) {
      console.error("Erro ao gerar QR Code PIX:", err);
    }
  }

  updateWhatsAppPixLink(valor) {
    const btn = document.getElementById("whatsappPixNotifyBtn");
    if (!btn || !this.selectedGift) return;

    const texto = this.config.whatsapp.mensagemPadraoPix(this.selectedGift.titulo, Number(valor));
    const url = `https://api.whatsapp.com/send?phone=${this.config.whatsapp.numero}&text=${encodeURIComponent(texto)}`;
    btn.href = url;
  }

  async handleCopyPix() {
    if (!this.currentPixPayload) return;
    const ok = await window.PixEngine.copyToClipboard(this.currentPixPayload);
    const copyBtn = document.getElementById("copyPixBtn");

    if (ok) {
      this.showToast("Código PIX Copiado com Sucesso! 📋✨");
      if (copyBtn) {
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = `<span>Copiado! ✅</span>`;
        copyBtn.classList.add("copied");
        setTimeout(() => {
          copyBtn.innerHTML = originalText;
          copyBtn.classList.remove("copied");
        }, 2500);
      }
    } else {
      this.showToast("Não foi possível copiar automaticamente. Selecione e copie o código.");
    }
  }

  openPhysicalModal(gift) {
    this.selectedGift = gift;
    const titleEl = document.getElementById("physicalModalTitle");
    const hintEl = document.getElementById("physicalModalHint");

    if (titleEl) titleEl.textContent = gift.titulo;
    if (hintEl) hintEl.textContent = gift.dicaFisico || "Leve com muito carinho no dia da comemoração!";

    // Limpa campos anteriores
    const nameInput = document.getElementById("guestName");
    const msgInput = document.getElementById("guestMessage");
    if (nameInput) nameInput.value = "";
    if (msgInput) msgInput.value = "";

    if (this.physicalModal) {
      this.physicalModal.classList.add("active");
      document.body.classList.add("modal-open");
    }
  }

  handlePhysicalSubmit(e) {
    e.preventDefault();
    if (!this.selectedGift) return;

    const nameInput = document.getElementById("guestName");
    const msgInput = document.getElementById("guestMessage");
    const nome = nameInput ? nameInput.value.trim() : "";
    const recado = msgInput ? msgInput.value.trim() : "";

    if (!nome) {
      this.showToast("Por favor, digite seu nome antes de confirmar.");
      if (nameInput) nameInput.focus();
      return;
    }

    // Salva nos itens reservados localmente
    this.reservedGifts[this.selectedGift.id] = {
      nome: nome,
      recado: recado,
      data: new Date().toISOString()
    };
    this.saveReservedGifts();

    // Redireciona para o WhatsApp
    const texto = this.config.whatsapp.mensagemPadraoFisico(this.selectedGift.titulo, nome, recado);
    const url = `https://api.whatsapp.com/send?phone=${this.config.whatsapp.numero}&text=${encodeURIComponent(texto)}`;

    this.showToast("Presente confirmado! Abrindo WhatsApp... 🎁");
    setTimeout(() => {
      window.open(url, "_blank");
      this.closeAllModals();
      this.renderGifts();
    }, 800);
  }

  closeAllModals() {
    if (this.pixModal) this.pixModal.classList.remove("active");
    if (this.physicalModal) this.physicalModal.classList.remove("active");
    document.body.classList.remove("modal-open");
    this.selectedGift = null;
  }

  showToast(message) {
    if (!this.toast) return;
    this.toast.textContent = message;
    this.toast.classList.add("show");
    setTimeout(() => {
      this.toast.classList.remove("show");
    }, 3500);
  }
}

// Exporta e instancia quando DOM estiver carregado
window.GiftManager = GiftManager;

