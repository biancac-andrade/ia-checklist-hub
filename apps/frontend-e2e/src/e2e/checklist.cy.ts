describe('IA Course Tracker - Checklist E2E Flow', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit('/');
  });

  it('1. Carregamento e Estado Inicial: deve carregar a rota com layout e métricas zeradas', () => {
    // Verificar a renderização do título com a fonte correta e classes de estilo
    cy.get('h1')
      .should('be.visible')
      .and('have.class', 'font-header')
      .and('have.class', 'text-brand-dark')
      .and('contain.text', 'IA Course Tracker');

    // Validar que os contadores de métricas iniciam zerados (0% de progresso)
    cy.contains('article', 'Progresso do Certificado').within(() => {
      cy.contains('0%').should('be.visible');
    });

    cy.contains('article', 'Estudado a Fundo').within(() => {
      cy.contains('0').should('be.visible');
    });

    cy.contains('article', 'Acelerado p/ Prova').within(() => {
      cy.contains('0').should('be.visible');
    });

    cy.contains('article', 'Dívida p/ Modo Vitalício').within(() => {
      cy.contains('0').should('be.visible');
    });

    // Validar carregamento do módulo 1 e do tópico inicial
    cy.contains('h2', 'Fundamentos de IA e LLMs para Programadores').should(
      'be.visible'
    );
    cy.contains('[data-testid="topic-row"]', 'História e contexto da IA').should(
      'be.visible'
    );
  });

  it('2. Seleção de Status e Atualização Visual: deve atualizar chip visual e métricas dinâmicas', () => {
    // Localizar a linha do tópico "História e contexto da IA"
    cy.contains('[data-testid="topic-row"]', 'História e contexto da IA').within(
      () => {
        // Clicar no chip "Acelerado (Prova)"
        cy.contains('button', 'Acelerado (Prova)')
          .should('have.attr', 'aria-pressed', 'false')
          .click();

        // Validar que o chip recebe a classe de destaque correspondente (brand-yellow)
        cy.contains('button', 'Acelerado (Prova)')
          .should('have.class', 'bg-brand-yellow')
          .and('have.attr', 'aria-pressed', 'true');
      }
    );

    // Verificar se o contador de "Acelerado" foi incrementado para 1
    cy.contains('article', 'Acelerado p/ Prova').within(() => {
      cy.contains('1').should('be.visible');
    });

    // Clicar em "Estudado a Fundo" no mesmo item e validar que a seleção anterior foi substituída
    cy.contains('[data-testid="topic-row"]', 'História e contexto da IA').within(
      () => {
        cy.contains('button', 'Estudado a Fundo').click();

        // Validar que o novo chip recebe a classe de destaque correspondente (brand-mint)
        cy.contains('button', 'Estudado a Fundo')
          .should('have.class', 'bg-brand-mint')
          .and('have.attr', 'aria-pressed', 'true');

        // Validar que a seleção anterior foi desmarcada
        cy.contains('button', 'Acelerado (Prova)')
          .should('not.have.class', 'bg-brand-yellow')
          .and('have.attr', 'aria-pressed', 'false');
      }
    );

    // Verificar atualização das métricas no dashboard
    cy.contains('article', 'Estudado a Fundo').within(() => {
      cy.contains('1').should('be.visible');
    });

    cy.contains('article', 'Acelerado p/ Prova').within(() => {
      cy.contains('0').should('be.visible');
    });
  });

  it('3. Persistência de Dados: deve manter o estado salvo no localStorage após cy.reload()', () => {
    // Marcar "Estudado a Fundo" no tópico "História e contexto da IA"
    cy.contains('[data-testid="topic-row"]', 'História e contexto da IA').within(
      () => {
        cy.contains('button', 'Estudado a Fundo').click();
        cy.contains('button', 'Estudado a Fundo').should(
          'have.class',
          'bg-brand-mint'
        );
      }
    );

    // Recarregar a página com cy.reload()
    cy.reload();

    // Garantir que o estado marcado permanece salvo via localStorage
    cy.contains('[data-testid="topic-row"]', 'História e contexto da IA').within(
      () => {
        cy.contains('button', 'Estudado a Fundo')
          .should('be.visible')
          .and('have.class', 'bg-brand-mint')
          .and('have.attr', 'aria-pressed', 'true');

        cy.contains('button', 'Acelerado (Prova)')
          .should('not.have.class', 'bg-brand-yellow')
          .and('have.attr', 'aria-pressed', 'false');
      }
    );

    // Validar que a métrica reidratada permanece com 1 item estudado a fundo
    cy.contains('article', 'Estudado a Fundo').within(() => {
      cy.contains('1').should('be.visible');
    });
  });
});
