import { create } from "zustand";

type UseFeedbackStoreType = {
    criterias: string[]
    setCriterias: (criterias: string[]) => void
}

export const useFeedbackStore = create<UseFeedbackStoreType>((set) => ({
    criterias: [],
    setCriterias: (criterias) => set({ criterias }),
}));