import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
  computed,
  inject,
  Injectable,
  PLATFORM_ID,
  signal,
  Signal,
} from '@angular/core';
import {
  CourseModule,
  CourseSubject,
  isStudyStatus,
  StudyMetrics,
  StudyStatus,
  SubmoduleItem,
  TopicProgressRecord,
  UpdateTopicProgressPayload,
} from '@ia-study-hub/shared-types';
import { buildInitialSyllabusTree } from '../core/syllabus-data';

export const SYLLABUS_STORAGE_KEY = 'ia_course_subjects_state_v2';

export interface TrackableItemWithContext {
  readonly id: string;
  readonly label: string;
  readonly status: StudyStatus;
}

export function extractTrackableItems(
  subjects: readonly CourseSubject[]
): TrackableItemWithContext[] {
  const items: TrackableItemWithContext[] = [];

  for (const subject of subjects) {
    if (subject.isLocked) {
      continue;
    }

    for (const mod of subject.modules) {
      for (const sub of mod.submodules) {
        items.push({
          id: sub.id,
          label: `${subject.title} - ${mod.title} - ${sub.title}`,
          status: sub.status,
        });
      }
    }

    if (subject.podcast) {
      items.push({
        id: subject.podcast.id,
        label: `${subject.title} - ${subject.podcast.title}`,
        status: subject.podcast.status,
      });
    }

    if (subject.evaluation) {
      items.push({
        id: subject.evaluation.id,
        label: `${subject.title} - ${subject.evaluation.title}`,
        status: subject.evaluation.status,
      });
    }
  }

  return items;
}

export function calculateStudyMetricsFromItems(
  items: readonly { readonly status: StudyStatus }[]
): StudyMetrics {
  const total = items.length;

  let deepStudy = 0;
  let accelerated = 0;
  let reviewLater = 0;
  let pending = 0;

  for (const item of items) {
    switch (item.status) {
      case 'deep_study':
        deepStudy++;
        break;
      case 'accelerated':
        accelerated++;
        break;
      case 'review_later':
        reviewLater++;
        break;
      case 'pending':
      default:
        pending++;
        break;
    }
  }

  const certificateProgressPercent =
    total > 0
      ? Math.round(((deepStudy + accelerated) / total) * 100 * 10) / 10
      : 0;

  const realMasteryPercent =
    total > 0 ? Math.round((deepStudy / total) * 100 * 10) / 10 : 0;

  return {
    total,
    deepStudy,
    accelerated,
    reviewLater,
    pending,
    certificateProgressPercent,
    realMasteryPercent,
  };
}

export function calculateStudyMetrics(
  modules: readonly CourseModule[]
): StudyMetrics {
  const allTopics = modules.flatMap((courseModule) => courseModule.topics);
  return calculateStudyMetricsFromItems(allTopics);
}

export function applySubjectItemStatus(
  subjects: readonly CourseSubject[],
  itemId: string,
  status: StudyStatus
): CourseSubject[] {
  return subjects.map((subject) => {
    if (subject.isLocked) {
      return subject;
    }

    const updatedModules = subject.modules.map((mod) => ({
      ...mod,
      submodules: mod.submodules.map((sub) =>
        sub.id === itemId ? { ...sub, status } : sub
      ),
    }));

    const updatedPodcast: SubmoduleItem | undefined = subject.podcast
      ? subject.podcast.id === itemId
        ? { ...subject.podcast, status }
        : subject.podcast
      : undefined;

    const updatedEvaluation: SubmoduleItem | undefined = subject.evaluation
      ? subject.evaluation.id === itemId
        ? { ...subject.evaluation, status }
        : subject.evaluation
      : undefined;

    return {
      ...subject,
      modules: updatedModules,
      ...(updatedPodcast ? { podcast: updatedPodcast } : {}),
      ...(updatedEvaluation ? { evaluation: updatedEvaluation } : {}),
    };
  });
}

export function mergeRemoteProgressIntoSubjects(
  subjects: readonly CourseSubject[],
  records: readonly TopicProgressRecord[]
): CourseSubject[] {
  const statusMap = new Map<string, StudyStatus>();
  for (const record of records) {
    if (record.topicId && isStudyStatus(record.status)) {
      statusMap.set(record.topicId, record.status);
    }
  }

  if (statusMap.size === 0) {
    return subjects.map((s) => ({ ...s }));
  }

  return subjects.map((subject) => {
    if (subject.isLocked) {
      return subject;
    }

    const updatedModules = subject.modules.map((mod) => ({
      ...mod,
      submodules: mod.submodules.map((sub) => {
        const remote = statusMap.get(sub.id);
        return remote ? { ...sub, status: remote } : sub;
      }),
    }));

    const updatedPodcast: SubmoduleItem | undefined = subject.podcast
      ? (() => {
          const remote = statusMap.get(subject.podcast.id);
          return remote
            ? { ...subject.podcast, status: remote }
            : subject.podcast;
        })()
      : undefined;

    const updatedEvaluation: SubmoduleItem | undefined = subject.evaluation
      ? (() => {
          const remote = statusMap.get(subject.evaluation.id);
          return remote
            ? { ...subject.evaluation, status: remote }
            : subject.evaluation;
        })()
      : undefined;

    return {
      ...subject,
      modules: updatedModules,
      ...(updatedPodcast ? { podcast: updatedPodcast } : {}),
      ...(updatedEvaluation ? { evaluation: updatedEvaluation } : {}),
    };
  });
}

@Injectable({
  providedIn: 'root',
})
export class SyllabusService {
  private readonly platformId: object = inject(PLATFORM_ID);
  private readonly isBrowser: boolean = isPlatformBrowser(this.platformId);
  private readonly http: HttpClient | null = inject(HttpClient, {
    optional: true,
  });

  readonly subjects = signal<CourseSubject[]>(buildInitialSyllabusTree());

  readonly trackableItems: Signal<TrackableItemWithContext[]> = computed(() =>
    extractTrackableItems(this.subjects())
  );

  readonly metrics: Signal<StudyMetrics> = computed(() =>
    calculateStudyMetricsFromItems(this.trackableItems())
  );

  readonly acceleratedTopicsList: Signal<string[]> = computed(() =>
    this.trackableItems()
      .filter((item) => item.status === 'accelerated')
      .map((item) => item.label)
  );

  readonly reviewLaterList: Signal<string[]> = computed(() =>
    this.trackableItems()
      .filter((item) => item.status === 'review_later')
      .map((item) => item.label)
  );

  constructor() {
    this.loadFromStorage();
    this.loadRemoteProgress();
  }

  loadRemoteProgress(): void {
    if (!this.isBrowser || !this.http) {
      return;
    }

    this.http.get<TopicProgressRecord[]>('/api/progress').subscribe({
      next: (records) => {
        if (Array.isArray(records) && records.length > 0) {
          this.subjects.update((current) =>
            mergeRemoteProgressIntoSubjects(current, records)
          );
          this.saveToStorage();
        }
      },
      error: (error: unknown) => {
        console.error('Failed to load progress from /api/progress:', error);
      },
    });
  }

  setStatus(itemId: string, status: StudyStatus): void {
    const existingItem = this.trackableItems().find(
      (item) => item.id === itemId
    );

    if (!existingItem) {
      return;
    }

    const previousStatus: StudyStatus = existingItem.status;
    const nextStatus: StudyStatus =
      previousStatus === status ? 'pending' : status;

    this.subjects.update((current) =>
      applySubjectItemStatus(current, itemId, nextStatus)
    );
    this.saveToStorage();

    if (!this.isBrowser || !this.http) {
      return;
    }

    const payload: UpdateTopicProgressPayload = {
      topicId: itemId,
      status: nextStatus,
    };

    this.http.post<TopicProgressRecord>('/api/progress', payload).subscribe({
      error: (error: unknown) => {
        console.error(
          `Failed to persist status for item "${itemId}", rolling back:`,
          error
        );
        this.subjects.update((current) =>
          applySubjectItemStatus(current, itemId, previousStatus)
        );
        this.saveToStorage();
      },
    });
  }

  saveToStorage(): void {
    if (!this.isBrowser) {
      return;
    }

    try {
      localStorage.setItem(
        SYLLABUS_STORAGE_KEY,
        JSON.stringify(this.subjects())
      );
    } catch (error) {
      console.error('Failed to save syllabus to localStorage:', error);
    }
  }

  loadFromStorage(): void {
    if (!this.isBrowser) {
      return;
    }

    try {
      const stored = localStorage.getItem(SYLLABUS_STORAGE_KEY);
      if (!stored) {
        return;
      }
      const parsed: unknown = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        this.subjects.set(parsed as CourseSubject[]);
      }
    } catch (error) {
      console.error('Failed to load syllabus from localStorage:', error);
    }
  }

  reset(): void {
    this.subjects.set(buildInitialSyllabusTree());
    if (this.isBrowser) {
      try {
        localStorage.removeItem(SYLLABUS_STORAGE_KEY);
      } catch (error) {
        console.error('Failed to clear syllabus from localStorage:', error);
      }
    }
  }
}
