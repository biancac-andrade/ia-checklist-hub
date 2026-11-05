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

  it('should display the main header with font-header and text-brand-dark', () => {
    const heading = fixture.debugElement.query(By.css('h1')).nativeElement as HTMLElement;
    expect(heading.textContent).toContain('IA Course Tracker');
    expect(heading.classList).toContain('font-header');
    expect(heading.classList).toContain('text-brand-dark');
  });

  it('should render the 4 metrics cards', () => {
    const cards = fixture.debugElement.queryAll(By.css('section[aria-label="Painel de Métricas do Curso"] article'));
    expect(cards.length).toBe(4);

    expect(cards[0].nativeElement.classList).toContain('bg-brand-sky/20');
    expect(cards[1].nativeElement.classList).toContain('bg-brand-mint/20');
    expect(cards[2].nativeElement.classList).toContain('bg-brand-yellow/30');
    expect(cards[3].nativeElement.classList).toContain('bg-brand-coral/20');
  });

  it('should render 10 course module cards with correct titles and rounded-2xl', () => {
    const moduleCards = fixture.debugElement.queryAll(
      By.css('section[aria-label="Módulos da Ementa"] > div')
    );
    expect(moduleCards.length).toBe(10);
    expect(moduleCards[0].nativeElement.classList).toContain('rounded-2xl');

    const firstModuleTitle = moduleCards[0].query(By.css('h2')).nativeElement as HTMLElement;
    expect(firstModuleTitle.textContent).toContain('Fundamentos de IA e LLMs para Programadores');
    expect(firstModuleTitle.classList).toContain('font-header');
  });

  it('should update topic status when chip button is clicked and set aria-pressed', () => {
    const firstButton = fixture.debugElement.query(
      By.css('button[aria-label^="Marcar como Estudado a Fundo"]')
    );
    expect(firstButton.nativeElement.getAttribute('aria-pressed')).toBe('false');

    firstButton.nativeElement.click();
    fixture.detectChanges();

    expect(firstButton.nativeElement.getAttribute('aria-pressed')).toBe('true');
    expect(component.metrics().deepStudy).toBe(1);

    firstButton.nativeElement.click();
    fixture.detectChanges();

    expect(firstButton.nativeElement.getAttribute('aria-pressed')).toBe('false');
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
