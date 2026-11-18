import { badgesFrente, badgeVerso, lerConfig, lerNivel, ordenarIds } from './prioridades.js';

const ICONE = new URL('../img/prioridade.svg', import.meta.url).href;

const abrirPopup = (t) => t.popup({ title: 'Prioridade do cartão', url: './popup.html', height: 340 });

const lerCartao = (t) => Promise.all([lerNivel(t), lerConfig(t)]);

window.TrelloPowerUp.initialize({
  'card-badges': async (t) => {
    const [nivel, config] = await lerCartao(t);
    return badgesFrente(nivel, config);
  },

  'card-detail-badges': async (t) => {
    const [nivel, config] = await lerCartao(t);
    const badge = badgeVerso(nivel, config);
    return badge ? [{ ...badge, callback: abrirPopup }] : [];
  },

  // Com o badge do verso desligado nas configurações, este botão é o caminho para mudar a prioridade.
  'card-buttons': () => [{ icon: ICONE, text: 'Prioridade', condition: 'edit', callback: abrirPopup }],

  'show-settings': (t) => t.popup({ title: 'Prioridades', url: './settings.html', height: 430 }),

  'list-sorters': () => [{
    text: 'Prioridade (mais urgente primeiro)',
    callback: async (t, opts) => {
      const niveis = await Promise.all(opts.cards.map((card) => lerNivel(t, card.id)));
      return { sortedIds: ordenarIds(opts.cards, niveis) };
    },
  }],
});
