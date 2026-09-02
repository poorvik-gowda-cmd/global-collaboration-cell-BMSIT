import type { GoogleFormsAdapter, FormResponse } from './interfaces.js';
import { GoogleAdapterError, GoogleApiRateLimitError } from './errors.js';
import type { GoogleAuthClient } from './auth.js';

interface FormItem {
  itemId: string;
  title?: string;
  questionItem?: {
    question?: {
      questionId?: string;
    };
  };
  questionGroupItem?: {
    questions?: { questionId?: string }[];
  };
}

interface FormDefinition {
  formId: string;
  items?: FormItem[];
}

interface FormResponseAnswer {
  questionId?: string;
  textAnswers?: {
    answers: { value: string }[];
  };
  fileUploadAnswers?: {
    answers: { fileId: string }[];
  };
  [key: string]: unknown;
}

interface FormAPIResponse {
  responseId: string;
  answers?: Record<string, FormResponseAnswer>;
}

interface FormResponsesList {
  responses?: FormAPIResponse[];
  nextPageToken?: string;
}

export class GoogleFormsService implements GoogleFormsAdapter {
  constructor(private readonly authClient: GoogleAuthClient) {}

  private async fetchWithAuth(url: string, init?: RequestInit): Promise<Response> {
    const token = await this.authClient.getAccessToken();
    
    const headers = new Headers(init?.headers);
    headers.set('Authorization', `Bearer ${token}`);
    
    const response = await fetch(url, { ...init, headers });
    
    if (response.status === 429) {
      throw new GoogleApiRateLimitError("forms");
    }
    
    if (!response.ok) {
      const text = await response.text();
      throw new GoogleAdapterError(
        `Google Forms API error (${String(response.status)}): ${text}`,
        "FORMS_API_ERROR",
        "forms"
      );
    }
    
    return response;
  }

  async getResponses(formId: string): Promise<FormResponse[]> {
    if (formId.trim() === '') {
      throw new GoogleAdapterError("Invalid formId provided", "VALIDATION_ERROR", "forms");
    }

    const cleanFormId = encodeURIComponent(formId.trim());

    // 1. Fetch form definition to map question IDs to titles
    const formUrl = `https://forms.googleapis.com/v1/forms/${cleanFormId}`;
    const formRes = await this.fetchWithAuth(formUrl);
    const formData = await formRes.json() as FormDefinition;

    const questionIdToTitle = new Map<string, string>();
    
    for (const item of formData.items ?? []) {
      const qId = item.questionItem?.question?.questionId;
      if (qId) {
        questionIdToTitle.set(qId, item.title ?? "");
      }
      
      item.questionGroupItem?.questions?.forEach(q => {
        if (q.questionId) {
          questionIdToTitle.set(q.questionId, item.title ?? "");
        }
      });
    }

    // 2. Fetch responses
    const allResponses: FormResponse[] = [];
    let pageToken: string | undefined;

    do {
      const searchParams = new URLSearchParams();
      if (pageToken) {
        searchParams.set('pageToken', pageToken);
      }

      const qs = searchParams.toString();
      const responsesUrl = `https://forms.googleapis.com/v1/forms/${cleanFormId}/responses${qs ? '?' + qs : ''}`;
      const res = await this.fetchWithAuth(responsesUrl);
      const responsesData = await res.json() as FormResponsesList;

      if (responsesData.responses) {
        for (const r of responsesData.responses) {
          const formRecord: FormResponse = {};
          
          if (r.answers) {
            for (const [qId, answer] of Object.entries(r.answers)) {
              const title = questionIdToTitle.get(qId) ?? qId;
              
              if (answer.textAnswers?.answers) {
                const values = answer.textAnswers.answers.map(a => a.value);
                formRecord[title] = values.join(", ");
              } else if (answer.fileUploadAnswers?.answers) {
                const values = answer.fileUploadAnswers.answers.map(a => a.fileId);
                formRecord[title] = values.join(", ");
              } else {
                const { questionId: _, ...rest } = answer;
                formRecord[title] = Object.keys(rest).length > 0 ? JSON.stringify(rest) : "";
              }
            }
          }
          
          allResponses.push(formRecord);
        }
      }

      pageToken = responsesData.nextPageToken;
    } while (pageToken);

    return allResponses;
  }
}
