import type {
  StudentDestination,
  StudentNavFrame,
  StudentNavParams,
  StudentTab,
} from '../../features/student-app/studentNav'
import { tabForDestination } from '../../features/student-app/studentNav'

export type NavState = {
  tab: StudentTab
  stack: StudentNavFrame[]
  askOrbitOpen: boolean
  askOrbitSeed: string
}

export type NavAction =
  | { type: 'setTab'; tab: StudentTab }
  | { type: 'push'; dest: StudentDestination; params?: StudentNavParams; title?: string }
  | { type: 'pop' }
  | { type: 'openAskOrbit'; seed?: string }
  | { type: 'closeAskOrbit' }
  | { type: 'restore'; state: NavState }

const TAB_ROOT: Record<StudentTab, StudentDestination> = {
  home: 'home',
  learn: 'learn',
  grow: 'grow',
  me: 'me',
}

export function rootFrame(tab: StudentTab): StudentNavFrame {
  return { dest: TAB_ROOT[tab] }
}

export function initialNavState(tab: StudentTab = 'home'): NavState {
  return { tab, stack: [rootFrame(tab)], askOrbitOpen: false, askOrbitSeed: '' }
}

export function deepFocus(stack: StudentNavFrame[]): boolean {
  return stack.length >= 3
}

export function studentNavReducer(state: NavState, action: NavAction): NavState {
  switch (action.type) {
    case 'setTab':
      return {
        tab: action.tab,
        stack: [rootFrame(action.tab)],
        askOrbitOpen: false,
        askOrbitSeed: '',
      }
    case 'push': {
      const nextTab = tabForDestination(action.dest)
      const root = rootFrame(nextTab)
      if (action.dest === root.dest && !action.params) {
        return { ...state, tab: nextTab, stack: [root] }
      }
      const base = state.stack[0]?.dest === root.dest ? state.stack : [root]
      const nextFrame: StudentNavFrame = { dest: action.dest, params: action.params, title: action.title }
      const last = base[base.length - 1]
      if (
        last?.dest === action.dest &&
        JSON.stringify(last.params ?? {}) === JSON.stringify(action.params ?? {})
      ) {
        return { ...state, tab: nextTab, stack: base }
      }
      return { ...state, tab: nextTab, stack: [...base, nextFrame] }
    }
    case 'pop':
      if (state.stack.length <= 1) return state
      return { ...state, stack: state.stack.slice(0, -1) }
    case 'openAskOrbit':
      return { ...state, askOrbitOpen: true, askOrbitSeed: action.seed ?? '' }
    case 'closeAskOrbit':
      return { ...state, askOrbitOpen: false, askOrbitSeed: '' }
    case 'restore':
      return action.state
    default: {
      const _exhaustive: never = action
      return _exhaustive
    }
  }
}

/** Hardware back: close sheet → pop → Home tab → consume (exit left to OS). */
export function handleHardwareBack(state: NavState): { state: NavState; exitApp: boolean } {
  if (state.askOrbitOpen) {
    return { state: studentNavReducer(state, { type: 'closeAskOrbit' }), exitApp: false }
  }
  if (state.stack.length > 1) {
    return { state: studentNavReducer(state, { type: 'pop' }), exitApp: false }
  }
  if (state.tab !== 'home') {
    return { state: studentNavReducer(state, { type: 'setTab', tab: 'home' }), exitApp: false }
  }
  return { state, exitApp: true }
}
