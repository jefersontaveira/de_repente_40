/**
 * ====================================================================
 * DE REPENTE 40! — INTEGRAÇÃO COM GOOGLE SHEETS & GERENCIAMENTO DE USUÁRIO
 * ====================================================================
 */

class UserManager {
  static STORAGE_KEY = "dr40_guest_name";
  static RSVP_CONFIRMED_KEY = "dr40_user_rsvp_confirmed";

  static getName() {
    try {
      return localStorage.getItem(this.STORAGE_KEY) || "";
    } catch (e) {
      return "";
    }
  }

  static setName(name) {
    if (!name || typeof name !== "string") return;
    const cleanName = name.trim();
    if (!cleanName) return;

    try {
      localStorage.setItem(this.STORAGE_KEY, cleanName);
    } catch (e) {}

    // Sincroniza instantaneamente todos os campos de nome abertos ou futuros no site
    this.syncAllNameInputs(cleanName);
  }

  static isRsvpConfirmed() {
    try {
      return localStorage.getItem(this.RSVP_CONFIRMED_KEY) === "true";
    } catch (e) {
      return false;
    }
  }

  static setRsvpConfirmed(status = true) {
    try {
      localStorage.setItem(this.RSVP_CONFIRMED_KEY, status ? "true" : "false");
    } catch (e) {}
  }

  static syncAllNameInputs(name) {
    const ids = ["gbAuthor", "rsvpGuestName", "pixGuestName", "guestName"];
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el && !el.value) {
        el.value = name;
      }
    });
  }

  static bindInputs() {
    const ids = ["gbAuthor", "rsvpGuestName", "pixGuestName", "guestName"];
    const savedName = this.getName();

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;

      // Preenche com o nome memorizado
      if (savedName && !el.value) {
        el.value = savedName;
      }

      // Ao digitar em qualquer um, atualiza a memória e os outros campos
      el.addEventListener("input", (e) => {
        const val = e.target.value.trim();
        if (val) {
          try {
            localStorage.setItem(UserManager.STORAGE_KEY, val);
          } catch (err) {}
          
          // Atualiza os outros campos que ainda não foram alterados
          ids.forEach((otherId) => {
            if (otherId !== id) {
              const otherEl = document.getElementById(otherId);
              if (otherEl) otherEl.value = e.target.value;
            }
          });
        }
      });
    });
  }
}

class SheetsService {
  static getUrl() {
    return (window.SITE_CONFIG && window.SITE_CONFIG.sheetsUrl) ? window.SITE_CONFIG.sheetsUrl.trim() : "";
  }

  static async sendData(payload) {
    const url = this.getUrl();

    // Fallback gracioso local se a URL ainda não tiver sido preenchida pelo usuário
    if (!url) {
      console.warn("⚠️ SITE_CONFIG.sheetsUrl não configurada ainda. Simulando gravação local...");
      return this.simulateLocalSave(payload);
    }

    try {
      // Usamos no-cors com fallback ou requisição padrão para Google Apps Script
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error("HTTP error " + response.status);
      }

      const result = await response.json();
      return result;
    } catch (err) {
      console.warn("Tentando envio via modo no-cors ou fallback local devido a CORS:", err);
      // Fallback para Google Apps Script que redireciona 302
      try {
        await fetch(url, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify(payload)
        });
        return { success: true, message: "Enviado com sucesso!" };
      } catch (e) {
        return this.simulateLocalSave(payload);
      }
    }
  }

  static simulateLocalSave(payload) {
    const action = payload.action;
    const storeKey = "dr40_local_sheets_" + action;
    try {
      const existing = JSON.parse(localStorage.getItem(storeKey) || "[]");
      
      // Validação anti-duplicidade de presença local
      if (action === "rsvp") {
        const normalize = (t) => String(t || "").toLowerCase().trim();
        const target = normalize(payload.name);
        const already = existing.some((item) => normalize(item.name) === target);
        
        if (already) {
          return {
            success: false,
            alreadyConfirmed: true,
            message: `Oi ${payload.name}! Você já confirmou sua presença anteriormente. Estamos te esperando com muito amor!`
          };
        }
      }

      existing.push({ ...payload, timestamp: new Date().toISOString() });
      localStorage.setItem(storeKey, JSON.stringify(existing));
    } catch (e) {}

    return {
      success: true,
      alreadyConfirmed: false,
      message: action === "rsvp" ? "Presença confirmada com sucesso!" : "Registrado com sucesso na planilha!"
    };
  }

  // Ações Específicas
  static async submitRsvp({ name, message }) {
    UserManager.setName(name);
    return await this.sendData({
      action: "rsvp",
      name: name,
      message: message
    });
  }

  static async submitPixGift({ name, giftTitle, amount }) {
    if (name) UserManager.setName(name);
    return await this.sendData({
      action: "pix_gift",
      name: name || UserManager.getName() || "Anônimo",
      giftTitle: giftTitle,
      amount: amount
    });
  }

  static async submitPhysicalGift({ name, giftTitle, message }) {
    if (name) UserManager.setName(name);
    return await this.sendData({
      action: "physical_gift",
      name: name,
      giftTitle: giftTitle,
      message: message
    });
  }

  static async submitGuestbookNote({ name, message }) {
    if (name) UserManager.setName(name);
    return await this.sendData({
      action: "guestbook",
      name: name,
      message: message
    });
  }
}

/**
 * Controlador da Janela Modal de Confirmação de Presença (RSVP)
 */
class RsvpModalManager {
  constructor() {
    this.modal = document.getElementById("rsvpModal");
    this.form = document.getElementById("rsvpForm");
    this.nameInput = document.getElementById("rsvpGuestName");
    this.messageInput = document.getElementById("rsvpGuestMessage");
    this.submitBtn = document.getElementById("rsvpSubmitBtn");
    this.alertBox = document.getElementById("rsvpAlertBox");

    this.init();
  }

  init() {
    if (!this.modal) return;

    // Conecta botões que abrem a confirmação de presença
    const openBtns = document.querySelectorAll("#headerRsvpBtn, #rsvpEventBtn, [data-open-rsvp]");
    openBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        this.open();
      });
    });

    // Fechar modal
    const closeBtns = this.modal.querySelectorAll("[data-close-modal]");
    closeBtns.forEach((btn) => btn.addEventListener("click", () => this.close()));
    this.modal.addEventListener("click", (e) => {
      if (e.target === this.modal) this.close();
    });

    // Submissão do formulário
    if (this.form) {
      this.form.addEventListener("submit", (e) => this.handleSubmit(e));
    }
  }

  open() {
    if (!this.modal) return;

    // Limpa alertas anteriores
    if (this.alertBox) {
      this.alertBox.style.display = "none";
      this.alertBox.innerHTML = "";
    }

    // Preenche com o nome memorizado
    const savedName = UserManager.getName();
    if (this.nameInput && savedName) {
      this.nameInput.value = savedName;
    }

    // Mensagem padrão configurada
    if (this.messageInput && !this.messageInput.value) {
      const defMsg = window.SITE_CONFIG?.evento?.rsvpMensagem || 
        "Oi Millena! Confirmo minha presença com muita alegria no seu aniversário de 40 anos no Espaço WM Prime!";
      this.messageInput.value = defMsg;
    }

    // Se já tiver confirmado antes no dispositivo, avisa logo de início com carinho
    if (UserManager.isRsvpConfirmed() && savedName && this.alertBox) {
      this.alertBox.className = "rsvp-alert-box info";
      this.alertBox.innerHTML = `<strong>Você já confirmou sua presença!</strong><br>Estamos muito felizes em celebrar juntos, ${savedName}! Caso queira atualizar sua mensagem, basta enviar novamente.`;
      this.alertBox.style.display = "block";
    }

    this.modal.classList.add("active");
    document.body.classList.add("modal-open");
    if (this.nameInput && !this.nameInput.value) {
      setTimeout(() => this.nameInput.focus(), 150);
    }
  }

  close() {
    if (!this.modal) return;
    this.modal.classList.remove("active");
    document.body.classList.remove("modal-open");
  }

  async handleSubmit(e) {
    e.preventDefault();
    if (!this.nameInput || !this.submitBtn) return;

    const name = this.nameInput.value.trim();
    const message = this.messageInput ? this.messageInput.value.trim() : "";

    if (!name) {
      this.showAlert("Por favor, informe seu nome.", "error");
      this.nameInput.focus();
      return;
    }

    // Estado de carregamento do botão
    const originalText = this.submitBtn.innerHTML;
    this.submitBtn.disabled = true;
    this.submitBtn.innerHTML = `<span>Verificando e confirmando...</span>`;

    try {
      const response = await SheetsService.submitRsvp({ name, message });

      if (response.alreadyConfirmed) {
        // CONVIDADO JÁ ESTÁ NA PLANILHA
        UserManager.setRsvpConfirmed(true);
        this.showAlert(
          `<strong>Presença Já Confirmada!</strong><br>${response.message || 'Seu nome já está na lista oficial de convidados da Millena. Te esperamos lá!'}`,
          "warning"
        );
        this.submitBtn.disabled = false;
        this.submitBtn.innerHTML = `<span>Presença Já Confirmada</span>`;
        return;
      }

      if (response.success) {
        // SUCESSO: PRESENÇA CONFIRMADA PELA PRIMEIRA VEZ
        UserManager.setRsvpConfirmed(true);
        this.showAlert(
          `<strong>Presença Confirmada com Sucesso!</strong><br>Obrigado, ${name}! Seu lugar na comemoração está mais que garantido!`,
          "success"
        );

        this.submitBtn.innerHTML = `<span>Presença Confirmada!</span>`;
        
        // Dispara toast global
        const toast = document.getElementById("toastNotification");
        if (toast) {
          toast.textContent = `Presença de ${name} confirmada com sucesso!`;
          toast.classList.add("show");
          setTimeout(() => toast.classList.remove("show"), 4000);
        }

        setTimeout(() => {
          this.close();
          this.submitBtn.disabled = false;
          this.submitBtn.innerHTML = originalText;
        }, 2200);

      } else {
        this.showAlert(response.message || "Não foi possível confirmar no momento. Tente novamente.", "error");
        this.submitBtn.disabled = false;
        this.submitBtn.innerHTML = originalText;
      }

    } catch (err) {
      console.error("Erro ao confirmar presença:", err);
      this.showAlert("Ocorreu um erro ao conectar à planilha. Mas gravamos localmente!", "info");
      this.submitBtn.disabled = false;
      this.submitBtn.innerHTML = originalText;
    }
  }

  showAlert(htmlText, type = "info") {
    if (!this.alertBox) return;
    this.alertBox.className = `rsvp-alert-box ${type}`;
    this.alertBox.innerHTML = htmlText;
    this.alertBox.style.display = "block";
  }
}

// Expõe globalmente
window.UserManager = UserManager;
window.SheetsService = SheetsService;
window.RsvpModalManager = RsvpModalManager;

