import { getGreeting } from '../support/app.po';

describe('frontend-e2e', () => {
  beforeEach(() => cy.visit('/'));

  it('should display the main application heading', () => {
    getGreeting().contains('IA Course Tracker');
  });
});
