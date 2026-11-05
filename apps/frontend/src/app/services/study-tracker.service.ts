import { Injectable } from '@angular/core';
import {
  applySubjectItemStatus,
  calculateStudyMetrics,
  calculateStudyMetricsFromItems,
  extractTrackableItems,
  mergeRemoteProgressIntoSubjects,
  SYLLABUS_STORAGE_KEY,
  SyllabusService,
} from './syllabus.service';

export {
  applySubjectItemStatus,
  calculateStudyMetrics,
  calculateStudyMetricsFromItems,
  extractTrackableItems,
  mergeRemoteProgressIntoSubjects,
  SYLLABUS_STORAGE_KEY,
  SyllabusService,
};

@Injectable({
  providedIn: 'root',
  useExisting: SyllabusService,
})
export class StudyTrackerService extends SyllabusService {}
