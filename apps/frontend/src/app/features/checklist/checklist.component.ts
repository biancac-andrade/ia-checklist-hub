import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CourseSubject, StudyStatus } from '@ia-study-hub/shared-types';
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

  readonly subjects = this.syllabusService.subjects;
  readonly metrics = this.syllabusService.metrics;
  readonly acceleratedTopicsList = this.syllabusService.acceleratedTopicsList;
  readonly reviewLaterList = this.syllabusService.reviewLaterList;
  readonly collapsedSubjectIds = signal<ReadonlySet<string>>(new Set());

  isSubjectCollapsed(subjectId: string): boolean {
    return this.collapsedSubjectIds().has(subjectId);
  }

  toggleSubject(subjectId: string): void {
    this.collapsedSubjectIds.update((current) => {
      const next = new Set(current);
      if (next.has(subjectId)) {
        next.delete(subjectId);
      } else {
        next.add(subjectId);
      }
      return next;
    });
  }

  getSubjectStats(subject: CourseSubject): {
    completed: number;
    total: number;
  } {
    if (subject.isLocked) {
      return { completed: 0, total: 0 };
    }

    let total = 0;
    let completed = 0;

    for (const mod of subject.modules) {
      for (const sub of mod.submodules) {
        total++;
        if (sub.status === 'deep_study' || sub.status === 'accelerated') {
          completed++;
        }
      }
    }

    if (subject.podcast) {
      total++;
      if (
        subject.podcast.status === 'deep_study' ||
        subject.podcast.status === 'accelerated'
      ) {
        completed++;
      }
    }

    if (subject.evaluation) {
      total++;
      if (
        subject.evaluation.status === 'deep_study' ||
        subject.evaluation.status === 'accelerated'
      ) {
        completed++;
      }
    }

    return { completed, total };
  }

  onStatusClick(itemId: string, status: StudyStatus): void {
    this.syllabusService.setStatus(itemId, status);
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
