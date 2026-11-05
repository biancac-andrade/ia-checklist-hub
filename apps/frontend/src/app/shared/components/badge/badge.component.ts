import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-badge',
  standalone: true,
  template: `
    <span
      class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold"
      [class]="variantClasses()"
    >
      <ng-content />
    </span>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BadgeComponent {
  readonly variant = input<'primary' | 'success' | 'warning' | 'danger' | 'neutral'>('neutral');

  protected variantClasses(): string {
    switch (this.variant()) {
      case 'primary':
        return 'bg-brand-sky/25 text-blue-900 border border-brand-sky/40';
      case 'success':
        return 'bg-brand-mint/25 text-emerald-900 border border-brand-mint/40';
      case 'warning':
        return 'bg-brand-yellow/40 text-amber-900 border border-yellow-400';
      case 'danger':
        return 'bg-brand-coral/25 text-rose-900 border border-brand-coral/40';
      case 'neutral':
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  }
}
