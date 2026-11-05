import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { INITIAL_SYLLABUS } from '@ia-study-hub/shared-types';
import {
  SyllabusService,
  SYLLABUS_STORAGE_KEY,
} from './syllabus.service';

describe('SyllabusService', () => {
  let service: SyllabusService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        SyllabusService,
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });
    service = TestBed.inject(SyllabusService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created and initialized with INITIAL_SYLLABUS', () => {
    expect(service).toBeTruthy();
    expect(service.modules().length).toBe(10);
    expect(service.metrics().total).toBe(73);
    expect(service.metrics().pending).toBe(73);
    expect(service.metrics().deepStudy).toBe(0);
    expect(service.metrics().accelerated).toBe(0);
    expect(service.metrics().reviewLater).toBe(0);
    expect(service.metrics().certificateProgressPercent).toBe(0);
    expect(service.metrics().realMasteryPercent).toBe(0);
  });

  it('should change topic status and calculate metrics correctly', () => {
    const topicId = 'mod-1-topic-1';
    service.setStatus(topicId, 'deep_study');

    const updatedTopic = service
      .modules()[0]
      .topics.find((t) => t.id === topicId);
    expect(updatedTopic?.status).toBe('deep_study');

    const metrics = service.metrics();
    expect(metrics.deepStudy).toBe(1);
    expect(metrics.pending).toBe(72);
    expect(metrics.realMasteryPercent).toBeCloseTo((1 / 73) * 100, 1);
    expect(metrics.certificateProgressPercent).toBeCloseTo((1 / 73) * 100, 1);
  });

  it('should toggle status back to pending if same status is selected', () => {
    const topicId = 'mod-1-topic-1';
    service.setStatus(topicId, 'deep_study');
    expect(service.modules()[0].topics[0].status).toBe('deep_study');

    service.setStatus(topicId, 'deep_study');
    expect(service.modules()[0].topics[0].status).toBe('pending');
    expect(service.metrics().pending).toBe(73);
  });

  it('should correctly maintain acceleratedTopicsList and reviewLaterList', () => {
    service.setStatus('mod-1-topic-1', 'accelerated');
    service.setStatus('mod-1-topic-2', 'accelerated');
    service.setStatus('mod-2-topic-1', 'review_later');

    expect(service.acceleratedTopicsList()).toEqual([
      INITIAL_SYLLABUS[0].topics[0].title,
      INITIAL_SYLLABUS[0].topics[1].title,
    ]);

    expect(service.reviewLaterList()).toEqual([
      INITIAL_SYLLABUS[1].topics[0].title,
    ]);
  });

  it('should persist changes to localStorage and load them on boot', () => {
    service.setStatus('mod-1-topic-1', 'deep_study');

    const storedRaw = localStorage.getItem(SYLLABUS_STORAGE_KEY);
    expect(storedRaw).toBeTruthy();

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        SyllabusService,
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });
    const reloadedService = TestBed.inject(SyllabusService);
    expect(reloadedService.modules()[0].topics[0].status).toBe('deep_study');
    expect(reloadedService.metrics().deepStudy).toBe(1);
  });

  it('should reset back to initial state and remove storage entry', () => {
    service.setStatus('mod-1-topic-1', 'deep_study');
    expect(service.metrics().deepStudy).toBe(1);

    service.reset();
    expect(service.metrics().deepStudy).toBe(0);
    expect(service.metrics().pending).toBe(73);
    expect(localStorage.getItem(SYLLABUS_STORAGE_KEY)).toBeNull();
  });

  it('should safely handle SSR environment without calling localStorage', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        SyllabusService,
        { provide: PLATFORM_ID, useValue: 'server' },
      ],
    });
    const serverService = TestBed.inject(SyllabusService);
    expect(serverService).toBeTruthy();
    expect(() => serverService.setStatus('mod-1-topic-1', 'deep_study')).not.toThrow();
    expect(() => serverService.reset()).not.toThrow();
  });
});
