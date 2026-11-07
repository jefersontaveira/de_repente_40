/**
 * ====================================================================
 * DE REPENTE 40! — GOOGLE APPS SCRIPT (BACKEND DA PLANILHA)
 * ====================================================================
 * 
 * Este código conecta o site do aniversário de 40 anos da Millena à sua
 * Planilha Google Sheets para gerenciar automaticamente:
 * 1. Presenças Confirmadas (com validação anti-duplicidade)
 * 2. Presentes via PIX (com valor e campo para Millena conferir)
 * 3. Presentes Físicos (com nome de quem reservou)
 * 4. Cópia dos Recados do Mural
 * 
 * RECURSO AUTOMÁTICO:
 * Se o script não estiver vinculado a uma planilha existente, ele CRIA
 * AUTOMATICAMENTE uma nova planilha chamada:
 * "De Repente 40! — Aniversário da Millena (Respostas)"
 * diretamente no seu Google Drive!
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    var rawData = (e && e.postData) ? e.postData.contents : null;
    var data = {};

    if (rawData) {
      try {
        data = JSON.parse(rawData);
      } catch (err) {
        data = (e && e.parameter) ? e.parameter : {};
      }
    } else if (e && e.parameter) {
      data = e.parameter;
    }

    var action = data.action || "rsvp";
    var ss = getSpreadsheet();
    var response = { success: true };

    if (action === "check_rsvp") {
      response = handleCheckRsvp(ss, data);
    } else if (action === "rsvp") {
      response = handleRsvp(ss, data);
    } else if (action === "pix_gift") {
      response = handlePixGift(ss, data);
    } else if (action === "physical_gift") {
      response = handlePhysicalGift(ss, data);
    } else if (action === "guestbook") {
      response = handleGuestbook(ss, data);
    } else {
      response = { success: false, message: "Ação não reconhecida: " + action };
    }

    response.planilhaUrl = ss.getUrl();

    return ContentService.createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

/**
 * Ao abrir a URL do script no navegador, exibe um painel visual com o link direto da planilha!
 */
function doGet(e) {
  try {
    var ss = getSpreadsheet();
    var sheetUrl = ss.getUrl();
    var sheetName = ss.getName();

    // Se a requisição pedir explicitamente JSON
    if (e && e.parameter && e.parameter.format === "json") {
      return ContentService.createTextOutput(JSON.stringify({
        status: "online",
        planilhaNome: sheetName,
        planilhaUrl: sheetUrl
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // Página visual elegante com o botão para abrir a planilha em 1 clique
    var html = '<!DOCTYPE html>' +
      '<html><head><meta charset="utf-8">' +
      '<meta name="viewport" content="width=device-width, initial-scale=1">' +
      '<title>Planilha de Respostas — De Repente 40!</title>' +
      '<style>' +
      'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #FDF3E7; color: #4A1A0A; padding: 1.5rem; box-sizing: border-box; }' +
      '.card { background: #FFFFFF; padding: 2.5rem 2rem; border-radius: 20px; border: 2px solid #C84B1C; text-align: center; max-width: 520px; width: 100%; box-shadow: 0 15px 40px rgba(74,26,10,0.12); }' +
      'h1 { font-size: 1.8rem; margin: 0 0 0.5rem; color: #C84B1C; }' +
      'p { margin: 0 0 2rem; color: #6D4C41; font-size: 1.05rem; line-height: 1.5; }' +
      '.btn { display: inline-block; background: #C84B1C; color: #FFFFFF; padding: 1.1rem 2.2rem; border-radius: 50px; text-decoration: none; font-weight: 700; font-size: 1.15rem; box-shadow: 0 6px 20px rgba(200,75,28,0.35); transition: background 0.2s, transform 0.2s; }' +
      '.btn:hover { background: #A03610; transform: translateY(-2px); }' +
      '.info-box { margin-top: 2rem; padding: 1rem; background: #FBF7F2; border-radius: 12px; font-size: 0.9rem; color: #5C220E; text-align: left; }' +
      '.info-box strong { color: #C84B1C; }' +
      '</style></head><body>' +
      '<div class="card">' +
      '<h1>De Repente 40!</h1>' +
      '<p>O sistema do aniversário da Millena está conectado e funcionando perfeitamente!</p>' +
      '<a class="btn" href="' + sheetUrl + '" target="_blank">👉 Abrir Planilha Google</a>' +
      '<div class="info-box">' +
      '<div>📄 <strong>Arquivo:</strong> ' + sheetName + '</div>' +
      '<div style="margin-top:0.4rem;">💡 As abas <em>Presencas</em>, <em>Presentes_PIX</em>, <em>Presentes_Fisicos</em> e <em>Mural_Recados</em> são criadas automaticamente conforme os envios no site.</div>' +
      '</div>' +
      '</div></body></html>';

    return HtmlService.createHtmlOutput(html)
      .setTitle("Planilha - De Repente 40!")
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// --------------------------------------------------------------------
// LOCALIZA OU CRIA AUTOMATICAMENTE A PLANILHA NO SEU GOOGLE DRIVE
// --------------------------------------------------------------------
function getSpreadsheet() {
  // 1. Tenta obter a planilha vinculada (se o script foi aberto em Extensões > Apps Script)
  try {
    var activeSs = SpreadsheetApp.getActiveSpreadsheet();
    if (activeSs) return activeSs;
  } catch (e) {}

  // 2. Se for um script autônomo, verifica se já criamos e salvamos o ID dela anteriormente
  var props = PropertiesService.getScriptProperties();
  var savedId = props.getProperty("DR40_SPREADSHEET_ID");
  if (savedId) {
    try {
      return SpreadsheetApp.openById(savedId);
    } catch (e) {}
  }

  // 3. Se ainda não existir nenhuma planilha, CRIA AUTOMATICAMENTE no Google Drive do usuário!
  var newSs = SpreadsheetApp.create("De Repente 40! — Aniversário da Millena (Respostas)");
  props.setProperty("DR40_SPREADSHEET_ID", newSs.getId());
  return newSs;
}

// --------------------------------------------------------------------
// 1. CONFIRMAÇÃO DE PRESENÇA (com verificação se o nome já existe)
// --------------------------------------------------------------------
function handleRsvp(ss, data) {
  var sheet = getOrCreateSheet(ss, "Presencas", [
    "Data / Hora", "Nome do Convidado", "Mensagem de Confirmação", "Status"
  ]);

  var nome = String(data.name || "").trim();
  var mensagem = String(data.message || "").trim();

  if (!nome) {
    return { success: false, message: "Por favor, informe seu nome." };
  }

  // Verifica se o convidado já confirmou antes
  if (isNameAlreadyRegistered(sheet, nome)) {
    return {
      success: false,
      alreadyConfirmed: true,
      message: "Oi " + nome + "! Você já confirmou sua presença anteriormente. Estamos te esperando com muito amor!"
    };
  }

  // Adiciona a nova presença confirmada
  var dataHora = Utilities.formatDate(new Date(), "America/Fortaleza", "dd/MM/yyyy HH:mm:ss");
  sheet.appendRow([dataHora, nome, mensagem, "Confirmado"]);

  return {
    success: true,
    alreadyConfirmed: false,
    message: "Presença confirmada com sucesso, " + nome + "! Te esperamos na festa! 🎉"
  };
}

function handleCheckRsvp(ss, data) {
  var sheet = getOrCreateSheet(ss, "Presencas", [
    "Data / Hora", "Nome do Convidado", "Mensagem de Confirmação", "Status"
  ]);

  var nome = String(data.name || "").trim();
  if (!nome) return { exists: false };

  var exists = isNameAlreadyRegistered(sheet, nome);
  return {
    exists: exists,
    message: exists ? "Presença já confirmada anteriormente!" : "Ainda não confirmou."
  };
}

// --------------------------------------------------------------------
// 2. REGISTRO DE PRESENTES VIA PIX
// --------------------------------------------------------------------
function handlePixGift(ss, data) {
  var sheet = getOrCreateSheet(ss, "Presentes_PIX", [
    "Data / Hora", "Nome do Convidado", "Presente Escolhido", "Valor (R$)", "Status", "Recebido na Conta? (Sim/Não)"
  ]);

  var nome = String(data.name || "Anônimo / Não informado").trim();
  var presente = String(data.giftTitle || "Cota Livre").trim();
  var valor = Number(data.amount || 0);
  var dataHora = Utilities.formatDate(new Date(), "America/Fortaleza", "dd/MM/yyyy HH:mm:ss");

  sheet.appendRow([
    dataHora,
    nome,
    presente,
    valor,
    "Pendente de Conferência",
    "Não conferido ainda"
  ]);

  return {
    success: true,
    message: "Registro do PIX gravado com sucesso! Muito obrigado pelo presente! 💖"
  };
}

// --------------------------------------------------------------------
// 3. REGISTRO DE PRESENTES FÍSICOS
// --------------------------------------------------------------------
function handlePhysicalGift(ss, data) {
  var sheet = getOrCreateSheet(ss, "Presentes_Fisicos", [
    "Data / Hora", "Nome do Convidado", "Presente Escolhido", "Recado / Observação", "Status"
  ]);

  var nome = String(data.name || "").trim();
  var presente = String(data.giftTitle || "").trim();
  var recado = String(data.message || "").trim();
  var dataHora = Utilities.formatDate(new Date(), "America/Fortaleza", "dd/MM/yyyy HH:mm:ss");

  sheet.appendRow([
    dataHora,
    nome,
    presente,
    recado,
    "Reservado para entregar na festa"
  ]);

  return {
    success: true,
    message: "Presente físico reservado com sucesso! 🎁"
  };
}

// --------------------------------------------------------------------
// 4. REGISTRO DE RECADOS DO MURAL
// --------------------------------------------------------------------
function handleGuestbook(ss, data) {
  var sheet = getOrCreateSheet(ss, "Mural_Recados", [
    "Data / Hora", "Nome do Autor", "Recado Carinhoso"
  ]);

  var nome = String(data.name || "").trim();
  var recado = String(data.message || "").trim();
  var dataHora = Utilities.formatDate(new Date(), "America/Fortaleza", "dd/MM/yyyy HH:mm:ss");

  sheet.appendRow([dataHora, nome, recado]);

  return {
    success: true,
    message: "Recadinho gravado no mural da planilha! 💌"
  };
}

// --------------------------------------------------------------------
// FUNÇÕES AUXILIARES: FORMATAÇÃO E VERIFICAÇÃO DE DUPLICIDADE
// --------------------------------------------------------------------
function normalizeText(text) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function isNameAlreadyRegistered(sheet, name) {
  var target = normalizeText(name);
  if (!target) return false;

  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return false; // Apenas cabeçalho

  var names = sheet.getRange(2, 2, lastRow - 1, 1).getValues();
  for (var i = 0; i < names.length; i++) {
    var rowName = normalizeText(names[i][0]);
    if (rowName === target) {
      return true;
    }
  }
  return false;
}

function getOrCreateSheet(ss, sheetName, headers) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(headers);

    // Formatação visual elegante dos cabeçalhos na planilha
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground("#C84B1C"); // Terracota da identidade visual
    headerRange.setFontColor("#FFFFFF");
    headerRange.setFontWeight("bold");
    headerRange.setHorizontalAlignment("center");
    sheet.setFrozenRows(1);

    for (var col = 1; col <= headers.length; col++) {
      sheet.setColumnWidth(col, 220);
    }
  }
  return sheet;
}
