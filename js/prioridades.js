// Regras de prioridade usadas pelo conector, pelo popup e pela tela de configurações.
// Fora as funções que recebem `t`, tudo aqui é função pura (testada em test/).

export const CORES = ['red', 'orange', 'yellow', 'green', 'blue']; // cor do badge do Trello, nível 1 a 5
export const NIVEL_ALTO_MAX = 2; // "só as altas na frente" mostra os níveis 1 e 2
export const TAMANHO_MAX_NOME = 30;

export const CONFIG_PADRAO = Object.freeze({
  nomes: Object.freeze(['Urgente', 'Alta', 'Média', 'Baixa', 'Nenhuma']),
  frente: true,
  verso: true,
  soAltasNaFrente: false,
});

// O dado salvo pode ser alterado por qualquer membro do quadro pela API do Trello: só aceita 1 a 5.
export function nivelValido(valor) {
  return Number.isInteger(valor) && valor >= 1 && valor <= CORES.length ? valor : null;
}

export function normalizarConfig(salva) {
  const c = salva !== null && typeof salva === 'object' ? salva : {};
  const nomes = CONFIG_PADRAO.nomes.map((padrao, i) => {
    const nome = Array.isArray(c.nomes) && typeof c.nomes[i] === 'string'
      ? c.nomes[i].trim().slice(0, TAMANHO_MAX_NOME)
      : '';
    return nome || padrao;
  });
  const booleano = (chave) => (typeof c[chave] === 'boolean' ? c[chave] : CONFIG_PADRAO[chave]);

  return {
    nomes,
    frente: booleano('frente'),
    verso: booleano('verso'),
    soAltasNaFrente: booleano('soAltasNaFrente'),
  };
}

export function badgesFrente(nivel, config) {
  if (!nivel || !config.frente) return [];
  if (config.soAltasNaFrente && nivel > NIVEL_ALTO_MAX) return [];
  return [{ text: config.nomes[nivel - 1], color: CORES[nivel - 1] }];
}

export function badgeVerso(nivel, config) {
  if (!config.verso) return null;
  if (!nivel) return { title: 'Prioridade', text: 'Definir' };
  return { title: 'Prioridade', text: `${config.nomes[nivel - 1]} (${nivel})`, color: CORES[nivel - 1] };
}

// Mais urgente primeiro; sem prioridade vai para o fim; empate mantém a posição atual na lista.
export function ordenarIds(cards, niveis) {
  return cards
    .map((card, i) => ({ id: card.id, pos: card.pos, nivel: niveis[i] ?? Infinity }))
    .sort((a, b) => a.nivel - b.nivel || a.pos - b.pos)
    .map((card) => card.id);
}

// Leitura e gravação no próprio Trello (pluginData). Nenhum dado sai para outro servidor.
export async function lerConfig(t) {
  return normalizarConfig(await t.get('board', 'shared', 'config'));
}

export async function lerNivel(t, escopo = 'card') {
  return nivelValido(await t.get(escopo, 'shared', 'prioridade'));
}

export const salvarConfig = (t, config) => t.set('board', 'shared', 'config', config);
export const salvarNivel = (t, nivel) => t.set('card', 'shared', 'prioridade', nivel);
export const removerNivel = (t) => t.remove('card', 'shared', 'prioridade');
