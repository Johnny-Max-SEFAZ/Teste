import { initializeApp as initAppFirebase } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-analytics.js";
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, addDoc, updateDoc, deleteDoc, onSnapshot, collection, query, where, writeBatch, getDocs } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyATe3-KBCHGUx5jszvjWD-mt1WbbPNPYZ0",
    authDomain: "calendario-de-compras.firebaseapp.com",
    projectId: "calendario-de-compras",
    storageBucket: "calendario-de-compras.firebasestorage.app",
    messagingSenderId: "336879648918",
    appId: "1:336879648918:web:13e7fafda15a8c54e7c2b7",
    measurementId: "G-NBHWMXND3T"
};

const appId = 'calendario-de-compras';
const initialAuthToken = null;

const app = initAppFirebase(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);

const YEAR = "2026";
const MASTER_USER = "vitor.barcelos";
const MASTER_DEFAULT_PASS = "310760";
// DATA DEADLINE: 30/11/2025
const DEADLINE_DATE = new Date('2025-11-30T23:59:59');

const UNIT_ACRONYMS = {
    "Assessoria de Assuntos Estratégicos": "AAE", "Gabinete do Prefeito": "GBP", "Consultoria Jurídica": "CJ", "Controladoria": "CM", "Procuradoria": "PGM", "Secretaria de Cultura, Desporto, Lazer e Turismo": "SMCDLT", "Secretaria de Fazenda": "SEFAZ", "Secretaria de Planejamento, Orçamento e Gestão": "SPOG", "Secretaria de Saúde": "SMS", "Secretaria de Educação": "SME", "Secretaria de Obras": "SMOSU", "Secretaria Agronegócio": "SEAGRO", "Secretaria de Meio ambiente": "SEMMA", "Secretaria de Assistência Social": "SMAS", "Secretaria de Governo": "SEGOV", "Secretaria de Administração": "SECADM"
};
const SECRETARIAS_LIST = Object.keys(UNIT_ACRONYMS).sort();
const MONTHS = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

// --- LISTA COMPLETA DE GRUPOS ---
const DEFAULT_GROUPS_RAW = [
    ['000400', 'MATERIAL DE INFORMATICA'], ['000401', 'PEÇAS PARA VEÍCULO'], ['000402', 'CONTRATAÇÃO PRESTAÇÃO DE SERVIÇOS LABORATORIAIS'],
    ['000403', 'CONTR. PREST. SERV. DE MÉDIA E ALTA COMPLEXIDADE AMBULATORIAL'], ['000404', 'MATERIAL ELETRICO ELETRÔNICO'], ['000405', 'SERVIÇO DE CÓPIAS'],
    ['000406', 'MANUTENÇÃO DE VEICULOS - FROTA MECANIZADA'], ['000407', 'CONFECÇÃO DE IMPRESSOS DE USO CONTÍNUO'], ['000408', 'MATERIAL DE ESCRITORIO'],
    ['000409', 'ACESSÓRIO PARA VEÍCULO'], ['000410', 'GÁS LIQUEFEITO DE PETRÓLEO - GLP'], ['000411', 'COMBUSTÍVEL AUTOMOTIVO'], ['000412', 'GÊNEROS ALIMENTÍCIOS'],
    ['000413', 'CONFECÇÃO DE IMPRESSOS DE USO ESPECIAL'], ['000414', 'CONFECÇÃO DE IMPRESSOS TÉCNICOS COM CÓDIGO'], ['000415', 'CONFECÇÃO DE PLACA OU TARJETA PARA VEÍCULO'],
    ['000416', 'SERVIÇO DE ALINHAMENTO E BALANCEAMENTO'], ['000417', 'CORTINAS EM PERSIANAS E TECIDOS'], ['000418', 'CONFECÇÃO DE FAIXAS E ESCRITA TIPO LETREIRO'],
    ['000419', 'ALIMENTAÇÃO PARA ATLETAS EM JOGOS FESTIVOS'], ['000420', 'ALUGUEL DE OUTDOOR'], ['000421', 'APARELHO DE MEDIÇÃO E ORIENTAÇÃO'],
    ['000422', 'APARELHO E EQUIPAMENTO DE COMUNICAÇÃO'], ['000423', 'SERVIÇO DE ENCADERNAÇÃO DE DOCUMENTOS'], ['000424', 'ARDÓSIA'], ['000425', 'AREIA'],
    ['000426', 'ARTEFATOS CONCRETO PREMOLDADOS'], ['000427', 'ARTEFATOS DE FERRO'], ['000428', 'ARTIGO DE CAMA MESA E BANHO'], ['000429', 'ASSINATURA DE JORNAIS'],
    ['000430', 'ASSINATURA DE REVISTAS BOLETINS'], ['000431', 'AUXILIO FUNERAL'], ['000432', 'BANDEIRA MASTRO E FLÂMULA'], ['000433', 'BICICLETA'],
    ['000434', 'BRINQUEDOS'], ['000435', 'BRITA'], ['000436', 'EQUIPAMENTO PARA REPRODUÇÃO DE CÓPIAS'], ['000437', 'CARIMBO E SUPRIMENTOS PARA CARIMBO'],
    ['000438', 'CARTEIRA FUNCIONAL E CEDULA'], ['000439', 'CIMENTO'], ['000441', 'MANUTENÇÃO DE MOTOS'], ['000442', 'RETÍFICA EM MOTOR'],
    ['000443', 'CONFECÇÃO DE UNIFORMES'], ['000444', 'CONFECÇÃO E COLOCAÇÃO DE ADESIVO TIPO SILK'], ['000445', 'CONGRESSOS, CURSOS E EVENTOS'],
    ['000446', 'CONTR. PREST. SERV. DE ARQUITETURA'], ['000447', 'CONTR. PREST. SERV. DE REDE DE INFORMÁTICA'], ['000448', 'EXAMES PARA APOIO DIAGNÓSTICO'],
    ['000449', 'ELETRODOMÉSTICO'], ['000450', 'CONTRATAÇÃO DE SHOWS MUSICAIS'], ['000451', 'EQUIPAMENTO DE ÁUDIO E VÍDEO'], ['000452', 'EQUIPAMENTO DE INFORMÁTICA'],
    ['000453', 'EQUIPAMENTO ESPORTIVO'], ['000454', 'EQUIPAMENTO INDUSTRIAL'], ['000455', 'EQUIPAMENTO MÉDICO-HOSPITALAR'], ['000456', 'EQUIPAMENTO ODONTOLÓGICO'],
    ['000457', 'EQUIPAMENTO PARA FISIOTERAPIA'], ['000458', 'EQUIPAMENTO PARA LABORATÓRIO'], ['000459', 'EQUIPAMENTO PARA OFICINA'],
    ['000460', 'EQUIPAMENTO PARA PARQUE INFANTIL'], ['000461', 'EQUIPAMENTO DE RADIOFUSÃO'], ['000462', 'EQUIPAMENTO PARA USINA ASFÁLTICA'],
    ['000463', 'EQUIPAMENTO DE PROTEÇÃO INDIVIDUAL'], ['000464', 'EQUIPAMENTOS E ACESSORIOS PARA LIMPEZA'], ['000465', 'EQUIPAMENTOS ELÉTRICO ELETRÔNICO'],
    ['000466', 'MADEIRA'], ['000467', 'FERRAGEM'], ['000468', 'FERRAMENTA'], ['000469', 'FILTROS PARA VEÍCULO'], ['000470', 'MATERIAL DE HIGIENE PESSOAL'],
    ['000471', 'GENEROS NUTRICIONAIS'], ['000472', 'GRADE, JANELA, PORTA E BASCULANTE'], ['000473', 'INSTRUMENTO MEDICO-HOSPITALAR'],
    ['000474', 'INSTRUMENTO ODONTOLÓGICO'], ['000475', 'LANCHE'], ['000476', 'MATERIAL DE CARPINTARIA'], ['000478', 'LOCAÇÃO DE BARRACAS E TENDAS'],
    ['000479', 'LOCAÇÃO DE IMÓVEL'], ['000480', 'LOCAÇÃO DE MÁQUINAS E EQUIP. MEDICO-HOSP.'], ['000481', 'LUBRIFICANTE AUTOMOTIVO'],
    ['000482', 'MEDICAMENTOS (USO GERAL)'], ['000483', 'LOCAÇÃO DE FOTOCOPIADORA/IMPRESSORAS'], ['000484', 'MANUTENÇÃO DE EQUIP. COMUNICAÇÃO'],
    ['000485', 'MANUTENÇÃO/CONSERTO EM ELETRODOMÉSTICO'], ['000486', 'MANUTENÇÃO EQUIP.ELETRICO-ELETRONICO'], ['000487', 'MANUTENÇÃO EQUIP.ESCRITÓRIO'],
    ['000488', 'MANUTENÇÃO EQUIP.INFORMÁTICA'], ['000489', 'MANUTENÇÃO EQUIP. LABORATÓRIO'], ['000490', 'MAQUINAS PESADAS'],
    ['000491', 'PLANTAS ORNAMENTAIS'], ['000492', 'CONFECÇÃO DE PLACAS COMEMORATIVAS'], ['000493', 'MATERIAL DE CONSTRUÇÃO'], ['000494', 'VIDROS E ACESSÓRIOS'],
    ['000495', 'PAGAMENTOS NOTORIAIS'], ['000496', 'SERVIÇO DE CHAVEIRO'], ['000497', 'SERVIÇO DE RECARGA DE EXTINTOR'],
    ['000498', 'ACESSORIO/MATERIAL DE AUDIO E VIDEO'], ['000499', 'REVELAÇÃO E CÓPIA DE FILMES'], ['000500', 'MATERIAL DE COPA E COZINHA'],
    ['000501', 'MATERIAL DE ENFERMAGEM'], ['000502', 'MERENDA ESCOLAR'], ['000503', 'GASES INDUSTRIAIS'], ['000504', 'MATERIAL E PEÇAS P/ ELETRODOMÉSTICOS'],
    ['000505', 'MATERIAL E PEÇAS P/ REPAROS EM MOTOSSERRA'], ['000506', 'ACESSÓRIO P/ EQUIPAMENTO DE COMUNICAÇÃO'],
    ['000507', 'MATERIAL DE LIMPEZA AUTOMOTIVA'], ['000508', 'MATERIAL E PEÇAS P/ USINA LAMA ASFÁLTICA'], ['000509', 'TELECOMUNICAÇÃO'],
    ['000510', 'MATERIAL P/ INSTRUMENTOS MUSICAIS'], ['000511', 'MATERIAL HIDRÁULICO'], ['000512', 'MATERIAL ODONTOLÓGICO'],
    ['000513', 'SERVIÇO DE CAPOTEIRO'], ['000514', 'PEÇAS P/ EQUIP. ODONTOLÓGICO'], ['000515', 'SEGURO DE VEÍCULO'],
    ['000516', 'SERVIÇO DE LOCAÇÃO DE VEÍCULOS'], ['000517', 'CONTRAT. PREST. SERV. P/ COLETA DE LIXO'], ['000518', 'SERVIÇOS AUDITORIA/CONSULTORIA'],
    ['000519', 'ÁGUA MINERAL'], ['000520', 'EQUIPAMENTO HIDRAULICO'], ['000521', 'AUXILIO ALIMENTAÇÃO'],
    ['000522', 'MATERIAL DE EMBALAGEM'], ['000523', 'MATERIAL P/ FESTIVIDADE'],
    ['000524', 'EQUIPAMENTO DE FISIOTERAPIA'], ['000525', 'MATERIAL PARA FOTOGRAFIA'], ['000526', 'MATERIAL P/ LANTERNAGEM E PINTURA'],
    ['000527', 'MATERIAL P/ MANUTENÇÃO DE BENS IMÓVEIS'], ['000528', 'MATERIAL P/ OFICINAS TERAPÊUTICAS'], ['000529', 'MATERIAL P/ CONTROLE DE VETOR'],
    ['000530', 'MATERIAL P/ SANEAMENTO BÁSICO'], ['000531', 'MATERIAL QUÍMICO'], ['000532', 'MATERIAL DE LABORATORIO'], ['000533', 'MEDALHAS E TROFÉUS'],
    ['000534', 'MATERIAL DE PINTURA'], ['000535', 'MEDICAMENTOS (VETERINÁRIO)'], ['000536', 'MOBÍLIA'], ['000537', 'MOBILIÁRIO ESCOLAR'],
    ['000538', 'MOBILIÁRIO PARA ESCRITÓRIO'], ['000539', 'MATERIAL DE LIMPEZA GERAL'], ['000540', 'SERVIÇO DE ENGENHARIA'],
    ['000541', 'EQUIPAMENTOS DE MANUTENÇÃO DO TRÂNSITO'], ['000542', 'PNEUS, CÂMARAS E PROTETORES'], ['000543', 'MOBILIÁRIO PARA LABORATÓRIO'],
    ['000544', 'OBRAS DE CONSTRUÇÃO CIVIL'], ['000545', 'PASSAGENS E PASSES'], ['000546', 'PEÇAS P/ EQUIP. MED.HOSPITALAR'],
    ['000547', 'PROPAGANDA VOLANTE'], ['000548', 'SERVIÇO DE SONORIZAÇÃO'], ['000549', 'PEÇAS E SUPRIMENTOS DE INFORMÁTICA'],
    ['000550', 'SERVIÇO DE TRANSPORTE ESCOLAR'], ['000551', 'SUPRIMENTOS MÉDICOS HOSPITALAR'], ['000553', 'HERBICIDAS'],
    ['000554', 'SERVIÇO DE SERRALHEIRO'], ['000555', 'MATERIAL DE SINALIZAÇÃO VISUAL'], ['000556', 'ACUMULADORES ELETROELETRÔNICOS'],
    ['000557', 'SERVIÇO AUTO-ELÉTRICO'], ['000558', 'PEÇAS P/ MOTOS E BICICLETAS'], ['000559', 'MATERIAL DE DESENHO TÉCNICO'],
    ['000560', 'EQUIPAMENTO AGRÍCOLA'], ['000561', 'SERVIÇO DE LETREIRO'], ['000562', 'MATERIAL DE SEGURANÇA'], ['000563', 'GASES MEDICINAIS'],
    ['000564', 'RENOVAÇÃO DE ASSINATURA'], ['000565', 'MANUTENÇÃO EQUIP. P/ FISIOTERAPIA'], ['000566', 'ACESSÓRIOS P/ EQUIPAMENTOS ELETRÔNICOS'],
    ['000567', 'ESPETÁCULO PIROTÉCNICO'], ['000568', 'BUFFET'], ['000569', 'SERV. MÉDIC. ESPECIALIZADO'],
    ['000570', 'IMPLANTAÇÃO DE SEMÁFORO'], ['000571', 'VEÍCULOS LEVES/UTILITÁRIOS'],
    ['000572', 'SERVIÇO DE SILKAGEM'], ['000573', 'TIJOLO'], ['000574', 'PEÇAS PARA MÁQUINAS PESADAS'], ['000575', 'ACESSÓRIOS PARA MÁQUINAS PESADAS'],
    ['000576', 'MATERIAIS PARA JARDIM'], ['000577', 'PEÇAS P/ EQUIP. LABORATÓRIO'], ['000578', 'LOCAÇÃO DE VEÍCULOS'],
    ['000579', 'TELHA'], ['000580', 'PEÇAS PARA ROÇADEIRA'], ['000581', 'SERVIÇO TÉCNICO ESPECIALIZADO'],
    ['000582', 'LIVRO DIDÁTICO'], ['000583', 'MATERIAL DIDÁTICO'], ['000584', 'MATERIAL DE DIVULGAÇÃO'],
    ['000585', 'COLETA DE LIXO HOSPITALAR'], ['000586', 'REMOÇÃO DE PACIENTES'], ['000587', 'SERVIÇO DE MOLEIRO'],
    ['000588', 'PEÇAS PARA TELEFONIA'], ['000589', 'MATERIAL DE PAVIMENTAÇÃO'], ['000590', 'SERVIÇO DE ELETRICISTA'],
    ['000591', 'RETÍFICA EM MOTOR'], ['000592', 'PAGAMENTO DE FRANQUIA'], ['000593', 'PRONTO ATENDIMENTO'],
    ['000594', 'ACUMULADORES'], ['000595', 'ACESSÓRIOS PARA SEMÁFORO'], ['000596', 'SERVIÇO DE FERREIRO'],
    ['000597', 'MANUTENÇÃO DE CORTINAS'], ['000598', 'SERVIÇO DE BOMBEIRO HIDRÁULICO'], ['000599', 'SERVIÇOS DE MARCENARIA'],
    ['000600', 'RECARGA DE REFRIGERAÇÃO'], ['000601', 'EQUIPAMENTOS DE SEGURANÇA'],
    ['000602', 'PLACAS INDICATIVAS'], ['000603', 'SERVIÇOS DE EVENTOS'],
    ['000604', 'CERTIFICADOS E LAUDOS'], ['000605', 'SEGURANÇA E VIGILÂNCIA'],
    ['000606', 'ARTIGOS DE CAMA/MESA HOSPITALAR'], ['000607', 'CONFECÇÃO DE VESTUÁRIO HOSPITALAR'],
    ['000608', 'SERVIÇO DE INTERNET'], ['000609', 'ARTIGOS PARA BERCÁRIO'], ['000610', 'FERRAMENTA ELÉTRICA'], ['000611', 'PUBLICAÇÃO'],
    ['000612', 'ACESSÓRIOS DE INFORMÁTICA'], ['000613', 'QUADRO E MOLDURA'], ['000614', 'SERVIÇOS GFIP'],
    ['000615', 'SERVIÇO ELETRICO-ELETRONICO'], ['000616', 'EQUIPAMENTOS URBANOS'], ['000617', 'SEGURANÇA P/ ACOMPANHAMENTO'],
    ['000618', 'LOCAÇÃO DIVERSA'], ['000619', 'SERVIÇO DE BORRACHEIRO'], ['000620', 'SERVIÇO DE REBOQUE'],
    ['000621', 'LAVAÇÃO DE VEÍCULOS'], ['000622', 'MANUTENÇÃO E RECAUCHUTAGEM'], ['000623', 'UTENSÍLIOS PARA LIMPEZA'],
    ['000624', 'EQUIPAMENTO DE ABASTECIMENTO'], ['000625', 'EQUIPAMENTO PARA ESCRITORIO'], ['000626', 'LAVANDERIA'],
    ['000627', 'MATERIAL DE OFICINA'], ['000628', 'SOFTWARE'], ['000629', 'MATERIAL ORTOPÉDICO'], ['000630', 'SERVIÇOS DE DESPACHANTE'],
    ['000631', 'BAR E RESTAURANTE'], ['000632', 'INSUMOS INSPEÇÃO ANIMAL/VEGETAL'],
    ['000633', 'LOCAÇÃO ESTRUTURAS EVENTOS'], ['000634', 'PEÇAS DE REPOSIÇÃO'],
    ['000635', 'MANUTENÇÃO SINALIZAÇÃO VIÁRIA'], ['000636', 'WEB SITES'], ['000637', 'LANTERNAGEM E PINTURA'],
    ['000638', 'PEÇAS EQUIPAMENTO AGRÍCOLA'], ['000639', 'SERVIÇO DE SEGURANÇA'],
    ['000640', 'AFERIÇÃO E CALIBRAÇÃO'], ['000641', 'TOPOGRAFIA'],
    ['000642', 'POÇO ARTESIANO'], ['000643', 'REFEIÇOES PRONTAS'],
    ['000644', 'VESTUÁRIOS P/ CAMPANHA'], ['000645', 'VEÍCULOS RODOVIÁRIOS'], ['000646', 'MANUTENÇÃO EQUIP. HOSPITALAR'],
    ['000647', 'SINALIZADORES AEROPORTO'], ['000648', 'BARRACAS E TENDAS'], ['000649', 'INTERNAÇÃO INVOLUNTÁRIA'],
    ['000650', 'PEÇAS COMPACTADOR LIXO'], ['000651', 'MANUTENÇÃO COMPACTADOR'], ['000653', 'VEICULOS PESADOS'], ['000654', 'SEGURO DE VIDA'],
    ['000656', 'VIDRAÇARIA'], ['000657', 'SELEÇÃO E TREINAMENTO'], ['000658', 'SERVIÇOS POSTAIS'],
    ['000659', 'REDES WIRELESS'], ['000660', 'MATERIAL AGRÍCOLA'], ['000661', 'PUBLICIDADE E PROPAGANDA'],
    ['000662', 'APOIO A SHOWS MUSICAIS'], ['000663', 'ADITIVO AUTOMOTIVO'],
    ['000664', 'FORMAS PRÉ-MOLDADOS'], ['000665', 'FOTOGRAFIAS AEREAS'], ['000666', 'EQUIPAMENTOS PARQUES E JARDINS'],
    ['000667', 'REFORMA CARROCERIA'], ['000668', 'MATERIAL CARROCERIA'], ['000669', 'MOBILIÁRIO URBANO'], ['000670', 'MATERIAL DE PROTEÇÃO'],
    ['000671', 'CONSERTO EQUIP. ODONTOLÓGICO'], ['000672', 'SEGURANÇA PATRIMONIAL'], ['000673', 'PASSAGEM AÉREA'],
    ['000674', 'MATERIAIS SINALIZAÇÃO VIÁRIA'], ['000675', 'PERMISSAO DE USO'], ['000676', 'EQUIPAMENTO TOPOGRAFIA'],
    ['000677', 'LOCAÇÃO MÁQUINAS'], ['000678', 'SERVIÇOS SINALIZAÇÃO VIÁRIA'], ['000679', 'SERVIÇO DE TRANSPORTE'],
    ['000680', 'MANUTENÇÃO EQUIP. ODONTOLÓGICO'], ['000681', 'ACESSÓRIOS BORRACHARIA'],
    ['000682', 'MONITORAMENTO CÂMERAS'], ['000683', 'PLACAS COMEMORATIVAS'], ['000684', 'INSTALAÇÃO CÂMERAS'],
    ['000685', 'EQUIPAMENTOS VETERINÁRIOS'], ['000686', 'MATERIAL VETERINÁRIO'], ['000687', 'LIVROS GERAIS'],
    ['000688', 'DIVULGAÇÃO EVENTOS'], ['000689', 'FILMAGEM E EDIÇÃO'], ['000690', 'SINALIZAÇÃO HORIZONTAL'],
    ['000691', 'TORNEARIA'], ['000692', 'MANUTENÇÃO EQUIP. HOSPITALAR'], ['000693', 'SEGURANÇA DESARMADA'],
    ['000694', 'ARTIGOS DE ESCRITORIO'], ['000695', 'MAQUINAS DE OFICINAS'],
    ['000696', 'POSTES PARA CERCA'], ['000697', 'LOCAÇÃO REDE OPTICA'], ['000698', 'AUXILIO ALIMENTAÇÃO'],
    ['000699', 'VEDANTES E ADESIVOS'], ['000700', 'MÁQUINAS MOTOMECANIZADAS'], ['000701', 'ATENDIMENTO HOSPITALAR'],
    ['000702', 'LEILOEIRO'], ['000703', 'CONCRETO USINADO'], ['000704', 'PLANO MOBILIDADE URBANA'],
    ['000705', 'MATERIAL ABATEDOURO'], ['000706', 'GERENCIAMENTO TRANSPORTE SAÚDE'],
    ['000707', 'TRANSPORTE DE PESSOAS'], ['000708', 'MANUTENÇÃO DE BENS IMÓVEIS'], ['000709', 'MOBILIÁRIOS EM GERAL'],
    ['000710', 'PLANEJAMENTO E METAS'], ['000711', 'PACOTE DE VIAGEM'],
    ['000712', 'PEÇAS PARQUES E JARDINS'], ['000713', 'TRANSPORTE DE VALORES'],
    ['000714', 'INSTITUIÇÃO FINANCEIRA'], ['000715', 'MANUTENÇÃO PARQUES E JARDINS'], ['000716', 'PLACAS VEICULARES'],
    ['000717', 'PLACAS COMEMORATIVAS'], ['000718', 'PRODUTO LÚDICO'], ['000719', 'TRADUÇÃO DE TEXTOS'],
    ['000720', 'EQUIPAMENTO PINTURA VIÁRIA'], ['000721', 'VEÍCULOS ESPECIAIS'], ['000722', 'EDIÇÃO DE VÍDEO'],
    ['000723', 'EQUIPAMENTOS MATADOURO'], ['000724', 'LOCAÇÃO EQUIPAMENTO'],
    ['000725', 'ASSINATURA DIGITAL'], ['000726', 'MATERIAL ESPORTIVO'], ['000727', 'VIGILÂNCIA PATRIMONIAL'], ['000728', 'SIMBOLO OLÍMPICO'],
    ['000729', 'PAVIMENTAÇÃO E CONSTRUÇÃO'], ['000730', 'MATERIAL MEDICO-HOSPITALAR'],
    ['000731', 'HOSPEDAGEM ASSISTIDA'], ['000732', 'POÇO ARTESIANO'],
    ['000733', 'MATERIAIS DIDÁTICO PEDAGOGICO'], ['000734', 'LOCAÇÃO EQUIP. HOSPITALAR'],
    ['000735', 'PUBLICAÇÕES JUDICIAIS'], ['000736', 'LIMPEZA AUTOMOTIVA'], ['000737', 'EQUIPAMENTO COMUNICAÇÃO'],
    ['000738', 'EQUIPAMENTO ABATEDOURO'], ['000739', 'HOSPEDAGEM'], ['000740', 'INFRAESTRUTURA REDE OPTICA'],
    ['000741', 'BANHEIROS QUIMICOS'], ['000742', 'COBERTURA PARA CURATIVOS'], ['000743', 'EQUIPAMENTO PARA VEICULO'],
    ['000744', 'EQUIPAMENTOS PARA VEÍCULOS'], ['000745', 'BRIGADISTA/SOCORRISTA'],
    ['000746', 'INSTALAÇÃO CORTINAS'], ['000747', 'DIAGNÓSTICO ESPELEOLÓGICO'],
    ['000748', 'PEÇAS EQUIPAMENTOS ELÉTRICOS'], ['000749', 'PUBLICIDADE CARRO DE SOM'],
    ['000750', 'ACESSÓRIO COMUNICAÇÃO'], ['000751', 'INSTRUMENTOS MUSICAIS'],
    ['000752', 'IMPRESSÃO E CÓPIAS'], ['000753', 'MANUTENÇÃO BENS MOVEIS'],
    ['000754', 'PILOTAGEM DRONE'], ['000755', 'SEGURANÇA DESARMADA'],
    ['000756', 'ARMAZENAMENTO BETUMINOSO'], ['000757', 'BIBLIOTECA DIGITAL'], ['000758', 'MAQUINAS INDUSTRIAIS'],
    ['000759', 'JARDINAGEM'], ['000760', 'PEÇAS FONTE LUMINOSA'],
    ['000761', 'MANUTENÇÃO INCÊNDIO'], ['000762', 'EDUCAÇÃO NUTRICIONAL'],
    ['000763', 'CUIDADORES'], ['000764', 'SERVIÇOS GRÁFICOS'],
    ['000765', 'ACESSÓRIOS OFICINA'], ['000766', 'EQUIPAMENTOS MONITORAMENTO'], ['000767', 'INVENTÁRIO PATRIMONIAL'],
    ['000768', 'EQUIPAMENTOS MECÂNNICOS'], ['000769', 'SERVIÇO DE TRANSPORTE'],
    ['000770', 'GRAVAÇÃO ÁUDIO E VÍDEO'], ['000771', 'CONCESSÃO BENS PÚBLICOS'],
    ['000772', 'ADAPTAÇÃO VEICULAR'], ['000773', 'COBRANÇA PEDÁGIO'], ['000774', 'MODELOS ANATÔMICOS'],
    ['000775', 'MANUTENÇÃO ELEVADORES'], ['000776', 'DESTINAÇÃO DE RESÍDUOS'],
    ['000777', 'MANUTENÇÃO POÇOS'], ['000778', 'ACONDICIONAMENTO E PROTEÇÃO'], ['000779', 'CONSERTO BICICLETA'],
    ['000780', 'LEVANTAMENTO PATRIMONIAL'], ['000781', 'LIMPEZA HOSPITALAR'], ['000782', 'ENFEITES NATALINOS'],
    ['000783', 'TRANSPORTE COLETIVO URBANO'], ['000784', 'TRANSPORTE COLETIVO DISTRITAL'], ['000785', 'FANTASIAS EDUCATIVAS'], ['000786', 'CESTA BÁSICA'],
    ['000787', 'SERVIÇOS TI'], ['000788', 'CORTE E COSTURA'],
    ['000789', 'RECARGA EXTINTORES'], ['000790', 'SERVIÇO ENGENHARIA'], ['000791', 'PEÇAS MICROPAVIMENTO'],
    ['000792', 'PROPAGANDA VOLANTE'], ['000793', 'SERVIÇOS GERAIS'], ['000794', 'PRODUÇÕES VÍDEO'],
    ['000795', 'ABASTECIMENTO D\'ÁGUA'], ['000796', 'TERAPIA OCUPACIONAL'],
    ['000797', 'MANUTENÇÃO INDUSTRIAL'], ['000798', 'EPI/EPC'],
    ['000799', 'FOLHA DE PAGAMENTO'], ['000800', 'ETIQUETAS IDENTIFICAÇÃO'],
    ['000801', 'TELEORIENTAÇÃO'], ['000802', 'GERENCIAMENTO FROTAS'], ['000803', 'INSTALAÇÃO AR CONDICIONADO'],
    ['000806', 'SERVIÇO DE TURISMO'], ['000807', 'PRODUÇÃO AUDIOVISUAL'], ['000808', 'MANUTENÇÃO SEGURANÇA'],
    ['000811', 'SISTEMA DE IRRIGAÇÃO'], ['000812', 'TRANSPORTE RECREATIVO'],
    ['000813', 'SERVIÇOS ON-LINE'], ['000814', 'CERIMONIAL'], ['000815', 'MANUTENÇÃO HOSPITALAR'],
    ['000816', 'PESAGEM RESÍDUOS'], ['000819', 'LOCAÇÃO EQUIP. EVENTOS'], ['000820', 'EQUIPAMENTOS DIVERSOS'],
    ['000821', 'CENOGRAFIA'], ['000822', 'GERENCIAMENTO FROTA'], ['000823', 'COMBATE INCÊNDIO FLORESTAL'],
    ['000824', 'SERVIÇOS DE BRIGADISTA'], ['000828', 'VÍDEO MONITORAMENTO'], ['000829', 'EDUCAÇÃO EM SAÚDE'],
    ['000830', 'TRIO ELÉTRICO'], ['000833', 'USINA RESÍDUOS'], ['000834', 'CAÇAMBA ESTACIONÁRIA'],
    ['000835', 'REVISÃO VEÍCULOS'], ['000836', 'MANUTENÇÃO ÁUDIO/VÍDEO'],
    ['000837', 'TRANSPORTE MATERIAIS'], ['000838', 'ESTRUTURAS MODULARES'],
    ['000839', 'SINALIZAÇÃO HORIZONTAL'], ['000840', 'SINALIZAÇÃO'], ['000841', 'MATERIAL RECREATIVO'],
    ['000842', 'TACÓGRAFOS'], ['000843', 'KIT NATALIDADE'],
    ['000844', 'EQUIPAGEM BIBLIOTECA'], ['000845', 'DRONES'],
    ['000852', 'CÂMARAS DE VACINA'], ['000854', 'SERVIÇO DE PLANTIO'], ['000855', 'REAGENTES QUÍMICOS'],
    ['000858', 'SISTEMA TELEFONIA'], ['000859', 'SISTEMA SEGURANÇA'],
    ['000861', 'EVENTOS ESPORTIVOS'], ['000864', 'INOVAÇÃO TECNOLÓGICA'],
    ['000865', 'ESTIMULAÇÃO MULTIDISCIPLINAR'], ['000866', 'PSICOMOTORES'],
    ['000867', 'BRINQUEDOS PSICOPEDAGÓGICOS'], ['000868', 'AVALIAÇÃO MULTIDIMENSIONAL'],
    ['000871', 'SERVIÇO EDUCACIONAL BILÍNGUE'], ['000872', 'INGRESSOS'], ['000874', 'ENGENHARIA ELÉTRICA'],
    ['000876', 'EVENTOS E COMEMORAÇÕES']
];

const DEFAULT_GROUPS_LIST = DEFAULT_GROUPS_RAW.map(g => [g[0].slice(-3), g[1]]);

let firebaseUserUid = null;
let appUser = null;
let globalGroups = [];
let globalRequests = [];
let calendarOverrides = {};
let userRequests = {};
let myRequestsUnsubscribe = null;
let isDeadlineExpired = false;
let currentFilter = 'all';
let globalScheduleMap = new Map();
let selectedSearchGroupId = null;
let deleteTargetId = null;
let deleteType = null;
let isSystemLocked = false;

// --- Helper for Event Listeners ---
function safeAddEventListener(id, event, handler) {
    const element = document.getElementById(id);
    if (element) {
        element.addEventListener(event, handler);
    }
}

// --- DOM Ready ---
document.addEventListener('DOMContentLoaded', () => {
    if (typeof lucide !== 'undefined') lucide.createIcons();
    checkDeadline();
    setupAuth();
    setupUI();
    setupGroupAdmin();
    setupUserManagementUI();
});

// --- GLOBAL EXPORTS FOR INLINE HTML EVENTS ---
window.editGroup = (id) => {
    const g = globalGroups.find(x => x.id === id);
    if (!g) return;
    document.getElementById('groupId').value = g.id;
    document.getElementById('groupNumber').value = g.number || '';
    document.getElementById('groupName').value = g.name;
    document.getElementById('cancelGroupEdit').classList.remove('hidden');
};

window.deleteGroupInit = (id, name) => {
    deleteTargetId = id;
    deleteType = 'group';
    document.getElementById('deleteMsg').textContent = `Tem certeza que deseja excluir: ${name}?`;
    document.getElementById('deleteConfirmModal').classList.remove('hidden');
};

window.deleteUser = async (id) => {
    deleteTargetId = id;
    deleteType = 'user';
    document.getElementById('deleteMsg').textContent = `Tem certeza que deseja excluir o usuário ${id}?`;
    document.getElementById('deleteConfirmModal').classList.remove('hidden');
};

// --- DRAG AND DROP LOGIC ---
let draggedGroupId = null;

window.handleDragStart = (e, gid) => {
    draggedGroupId = gid;
    e.target.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
};

window.handleDragEnd = (e) => {
    e.target.classList.remove('dragging');
    draggedGroupId = null;
    document.querySelectorAll('.drop-zone').forEach(zone => zone.classList.remove('drag-over'));
};

window.handleDragOver = (e) => {
    e.preventDefault(); // Necessary for drop to work
    e.currentTarget.classList.add('drag-over');
    return false;
};

window.handleDragLeave = (e) => {
    e.currentTarget.classList.remove('drag-over');
};

window.handleDrop = async (e, monthIndex) => {
    e.stopPropagation();
    e.currentTarget.classList.remove('drag-over');
    if (!draggedGroupId) return false;

    try {
        // Save override to Firestore
        await setDoc(doc(db, `artifacts/${appId}/public/data/calendar_overrides`, draggedGroupId), {
            monthIndex: monthIndex,
            updatedAt: new Date().toISOString(),
            updatedBy: appUser.username
        });
    } catch (err) {
        console.error("Drop error:", err);
        alert("Erro ao mover item.");
    }
    return false;
};


// --- FUNÇÕES DO SISTEMA ---

function checkDeadline() {
    const now = new Date();
    isDeadlineExpired = now > DEADLINE_DATE;
    updateLockUI();
}

function updateLockUI() {
    const banner = document.getElementById('deadlineBanner');
    const bannerTitle = document.getElementById('deadlineTitle');
    const bannerText = document.getElementById('deadlineText');
    const btnSave = document.getElementById('saveAllMyRequests');

    const isActuallyLocked = isSystemLocked || isDeadlineExpired;
    const canBypass = appUser && (appUser.isMaster || appUser.isAdmin);

    if (isActuallyLocked) {
        banner.classList.remove('hidden');
        if (isSystemLocked) {
            bannerTitle.textContent = "Solicitações Pausadas Administrativamente";
            bannerText.textContent = "A equipe de gestão pausou o recebimento de novas solicitações ou edições.";
        } else {
            bannerTitle.textContent = "Período de Edição Encerrado";
            bannerText.textContent = "O prazo final expirou. O sistema está em modo de leitura.";
        }

        if (!canBypass) {
            // Disable inputs
            document.querySelectorAll('.req-select').forEach(el => el.disabled = true);
            if (btnSave) {
                btnSave.disabled = true;
                btnSave.classList.add('opacity-50', 'cursor-not-allowed');
                btnSave.innerHTML = '<i data-lucide="lock" class="w-4 h-4"></i> <span>Bloqueado</span>';
            }
        } else {
            // Admins can still edit but see banner
            document.querySelectorAll('.req-select').forEach(el => el.disabled = false);
            if (btnSave) {
                btnSave.disabled = false;
                btnSave.classList.remove('opacity-50', 'cursor-not-allowed');
                btnSave.innerHTML = '<i data-lucide="save" class="w-4 h-4"></i> <span>Salvar Alterações (Admin)</span>';
            }
        }
    } else {
        banner.classList.add('hidden');
        document.querySelectorAll('.req-select').forEach(el => el.disabled = false);
        if (btnSave) {
            btnSave.disabled = false;
            btnSave.classList.remove('opacity-50', 'cursor-not-allowed');
            btnSave.innerHTML = '<i data-lucide="save" class="w-4 h-4"></i> <span>Salvar Alterações</span>';
        }
    }

    // Update toggle button text
    const toggleBtn = document.getElementById('btnToggleLock');
    if (toggleBtn) {
        if (isSystemLocked) {
            toggleBtn.innerHTML = '<i data-lucide="unlock" class="w-4 h-4"></i> Retomar Solicitações';
            toggleBtn.classList.remove('bg-slate-800', 'hover:bg-slate-700');
            toggleBtn.classList.add('bg-green-600', 'hover:bg-green-500');
        } else {
            toggleBtn.innerHTML = '<i data-lucide="lock" class="w-4 h-4"></i> Pausar Solicitações';
            toggleBtn.classList.remove('bg-green-600', 'hover:bg-green-500');
            toggleBtn.classList.add('bg-slate-800', 'hover:bg-slate-700');
        }
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
}

function setupAuth() {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            firebaseUserUid = user.uid;
            await initMasterAccount();
            if (!appUser) document.getElementById('loginModal').classList.remove('hidden');
            initListeners();
        } else {
            if (initialAuthToken) await signInWithCustomToken(auth, initialAuthToken);
            else await signInAnonymously(auth);
        }
    });
}

async function initMasterAccount() {
    const masterRef = doc(db, `artifacts/${appId}/public/data/app_users`, MASTER_USER);
    try {
        const snap = await getDoc(masterRef);
        if (!snap.exists()) {
            await setDoc(masterRef, {
                password: MASTER_DEFAULT_PASS,
                name: 'Vitor Augusto Assis Barcelos',
                unitName: 'Secretaria de Fazenda',
                units: ['Secretaria de Fazenda'],
                cargo: 'Secretário de Fazenda',
                isMaster: true,
                isAdmin: true
            });
        } else {
            if (!snap.data().name) await updateDoc(masterRef, { name: 'Vitor Augusto Assis Barcelos' });
        }
    } catch (e) { console.error("Erro seed master:", e); }
}

async function performAppLogin(username, password) {
    try {
        const ref = doc(db, `artifacts/${appId}/public/data/app_users`, username);
        const snap = await getDoc(ref);
        if (!snap.exists()) return { success: false, msg: "Usuário não encontrado." };
        const data = snap.data();
        if (data.password !== password) return { success: false, msg: "Senha incorreta." };
        let userUnits = data.units || [];
        if (userUnits.length === 0 && data.unitName) userUnits = [data.unitName];
        return {
            success: true,
            userData: {
                username: username,
                name: data.name || username,
                cargo: data.cargo || 'Usuário',
                isMaster: !!data.isMaster,
                isAdmin: !!data.isAdmin,
                availableUnits: userUnits
            }
        };
    } catch (e) { console.error(e); return { success: false, msg: "Erro de conexão." }; }
}
function handleLoginSuccess(userData) {
    if (userData.availableUnits.length > 1) showUnitSelection(userData);
    else if (userData.availableUnits.length === 1) completeLogin(userData, userData.availableUnits[0]);
    else alert("Usuário sem unidade vinculada.");
}

function showUnitSelection(userData) {
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('loginUnitSelection').classList.remove('hidden');
    const container = document.getElementById('unitButtonsContainer');
    container.innerHTML = '';
    userData.availableUnits.forEach(unitName => {
        const acronym = UNIT_ACRONYMS[unitName] || unitName.substring(0, 3).toUpperCase();
        const btn = document.createElement('button');
        btn.className = "w-full flex items-center gap-3 p-3 bg-slate-50 hover:bg-blue-50 border border-slate-200 rounded-lg transition-colors group";
        btn.innerHTML = `<div class="w-10 h-10 rounded bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs border border-blue-200 group-hover:bg-blue-600 group-hover:text-white transition-colors">${acronym}</div><span class="text-sm text-slate-700 font-medium text-left flex-1 group-hover:text-blue-800">${unitName}</span><i data-lucide="chevron-right" class="w-4 h-4 text-slate-400 group-hover:text-blue-500"></i>`;
        btn.onclick = () => completeLogin(userData, unitName);
        container.appendChild(btn);
    });
    if (typeof lucide !== 'undefined') lucide.createIcons();
    document.getElementById('backToLogin').onclick = () => { document.getElementById('loginUnitSelection').classList.add('hidden'); document.getElementById('loginForm').classList.remove('hidden'); };
}

function completeLogin(userData, selectedUnit) {
    appUser = { ...userData, unitName: selectedUnit };
    updateInterfaceForUser();
    setupLogoUpload();
}

// --- UI UPDATE FUNCTIONS ---
function updateInterfaceForUser() {
    document.getElementById('loginModal').classList.add('hidden');
    const container = document.getElementById('userInfoContainer');
    container.classList.remove('opacity-0');

    document.getElementById('currentUserDisplay').textContent = appUser.name;
    document.getElementById('currentUserCargo').textContent = appUser.cargo;
    document.getElementById('dropdownUnitName').textContent = appUser.unitName;
    document.getElementById('dropdownUserName').textContent = appUser.name;

    const acronym = UNIT_ACRONYMS[appUser.unitName] || appUser.unitName.substring(0, 2).toUpperCase();
    const avatarEl = document.getElementById('userAvatar');
    avatarEl.textContent = acronym;
    if (acronym.length > 3) avatarEl.classList.add('long-text');
    else avatarEl.classList.remove('long-text');

    const masterSelector = document.getElementById('unitSelectorContainer');
    const solSubtitle = document.getElementById('solicitacoesSubtitle');
    const canSeeAdminTabs = appUser.isMaster || appUser.isAdmin;
    const canSeeUsersTab = appUser.isMaster;
    const canSwitchUnits = appUser.isMaster;

    ['btn-tab-grupos', 'btn-tab-analise'].forEach(id => { const el = document.getElementById(id); if (canSeeAdminTabs) el.classList.remove('hidden'); else el.classList.add('hidden'); });
    const usersTab = document.getElementById('btn-tab-usuarios');
    if (canSeeUsersTab) usersTab.classList.remove('hidden'); else usersTab.classList.add('hidden');

    if (canSwitchUnits) {
        masterSelector.classList.remove('hidden');
        solSubtitle.innerHTML = `Visualizando como: <strong>${appUser.unitName}</strong>`;
        populateMasterUnitSelector();
        document.getElementById('masterDragHint').classList.remove('hidden');
    } else {
        masterSelector.classList.add('hidden');
        document.getElementById('masterDragHint').classList.add('hidden');
        solSubtitle.textContent = "Sua unidade foi definida no login.";
    }

    updateLockUI(); // Initial UI lock check

    document.getElementById('btn-tab-solicitacoes').click();
    if (myRequestsUnsubscribe) myRequestsUnsubscribe();
    setupMyRequestsListener();
}

function populateMasterUnitSelector() {
    const sel = document.getElementById('headerUnitSelect');
    sel.innerHTML = '';
    SECRETARIAS_LIST.forEach(u => {
        const opt = document.createElement('option');
        opt.value = u; opt.textContent = u;
        opt.className = "text-gray-900 bg-white";
        if (u === appUser.unitName) opt.selected = true;
        sel.appendChild(opt);
    });
    sel.onchange = (e) => {
        appUser.unitName = e.target.value;
        const ac = UNIT_ACRONYMS[appUser.unitName] || "UN";
        const avatarEl = document.getElementById('userAvatar');
        avatarEl.textContent = ac;
        if (ac.length > 3) avatarEl.classList.add('long-text');
        else avatarEl.classList.remove('long-text');

        document.getElementById('solicitacoesSubtitle').innerHTML = `Visualizando como: <strong>${appUser.unitName}</strong>`;
        if (myRequestsUnsubscribe) myRequestsUnsubscribe();
        setupMyRequestsListener();
        renderMyRequests();
    };
}

function setupLogoUpload() {
    const container = document.getElementById('appLogoContainer');
    const freshInput = document.getElementById('appLogoInput');
    const freshOverlay = document.getElementById('appLogoOverlay');

    // Clonar para remover listeners antigos
    const newContainer = container.cloneNode(true);
    container.parentNode.replaceChild(newContainer, container);

    // Re-selecionar
    const finalContainer = document.getElementById('appLogoContainer');
    const finalInput = finalContainer.querySelector('#appLogoInput');
    const finalOverlay = finalContainer.querySelector('#appLogoOverlay');

    if (appUser && appUser.isMaster) {
        finalContainer.classList.add('editable');
        finalOverlay.classList.remove('hidden');

        finalContainer.addEventListener('click', () => finalInput.click());

        finalInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            if (file.size > 1024 * 1024) {
                alert("A imagem é muito grande. Tente uma menor.");
                return;
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = async () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    const maxSize = 150;
                    let width = img.width;
                    let height = img.height;
                    if (width > height) {
                        if (width > maxSize) { height *= maxSize / width; width = maxSize; }
                    } else {
                        if (height > maxSize) { width *= maxSize / height; height = maxSize; }
                    }
                    canvas.width = width;
                    canvas.height = height;
                    ctx.drawImage(img, 0, 0, width, height);

                    const base64 = canvas.toDataURL('image/png');

                    try {
                        await setDoc(doc(db, `artifacts/${appId}/public/data/app_config`, 'global'), {
                            logoBase64: base64,
                            updatedAt: new Date().toISOString()
                        }, { merge: true });
                    } catch (err) {
                        console.error("Erro ao salvar logo", err);
                        alert("Erro ao salvar logo.");
                    }
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        });
    } else {
        finalContainer.classList.remove('editable');
        finalOverlay.classList.add('hidden');
    }
}

// --- SEARCH LOGIC FUNCTIONS ---

function setupCalendarSearch() {
    const numInput = document.getElementById('searchNum');
    const nameInput = document.getElementById('searchName');
    const dropdown = document.getElementById('searchNameDropdown');
    const searchBtn = document.getElementById('calendarSearchBtn');

    // Helper to check if clear
    const checkClear = () => {
        if (!numInput.value.trim() && !nameInput.value.trim()) {
            document.getElementById('calendarSearchResult').classList.add('hidden');
        }
    };

    // Listener Número: Busca Exata
    if (numInput) {
        numInput.addEventListener('input', (e) => {
            const val = e.target.value.replace(/\D/g, ''); // Apenas dígitos
            e.target.value = val;
            checkClear(); // Check clear

            // Tentar encontrar grupo correspondente
            const found = globalGroups.find(g => (g.number ? g.number.slice(-3) : '') === val);
            if (found) {
                nameInput.value = found.name;
                selectedSearchGroupId = found.id;
            } else {
                // Se apagou ou não achou, limpa seleção
                selectedSearchGroupId = null;
                if (val.length < 3) nameInput.value = ''; // Limpa nome se numero incompleto
            }
        });

        // Enter no numero dispara busca
        numInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleCalendarSearch();
        });
    }

    // Listener Nome: Busca Parcial com Dropdown
    if (nameInput) {
        nameInput.addEventListener('input', (e) => {
            const val = e.target.value.toLowerCase();
            selectedSearchGroupId = null; // Reset seleção ao digitar
            checkClear(); // Check clear

            if (val.length < 2) {
                dropdown.classList.add('hidden');
                return;
            }

            const matches = globalGroups.filter(g => g.name.toLowerCase().includes(val));

            if (matches.length > 0) {
                dropdown.innerHTML = matches.map(g => `
                    <div class="suggestion-item text-sm py-2 px-3 hover:bg-blue-50 cursor-pointer border-b border-slate-100 last:border-0" 
                         data-id="${g.id}" 
                         data-num="${g.number ? g.number.slice(-3) : ''}" 
                         data-name="${g.name.replace(/"/g, '&quot;')}">
                        <span class="font-bold text-blue-600">${g.number ? g.number.slice(-3) : '---'}</span> - ${g.name}
                    </div>
                `).join('');
                dropdown.classList.remove('hidden');

                // Add click events to items
                dropdown.querySelectorAll('.suggestion-item').forEach(item => {
                    item.addEventListener('click', () => {
                        const gid = item.dataset.id;
                        const gnum = item.dataset.num;
                        const gname = item.dataset.name;

                        numInput.value = gnum;
                        nameInput.value = gname;
                        selectedSearchGroupId = gid;
                        dropdown.classList.add('hidden');
                    });
                });
            } else {
                dropdown.innerHTML = '<div class="p-3 text-xs text-gray-500">Nenhum grupo encontrado.</div>';
                dropdown.classList.remove('hidden');
            }
        });

        // Hide dropdown on outside click
        document.addEventListener('click', (e) => {
            if (!nameInput.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.classList.add('hidden');
            }
        });

        // Enter no nome dispara busca
        nameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleCalendarSearch();
        });
    }

    if (searchBtn) {
        searchBtn.addEventListener('click', handleCalendarSearch);
    }
}

function handleCalendarSearch() {
    const resultBox = document.getElementById('calendarSearchResult');
    const resultText = document.getElementById('calendarSearchResultText');
    const btn = document.getElementById('calendarSearchBtn');

    // Se tem um grupo selecionado via lógica (ID), usa ele.
    // Se não, tenta buscar pelo que está escrito no input de numero ou nome como fallback
    let group = null;

    if (selectedSearchGroupId) {
        group = globalGroups.find(g => g.id === selectedSearchGroupId);
    } else {
        // Fallback manual search
        const numVal = document.getElementById('searchNum').value.trim();
        const nameVal = document.getElementById('searchName').value.trim().toLowerCase();

        if (numVal) {
            group = globalGroups.find(g => (g.number ? g.number.slice(-3) : '') === numVal);
        } else if (nameVal) {
            group = globalGroups.find(g => g.name.toLowerCase().includes(nameVal));
        }
    }

    if (!group && !document.getElementById('searchName').value && !document.getElementById('searchNum').value) return; // Campos vazios

    // Animação Loading
    const originalHtml = btn.innerHTML;
    btn.innerHTML = '<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> Buscando...';
    if (typeof lucide !== 'undefined') lucide.createIcons();

    setTimeout(() => {
        if (group) {
            const scheduleData = globalScheduleMap.get(group.id);

            if (scheduleData) {
                const monthName = MONTHS[scheduleData.monthIndex];
                const units = scheduleData.interested.length > 0 ? scheduleData.interested.join(', ') : 'Nenhuma (Item sugerido pelo sistema)';

                resultText.innerHTML = `
                    <div class="flex items-center gap-2 mb-1">
                        <span class="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-0.5 rounded border border-blue-200">Grupo ${group.number ? group.number.slice(-3) : 'S/N'}</span>
                        <span class="font-bold text-slate-700 text-sm">${group.name}</span>
                    </div>
                    <div class="text-sm text-slate-600">
                        Está programado para o mês de <strong class="text-blue-700 uppercase">${monthName}</strong>.
                    </div>
                    <div class="text-xs text-slate-500 mt-1">
                        <strong>Interessados:</strong> ${units}
                    </div>
                `;
            } else {
                // Grupo existe mas não entrou no calendário (sem prioridade > 0)
                resultText.innerHTML = `
                    O grupo <strong>${group.number ? group.number.slice(-3) : 'S/N'} - ${group.name}</strong> foi encontrado no catálogo, mas 
                    <span class="text-red-600 font-bold">não possui solicitações ativas</span> ou prioridade suficiente para entrar no calendário de 2026.
                `;
            }
        } else {
            const term = document.getElementById('searchName').value || document.getElementById('searchNum').value;
            resultText.innerHTML = `Nenhum grupo encontrado para "<strong>${term}</strong>". Verifique o número ou nome digitado.`;
        }

        resultBox.classList.remove('hidden');
        btn.innerHTML = originalHtml;
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }, 600);
}


// --- CORE LOGIC FUNCTIONS (Defined before use) ---

function renderMyRequests() {
    const listContainer = document.getElementById('myRequestsList');
    if (!listContainer) return;
    const textFilterInput = document.getElementById('filterMyRequests');
    const textFilter = textFilterInput ? textFilterInput.value.toLowerCase() : '';

    if (!globalGroups.length) {
        listContainer.innerHTML = `<div class="px-6 py-10 text-center text-gray-500 text-sm">Nenhum grupo.</div>`;
        return;
    }

    const isLocked = (isSystemLocked || isDeadlineExpired) && (!appUser || (!appUser.isMaster && !appUser.isAdmin));

    const filtered = globalGroups.filter(g => {
        const matchesName = g.name.toLowerCase().includes(textFilter) || (g.number && g.number.includes(textFilter));
        if (!matchesName) return false;

        const req = userRequests[g.id];

        if (currentFilter === 'pending') {
            return !req;
        } else if (currentFilter === 'priority10') {
            return req && req.priority == 10;
        } else if (currentFilter === 'today') {
            if (!req || !req.lastEditedAt) return false;
            const date = new Date(req.lastEditedAt);
            const today = new Date();
            return date.toDateString() === today.toDateString();
        }

        return true;
    });

    if (!filtered.length) {
        listContainer.innerHTML = `<div class="px-6 py-10 text-center text-gray-500 text-sm">Nada encontrado.</div>`;
        return;
    }

    listContainer.innerHTML = filtered.map(g => {
        const req = userRequests[g.id];
        const val = req ? req.priority : "";
        const monthVal = req ? req.preferredMonth : "";
        const cod = g.number ? g.number.slice(-3) : '---';

        let tooltip = "Sem alterações recentes";
        if (req && req.lastEditor) {
            tooltip = `Última alteração por: ${req.lastEditor}`;
        }

        return `
        <div class="req-row flex items-center hover:bg-slate-50 transition-colors ${!req ? 'bg-slate-50/50' : ''}">
            <div class="px-6 py-3 w-24 border-r border-gray-100 shrink-0 text-sm font-mono font-semibold text-slate-600">${cod}</div>
            <div class="px-6 py-3 flex-1 text-sm text-slate-700">${g.name}</div>
            <div class="px-6 py-2 w-40 shrink-0">
                <select ${isLocked ? 'disabled' : ''} title="${tooltip}" data-gid="${g.id}" data-field="priority" data-old="${val}" class="req-select w-full border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500 ${val === 10 ? 'bg-red-50 text-red-700 font-bold' : (val === 0 && req ? 'bg-gray-100 text-gray-500' : '')}">
                    <option value="" ${val === "" ? 'selected' : ''} class="text-gray-400">Pendente...</option>
                    <option value="0" ${val === 0 ? 'selected' : ''}>0 - Sem Interesse</option>
                    ${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => `<option value="${n}" ${val === n ? 'selected' : ''}>${n}</option>`).join('')}
                </select>
            </div>
            <div class="px-6 py-2 w-48 shrink-0">
                 <select ${isLocked ? 'disabled' : ''} data-gid="${g.id}" data-field="month" data-old="${monthVal}" class="req-select w-full border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500 text-xs">
                    <option value="">Sem Preferência</option>
                    ${MONTHS.map((m, i) => `<option value="${i}" ${monthVal == i.toString() ? 'selected' : ''}>${m}</option>`).join('')}
                </select>
            </div>
        </div>`;
    }).join('');

    listContainer.querySelectorAll('select').forEach(s => {
        s.addEventListener('change', updateUnsavedChangesUI);
    });
    updateUnsavedChangesUI();
}

function renderGroupsTable(list) {
    const tbody = document.getElementById('groupsTable');
    const filterEl = document.getElementById('filterGroups');
    if (!tbody || !filterEl) return;

    const filter = filterEl.value.toLowerCase();
    const visible = list.filter(g => g.name.toLowerCase().includes(filter) || (g.number && g.number.includes(filter)));
    tbody.innerHTML = visible.map(g => `
        <tr class="hover:bg-slate-50 group">
            <td class="px-4 py-2 font-mono text-xs text-slate-600">${g.number ? g.number.slice(-3) : '---'}</td>
            <td class="px-4 py-2 text-slate-700">${g.name}</td>
            <td class="px-4 py-2 text-right space-x-2">
                <button onclick="window.editGroup('${g.id}')" class="text-blue-600 hover:text-blue-800"><i data-lucide="edit-2" class="w-4 h-4"></i></button>
                <button onclick="window.deleteGroupInit('${g.id}', '${(g.name || '').replace(/'/g, "\\'")}')" class="text-red-600 hover:text-red-800"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
            </td>
        </tr>
    `).join('');
    if (typeof lucide !== 'undefined') lucide.createIcons();
}
function renderCalendar(common, specific) {
    const schedule = MONTHS.map(() => ({ c: [], s: [] }));
    const assignedGroups = new Set();

    const placeFixed = (list, type) => {
        const remaining = [];
        list.forEach(item => {
            if (item.finalMonth !== null && item.finalMonth >= 0 && item.finalMonth < 12) {
                if (type === 'C') schedule[item.finalMonth].c.push(item);
                else schedule[item.finalMonth].s.push(item);
                assignedGroups.add(item.group.id);
            } else {
                remaining.push(item);
            }
        });
        return remaining;
    };

    const remainingCommon = placeFixed(common, 'C');
    const remainingSpecific = placeFixed(specific, 'S');

    const distribute = (list, type) => {
        const total = list.length;
        const baseChunk = Math.floor(total / 12);
        const remainder = total % 12;
        let offset = 0;

        for (let i = 0; i < 12; i++) {
            const chunkCurrent = baseChunk + (i < remainder ? 1 : 0);
            const monthItems = list.slice(offset, offset + chunkCurrent);
            offset += chunkCurrent;
            if (type === 'C') schedule[i].c.push(...monthItems);
            else schedule[i].s.push(...monthItems);
        }
    };

    distribute(remainingCommon, 'C');
    distribute(remainingSpecific, 'S');

    mapScheduleData(schedule);

    const calArea = document.getElementById('calendar-print-area');
    if (!calArea) return;

    const isMaster = appUser && appUser.isMaster;

    calArea.innerHTML = MONTHS.map((m, idx) => {
        const mData = schedule[idx];

        const renderCard = (it, type) => `
            <div class="draggable-card border-l-4 ${type == 'C' ? 'border-blue-500 bg-blue-50' : 'border-purple-500 bg-purple-50'} pl-3 py-2 mb-2 rounded-r shadow-sm text-xs break-inside-avoid relative group" 
                 ${isMaster ? `draggable="true" ondragstart="window.handleDragStart(event, '${it.group.id}')" ondragend="window.handleDragEnd(event)"` : ''}>
                ${isMaster ? '<div class="absolute top-1 right-1 opacity-0 group-hover:opacity-100 cursor-move text-gray-400"><i data-lucide="grip-vertical" class="w-3 h-3"></i></div>' : ''}
                <div class="flex justify-between font-bold text-slate-700">
                    <span>${it.group.number ? it.group.number.slice(-3) : 'S/N'} - ${it.group.name}</span>
                    <span class="bg-white px-1 rounded border border-slate-200">Média: ${it.avg.toFixed(1)}</span>
                </div>
                <div class="text-slate-500 mt-1 leading-tight">Interessados: ${it.reqs.map(r => r.unitName).join(', ')}</div>
            </div>`;

        return `
            <div class="calendar-month bg-white rounded-lg border border-gray-200 p-4 mb-6 break-inside-avoid drop-zone" 
                 ${isMaster ? `ondragover="window.handleDragOver(event)" ondragleave="window.handleDragLeave(event)" ondrop="window.handleDrop(event, ${idx})"` : ''}>
                <h3 class="text-xl font-bold text-blue-900 border-b border-blue-100 pb-2 mb-4 uppercase tracking-wide flex justify-between items-center">
                    <span>${m} <span class="text-slate-400 text-sm normal-case">${YEAR}</span></span>
                    <span class="text-xs font-normal text-gray-400 bg-gray-50 px-2 py-1 rounded">Itens: ${mData.c.length + mData.s.length}</span>
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pointer-events-none">
                    <div>
                        <h4 class="text-xs font-bold text-blue-600 uppercase mb-2 flex items-center gap-1"><i data-lucide="layers" class="w-3 h-3"></i> Pedidos Comuns</h4>
                        <div class="pointer-events-auto space-y-2 min-h-[20px]">
                            ${mData.c.map(i => renderCard(i, 'C')).join('')}
                        </div>
                    </div>
                    <div>
                        <h4 class="text-xs font-bold text-purple-600 uppercase mb-2 flex items-center gap-1"><i data-lucide="star" class="w-3 h-3"></i> Pedidos Específicos</h4>
                        <div class="pointer-events-auto space-y-2 min-h-[20px]">
                            ${mData.s.map(i => renderCard(i, 'S')).join('')}
                        </div>
                    </div>
                </div>
            </div>`;
    }).join('');
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function mapScheduleData(schedule) {
    globalScheduleMap.clear();
    schedule.forEach((monthData, monthIdx) => {
        [...monthData.c, ...monthData.s].forEach(item => {
            globalScheduleMap.set(item.group.id, {
                monthIndex: monthIdx,
                group: item.group,
                interested: item.reqs.map(r => r.unitName)
            });
        });
    });
}

function processDashboard() {
    if (!globalGroups.length) return;
    const data = {};
    globalGroups.forEach(g => data[g.id] = { group: g, reqs: [], total: 0, months: {} });

    globalRequests.forEach(r => {
        if (data[r.groupId] && r.priority > 0) {
            data[r.groupId].reqs.push(r);
            data[r.groupId].total += r.priority;

            if (r.preferredMonth !== "") {
                if (!data[r.groupId].months[r.preferredMonth]) data[r.groupId].months[r.preferredMonth] = 0;
                data[r.groupId].months[r.preferredMonth]++;
            }
        }
    });

    const results = Object.values(data).filter(d => d.reqs.length > 0).map(d => {
        const avg = d.total / d.reqs.length;

        let bestMonth = null;
        let maxVotes = -1;
        for (const m in d.months) {
            if (d.months[m] > maxVotes) {
                maxVotes = d.months[m];
                bestMonth = parseInt(m);
            }
        }

        const override = calendarOverrides[d.group.id];

        return {
            ...d,
            avg: avg,
            finalMonth: override !== undefined ? override : (bestMonth !== null ? bestMonth : null)
        };
    }).sort((a, b) => b.avg - a.avg);

    const common = results.filter(r => r.reqs.length > 2);
    const specific = results.filter(r => r.reqs.length <= 2);

    const elTotal = document.getElementById('metricTotalGroups');
    if (elTotal) elTotal.textContent = globalGroups.length;

    const elDemand = document.getElementById('metricDemandGroups');
    if (elDemand) elDemand.textContent = results.length;

    const elCommon = document.getElementById('metricCommonRequests');
    if (elCommon) elCommon.textContent = common.length;

    const elSpecific = document.getElementById('metricSpecificRequests');
    if (elSpecific) elSpecific.textContent = specific.length;

    const renderRow = (l, elId) => {
        const container = document.getElementById(elId);
        if (container) container.innerHTML = l.map(i => `<tr><td class="px-2 py-1 font-mono text-xs">${i.group.number ? i.group.number.slice(-3) : ''}</td><td class="px-2 py-1">${i.group.name}</td><td class="px-2 py-1 text-center">${i.reqs.length}</td><td class="px-2 py-1 text-center font-bold">${i.avg.toFixed(1)}</td></tr>`).join('');
    };
    renderRow(common, 'commonRequestsList');
    renderRow(specific, 'specificRequestsList');

    const units = {};
    globalRequests.forEach(r => { if (!units[r.unitName]) units[r.unitName] = { count: 0, sum: 0 }; units[r.unitName].count++; units[r.unitName].sum += r.priority; });

    const unitList = document.getElementById('unitDetailsList');
    if (unitList) unitList.innerHTML = Object.keys(units).sort().map(u => `<tr><td class="px-4 py-2 font-medium">${u}</td><td class="px-4 py-2 text-center">${units[u].count}</td><td class="px-4 py-2 text-center">${units[u].sum}</td><td class="px-4 py-2 text-center">${(units[u].sum / units[u].count).toFixed(1)}</td></tr>`).join('');

    renderCalendar(common, specific);
}



function setupUI() {
    // Tabs
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));

            btn.classList.add('active');
            const tabId = btn.dataset.tab;
            document.getElementById(tabId).classList.remove('hidden');

            if (tabId === 'tab-analise') processDashboard();
        });
    });

    // PDF
    safeAddEventListener('generatePdfButton', 'click', generatePDFReport);

    // Export
    safeAddEventListener('exportReportButton', 'click', exportCSV);

    // Save My Requests
    safeAddEventListener('saveAllMyRequests', 'click', saveMyRequests);

    // Float Save
    safeAddEventListener('btnFloatSave', 'click', saveMyRequests);

    // Delete Modal Logic
    const cancel = document.getElementById('cancelDelete');
    if (cancel) cancel.onclick = () => document.getElementById('deleteConfirmModal').classList.add('hidden');

    const confirm = document.getElementById('confirmDelete');
    if (confirm) confirm.onclick = async () => {
        if (!deleteTargetId) return;

        if (deleteType === 'group') {
            const batch = writeBatch(db);
            batch.delete(doc(db, `artifacts / ${appId} /public/data / groups`, deleteTargetId));
            const q = query(collection(db, `artifacts / ${appId} /public/data / requests`), where("groupId", "==", deleteTargetId));
            const snaps = await getDocs(q);
            snaps.forEach(d => batch.delete(d.ref));
            await batch.commit();
        } else if (deleteType === 'user') {
            await deleteDoc(doc(db, `artifacts / ${appId} /public/data / app_users`, deleteTargetId));
        } else if (deleteType === 'reset_calendar') {
            const q = query(collection(db, `artifacts / ${appId} /public/data / calendar_overrides`));
            const snaps = await getDocs(q);
            const batch = writeBatch(db);
            snaps.forEach(d => batch.delete(d.ref));
            await batch.commit();
        }

        document.getElementById('deleteConfirmModal').classList.add('hidden');
    };
}

function setupGroupAdmin() {
    // Import CSV
    safeAddEventListener('btnProcessImport', 'click', async () => {
        const fileInput = document.getElementById('csvFileInput');
        const file = fileInput.files[0];
        if (!file) return alert("Selecione um arquivo CSV.");

        const reader = new FileReader();
        reader.onload = async (e) => {
            const text = e.target.result;
            const lines = text.split('\n');
            const batch = writeBatch(db);
            let count = 0;

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line) continue;
                // Expected format: CODE;NAME or CODE,NAME
                let parts = line.split(';');
                if (parts.length < 2) parts = line.split(',');

                if (parts.length >= 2) {
                    const code = parts[0].trim();
                    const name = parts.slice(1).join(' ').trim().replace(/^"|"$/g, '');

                    if (code && name) {
                        // Try to find existing group by number to update, otherwise create new
                        const existing = globalGroups.find(g => g.number === code);
                        const ref = existing ? doc(db, `artifacts/${appId}/public/data/groups`, existing.id) : doc(collection(db, `artifacts/${appId}/public/data/groups`));

                        batch.set(ref, {
                            number: code,
                            name: name,
                            updatedAt: new Date().toISOString()
                        }, { merge: true });
                        count++;
                    }
                }
            }

            if (count > 0) {
                try {
                    await batch.commit();
                    alert(`${count} grupos processados com sucesso!`);
                    fileInput.value = '';
                } catch (err) {
                    console.error(err);
                    alert("Erro ao salvar grupos.");
                }
            } else {
                alert("Nenhum grupo válido encontrado no CSV.");
            }
        };
        reader.readAsText(file);
    });

    // Sync Defaults
    safeAddEventListener('syncDefaultGroups', 'click', async () => {
        if (!confirm("Isso irá recriar os grupos padrão se não existirem. Continuar?")) return;

        const batch = writeBatch(db);
        let added = 0;

        for (const g of DEFAULT_GROUPS_RAW) {
            const code = g[0];
            const name = g[1];

            // Check if exists locally first to avoid reads? 
            // globalGroups is live, so we can check it.
            const exists = globalGroups.some(gg => gg.number === code);
            if (!exists) {
                const ref = doc(collection(db, `artifacts/${appId}/public/data/groups`));
                batch.set(ref, { number: code, name: name, updatedAt: new Date().toISOString() });
                added++;
            }
        }

        if (added > 0) {
            await batch.commit();
            alert(`${added} grupos padrão restaurados.`);
        } else {
            alert("Todos os grupos padrão já existem.");
        }
    });

    // Reset Calendar
    safeAddEventListener('btnResetCalendar', 'click', () => {
        window.deleteType = 'reset_calendar';
        document.getElementById('deleteMsg').textContent = "Isso apagará todos os ajustes manuais de meses (drag & drop). Confirmar?";
        document.getElementById('deleteConfirmModal').classList.remove('hidden');
    });

    // Toggle Lock
    safeAddEventListener('btnToggleLock', 'click', async () => {
        const newState = !isSystemLocked;
        try {
            await setDoc(doc(db, `artifacts/${appId}/public/data/app_config`, 'global'), {
                systemLocked: newState,
                updatedAt: new Date().toISOString()
            }, { merge: true });
        } catch (e) {
            alert("Erro ao alterar status.");
        }
    });

    // Group Form
    const groupForm = document.getElementById('groupForm');
    if (groupForm) {
        groupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('groupId').value;
            const number = document.getElementById('groupNumber').value;
            const name = document.getElementById('groupName').value;

            if (!name) return;

            try {
                const ref = id ? doc(db, `artifacts/${appId}/public/data/groups`, id) : doc(collection(db, `artifacts/${appId}/public/data/groups`));
                await setDoc(ref, {
                    number,
                    name,
                    updatedAt: new Date().toISOString()
                }, { merge: true });

                alert("Grupo salvo!");
                groupForm.reset();
                document.getElementById('groupId').value = '';
                document.getElementById('cancelGroupEdit').classList.add('hidden');
            } catch (err) {
                console.error(err);
                alert("Erro ao salvar.");
            }
        });
    }

    safeAddEventListener('cancelGroupEdit', 'click', () => {
        document.getElementById('groupForm').reset();
        document.getElementById('groupId').value = '';
        document.getElementById('cancelGroupEdit').classList.add('hidden');
    });
}

function exportCSV() {
    if (!globalGroups.length) return alert("Sem dados para exportar.");

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Codigo;Grupo;Total Prioridade;Media Prioridade;Mes Sugerido;Mes Final;Interessados\n";

    const data = {};
    globalGroups.forEach(g => data[g.id] = { group: g, reqs: [], total: 0, months: {} });

    globalRequests.forEach(r => {
        if (data[r.groupId] && r.priority > 0) {
            data[r.groupId].reqs.push(r);
            data[r.groupId].total += r.priority;
            if (r.preferredMonth !== "") {
                if (!data[r.groupId].months[r.preferredMonth]) data[r.groupId].months[r.preferredMonth] = 0;
                data[r.groupId].months[r.preferredMonth]++;
            }
        }
    });

    const results = Object.values(data).filter(d => d.reqs.length > 0).map(d => {
        const avg = d.total / d.reqs.length;
        let bestMonth = null;
        let maxVotes = -1;
        for (const m in d.months) {
            if (d.months[m] > maxVotes) {
                maxVotes = d.months[m];
                bestMonth = parseInt(m);
            }
        }
        const override = calendarOverrides[d.group.id];
        return {
            ...d,
            avg: avg,
            bestMonth: bestMonth !== null ? MONTHS[bestMonth] : 'Indefinido',
            finalMonth: override !== undefined ? MONTHS[override] : (bestMonth !== null ? MONTHS[bestMonth] : 'Indefinido')
        };
    });

    results.forEach(r => {
        const interested = r.reqs.map(q => `${q.unitName} (${q.priority})`).join(' | ');
        const row = [
            r.group.number || '',
            `"${r.group.name.replace(/"/g, '""')}"`,
            r.total,
            r.avg.toFixed(2),
            r.bestMonth,
            r.finalMonth,
            `"${interested}"`
        ].join(';');
        csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "relatorio_compras_2026.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function generatePDFReport() {
    const date = new Date().toLocaleDateString('pt-BR');
    document.getElementById('pdfDate').textContent = date;

    const sourceContent = document.getElementById('calendar-print-area').cloneNode(true);
    const targetArea = document.getElementById('pdfContentArea');
    targetArea.innerHTML = '';

    const guideOriginal = document.getElementById('calendarGuide');
    if (guideOriginal) {
        const guideClone = guideOriginal.cloneNode(true);
        guideClone.classList.remove('no-print');
        guideClone.style.marginBottom = '20px';
        const hint = guideClone.querySelector('#masterDragHint');
        if (hint) hint.remove();
        targetArea.appendChild(guideClone);
    }

    targetArea.appendChild(sourceContent);

    // --- Inject Custom Logo into PDF Template ---
    const appLogoImg = document.getElementById('appLogoImg');
    const pdfLogoContainer = document.getElementById('pdfLogoContainer');

    if (appLogoImg && !appLogoImg.classList.contains('hidden') && appLogoImg.src) {
        pdfLogoContainer.innerHTML = '';
        const newImg = document.createElement('img');
        newImg.src = appLogoImg.src;
        newImg.className = "w-full h-full object-contain";
        pdfLogoContainer.appendChild(newImg);
    } else {
        pdfLogoContainer.innerHTML = `
            <svg class="w-full h-full absolute inset-0 p-1" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    <path d="M50 5 L90 25 V55 C90 80 50 95 50 95 C50 95 10 80 10 55 V25 L50 5 Z" fill="#e2e8f0" stroke="#1e3a8a" stroke-width="2"/>
                    <path d="M50 15 L50 85 M20 40 L80 40" stroke="#1e3a8a" stroke-width="2" opacity="0.2"/>
                    <text x="50" y="65" font-family="serif" font-weight="bold" font-size="40" text-anchor="middle" fill="#1e3a8a">C</text>
                </svg>
            <img src="https://upload.wikimedia.org/wikipedia/commons/b/b2/Bras%C3%A3o_de_Curvelo.jpg"
                alt="Brasão Curvelo"
                class="w-full h-full object-contain relative z-10"
                crossorigin="anonymous"
                onerror="this.style.display='none'">`;
    }

    // HTML2PDF Generation
    const element = document.getElementById('pdfTemplate');

    // Clone to render off-screen
    const clone = element.cloneNode(true);
    clone.id = 'pdf-render-temp';
    clone.classList.remove('hidden');
    clone.style.width = '700px'; // Ensure fixed width for PDF consistency
    clone.style.position = 'absolute';
    clone.style.left = '-9999px';
    clone.style.top = '0';
    document.body.appendChild(clone);

    const opt = {
        margin: [10, 10, 10, 10],
        filename: 'calendario-compras-2026.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // Use window.html2pdf if imported via script tag
    const worker = window.html2pdf ? window.html2pdf() : html2pdf();

    worker.set(opt).from(clone).save().then(() => {
        document.body.removeChild(clone);
    }).catch(err => {
        console.error("PDF Error:", err);
        alert("Erro ao gerar PDF.");
        document.body.removeChild(clone);
    });
}
