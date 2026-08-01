import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { governanceService } from './governanceService';

export const governanceKeys = {
  meetings: (params) => ['meetings', params ?? {}],
  meeting: (id) => ['meetings', 'detail', id],
  projects: (params) => ['projects', params ?? {}],
  projectSummary: () => ['projects', 'summary'],
  polls: () => ['polls'],
  feedbackSummary: () => ['feedback', 'summary'],
  myFeedback: () => ['feedback', 'mine'],
  downloads: (params) => ['downloads', params ?? {}],
};

// Meetings and projects are low-churn reference data — cache generously so the pages are
// instant on repeat visits and usable from the offline cache.
export function useMeetings(params) {
  return useQuery({
    queryKey: governanceKeys.meetings(params),
    queryFn: () => governanceService.meetings(params),
    staleTime: 5 * 60_000,
    placeholderData: (prev) => prev,
  });
}

export function useMeeting(id) {
  return useQuery({
    queryKey: governanceKeys.meeting(id),
    queryFn: () => governanceService.meeting(id),
    enabled: Boolean(id),
    staleTime: 5 * 60_000,
  });
}

export function useProjects(params) {
  return useQuery({
    queryKey: governanceKeys.projects(params),
    queryFn: () => governanceService.projects(params),
    staleTime: 5 * 60_000,
    placeholderData: (prev) => prev,
  });
}

export function useProjectSummary() {
  return useQuery({
    queryKey: governanceKeys.projectSummary(),
    queryFn: () => governanceService.projectSummary(),
    staleTime: 5 * 60_000,
  });
}

/**
 * Polls are personalised (they carry whether *you* have voted) so they are not shared cache —
 * and short-lived, because the tallies change as the village votes.
 */
export function usePolls() {
  return useQuery({
    queryKey: governanceKeys.polls(),
    queryFn: () => governanceService.polls(),
    staleTime: 30_000,
  });
}

export function useVote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ pollId, optionId }) => governanceService.vote(pollId, optionId),
    // Refetch rather than patch the cache: the server decides the tally, and a 409 from a
    // duplicate vote must leave the list showing the truth.
    onSettled: () => qc.invalidateQueries({ queryKey: governanceKeys.polls() }),
  });
}

export function useFeedbackSummary() {
  return useQuery({
    queryKey: governanceKeys.feedbackSummary(),
    queryFn: () => governanceService.feedbackSummary(),
    staleTime: 60_000,
  });
}

export function useMyFeedback() {
  return useQuery({
    queryKey: governanceKeys.myFeedback(),
    queryFn: () => governanceService.myFeedback(),
    staleTime: 60_000,
  });
}

export function useSubmitFeedback() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => governanceService.submitFeedback(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: governanceKeys.feedbackSummary() });
      qc.invalidateQueries({ queryKey: governanceKeys.myFeedback() });
    },
  });
}

export function useDownloads(params) {
  return useQuery({
    queryKey: governanceKeys.downloads(params),
    queryFn: () => governanceService.downloads(params),
    staleTime: 5 * 60_000,
    placeholderData: (prev) => prev,
  });
}
