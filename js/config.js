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
    chave: "+5585981311975",
    nomeTitular: "JEFERSON BORGES TAVEIRA",
    cidadeTitular: "FORTALEZA",
    txIdPadrao: "NIVER40"
  },

  // Contato de WhatsApp da Aniversariante para receber recados e comprovantes
  whatsapp: {
    numero: "5585981311975",
    mensagemPadraoPix: (nomePresente, valor) =>
      `Oi Millena! 🎉 Acabei de presentear você com "${nomePresente}" no valor de R$ ${valor.toFixed(2).replace('.', ',')} via PIX para comemorar seus 40 anos! Segue o comprovante em anexo. Que seu novo ciclo seja radiante e repleto de bênçãos! ❤️✨`,
    mensagemPadraoFisico: (nomePresente, nomeConvidado, recado) =>
      `Oi Millena! 🎁 Escolhi te levar de presente o item "${nomePresente}" para a sua festa de 40 anos! ${recado ? `"${recado}"` : ''} Com carinho, ${nomeConvidado || 'Seu Convidado'}. Mal posso esperar pela Feijoada e pelo Pagode! 🥁✨`
  },

  // Categorias da Lista de Presentes
  categorias: [
    { id: "todas", label: "Todos os Presentes" },
    { id: "fitness", label: "Fitness & Treino 🏋️‍♀️" },
    { id: "perfumes", label: "Perfumes & Beleza 🌸" },
    { id: "acessorios", label: "Acessórios & Semijoias ✨" },
    { id: "casa", label: "Casa & Estilo 🏡" },
    { id: "cotas", label: "Cotas Livres & Mimos 💖" }
  ],

  // Catálogo Completo e Personalizado de Presentes da Millena
  presentes: [
    // --- COTAS & MIMOS ---
    {
      id: "cota-livre",
      titulo: "Mimo do Coração (Cota Livre)",
      categoria: "cotas",
      valor: 0,
      isLivre: true,
      destaque: true,
      imagem: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80",
      descricao: "Você escolhe com todo o amor o valor que deseja presentear para celebrar os 40 anos da Millena!",
      dicaFisico: "Qualquer mimo ou carinho faz a aniversariante sorrir à toa!"
    },

    // --- FITNESS & SUPLEMENTOS ---
    {
      id: "whey-protein",
      titulo: "Whey Protein Isolado / Concentrado",
      categoria: "fitness",
      valor: 160.00,
      imagem: "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&w=800&q=80",
      descricao: "Proteína de alto valor biológico para auxiliar na recuperação muscular, energia e rotina de treinos.",
      dicaFisico: "Pote de Whey Protein (sabor Baunilha, Chocolate ou Cookies preferido)."
    },
    {
      id: "creatina-pura",
      titulo: "Creatina Monohidratada 100% Pura",
      categoria: "fitness",
      valor: 95.00,
      imagem: "https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?auto=format&fit=crop&w=800&q=80",
      descricao: "Creatina pura de máxima absorção para força, resistência muscular e excelente desempenho diário.",
      dicaFisico: "Pote de Creatina Monohidratada Creapure ou 100% pura 250g/300g."
    },
    {
      id: "conjunto-fitness",
      titulo: "Conjunto Fitness (Legging & Top)",
      categoria: "fitness",
      valor: 180.00,
      imagem: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80",
      descricao: "Conjunto moderno com tecido de compressão confortável, toque aveludado e caimento perfeito para treinar.",
      dicaFisico: "Conjunto de legging e top esportivo (tamanho M ou cores neutras/terrosas)."
    },
    {
      id: "tenis-treino",
      titulo: "Tênis Esportivo para Academia",
      categoria: "fitness",
      valor: 290.00,
      imagem: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
      descricao: "Amortecimento ideal, leveza e estabilidade para corridas, caminhadas e treinos funcionais.",
      dicaFisico: "Tênis esportivo feminino confortável."
    },

    // --- PERFUMES & BELEZA ---
    {
      id: "perfume-eternal-cherish",
      titulo: "Perfume Eternal Cherish (WePink)",
      categoria: "perfumes",
      valor: 189.00,
      destaque: true,
      imagem: "https://wepink.vtexassets.com/arquivos/ids/164417/WhatsApp-Image-2026-05-16-at-07.51.21--1-.webp",
      descricao: "O perfume queridinho da aniversariante! Floral oriental ambarado com notas marcantes de canela, baunilha e jasmim.",
      dicaFisico: "Desodorante Colônia Eternal Cherish WePink 100ml."
    },
    {
      id: "perfume-importado",
      titulo: "Perfume Importado Sofisticado",
      categoria: "perfumes",
      valor: 340.00,
      imagem: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80",
      descricao: "Fragrância floral marcante e luxuosa, com alta fixação e elegância para ocasiões especiais.",
      dicaFisico: "Perfume Eau de Parfum importado feminino favorito da Millena."
    },
    {
      id: "kit-skincare",
      titulo: "Kit Skincare Facial Hidratação & Glow",
      categoria: "perfumes",
      valor: 140.00,
      imagem: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80",
      descricao: "Cuidados especiais com a pele: sérum antioxidante, ácido hialurônico e hidratação profunda.",
      dicaFisico: "Kit de cuidados faciais e dermocosméticos hidratantes."
    },

    // --- ACESSÓRIOS & SEMIJOIAS ---
    {
      id: "oculos-sol",
      titulo: "Óculos de Sol Elegante",
      categoria: "acessorios",
      valor: 220.00,
      imagem: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80",
      descricao: "Design sofisticado com lentes de proteção UV400, acabamento refinado para arrasar nos dias de sol.",
      dicaFisico: "Óculos de sol feminino modelo tartaruga clássico ou armação dourada."
    },
    {
      id: "colar-ponto-luz",
      titulo: "Colar Ponto de Luz em Zircônia",
      categoria: "acessorios",
      valor: 165.00,
      imagem: "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=800&q=80",
      descricao: "Gargantilha delicada com banho dourado e pingente solitário de zircônia que ilumina o colo com leveza.",
      dicaFisico: "Semijoia dourada antialérgica com design minimalista."
    },
    {
      id: "pulseira-dourada",
      titulo: "Pulseira Feminina Dourada Riviera",
      categoria: "acessorios",
      valor: 145.00,
      imagem: "https://images.unsplash.com/photo-1611591475152-477d6928e4e9?auto=format&fit=crop&w=800&q=80",
      descricao: "Pulseira com elos refinados e brilho sutil para compor mixes elegantes de pulseiras no dia a dia.",
      dicaFisico: "Pulseira com banho em ouro 18k e fecho seguro."
    },
    {
      id: "bracelete-rigido",
      titulo: "Bracelete Rígido Dourado Minimalista",
      categoria: "acessorios",
      valor: 175.00,
      imagem: "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=800&q=80",
      descricao: "Bracelete anatômico moderno em acabamento dourado polido, trazendo poder e sofisticação aos pulsos.",
      dicaFisico: "Bracelete rígido anatômico dourado com acabamento liso."
    },

    // --- ITENS DE CASA ---
    {
      id: "air-fryer",
      titulo: "Fritadeira Elétrica Air Fryer",
      categoria: "casa",
      valor: 350.00,
      imagem: "https://images.unsplash.com/photo-1585672840545-ef9a65c6f663?auto=format&fit=crop&w=800&q=80",
      descricao: "Praticidade total no dia a dia: receitas crocantes e saudáveis sem usar óleo e com limpeza rápida.",
      dicaFisico: "Fritadeira sem óleo Air Fryer digital (voltagem 220V)."
    },
    {
      id: "cafeteira-espresso",
      titulo: "Cafeteira de Cápsulas / Espresso",
      categoria: "casa",
      valor: 390.00,
      imagem: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=800&q=80",
      descricao: "Cafés aromáticos, cremosos e encorpados com a praticidade de um clique para começar o dia bem.",
      dicaFisico: "Cafeteira Nespresso Essenza Mini ou Dolce Gusto (220V)."
    },
    {
      id: "tacas-cristal",
      titulo: "Jogo de Taças de Cristal Nobre",
      categoria: "casa",
      valor: 160.00,
      imagem: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80",
      descricao: "Conjunto de taças com transparência límpida e lapidação fina para receber a família e brindar a vida.",
      dicaFisico: "Jogo com 6 taças de cristal para vinho ou espumante."
    },
    {
      id: "difusor-aromas",
      titulo: "Difusor de Aromas Ultrassônico & LED",
      categoria: "casa",
      valor: 120.00,
      imagem: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80",
      descricao: "Umidifica o ambiente e espalha óleos essenciais relaxantes com iluminação suave para aconchego total.",
      dicaFisico: "Difusor e umidificador ultrassônico acompanhado de óleo essencial."
    }
  ]
};

window.SITE_CONFIG = SITE_CONFIG;
