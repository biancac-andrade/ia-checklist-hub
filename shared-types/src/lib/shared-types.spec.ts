import { INITIAL_SYLLABUS } from './shared-types';

describe('INITIAL_SYLLABUS', () => {
  it('should contain 10 course modules', () => {
    expect(INITIAL_SYLLABUS).toHaveLength(10);
  });

  it('should have the exact topic count per module as specified in the curriculum', () => {
    const expectedTopicCounts = [11, 7, 6, 9, 5, 12, 6, 5, 6, 6];
    const actualCounts = INITIAL_SYLLABUS.map((module) => module.topics.length);

    expect(actualCounts).toEqual(expectedTopicCounts);
  });

  it('should initialize all topics with pending status', () => {
    const allTopics = INITIAL_SYLLABUS.flatMap((module) => module.topics);
    expect(allTopics.length).toBe(73);
    expect(allTopics.every((topic) => topic.status === 'pending')).toBe(true);
  });
});
