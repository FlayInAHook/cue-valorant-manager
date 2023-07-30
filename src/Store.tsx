import { atomWithStorage } from 'jotai/utils'

export const obsIPAtom = atomWithStorage("obsIP", "127.0.0.1");
export const obsPasswordAtom = atomWithStorage("obsPassword", "changeme");
export const obsPortAtom = atomWithStorage("obsPort", "4455");
export const obsIngameSceneAtom = atomWithStorage("obsIngameScene", "Ingame Valorant");
export const obsCamSceneAtom = atomWithStorage("obsCamScene", "Client + 1 Cam");


