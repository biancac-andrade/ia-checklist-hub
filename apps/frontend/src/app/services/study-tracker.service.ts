import { Injectable } from '@angular/core';
import {
  applyTopicStatus,
  calculateStudyMetrics,
  mergeRemoteProgress,
  SYLLABUS_STORAGE_KEY,
  SyllabusService,
} from './syllabus.service';

export {
  applyTopicStatus,
  calculateStudyMetrics,
  mergeRemoteProgress,
  SYLLABUS_STORAGE_KEY,
  SyllabusService,
};

@Injectable({
  providedIn: 'root',
  useExisting: SyllabusService,
})
export class StudyTrackerService extends SyllabusService {}
