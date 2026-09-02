import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GoogleFormsService } from './forms.js';
import { GoogleAdapterError, GoogleApiRateLimitError } from './errors.js';
import type { GoogleAuthClient } from './auth.js';

const mockGetAccessToken = vi.fn();
const mockAuthClient = {
  getAccessToken: mockGetAccessToken,
} as unknown as GoogleAuthClient;

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('GoogleFormsService', () => {
  let service: GoogleFormsService;

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAccessToken.mockResolvedValue('mock-token');
    service = new GoogleFormsService(mockAuthClient);
  });

  it('rejects empty formId', async () => {
    await expect(service.getResponses('')).rejects.toThrowError(GoogleAdapterError);
    await expect(service.getResponses('   ')).rejects.toThrowError(GoogleAdapterError);
  });

  it('handles rate limits correctly (429)', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 429,
    });

    await expect(service.getResponses('form-id')).rejects.toThrowError(GoogleApiRateLimitError);
  });

  it('handles non-2xx API failure mapping without exposing tokens', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
      text: () => Promise.resolve('Forbidden details'),
    });

    try {
      await service.getResponses('form-id');
      expect.fail('Should have thrown');
    } catch (e: unknown) {
      expect(e).toBeInstanceOf(GoogleAdapterError);
      if (e instanceof GoogleAdapterError) {
        expect(e.message).toContain('Google Forms API error (403): Forbidden details');
        expect(e.message).not.toContain('mock-token');
        expect(e.code).toBe('FORMS_API_ERROR');
      }
    }
  });

  it('successfully retrieves and maps responses, including non-text types', async () => {
    // 1. Mock form definition
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({
        formId: 'form-id',
        items: [
          {
            itemId: 'item1',
            title: 'What is your name?',
            questionItem: { question: { questionId: 'q1' } },
          },
          {
            itemId: 'item2',
            title: 'Resume?',
            questionItem: { question: { questionId: 'q2' } },
          },
          {
            itemId: 'item3',
            title: 'Complex Grade?',
            questionItem: { question: { questionId: 'q3' } },
          }
        ]
      })
    });

    // 2. Mock responses
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({
        responses: [
          {
            responseId: 'r1',
            answers: {
              'q1': { questionId: 'q1', textAnswers: { answers: [{ value: 'Alice' }] } },
              'q2': { questionId: 'q2', fileUploadAnswers: { answers: [{ fileId: 'file-123' }] } },
              'q3': { questionId: 'q3', grade: { score: 10, correct: true } },
            }
          }
        ]
      })
    });

    const responses = await service.getResponses('form-id');
    
    expect(responses).toHaveLength(1);
    expect(responses[0]).toEqual({
      'What is your name?': 'Alice',
      'Resume?': 'file-123',
      'Complex Grade?': JSON.stringify({ grade: { score: 10, correct: true } }),
    });

    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(mockFetch).toHaveBeenNthCalledWith(
      1,
      'https://forms.googleapis.com/v1/forms/form-id',
      expect.anything()
    );
    expect(mockFetch).toHaveBeenNthCalledWith(
      2,
      'https://forms.googleapis.com/v1/forms/form-id/responses',
      expect.anything()
    );
  });

  it('handles pagination properly', async () => {
    // 1. Form definition
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({
        formId: 'form-id',
        items: [{ title: 'Q', questionItem: { question: { questionId: 'q1' } } }]
      })
    });

    // 2. Page 1
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({
        nextPageToken: 'token123',
        responses: [
          { answers: { 'q1': { textAnswers: { answers: [{ value: 'A1' }] } } } }
        ]
      })
    });

    // 3. Page 2
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({
        responses: [
          { answers: { 'q1': { textAnswers: { answers: [{ value: 'A2' }] } } } }
        ]
      })
    });

    const responses = await service.getResponses('form-id');
    
    expect(responses).toHaveLength(2);
    expect(responses[0]).toEqual({ 'Q': 'A1' });
    expect(responses[1]).toEqual({ 'Q': 'A2' });
    expect(mockFetch).toHaveBeenCalledTimes(3);
  });
});
