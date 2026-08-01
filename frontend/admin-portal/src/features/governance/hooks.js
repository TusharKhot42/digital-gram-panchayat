import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  meetingService,
  projectService,
  pollService,
  documentService,
  feedbackService,
} from './governanceService';

const keys = {
  meetings: ['admin', 'meetings'],
  projects: ['admin', 'projects'],
  polls: ['admin', 'polls'],
  documents: ['admin', 'downloads'],
  feedback: ['admin', 'feedback'],
  feedbackAnalytics: ['admin', 'feedback', 'analytics'],
};

/** One factory for the four list+mutate modules — they differ only in their service. */
function crudHooks(key, service) {
  return {
    useList(params) {
      return useQuery({
        queryKey: [...key, params ?? {}],
        queryFn: () => service.list(params),
        placeholderData: (prev) => prev,
      });
    },
    useMutations() {
      const qc = useQueryClient();
      const invalidate = () => qc.invalidateQueries({ queryKey: key });
      return {
        create: useMutation({
          mutationFn: ({ values, files }) => service.create(values, files),
          onSuccess: invalidate,
        }),
        update: useMutation({
          mutationFn: ({ id, values, files }) => service.update(id, values, files),
          onSuccess: invalidate,
        }),
        remove: useMutation({ mutationFn: (id) => service.remove(id), onSuccess: invalidate }),
      };
    },
  };
}

const meetings = crudHooks(keys.meetings, meetingService);
const projects = crudHooks(keys.projects, projectService);
const polls = crudHooks(keys.polls, pollService);
const documents = crudHooks(keys.documents, documentService);

export const useAdminMeetings = meetings.useList;
export const useMeetingMutations = meetings.useMutations;
export const useAdminProjects = projects.useList;
export const useProjectMutations = projects.useMutations;
export const useAdminPolls = polls.useList;
export const usePollMutations = polls.useMutations;
export const useAdminDocuments = documents.useList;
export const useDocumentMutations = documents.useMutations;

export function useFeedbackAnalytics(months = 6) {
  return useQuery({
    queryKey: [...keys.feedbackAnalytics, months],
    queryFn: () => feedbackService.analytics(months),
    staleTime: 60_000,
  });
}

export function useAdminFeedback(params) {
  return useQuery({
    queryKey: [...keys.feedback, params ?? {}],
    queryFn: () => feedbackService.list(params),
    placeholderData: (prev) => prev,
  });
}
