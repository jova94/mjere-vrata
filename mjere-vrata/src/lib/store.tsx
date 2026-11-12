import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { defaultSettings, uid } from './defaults';
import { storage as Storage } from './storage';
import { Door, Project, Settings } from './types';

const PROJECTS_KEY = 'projects.v1';
const SETTINGS_KEY = 'settings.v1';

function load<T>(key: string, fallback: T): T {
  try {
    const raw = Storage.getItemSync(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

interface StoreValue {
  projects: Project[];
  settings: Settings;
  getProject: (id: string) => Project | undefined;
  createProject: (data: Partial<Project>) => Project;
  updateProject: (id: string, data: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  saveDoor: (projectId: string, door: Door) => void;
  deleteDoor: (projectId: string, doorId: string) => void;
  updateSettings: (fn: (s: Settings) => Settings) => void;
  suggestNumber: () => string;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(() => load(PROJECTS_KEY, []));
  const [settings, setSettings] = useState<Settings>(() => ({
    ...defaultSettings,
    ...load<Partial<Settings>>(SETTINGS_KEY, {}),
  }));

  useEffect(() => {
    Storage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  }, [projects]);
  useEffect(() => {
    Storage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  const suggestNumber = useCallback(
    () => `${settings.numberPrefix}${String(settings.nextNumber).padStart(3, '0')}`,
    [settings.numberPrefix, settings.nextNumber],
  );

  const createProject = useCallback(
    (data: Partial<Project>) => {
      const p: Project = {
        id: uid(),
        number: suggestNumber(),
        name: '',
        phone: '',
        email: '',
        address: '',
        note: '',
        createdAt: new Date().toISOString(),
        doors: [],
        ...data,
      };
      setProjects((ps) => [p, ...ps]);
      setSettings((s) => ({ ...s, nextNumber: s.nextNumber + 1 }));
      return p;
    },
    [suggestNumber],
  );

  const value = useMemo<StoreValue>(
    () => ({
      projects,
      settings,
      getProject: (id) => projects.find((p) => p.id === id),
      createProject,
      updateProject: (id, data) =>
        setProjects((ps) => ps.map((p) => (p.id === id ? { ...p, ...data } : p))),
      deleteProject: (id) => setProjects((ps) => ps.filter((p) => p.id !== id)),
      saveDoor: (projectId, door) =>
        setProjects((ps) =>
          ps.map((p) => {
            if (p.id !== projectId) return p;
            const exists = p.doors.some((d) => d.id === door.id);
            return {
              ...p,
              doors: exists ? p.doors.map((d) => (d.id === door.id ? door : d)) : [...p.doors, door],
            };
          }),
        ),
      deleteDoor: (projectId, doorId) =>
        setProjects((ps) =>
          ps.map((p) => (p.id === projectId ? { ...p, doors: p.doors.filter((d) => d.id !== doorId) } : p)),
        ),
      updateSettings: (fn) => setSettings(fn),
      suggestNumber,
    }),
    [projects, settings, createProject, suggestNumber],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}
