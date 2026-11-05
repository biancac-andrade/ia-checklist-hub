import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BadgeComponent } from './badge.component';

describe('BadgeComponent', () => {
  let fixture: ComponentFixture<BadgeComponent>;
  let component: BadgeComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BadgeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BadgeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should render default neutral variant classes', () => {
    const spanElement = fixture.nativeElement.querySelector('span');

    expect(spanElement.className).toContain('bg-gray-100');
    expect(spanElement.className).toContain('text-gray-800');
  });

  it('should apply success variant classes when variant input is set to success', () => {
    fixture.componentRef.setInput('variant', 'success');
    fixture.detectChanges();

    const spanElement = fixture.nativeElement.querySelector('span');
    expect(spanElement.className).toContain('bg-brand-mint/25');
    expect(spanElement.className).toContain('text-emerald-900');
  });
});
