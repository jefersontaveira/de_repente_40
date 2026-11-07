/**
 * ====================================================================
 * DE REPENTE 40! — PONTO DE ENTRADA PRINCIPAL & INTEGRAÇÕES
 * ====================================================================
 */

document.addEventListener("DOMContentLoaded", () => {
  console.log("🌸 De Repente 40! — Inicializando experiência imersiva...");

  // 1. Inicializa o gerenciador de presentes primeiro (garante renderização imediata do catálogo)
  try {
    const giftManager = new GiftManager();
    window.giftManagerInstance = giftManager;
    console.log("✅ Catálogo de presentes carregado.");
  } catch (err) {
    console.error("Erro ao carregar presentes:", err);
  }

  // 2. Inicializa o sistema de RSVP e sincronização de usuário
  try {
    if (typeof UserManager !== "undefined") {
      UserManager.bindInputs();
    }
    if (typeof RsvpModalManager !== "undefined") {
      window.rsvpModalManagerInstance = new RsvpModalManager();
    }
    console.log("✅ Sistema RSVP e memória de usuário inicializados.");
  } catch (err) {
    console.error("Erro ao inicializar RSVP:", err);
  }

  // 3. Inicializa as animações, canvas e interações
  try {
    const animations = new SiteAnimations();
    window.siteAnimationsInstance = animations;
    console.log("✅ Animações e canvas carregados.");
  } catch (err) {
    console.error("Erro ao carregar animações:", err);
  }

  // 4. Configura botões de links e integração com calendário
  try {
    setupDynamicLinks();
    setupCalendarIntegration();
    console.log("✅ Links dinâmicos configurados.");
  } catch (err) {
    console.error("Erro ao configurar links:", err);
  }
});

function setupDynamicLinks() {
  const cfg = window.SITE_CONFIG;
  if (!cfg) return;

  // Botões de Confirmação de Presença acionam o modal oficial (sem WhatsApp)
  const rsvpBtn = document.getElementById("rsvpEventBtn") || document.getElementById("rsvpWhatsAppBtn");
  if (rsvpBtn) {
    rsvpBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (window.rsvpModalManagerInstance) {
        window.rsvpModalManagerInstance.open();
      }
    });
  }

  // Links de Localização
  const mapsBtn = document.getElementById("openMapsBtn");
  if (mapsBtn && cfg.evento.googleMapsUrl) {
    mapsBtn.href = cfg.evento.googleMapsUrl;
  }

  const wazeBtn = document.getElementById("openWazeBtn");
  if (wazeBtn && cfg.evento.wazeUrl) {
    wazeBtn.href = cfg.evento.wazeUrl;
  }
}

function setupCalendarIntegration() {
  const gcalBtn = document.getElementById("addToGCalBtn");
  const icalBtn = document.getElementById("addToICalBtn");

  const title = "De Repente 40! — Aniversário da Millena (Feijoada & Pagode)";
  const description = "Comemoração especial de 40 anos da Millena com deliciosa Feijoada e muito Pagode no Espaço WM Prime!";
  const location = "Espaço WM Prime";
  
  // 03 de Abril de 2027 das 13:00 às 20:00 (ou ano configurado)
  const startDate = "20270403T160000Z"; // UTC (13h BRT = 16h UTC)
  const endDate = "20270403T230000Z";

  // Google Calendar URL
  if (gcalBtn) {
    const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startDate}/${endDate}&details=${encodeURIComponent(description)}&location=${encodeURIComponent(location)}`;
    gcalBtn.href = gcalUrl;
  }

  // Download do arquivo iCal (.ics) para iPhone / Apple Calendar / Outlook
  if (icalBtn) {
    icalBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const icsContent = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//De Repente 40//Millena//PT",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
        "BEGIN:VEVENT",
        `SUMMARY:${title}`,
        `DESCRIPTION:${description}`,
        `LOCATION:${location}`,
        `DTSTART:${startDate}`,
        `DTEND:${endDate}`,
        "STATUS:CONFIRMED",
        "END:VEVENT",
        "END:VCALENDAR"
      ].join("\r\n");

      const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.setAttribute("download", "de_repente_40_millena.ics");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }
}

