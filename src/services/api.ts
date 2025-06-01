import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Form Data API calls
export const formApi = {
  getForms: () => api.get('/form'),
  getFormByProjectId: (projectId: string) => api.get(`/form/${projectId}`),
  updateForm: (projectId: string, data: any) => api.put(`/form/${projectId}`, data),
};

// Project Evaluation API calls
export const evaluationApi = {
  getEvaluations: () => api.get('/evaluation'),
  getEvaluationByProjectId: (projectId: string) => api.get(`/evaluation/${projectId}`),
  updateEvaluation: (projectId: string, data: any) => api.post(`/evaluation/${projectId}`, data),
  updateStatus: (projectId: string, status: string) => api.post(`/evaluation/${projectId}`, { projectStatus: status }),
  updateRoundNotes: (projectId: string, round: string, notes: string) => 
    api.post(`/evaluation/${projectId}`, { 
      roundNotes: { [round]: notes }
    }),
  updateChecklist: (projectId: string, checklistId: string, checked: boolean, notes?: string) =>
    api.post(`/evaluation/${projectId}`, {
      evaluationChecklist: [{ _id: checklistId, checked, notes }]
    }),
  addDocument: (projectId: string, document: { name: string, url: string, type: string }) =>
    api.post(`/evaluation/${projectId}`, {
      additionalDocuments: [document]
    }),
  removeDocument: (projectId: string, documentId: string) =>
    api.post(`/evaluation/${projectId}`, {
      additionalDocuments: [{ _id: documentId, remove: true }]
    }),
};

export default api; 