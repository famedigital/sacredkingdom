'use client';

import { useEffect, useCallback } from 'react';

interface ShortcutConfig {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  handler: () => void;
  description: string;
  global?: boolean;
}

export function useKeyboardShortcuts(shortcuts: ShortcutConfig[]) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement ||
        (event.target as HTMLElement).contentEditable === 'true'
      ) {
        return;
      }

      const matchingShortcut = shortcuts.find(shortcut => {
        const keyMatches = shortcut.key.toLowerCase() === event.key.toLowerCase();

        const modifierMatches =
          (shortcut.ctrlKey === undefined || shortcut.ctrlKey === event.ctrlKey) &&
          (shortcut.shiftKey === undefined || shortcut.shiftKey === event.shiftKey) &&
          (shortcut.altKey === undefined || shortcut.altKey === event.altKey) &&
          (shortcut.metaKey === undefined || shortcut.metaKey === event.metaKey);

        return keyMatches && modifierMatches;
      });

      if (matchingShortcut) {
        event.preventDefault();
        event.stopPropagation();
        matchingShortcut.handler();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [shortcuts]);
}

// Predefined shortcut configurations
export const adminShortcuts = {
  save: {
    key: 's',
    ctrlKey: true,
    description: 'Save current form',
  },
  cancel: {
    key: 'Escape',
    description: 'Cancel current operation',
  },
  new: {
    key: 'n',
    ctrlKey: true,
    description: 'Create new item',
  },
  delete: {
    key: 'Delete',
    description: 'Delete selected item',
  },
  search: {
    key: 'f',
    ctrlKey: true,
    description: 'Focus search',
  },
  refresh: {
    key: 'r',
    ctrlKey: true,
    description: 'Refresh data',
  },
  undo: {
    key: 'z',
    ctrlKey: true,
    description: 'Undo last action',
  },
  redo: {
    key: 'y',
    ctrlKey: true,
    description: 'Redo last action',
  },
  selectAll: {
    key: 'a',
    ctrlKey: true,
    description: 'Select all items',
  },
  dashboard: {
    key: 'd',
    altKey: true,
    description: 'Go to Dashboard',
  },
  tours: {
    key: 't',
    altKey: true,
    description: 'Go to Tours',
  },
  blog: {
    key: 'b',
    altKey: true,
    description: 'Go to Blog',
  },
};

export function useAdminShortcuts(handlers: {
  onSave?: () => void;
  onCancel?: () => void;
  onNew?: () => void;
  onDelete?: () => void;
  onSearch?: () => void;
  onRefresh?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onSelectAll?: () => void;
  onNavigate?: (section: string) => void;
}) {
  const shortcuts: ShortcutConfig[] = [];

  if (handlers.onSave) {
    shortcuts.push({
      ...adminShortcuts.save,
      handler: handlers.onSave,
      description: adminShortcuts.save.description,
    });
  }

  if (handlers.onCancel) {
    shortcuts.push({
      ...adminShortcuts.cancel,
      handler: handlers.onCancel,
      description: adminShortcuts.cancel.description,
    });
  }

  if (handlers.onNew) {
    shortcuts.push({
      ...adminShortcuts.new,
      handler: handlers.onNew,
      description: adminShortcuts.new.description,
    });
  }

  if (handlers.onDelete) {
    shortcuts.push({
      ...adminShortcuts.delete,
      handler: handlers.onDelete,
      description: adminShortcuts.delete.description,
    });
  }

  if (handlers.onSearch) {
    shortcuts.push({
      ...adminShortcuts.search,
      handler: handlers.onSearch,
      description: adminShortcuts.search.description,
    });
  }

  if (handlers.onRefresh) {
    shortcuts.push({
      ...adminShortcuts.refresh,
      handler: handlers.onRefresh,
      description: adminShortcuts.refresh.description,
    });
  }

  if (handlers.onUndo) {
    shortcuts.push({
      ...adminShortcuts.undo,
      handler: handlers.onUndo,
      description: adminShortcuts.undo.description,
    });
  }

  if (handlers.onRedo) {
    shortcuts.push({
      ...adminShortcuts.redo,
      handler: handlers.onRedo,
      description: adminShortcuts.redo.description,
    });
  }

  if (handlers.onSelectAll) {
    shortcuts.push({
      ...adminShortcuts.selectAll,
      handler: handlers.onSelectAll,
      description: adminShortcuts.selectAll.description,
    });
  }

  if (handlers.onNavigate) {
    shortcuts.push({
      ...adminShortcuts.dashboard,
      handler: () => handlers.onNavigate!('dashboard'),
      description: adminShortcuts.dashboard.description,
    });
    shortcuts.push({
      ...adminShortcuts.tours,
      handler: () => handlers.onNavigate!('tours'),
      description: adminShortcuts.tours.description,
    });
    shortcuts.push({
      ...adminShortcuts.blog,
      handler: () => handlers.onNavigate!('blog'),
      description: adminShortcuts.blog.description,
    });
  }

  useKeyboardShortcuts(shortcuts);

  return shortcuts;
}