'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Loader2, Check, X, Trash2, Archive, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

interface BulkAction {
  id: string;
  label: string;
  icon: any;
  color: string;
  confirm?: boolean;
  confirmMessage?: string;
  handler: (selectedIds: string[]) => Promise<void>;
}

interface BulkOperationsProps {
  items: { id: string; [key: string]: any }[];
  actions: BulkAction[];
  onActionComplete?: () => void;
  selectionKey?: string;
}

export function BulkOperations({
  items,
  actions,
  onActionComplete,
  selectionKey = 'id'
}: BulkOperationsProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [executingAction, setExecutingAction] = useState<string | null>(null);

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      setIsAllSelected(false);
      return newSet;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (isAllSelected) {
      setSelectedIds(new Set());
      setIsAllSelected(false);
    } else {
      setSelectedIds(new Set(items.map(item => item[selectionKey])));
      setIsAllSelected(true);
    }
  }, [items, selectionKey, isAllSelected]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
    setIsAllSelected(false);
  }, []);

  const executeAction = async (action: BulkAction) => {
    if (selectedIds.size === 0) {
      toast.error('Please select at least one item');
      return;
    }

    if (action.confirm && !confirm(action.confirmMessage || `Are you sure you want to ${action.label.toLowerCase()} ${selectedIds.size} item(s)?`)) {
      return;
    }

    try {
      setExecutingAction(action.id);

      // Call the action handler
      await action.handler(Array.from(selectedIds));

      toast.success(`${action.label} completed successfully!`);

      // Clear selection after successful action
      clearSelection();

      if (onActionComplete) {
        onActionComplete();
      }
    } catch (error) {
      console.error(`Error executing ${action.label}:`, error);
      toast.error(`Failed to ${action.label.toLowerCase()} items`);
    } finally {
      setExecutingAction(null);
    }
  };

  const selectedCount = selectedIds.size;
  const totalCount = items.length;

  return (
    <div className="space-y-4">
      {/* Selection Bar */}
      <AnimatePresence>
        {selectedCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-4 rounded-xl bg-gradient-to-r from-prayer-red/10 to-monastery-red/10 border-2 border-prayer-red/20"
          >
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 text-prayer-red rounded"
                  />
                  <span className="font-medium text-prayer-red">
                    {selectedCount} selected
                  </span>
                  <span className="text-sm text-muted-foreground">
                    of {totalCount}
                  </span>
                </div>

                <Button
                  onClick={clearSelection}
                  size="sm"
                  variant="outline"
                  className="text-xs"
                >
                  Clear Selection
                </Button>
              </div>

              {/* Bulk Actions */}
              <div className="flex items-center gap-2 flex-wrap">
                {actions.map(action => (
                  <Button
                    key={action.id}
                    onClick={() => executeAction(action)}
                    disabled={executingAction !== null}
                    size="sm"
                    variant="outline"
                    className={`flex items-center gap-2 ${
                      executingAction === action.id ? 'opacity-75' : ''
                    }`}
                    style={action.color ? { borderColor: action.color, color: action.color } : {}}
                  >
                    {executingAction === action.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <action.icon className="h-4 w-4" />
                    )}
                    <span className="hidden sm:inline">{action.label}</span>
                    <span className="sm:hidden">{action.icon && <action.icon className="h-4 w-4" />}</span>
                  </Button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selection Checkbox Column Header */}
      {items.length > 0 && (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isAllSelected && totalCount > 0}
            onChange={toggleSelectAll}
            className="w-4 h-4 text-prayer-red rounded"
          />
          <span className="text-sm text-muted-foreground">
            Select All
          </span>
        </div>
      )}
    </div>
  );
}

// Individual row checkbox component
export function BulkSelectRow({
  item,
  isSelected,
  onToggle,
  selectionKey = 'id'
}: {
  item: any;
  isSelected: boolean;
  onToggle: (id: string) => void;
  selectionKey?: string;
}) {
  return (
    <div className="flex items-center">
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => onToggle(item[selectionKey])}
        className="w-4 h-4 text-prayer-red rounded cursor-pointer"
      />
    </div>
  );
}

// Common bulk action configurations
export const commonBulkActions = {
  delete: {
    id: 'delete',
    label: 'Delete',
    icon: Trash2,
    color: 'var(--primary)',
    confirm: true,
    confirmMessage: 'Are you sure you want to delete the selected items? This action cannot be undone.',
  },

  archive: {
    id: 'archive',
    label: 'Archive',
    icon: Archive,
    color: '#F59E0B',
    confirm: true,
    confirmMessage: 'Are you sure you want to archive the selected items?',
  },

  activate: {
    id: 'activate',
    label: 'Activate',
    icon: Check,
    color: '#10B981',
    confirm: false,
  },

  deactivate: {
    id: 'deactivate',
    label: 'Deactivate',
    icon: X,
    color: '#6B7280',
    confirm: false,
  },

  publish: {
    id: 'publish',
    label: 'Publish',
    icon: Check,
    color: '#10B981',
    confirm: false,
  },

  unpublish: {
    id: 'unpublish',
    label: 'Unpublish',
    icon: X,
    color: '#6B7280',
    confirm: false,
  },

  feature: {
    id: 'feature',
    label: 'Feature',
    icon: Check,
    color: '#F59E0B',
    confirm: false,
  },

  unfeature: {
    id: 'unfeature',
    label: 'Unfeature',
    icon: X,
    color: '#6B7280',
    confirm: false,
  },

  duplicate: {
    id: 'duplicate',
    label: 'Duplicate',
    icon: RotateCcw,
    color: '#3B82F6',
    confirm: false,
  },
};

// Selection stats component
export function SelectionStats({
  selectedCount,
  totalCount
}: {
  selectedCount: number;
  totalCount: number;
}) {
  if (selectedCount === 0) return null;

  const percentage = Math.round((selectedCount / totalCount) * 100);

  return (
    <div className="flex items-center gap-2 text-sm">
      <Badge className="bg-prayer-red text-white border-0">
        {selectedCount} selected
      </Badge>
      <span className="text-muted-foreground">
        ({percentage}% of {totalCount})
      </span>
    </div>
  );
}

// Quick action bar for mobile
export function MobileBulkActionBar({
  actions,
  selectedCount,
  onAction
}: {
  actions: BulkAction[];
  selectedCount: number;
  onAction: (action: BulkAction) => void;
}) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 md:hidden z-40">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{selectedCount} selected</span>
        <div className="flex items-center gap-2">
          {actions.slice(0, 3).map(action => (
            <Button
              key={action.id}
              onClick={() => onAction(action)}
              size="sm"
              variant="outline"
            >
              <action.icon className="h-4 w-4" />
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}