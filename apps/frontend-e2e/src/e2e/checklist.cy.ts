describe('IA Course Tracker - Checklist E2E Flow', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit('/');
  });

  it('1. Carregamento e Estado Inicial: deve carregar a rota com tema Dark e métricas zeradas', () => {
    cy.get('h1')
      .should('be.visible')
      .and('have.class', 'font-header')
      .and('contain.text', 'IA Course Tracker');

    cy.contains('article', 'Progresso do Certificado').within(() => {
      cy.contains('0%').should('be.visible');
    });

    cy.contains('article', 'Estudado a Fundo').within(() => {
      cy.contains('0').should('be.visible');
    });

    cy.contains('article', 'Acelerado p/ Prova').within(() => {
      cy.contains('0').should('be.visible');
    });

    cy.contains('article', 'Voltar com Calma').within(() => {
      cy.contains('0').should('be.visible');
    });

    cy.contains('h2', 'Fundamentos de IA e LLMs para Programadores').should(
      'be.visible'
    );
    cy.get('[data-item-id="s1-m1-s1"]')
      .should('be.visible')
      .and('contain.text', 'Submódulo 1.1');

    cy.get('[data-testid="subject-locked-s12"]').should(
      'contain.text',
      '🔒 BLOQUEADA • Início em 14/11/2026'
    );
  });

  it('2. Seleção de Status e Atualização Visual: deve atualizar chip visual e métricas dinâmicas', () => {
    cy.get('[data-item-id="s1-m1-s1"]').within(() => {
      cy.contains('button', 'Acelerado / Prova')
        .should('have.attr', 'aria-pressed', 'false')
        .click();

      cy.contains('button', 'Acelerado / Prova')
        .should('have.class', 'bg-[#FFFA93]')
        .and('have.attr', 'aria-pressed', 'true');
    });

    cy.contains('article', 'Acelerado p/ Prova').within(() => {
      cy.contains('1').should('be.visible');
    });

    cy.get('[data-item-id="s1-m1-s1"]').within(() => {
      cy.contains('button', 'Estudado a Fundo').click();

      cy.contains('button', 'Estudado a Fundo')
        .should('have.class', 'bg-[#85E8A5]')
        .and('have.attr', 'aria-pressed', 'true');

      cy.contains('button', 'Acelerado / Prova')
        .should('not.have.class', 'bg-[#FFFA93]')
        .and('have.attr', 'aria-pressed', 'false');
    });

    cy.contains('article', 'Estudado a Fundo').within(() => {
      cy.contains('1').should('be.visible');
    });

    cy.contains('article', 'Acelerado p/ Prova').within(() => {
      cy.contains('0').should('be.visible');
    });
  });

  it('3. Persistência de Dados: deve manter o estado salvo após cy.reload()', () => {
    cy.get('[data-item-id="s1-m1-s1"]').within(() => {
      cy.contains('button', 'Estudado a Fundo').click();
      cy.contains('button', 'Estudado a Fundo').should(
        'have.class',
        'bg-[#85E8A5]'
      );
    });

    cy.reload();

    cy.get('[data-item-id="s1-m1-s1"]').within(() => {
      cy.contains('button', 'Estudado a Fundo')
        .should('be.visible')
        .and('have.class', 'bg-[#85E8A5]')
        .and('have.attr', 'aria-pressed', 'true');

      cy.contains('button', 'Acelerado / Prova')
        .should('not.have.class', 'bg-[#FFFA93]')
        .and('have.attr', 'aria-pressed', 'false');
    });

    cy.contains('article', 'Estudado a Fundo').within(() => {
      cy.contains('1').should('be.visible');
    });
  });
});
