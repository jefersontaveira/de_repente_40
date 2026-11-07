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
 * COMO USAR: Veja o passo a passo completo no chat ou no arquivo README.
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    var rawData = e.postData ? e.postData.contents : null;
    var data = {};

    if (rawData) {
      try {
        data = JSON.parse(rawData);
      } catch (err) {
        data = e.parameter || {};
      }
    } else {
      data = e.parameter || {};
    }

    var action = data.action || "rsvp";
    var ss = SpreadsheetApp.getActiveSpreadsheet();
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

function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : "ping";

  if (action === "check_rsvp") {
    var resp = handleCheckRsvp(ss, e.parameter);
    return ContentService.createTextOutput(JSON.stringify(resp))
      .setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService.createTextOutput(JSON.stringify({
    status: "online",
    message: "Google Apps Script para 'De Repente 40!' está ativo e pronto!"
  })).setMimeType(ContentService.MimeType.JSON);
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
      message: "Oi " + nome + "! Você já confirmou sua presença anteriormente. Estamos te esperando com muito amor! 🎉✨"
    };
  }

  // Adiciona a nova presença confirmada
  var dataHora = Utilities.formatDate(new Date(), "America/Fortaleza", "dd/MM/yyyy HH:mm:ss");
  sheet.appendRow([dataHora, nome, mensagem, "Confirmado"]);

  return {
    success: true,
    alreadyConfirmed: false,
    message: "Presença confirmada com sucesso, " + nome + "! Te esperamos na festa! 🎉💖"
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

