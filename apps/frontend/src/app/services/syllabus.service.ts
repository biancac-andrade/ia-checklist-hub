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
  INITIAL_SYLLABUS,
  isStudyStatus,
  StudyMetrics,
  StudyStatus,
  TopicProgressRecord,
  UpdateTopicProgressPayload,
} from '@ia-study-hub/shared-types';

export const SYLLABUS_STORAGE_KEY = 'ia_course_syllabus_state_v1';

export function calculateStudyMetrics(
  modules: readonly CourseModule[]
): StudyMetrics {
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

export function applyTopicStatus(
  modules: readonly CourseModule[],
  topicId: string,
  status: StudyStatus
): CourseModule[] {
  return modules.map((courseModule) => ({
    ...courseModule,
    topics: courseModule.topics.map((topic) =>
      topic.id === topicId ? { ...topic, status } : topic
    ),
  }));
}

export function mergeRemoteProgress(
  modules: readonly CourseModule[],
  records: readonly TopicProgressRecord[]
): CourseModule[] {
  const statusMap = new Map<string, StudyStatus>();
  for (const record of records) {
    if (record.topicId && isStudyStatus(record.status)) {
      statusMap.set(record.topicId, record.status);
    }
  }

  if (statusMap.size === 0) {
    return modules.map((courseModule) => ({
      ...courseModule,
      topics: [...courseModule.topics],
    }));
  }

  return modules.map((courseModule) => ({
    ...courseModule,
    topics: courseModule.topics.map((topic) => {
      const remoteStatus = statusMap.get(topic.id);
      return remoteStatus ? { ...topic, status: remoteStatus } : topic;
    }),
  }));
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
    this.loadRemoteProgress();
  }

  loadRemoteProgress(): void {
    if (!this.isBrowser || !this.http) {
      return;
    }

    this.http.get<TopicProgressRecord[]>('/api/progress').subscribe({
      next: (records) => {
        if (Array.isArray(records) && records.length > 0) {
          this.modules.update((current) =>
            mergeRemoteProgress(current, records)
          );
          this.saveToStorage();
        }
      },
      error: (error: unknown) => {
        console.error('Failed to load progress from /api/progress:', error);
      },
    });
  }

  setStatus(topicId: string, status: StudyStatus): void {
    const existingTopic = this.modules()
      .flatMap((courseModule) => courseModule.topics)
      .find((topic) => topic.id === topicId);

    if (!existingTopic) {
      return;
    }

    const previousStatus: StudyStatus = existingTopic.status;
    const nextStatus: StudyStatus =
      previousStatus === status ? 'pending' : status;

    this.modules.update((currentModules) =>
      applyTopicStatus(currentModules, topicId, nextStatus)
    );
    this.saveToStorage();

    if (!this.isBrowser || !this.http) {
      return;
    }

    const payload: UpdateTopicProgressPayload = {
      topicId,
      status: nextStatus,
    };

    this.http.post<TopicProgressRecord>('/api/progress', payload).subscribe({
      error: (error: unknown) => {
        console.error(
          `Failed to persist status for topic "${topicId}", rolling back:`,
          error
        );
        this.modules.update((currentModules) =>
          applyTopicStatus(currentModules, topicId, previousStatus)
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
        JSON.stringify(this.modules())
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
