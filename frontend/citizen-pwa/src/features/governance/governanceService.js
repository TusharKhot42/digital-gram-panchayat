import { apiClient } from '@/services/api-client';

/**
 * The Phase 4 governance modules. Meetings, projects and downloads are public reads; polls and
 * feedback need the citizen's token, which apiClient attaches automatically.
 */
export const governanceService = {
  async meetings(params) {
    const { data } = await apiClient.get('/meetings', { params });
    return data.data;
  },
  async meeting(id) {
    const { data } = await apiClient.get(`/meetings/${id}`);
    return data.data;
  },

  async projects(params) {
    const { data } = await apiClient.get('/projects', { params });
    return data.data;
  },
  async projectSummary() {
    const { data } = await apiClient.get('/projects/summary');
    return data.data;
  },

  async polls() {
    const { data } = await apiClient.get('/polls');
    return data.data;
  },
  async vote(pollId, optionId) {
    const { data } = await apiClient.post(`/polls/${pollId}/vote`, { optionId });
    return data.data;
  },

  async feedbackSummary() {
    const { data } = await apiClient.get('/feedback/summary');
    return data.data;
  },
  async submitFeedback(payload) {
    const { data } = await apiClient.post('/feedback', payload);
    return data.data;
  },
  async myFeedback() {
    const { data } = await apiClient.get('/feedback/mine');
    return data.data;
  },

  async downloads(params) {
    const { data } = await apiClient.get('/downloads', { params });
    return data.data;
  },
  /** Registers the download and returns the file URL to open. */
  async openDownload(id) {
    const { data } = await apiClient.post(`/downloads/${id}/open`);
    return data.data;
  },
};
