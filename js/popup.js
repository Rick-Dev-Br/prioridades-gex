import { lerConfig, lerNivel, removerNivel, salvarNivel } from './prioridades.js';

const t = window.TrelloPowerUp.iframe();
const atual = document.getElementById('atual');
const niveis = document.getElementById('niveis');
const remover = document.getElementById('remover');
const erro = document.getElementById('erro');

async function salvar(acao) {
  try {
    await acao();
    t.closePopup();
  } catch {
    erro.textContent = 'A prioridade ficou sem salvar. Feche esta janela e tente de novo.';
    erro.hidden = false;
    t.sizeTo('#conteudo');
  }
}

remover.addEventListener('click', () => salvar(() => removerNivel(t)));

t.render(async () => {
  const [nivel, config] = await Promise.all([lerNivel(t), lerConfig(t)]);

  atual.textContent = nivel
    ? `Prioridade atual: ${nivel} ${config.nomes[nivel - 1]}.`
    : 'Este cartão ainda está sem prioridade.';

  // textContent, nunca innerHTML: o nome vem do que alguém digitou nas configurações.
  niveis.replaceChildren(...config.nomes.map((nome, i) => {
    const botao = document.createElement('button');
    botao.type = 'button';
    botao.className = `nivel nivel-${i + 1}`;
    botao.textContent = `${i + 1} ${nome}`;
    botao.setAttribute('aria-pressed', String(nivel === i + 1));
    botao.addEventListener('click', () => salvar(() => salvarNivel(t, i + 1)));
    return botao;
  }));

  remover.hidden = !nivel;
  return t.sizeTo('#conteudo');
});
