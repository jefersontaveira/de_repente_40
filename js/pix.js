/**
 * ====================================================================
 * DE REPENTE 40! — GERADOR DE PAYLOAD PIX (PADRÃO BANCO CENTRAL EMVCo)
 * ====================================================================
 * Implementação 100% Client-Side do padrão EMVCo BR Code com cálculo
 * do CRC16-CCITT (polinômio 0x1021, valor inicial 0xFFFF).
 * Gratuito, sem intermediários, sem taxas e sem dependência de backend.
 */

class PixEngine {
  /**
   * Remove acentos e caracteres especiais para compatibilidade com os bancos
   * @param {string} text 
   * @returns {string}
   */
  static sanitizeText(text) {
    if (!text) return "";
    return text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9\s-_.]/g, "")
      .trim();
  }

  /**
   * Formata campo TLV (Tag, Length, Value)
   * @param {string} id - 2 dígitos
   * @param {string} value - Conteúdo
   * @returns {string}
   */
  static formatTLV(id, value) {
    if (value === undefined || value === null || value === "") return "";
    const strValue = String(value);
    const length = strValue.length.toString().padStart(2, "0");
    return `${id}${length}${strValue}`;
  }

  /**
   * Calcula o Checksum CRC16-CCITT (0x1021) conforme especificação do Bacen
   * @param {string} payload - String completa terminada com '6304'
   * @returns {string} 4 caracteres hexadecimais em maiúsculo
   */
  static calculateCRC16(payload) {
    let crc = 0xFFFF;
    const polynomial = 0x1021;

    for (let i = 0; i < payload.length; i++) {
      const code = payload.charCodeAt(i);
      crc ^= (code << 8);

      for (let bit = 0; bit < 8; bit++) {
        if ((crc & 0x8000) !== 0) {
          crc = ((crc << 1) ^ polynomial) & 0xFFFF;
        } else {
          crc = (crc << 1) & 0xFFFF;
        }
      }
    }

    return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, "0");
  }

  /**
   * Gera o código PIX Copia e Cola completo
   * @param {Object} params
   * @param {string} params.chave - Chave PIX (CPF, E-mail, Celular ou EVP)
   * @param {string} params.nome - Nome do recebedor (máx 25 chars)
   * @param {string} params.cidade - Cidade do recebedor (máx 15 chars)
   * @param {number} [params.valor] - Valor opcional em reais (ex: 65.00)
   * @param {string} [params.txId] - Identificador da transação (máx 25 chars)
   * @param {string} [params.descricao] - Descrição opcional (máx 40 chars)
   * @returns {string} Payload PIX oficial
   */
  static generatePayload({ chave, nome, cidade, valor, txId, descricao }) {
    if (!chave) throw new Error("Chave PIX obrigatória.");

    const cleanNome = this.sanitizeText(nome || "MILLENA").substring(0, 25).toUpperCase();
    const cleanCidade = this.sanitizeText(cidade || "SAO PAULO").substring(0, 15).toUpperCase();
    const cleanTxId = this.sanitizeText(txId || "***").replace(/\s/g, "").substring(0, 25) || "***";

    // 00: Payload Format Indicator
    let payload = this.formatTLV("00", "01");

    // 26: Merchant Account Information
    let merchantAccount = this.formatTLV("00", "br.gov.bcb.pix");
    merchantAccount += this.formatTLV("01", chave.trim());
    if (descricao) {
      const cleanDesc = this.sanitizeText(descricao).substring(0, 40);
      if (cleanDesc) {
        merchantAccount += this.formatTLV("02", cleanDesc);
      }
    }
    payload += this.formatTLV("26", merchantAccount);

    // 52: Merchant Category Code
    payload += this.formatTLV("52", "0000");

    // 53: Transaction Currency (986 = BRL)
    payload += this.formatTLV("53", "986");

    // 54: Transaction Amount (se houver valor > 0)
    if (valor !== undefined && valor !== null && Number(valor) > 0) {
      const valorStr = Number(valor).toFixed(2);
      payload += this.formatTLV("54", valorStr);
    }

    // 58: Country Code (BR)
    payload += this.formatTLV("58", "BR");

    // 59: Merchant Name
    payload += this.formatTLV("59", cleanNome);

    // 60: Merchant City
    payload += this.formatTLV("60", cleanCidade);

    // 62: Additional Data Field Template (TxID)
    const additionalData = this.formatTLV("05", cleanTxId);
    payload += this.formatTLV("62", additionalData);

    // 63: CRC16 (Tag 63, tamanho 04)
    payload += "6304";
    const crc = this.calculateCRC16(payload);

    return `${payload}${crc}`;
  }

  /**
   * Copia o texto para a área de transferência com suporte robusto
   * @param {string} text 
   * @returns {Promise<boolean>}
   */
  static async copyToClipboard(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (e) {
      console.warn("Clipboard API falhou, tentando fallback...", e);
    }

    // Fallback tradicional usando elemento de texto temporário
    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.left = "-999999px";
      textarea.style.top = "-999999px";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const successful = document.execCommand("copy");
      document.body.removeChild(textarea);
      return successful;
    } catch (err) {
      console.error("Erro ao copiar código PIX:", err);
      return false;
    }
  }
}

// Exporta para o escopo global
window.PixEngine = PixEngine;

