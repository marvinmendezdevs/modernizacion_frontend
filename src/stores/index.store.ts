import { create } from "zustand";

type UseNavbarType = {
    isOpen: boolean
    setIsOpen: () => void
}

type UseActiveNavType = {
    tab: string,
    setTab: (tab: string) => void,
}

export const useNavbar = create<UseNavbarType>((set) => ({
    isOpen: false,
    setIsOpen: () => set(state => ({ isOpen: !state.isOpen }))
}));

export const useActiveNavItem = create<UseActiveNavType>((set) => ({
    tab: '/',
    setTab: (tab) => set({tab}),
}));