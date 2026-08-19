'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, Keyboard, Command, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

interface ShortcutItem {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  description: string;
  category: string;
}

interface KeyboardShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
  shortcuts: ShortcutItem[];
}

export function KeyboardShortcutsHelp({ isOpen, onClose, shortcuts }: KeyboardShortcutsHelpProps) {
  const [copiedShortcut, setCopiedShortcut] = useState<string | null>(null);

  if (!isOpen) return null;

  const formatShortcut = (shortcut: ShortcutItem) => {
    const parts = [];
    if (shortcut.ctrlKey) parts.push('Ctrl');
    if (shortcut.shiftKey) parts.push('Shift');
    if (shortcut.altKey) parts.push('Alt');
    if (shortcut.metaKey) parts.push('⌘');
    parts.push(shortcut.key.charAt(0).toUpperCase() + shortcut.key.slice(1));
    return parts.join(' + ');
  };

  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, ShortcutItem[]>);

  const handleCopy = (shortcut: ShortcutItem) => {
    const text = formatShortcut(shortcut);
    navigator.clipboard.writeText(text);
    setCopiedShortcut(shortcut.key);

    setTimeout(() => setCopiedShortcut(null), 2000);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-background rounded-2xl shadow-lg max-w-2xl w-full max-h-[80vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-prayer-red to-monastery-red flex items-center justify-center">
                <Keyboard className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="font-heading text-2xl font-bold">Keyboard Shortcuts</h2>
                <p className="text-sm text-muted-foreground">Power user commands</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
            <div className="space-y-6">
              {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
                <div key={category}>
                  <h3 className="font-semibold text-lg mb-3 capitalize">{category}</h3>
                  <div className="grid gap-2">
                    {categoryShortcuts.map((shortcut, index) => (
                      <div
                        key={index}
                        onClick={() => handleCopy(shortcut)}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5">
                            {shortcut.ctrlKey && (
                              <kbd className="px-2 py-1 text-xs font-semibold bg-white border rounded shadow-sm">
                                Ctrl
                              </kbd>
                            )}
                            {shortcut.shiftKey && (
                              <kbd className="px-2 py-1 text-xs font-semibold bg-white border rounded shadow-sm">
                                Shift
                              </kbd>
                            )}
                            {shortcut.altKey && (
                              <kbd className="px-2 py-1 text-xs font-semibold bg-white border rounded shadow-sm">
                                Alt
                              </kbd>
                            )}
                            {shortcut.metaKey && (
                              <kbd className="px-2 py-1 text-xs font-semibold bg-white border rounded shadow-sm">
                                ⌘
                              </kbd>
                            )}
                            <kbd className="px-3 py-1 text-sm font-semibold bg-white border rounded shadow-sm">
                              {shortcut.key.charAt(0).toUpperCase() + shortcut.key.slice(1)}
                            </kbd>
                          </div>
                          <span className="text-sm">{shortcut.description}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {copiedShortcut === shortcut.key && (
                            <Badge className="bg-green-100 text-green-700 border-0">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Copied!
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                            Click to copy
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t bg-muted/30">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Press <kbd className="px-2 py-1 text-xs bg-white border rounded">?</kbd> anytime to open this help
              </p>
              <Button onClick={onClose} className="min-w-[100px]">
                Got it!
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Default shortcuts for admin dashboard
export const defaultAdminShortcuts: ShortcutItem[] = [
  // File Operations
  { key: 's', ctrlKey: true, description: 'Save current form', category: 'file' },
  { key: 'n', ctrlKey: true, description: 'Create new item', category: 'file' },
  { key: 'Delete', description: 'Delete selected item', category: 'file' },
  { key: 'z', ctrlKey: true, description: 'Undo last action', category: 'file' },
  { key: 'y', ctrlKey: true, description: 'Redo last action', category: 'file' },

  // Navigation
  { key: 'd', altKey: true, description: 'Go to Dashboard', category: 'navigation' },
  { key: 't', altKey: true, description: 'Go to Tours', category: 'navigation' },
  { key: 'b', altKey: true, description: 'Go to Blog', category: 'navigation' },
  { key: 'Escape', description: 'Cancel / Close modal', category: 'navigation' },

  // Search & Filter
  { key: 'f', ctrlKey: true, description: 'Focus search bar', category: 'search' },
  { key: 'a', ctrlKey: true, description: 'Select all items', category: 'search' },

  // View
  { key: 'r', ctrlKey: true, description: 'Refresh data', category: 'view' },
  { key: '?', description: 'Show keyboard shortcuts', category: 'view' },
];

// Small shortcut badge component
export function ShortcutBadge({ shortcut }: { shortcut: ShortcutItem }) {
  const parts = [];
  if (shortcut.ctrlKey) parts.push('Ctrl');
  if (shortcut.shiftKey) parts.push('Shift');
  if (shortcut.altKey) parts.push('Alt');
  if (shortcut.metaKey) parts.push('⌘');
  parts.push(shortcut.key.charAt(0).toUpperCase() + shortcut.key.slice(1));

  return (
    <div className="flex items-center gap-1 text-xs">
      {parts.map((part, i) => (
        <kbd
          key={i}
          className="px-1.5 py-0.5 text-xs font-semibold bg-white border rounded shadow-sm"
        >
          {part}
        </kbd>
      ))}
    </div>
  );
}