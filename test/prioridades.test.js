import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  badgesFrente, badgeVerso, nivelValido, normalizarConfig, ordenarIds,
} from '../js/prioridades.js';

const padrao = normalizarConfig(undefined);

test('nivelValido aceita só inteiros de 1 a 5', () => {
  assert.equal(nivelValido(1), 1);
  assert.equal(nivelValido(5), 5);
  for (const valor of [0, 6, 2.5, '1', null, undefined, {}]) {
    assert.equal(nivelValido(valor), null);
  }
});

test('normalizarConfig volta ao padrão quando o dado salvo vem quebrado', () => {
  assert.deepEqual(padrao, {
    nomes: ['Urgente', 'Alta', 'Média', 'Baixa', 'Nenhuma'],
    frente: true,
    verso: true,
    soAltasNaFrente: false,
  });

  const config = normalizarConfig({ nomes: ['  Máxima ', '', 42, 'x'.repeat(50)], frente: 'sim', verso: false });
  assert.deepEqual(config.nomes, ['Máxima', 'Alta', 'Média', 'x'.repeat(30), 'Nenhuma']);
  assert.equal(config.frente, true);
  assert.equal(config.verso, false);
});

test('badgesFrente respeita "mostrar na frente" e "só as altas"', () => {
  assert.deepEqual(badgesFrente(1, padrao), [{ text: 'Urgente', color: 'red' }]);
  assert.deepEqual(badgesFrente(null, padrao), []);
  assert.deepEqual(badgesFrente(1, { ...padrao, frente: false }), []);

  const soAltas = { ...padrao, soAltasNaFrente: true };
  assert.deepEqual(badgesFrente(2, soAltas), [{ text: 'Alta', color: 'orange' }]);
  assert.deepEqual(badgesFrente(3, soAltas), []);
});

test('badgeVerso mostra "Definir" sem prioridade e some quando desligado', () => {
  assert.deepEqual(badgeVerso(3, padrao), { title: 'Prioridade', text: 'Média (3)', color: 'yellow' });
  assert.deepEqual(badgeVerso(null, padrao), { title: 'Prioridade', text: 'Definir' });
  assert.equal(badgeVerso(3, { ...padrao, verso: false }), null);
});

test('ordenarIds: mais urgente primeiro, sem prioridade no fim, empate pela posição', () => {
  const cards = [{ id: 'a', pos: 1 }, { id: 'b', pos: 2 }, { id: 'c', pos: 3 }, { id: 'd', pos: 4 }];
  assert.deepEqual(ordenarIds(cards, [null, 3, 1, 3]), ['c', 'b', 'd', 'a']);
});
