import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { vi } from 'vitest';
import { ChecklistComponent } from './checklist.component';
import { SyllabusService } from '../../services/syllabus.service';

describe('ChecklistComponent', () => {
  let component: ChecklistComponent;
  let fixture: ComponentFixture<ChecklistComponent>;
  let syllabusService: SyllabusService;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [ChecklistComponent],
      providers: [SyllabusService],
    }).compileComponents();

    fixture = TestBed.createComponent(ChecklistComponent);
    component = fixture.componentInstance;
    syllabusService = TestBed.inject(SyllabusService);
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create the checklist component', () => {
    expect(component).toBeTruthy();
  });

  it('should display the main header with font-header and dark mode text', () => {
    const heading = fixture.debugElement.query(By.css('h1'))
      .nativeElement as HTMLElement;
    expect(heading.textContent).toContain('IA Course Tracker');
    expect(heading.classList).toContain('font-header');
    expect(heading.classList).toContain('text-[#F1F5F9]');
  });

  it('should render the 4 metrics cards in dark theme', () => {
    const cards = fixture.debugElement.queryAll(
      By.css('section[aria-label="Painel de Métricas do Curso"] article')
    );
    expect(cards.length).toBe(4);
    expect(cards[0].nativeElement.classList).toContain('bg-[#111827]');
  });

  it('should render 11 unlocked subjects and 4 locked subjects with startDate badge', () => {
    const unlockedCards = fixture.debugElement.queryAll(
      By.css('[data-testid^="subject-card-"]')
    );
    const lockedCards = fixture.debugElement.queryAll(
      By.css('[data-testid^="subject-locked-"]')
    );

    expect(unlockedCards.length).toBe(11);
    expect(lockedCards.length).toBe(4);

    const firstLockedText = (lockedCards[0].nativeElement as HTMLElement)
      .textContent;
    expect(firstLockedText).toContain('🔒 BLOQUEADA • Início em 14/11/2026');
  });

  it('should update submodule status when chip button is clicked and set aria-pressed', () => {
    const firstButton = fixture.debugElement.query(
      By.css('button[aria-label^="Marcar como Estudado a Fundo"]')
    );
    expect(firstButton.nativeElement.getAttribute('aria-pressed')).toBe(
      'false'
    );

    firstButton.nativeElement.click();
    fixture.detectChanges();

    expect(firstButton.nativeElement.getAttribute('aria-pressed')).toBe('true');
    expect(firstButton.nativeElement.classList).toContain('bg-[#85E8A5]');
    expect(component.metrics().deepStudy).toBe(1);

    firstButton.nativeElement.click();
    fixture.detectChanges();

    expect(firstButton.nativeElement.getAttribute('aria-pressed')).toBe(
      'false'
    );
    expect(component.metrics().deepStudy).toBe(0);
  });

  it('should invoke reset on SyllabusService when reset button is clicked', () => {
    const resetSpy = vi.spyOn(syllabusService, 'reset');
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    const resetButton = fixture.debugElement.query(
      By.css('button[aria-label="Restaurar estado padrão inicial da ementa"]')
    );
    resetButton.nativeElement.click();

    expect(resetSpy).toHaveBeenCalled();
  });
});
