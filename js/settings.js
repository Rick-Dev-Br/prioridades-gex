import { lerConfig, normalizarConfig, salvarConfig } from './prioridades.js';

const t = window.TrelloPowerUp.iframe();
const nomes = [...document.querySelectorAll('#nomes input')];
const opcoes = ['frente', 'verso', 'soAltasNaFrente'].map((id) => document.getElementById(id));
const erro = document.getElementById('erro');

function mostrarErro(texto) {
  erro.textContent = texto;
  erro.hidden = false;
  t.sizeTo('#conteudo');
}

// Lê uma vez só: o t.render leria de novo a cada mudança e apagaria o que a pessoa está digitando.
lerConfig(t)
  .then((config) => {
    nomes.forEach((input, i) => { input.value = config.nomes[i]; });
    opcoes.forEach((caixa) => { caixa.checked = config[caixa.id]; });
    t.sizeTo('#conteudo');
  })
  .catch(() => mostrarErro('As configurações ficaram sem carregar. Feche esta janela e abra de novo.'));

document.getElementById('salvar').addEventListener('click', async () => {
  // Nome vazio volta ao padrão e nome longo é cortado (normalizarConfig).
  const config = normalizarConfig({
    nomes: nomes.map((input) => input.value),
    ...Object.fromEntries(opcoes.map((caixa) => [caixa.id, caixa.checked])),
  });

  try {
    await salvarConfig(t, config);
    t.closePopup();
  } catch {
    mostrarErro('As configurações ficaram sem salvar. Feche esta janela e tente de novo.');
  }
});
