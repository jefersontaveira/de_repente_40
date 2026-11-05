/**
 * ====================================================================
 * DE REPENTE 40! — CONFIGURAÇÃO PRINCIPAL DO EVENTO & LISTA DE PRESENTES
 * ====================================================================
 * Altere as informações abaixo para personalizar o site rapidamente.
 */

const SITE_CONFIG = {
  // Informações da Aniversariante e Evento
  aniversariante: {
    nome: "Millena",
    apelido: "Milleninha",
    idade: 40,
    tema: "De Repente 40!",
    subtitulo: "E que venha essa nova fase com muita alegria, saúde e bons amigos!",
    cardapio: "Feijoada e muito Pagode!",
    slogan: "Você não pode faltar!"
  },

  evento: {
    dataTexto: "03/04",
    horarioTexto: "13h",
    localNome: "Espaço WM Prime",
    localEndereco: "Espaço WM Prime",
    dataContador: new Date(2027, 3, 3, 13, 0, 0),
    googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Espa%C3%A7o+WM+Prime",
    wazeUrl: "https://waze.com/ul?q=Espaço%20WM%20Prime",
    rsvpMensagem: "Oi Millena! Confirmo minha presença com muita alegria no seu aniversário de 40 anos no Espaço WM Prime! 🎉✨"
  },

  // Dados para Pagamento e Confirmação via PIX (100% Gratuito - Padrão Banco Central EMVCo)
  pix: {
    chave: "millena40anos@pix.com.br",
    nomeTitular: "MILLENA SILVA",
    cidadeTitular: "SAO PAULO",
    txIdPadrao: "NIVER40"
  },

  // Contato de WhatsApp da Aniversariante para receber recados e comprovantes
  whatsapp: {
    numero: "5511999998888",
    mensagemPadraoPix: (nomePresente, valor) => 
      `Oi Millena! 🎉 Acabei de presentear você com "${nomePresente}" no valor de R$ ${valor.toFixed(2).replace('.', ',')} via PIX para comemorar seus 40 anos! Segue o comprovante em anexo. Que seu novo ciclo seja radiante e repleto de bênçãos! ❤️✨`,
    mensagemPadraoFisico: (nomePresente, nomeConvidado, recado) =>
      `Oi Millena! 🎁 Escolhi te levar de presente o item "${nomePresente}" para a sua festa de 40 anos! ${recado ? `"${recado}"` : ''} Com carinho, ${nomeConvidado || 'Seu Convidado'}. Mal posso esperar pela Feijoada e pelo Pagode! 🥁✨`
  },

  // Categorias da Lista de Presentes
  categorias: [
    { id: "todas", label: "Todos os Presentes" },
    { id: "drinks", label: "Brindes & Chopp 🥂" },
    { id: "experiencias", label: "Experiências & Bem-Estar 💆‍♀️" },
    { id: "casa", label: "Casa & Estilo 🏡" },
    { id: "cotas", label: "Cotas Livres & Mimos 💖" }
  ],

  // Catálogo Completo e Recheado de Presentes
  presentes: [
    {
      id: "cota-livre",
      titulo: "Mimo do Coração (Cota Livre)",
      categoria: "cotas",
      valor: 0,
      isLivre: true,
      destaque: true,
      imagem: "assets/images/gifts/cota_livre.svg",
      descricao: "Você escolhe o valor que cabe no seu bolso com todo o carinho para celebrar essa data tão especial!",
      dicaFisico: "Qualquer valor e carinho faz a aniversariante sorrir à toa!"
    },
    {
      id: "rodada-chopp",
      titulo: "Rodada de Chopp Geladinho",
      categoria: "drinks",
      valor: 45.00,
      imagem: "assets/images/gifts/cerveja.svg",
      descricao: "Um chopp bem gelado com colarinho cremoso para brindar a alegria de estarmos juntos!",
      dicaFisico: "Para brindar muito durante o pagode!"
    },
    {
      id: "balde-cerveja",
      titulo: "Balde de Cerveja Artesanal",
      categoria: "drinks",
      valor: 75.00,
      imagem: "assets/images/gifts/cerveja.svg",
      descricao: "Cervejinhas selecionadas no gelo para abastecer a mesa e curtir o samba com energia.",
      dicaFisico: "Cervejas IPA, Puro Malte ou artesanais favoritas da aniversariante."
    },
    {
      id: "taca-gin",
      titulo: "Gin Tônica com Especiarias",
      categoria: "drinks",
      valor: 85.00,
      imagem: "assets/images/gifts/gin.svg",
      descricao: "Um drink sofisticado, refrescante com botânicos e zests cítricos para comemorar os 40.",
      dicaFisico: "Taça personalizada ou garrafa de Gin especial."
    },
    {
      id: "espumante-comemoracao",
      titulo: "Garrafa de Espumante para o Brinde",
      categoria: "drinks",
      valor: 130.00,
      imagem: "assets/images/gifts/espumante.svg",
      descricao: "Muitas borbulhas na taça para o grande momento dos parabéns e fotos inesquecíveis!",
      dicaFisico: "Espumante Brut ou Moscatel para o brinde oficial."
    },
    {
      id: "spa-relax",
      titulo: "Dia de Spa & Massagem Relaxante",
      categoria: "experiencias",
      valor: 180.00,
      imagem: "assets/images/gifts/spa.svg",
      descricao: "Um momento de puro autocuidado, massagem e renovação para iniciar os 40 revigorada.",
      dicaFisico: "Voucher de Spa ou kit com óleos essenciais e toalhas nobres."
    },
    {
      id: "salao-beleza",
      titulo: "Produção Especial de Beleza",
      categoria: "experiencias",
      valor: 150.00,
      imagem: "assets/images/gifts/beleza.svg",
      descricao: "Cabelo, unhas e make profissional para se sentir ainda mais linda e empoderada.",
      dicaFisico: "Voucher do salão de beleza preferido."
    },
    {
      id: "jantar-comemorativo",
      titulo: "Jantar Romântico / Gastronômico",
      categoria: "experiencias",
      valor: 220.00,
      imagem: "assets/images/gifts/jantar.svg",
      descricao: "Uma noite especial em um restaurante delicioso com pratos incríveis e bom vinho.",
      dicaFisico: "Convite para jantar especial."
    },
    {
      id: "difusor-aromas",
      titulo: "Difusor de Aromas & Óleos Nobres",
      categoria: "casa",
      valor: 95.00,
      imagem: "assets/images/gifts/difusor.svg",
      descricao: "Para deixar o cantinho da casa perfumado com notas de lavanda, baunilha e aconchego.",
      dicaFisico: "Aromatizador com varetas nobres ou difusor elétrico."
    },
    {
      id: "vela-artesanal",
      titulo: "Kit de Velas Aromáticas & Bandeja",
      categoria: "casa",
      valor: 110.00,
      imagem: "assets/images/gifts/vela.svg",
      descricao: "Velas de cera vegetal vegetal que iluminam o ambiente e trazem calma e paz.",
      dicaFisico: "Velas aromáticas com aromas de capim-limão ou flor de laranjeira."
    },
    {
      id: "acessorio-elegante",
      titulo: "Semijoia Delicada & Charmosa",
      categoria: "casa",
      valor: 140.00,
      imagem: "assets/images/gifts/joia.svg",
      descricao: "Um colar, brinco ou pulseira com banho dourado para marcar essa data especial.",
      dicaFisico: "Semijoia dourada antialérgica com design atemporal."
    },
    {
      id: "cota-viagem",
      titulo: "Cota para a Viagem dos Sonhos",
      categoria: "cotas",
      valor: 250.00,
      imagem: "assets/images/gifts/viagem.svg",
      descricao: "Uma contribuição para colecionar carimbos no passaporte e viver momentos únicos!",
      dicaFisico: "Cota para apoiar novas aventuras pelo mundo."
    },
    {
      id: "cota-pagode",
      titulo: "Cota do Pagode & Pandeiro",
      categoria: "cotas",
      valor: 60.00,
      imagem: "assets/images/gifts/pagode.svg",
      descricao: "Para garantir que o cavaquinho e o tantan continuem tocando os maiores sucessos!",
      dicaFisico: "Para ajudar a manter o samba e a alegria da festa!"
    }
  ]
};

window.SITE_CONFIG = SITE_CONFIG;
