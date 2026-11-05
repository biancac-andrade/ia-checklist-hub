import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
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

  it('should be created and initialized with 15 subjects (11 unlocked + 4 locked) and 324 trackable items', () => {
    expect(service).toBeTruthy();
    expect(service.subjects().length).toBe(15);
    expect(service.subjects().filter((s) => !s.isLocked).length).toBe(11);
    expect(service.subjects().filter((s) => s.isLocked).length).toBe(4);
    expect(service.metrics().total).toBe(324);
    expect(service.metrics().pending).toBe(324);
    expect(service.metrics().deepStudy).toBe(0);
    expect(service.metrics().accelerated).toBe(0);
    expect(service.metrics().reviewLater).toBe(0);
    expect(service.metrics().certificateProgressPercent).toBe(0);
    expect(service.metrics().realMasteryPercent).toBe(0);
  });

  it('should change submodule status and calculate metrics correctly', () => {
    const itemId = 's1-m1-s1';
    service.setStatus(itemId, 'deep_study');

    const updatedSubmodule = service
      .subjects()[0]
      .modules[0].submodules.find((s) => s.id === itemId);
    expect(updatedSubmodule?.status).toBe('deep_study');

    const metrics = service.metrics();
    expect(metrics.deepStudy).toBe(1);
    expect(metrics.pending).toBe(323);
    expect(metrics.realMasteryPercent).toBeCloseTo((1 / 324) * 100, 1);
    expect(metrics.certificateProgressPercent).toBeCloseTo((1 / 324) * 100, 1);
  });

  it('should toggle status back to pending if same status is selected', () => {
    const itemId = 's1-m1-s1';
    service.setStatus(itemId, 'deep_study');
    expect(service.subjects()[0].modules[0].submodules[0].status).toBe(
      'deep_study'
    );

    service.setStatus(itemId, 'deep_study');
    expect(service.subjects()[0].modules[0].submodules[0].status).toBe(
      'pending'
    );
    expect(service.metrics().pending).toBe(324);
  });

  it('should update podcast and evaluation status per subject', () => {
    service.setStatus('s1-podcast', 'accelerated');
    service.setStatus('s1-avaliacao', 'deep_study');

    expect(service.subjects()[0].podcast?.status).toBe('accelerated');
    expect(service.subjects()[0].evaluation?.status).toBe('deep_study');
    expect(service.metrics().accelerated).toBe(1);
    expect(service.metrics().deepStudy).toBe(1);
  });

  it('should persist changes to localStorage and load them on boot', () => {
    service.setStatus('s1-m1-s1', 'deep_study');

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
    expect(reloadedService.subjects()[0].modules[0].submodules[0].status).toBe(
      'deep_study'
    );
    expect(reloadedService.metrics().deepStudy).toBe(1);
  });

  it('should reset back to initial state and remove storage entry', () => {
    service.setStatus('s1-m1-s1', 'deep_study');
    expect(service.metrics().deepStudy).toBe(1);

    service.reset();
    expect(service.metrics().deepStudy).toBe(0);
    expect(service.metrics().pending).toBe(324);
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
    expect(() =>
      serverService.setStatus('s1-m1-s1', 'deep_study')
    ).not.toThrow();
    expect(() => serverService.reset()).not.toThrow();
  });
});
