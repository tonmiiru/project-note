import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { Point, Topic, PointStatus, ProjectState, Reaction, Reply, HistoricalSummary } from 'worker/types';
type LoadingStates = {
  fetch: boolean;
  addPoint: boolean;
  summary: boolean;
};
type SortOption = 'newest' | 'oldest';
type GroupOption = 'none' | 'topic' | 'status';
type ProjectStoreState = {
  projectId: string | null;
  projectName: string | null;
  points: Point[];
  topics: Topic[];
  summary: string | null;
  summaryHistory: HistoricalSummary[];
  loading: LoadingStates;
  sortOption: SortOption;
  groupOption: GroupOption;
};
type ProjectActions = {
  setProject: (projectId: string, data: ProjectState) => void;
  addPoint: (point: Point) => void;
  updatePointStatus: (pointId: string, status: PointStatus) => void;
  addReaction: (pointId: string, reaction: Reaction) => void;
  addReply: (pointId: string, reply: Reply) => void;
  setSummary: (summary: string) => void;
  addSummaryToHistory: (newSummary: HistoricalSummary) => void;
  setLoading: (key: keyof LoadingStates, value: boolean) => void;
  setSortOption: (option: SortOption) => void;
  setGroupOption: (option: GroupOption) => void;
};
export const useProjectStore = create<ProjectStoreState & ProjectActions>()(
  immer((set) => ({
    projectId: null,
    projectName: null,
    points: [],
    topics: [],
    summary: null,
    summaryHistory: [],
    loading: {
      fetch: true,
      addPoint: false,
      summary: false,
    },
    sortOption: 'newest',
    groupOption: 'none',
    setProject: (projectId, data) => {
      set((state) => {
        if (!data) return; // Defensive check
        state.projectId = projectId;
        state.projectName = data.name;
        state.points = data.points.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        state.topics = [...new Set(data.points.map(p => p.topic))].map(name => ({ id: name, name }));
        state.summary = data.summary;
        state.summaryHistory = data.summaryHistory || [];
        state.loading.fetch = false;
      });
    },
    addPoint: (point) => {
      set((state) => {
        state.points.unshift(point);
        const topicExists = state.topics.some((t) => t.name.toLowerCase() === point.topic.toLowerCase());
        if (!topicExists) {
          state.topics.push({ id: crypto.randomUUID(), name: point.topic });
        }
      });
    },
    updatePointStatus: (pointId, status) => {
      set((state) => {
        const point = state.points.find((p) => p.id === pointId);
        if (point) {
          point.status = status;
        }
      });
    },
    addReaction: (pointId, reaction) => {
      set((state) => {
        const point = state.points.find((p) => p.id === pointId);
        if (point) {
          point.reactions.push(reaction);
        }
      });
    },
    addReply: (pointId, reply) => {
      set((state) => {
        const point = state.points.find((p) => p.id === pointId);
        if (point) {
          point.replies.push(reply);
        }
      });
    },
    setSummary: (summary) => {
      set((state) => {
        state.summary = summary;
      });
    },
    addSummaryToHistory: (newSummary) => {
      set((state) => {
        state.summaryHistory.unshift(newSummary);
      });
    },
    setLoading: (key, value) => {
      set((state) => {
        state.loading[key] = value;
      });
    },
    setSortOption: (option) => {
      set((state) => {
        state.sortOption = option;
      });
    },
    setGroupOption: (option) => {
      set((state) => {
        state.groupOption = option;
      });
    },
  }))
);