import { PLATFORM_ID } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { StudyTrackerService } from './study-tracker.service';

describe('StudyTrackerService (Supabase API Integration)', () => {
  let service: StudyTrackerService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        StudyTrackerService,
        { provide: PLATFORM_ID, useValue: 'browser' },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(StudyTrackerService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should fetch initial progress from GET /api/progress and hydrate signals', () => {
    const req = httpMock.expectOne('/api/progress');
    expect(req.request.method).toBe('GET');

    req.flush([
      { topicId: 'mod-1-topic-1', status: 'deep_study' },
      { topicId: 'mod-1-topic-2', status: 'accelerated' },
    ]);

    expect(service.metrics().deepStudy).toBe(1);
    expect(service.metrics().accelerated).toBe(1);
  });

  it('should optimistically update signal and send POST /api/progress', () => {
    httpMock.expectOne('/api/progress').flush([]);

    service.setStatus('mod-1-topic-1', 'deep_study');

    expect(service.metrics().deepStudy).toBe(1);

    const postReq = httpMock.expectOne('/api/progress');
    expect(postReq.request.method).toBe('POST');
    expect(postReq.request.body).toEqual({
      topicId: 'mod-1-topic-1',
      status: 'deep_study',
    });

    postReq.flush({
      topicId: 'mod-1-topic-1',
      status: 'deep_study',
      updatedAt: '2026-11-05T00:00:00.000Z',
    });

    expect(service.metrics().deepStudy).toBe(1);
  });

  it('should rollback signal state when POST /api/progress fails', () => {
    httpMock.expectOne('/api/progress').flush([]);

    service.setStatus('mod-1-topic-1', 'accelerated');
    expect(service.metrics().accelerated).toBe(1);

    const postReq = httpMock.expectOne('/api/progress');
    postReq.flush(
      { error: 'Database unavailable' },
      { status: 500, statusText: 'Internal Server Error' }
    );

    expect(service.metrics().accelerated).toBe(0);
    expect(service.metrics().pending).toBe(73);
  });
});
