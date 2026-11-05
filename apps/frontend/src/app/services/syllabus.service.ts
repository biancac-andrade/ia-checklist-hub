import { isPlatformBrowser } from '@angular/common';
import { computed, inject, Injectable, PLATFORM_ID, signal, Signal } from '@angular/core';
import {
  CourseModule,
  INITIAL_SYLLABUS,
  StudyMetrics,
  StudyStatus,
} from '@ia-study-hub/shared-types';

export const SYLLABUS_STORAGE_KEY = 'ia_course_syllabus_state_v1';

export function calculateStudyMetrics(modules: readonly CourseModule[]): StudyMetrics {
  const allTopics = modules.flatMap((courseModule) => courseModule.topics);
  const total = allTopics.length;

  let deepStudy = 0;
  let accelerated = 0;
  let reviewLater = 0;
  let pending = 0;

  for (const topic of allTopics) {
    switch (topic.status) {
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

@Injectable({
  providedIn: 'root',
})
export class SyllabusService {
  private readonly platformId: object = inject(PLATFORM_ID);
  private readonly isBrowser: boolean = isPlatformBrowser(this.platformId);

  readonly modules = signal<CourseModule[]>(structuredClone(INITIAL_SYLLABUS));

  readonly metrics: Signal<StudyMetrics> = computed(() =>
    calculateStudyMetrics(this.modules())
  );

  readonly acceleratedTopicsList: Signal<string[]> = computed(() =>
    this.modules()
      .flatMap((courseModule) => courseModule.topics)
      .filter((topic) => topic.status === 'accelerated')
      .map((topic) => topic.title)
  );

  readonly reviewLaterList: Signal<string[]> = computed(() =>
    this.modules()
      .flatMap((courseModule) => courseModule.topics)
      .filter((topic) => topic.status === 'review_later')
      .map((topic) => topic.title)
  );

  constructor() {
    this.loadFromStorage();
  }

  setStatus(topicId: string, status: StudyStatus): void {
    this.modules.update((currentModules) =>
      currentModules.map((courseModule) => ({
        ...courseModule,
        topics: courseModule.topics.map((topic) => {
          if (topic.id !== topicId) {
            return topic;
          }
          const nextStatus: StudyStatus =
            topic.status === status ? 'pending' : status;
          return {
            ...topic,
            status: nextStatus,
          };
        }),
      }))
    );

    this.saveToStorage();
  }

  saveToStorage(): void {
    if (!this.isBrowser) {
      return;
    }

    try {
      localStorage.setItem(SYLLABUS_STORAGE_KEY, JSON.stringify(this.modules()));
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
        this.modules.set(parsed as CourseModule[]);
      }
    } catch (error) {
      console.error('Failed to load syllabus from localStorage:', error);
    }
  }

  reset(): void {
    this.modules.set(structuredClone(INITIAL_SYLLABUS));
    if (this.isBrowser) {
      try {
        localStorage.removeItem(SYLLABUS_STORAGE_KEY);
      } catch (error) {
        console.error('Failed to clear syllabus from localStorage:', error);
      }
    }
  }
}
