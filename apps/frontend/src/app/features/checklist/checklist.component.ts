import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StudyStatus } from '@ia-study-hub/shared-types';
import { SyllabusService } from '../../services/syllabus.service';

@Component({
  selector: 'app-checklist',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './checklist.component.html',
  styleUrl: './checklist.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChecklistComponent {
  private readonly syllabusService = inject(SyllabusService);

  readonly modules = this.syllabusService.modules;
  readonly metrics = this.syllabusService.metrics;
  readonly acceleratedTopicsList = this.syllabusService.acceleratedTopicsList;
  readonly reviewLaterList = this.syllabusService.reviewLaterList;

  onStatusClick(topicId: string, status: StudyStatus): void {
    this.syllabusService.setStatus(topicId, status);
  }

  onReset(): void {
    if (typeof window !== 'undefined' && window.confirm) {
      const confirmed = window.confirm(
        'Tem certeza de que deseja resetar todo o progresso dos tópicos?'
      );
      if (!confirmed) {
        return;
      }
    }
    this.syllabusService.reset();
  }
}
