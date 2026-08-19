'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, RotateCcw, Clock, User, GitCompare, ChevronDown, ChevronUp, Filter } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface Revision {
  id: string;
  entity_type: string;
  entity_id: string;
  entity_title: string;
  old_values: Record<string, any>;
  new_values: Record<string, any>;
  action: 'create' | 'update' | 'delete';
  user_name: string;
  user_email: string;
  created_at: string;
}

interface RevisionHistoryProps {
  entityType?: string;
  entityId?: string;
  onRollback?: (revisionId: string) => void;
}

export function RevisionHistory({ entityType, entityId, onRollback }: RevisionHistoryProps) {
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState<'all' | 'create' | 'update' | 'delete'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [rollingBack, setRollingBack] = useState<string | null>(null);

  useEffect(() => {
    fetchRevisions();
  }, [entityType, entityId]);

  const fetchRevisions = async () => {
    try {
      setLoading(true);

      // In a real implementation, this would fetch from your API
      // For now, using mock data
      const mockRevisions: Revision[] = [
        {
          id: '1',
          entity_type: 'tour',
          entity_id: 'tour-1',
          entity_title: 'Cultural Triangle Experience',
          action: 'update',
          old_values: { price: 2500, featured: false },
          new_values: { price: 2800, featured: true },
          user_name: 'Admin User',
          user_email: 'admin@sacredhimalaya.com',
          created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        },
        {
          id: '2',
          entity_type: 'tour',
          entity_id: 'tour-1',
          entity_title: 'Cultural Triangle Experience',
          action: 'update',
          old_values: { title: 'Cultural Triangle Tour' },
          new_values: { title: 'Cultural Triangle Experience' },
          user_name: 'Admin User',
          user_email: 'admin@sacredhimalaya.com',
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        },
        {
          id: '3',
          entity_type: 'blog_post',
          entity_id: 'blog-1',
          entity_title: 'Top 10 Bhutanese Festivals',
          action: 'create',
          old_values: {},
          new_values: {
            title: 'Top 10 Bhutanese Festivals',
            category: 'Festival',
            is_published: true,
          },
          user_name: 'Admin User',
          user_email: 'admin@sacredhimalaya.com',
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        },
        {
          id: '4',
          entity_type: 'tour',
          entity_id: 'tour-1',
          entity_title: 'Cultural Triangle Experience',
          action: 'create',
          old_values: {},
          new_values: {
            title: 'Cultural Triangle Tour',
            duration: 7,
            price: 2500,
            category: 'cultural',
          },
          user_name: 'Admin User',
          user_email: 'admin@sacredhimalaya.com',
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
        },
      ];

      setRevisions(mockRevisions);
    } catch (error) {
      console.error('Error fetching revisions:', error);
      toast.error('Failed to load revision history');
    } finally {
      setLoading(false);
    }
  };

  const handleRollback = async (revisionId: string) => {
    if (!confirm('Are you sure you want to rollback to this revision? This cannot be undone.')) {
      return;
    }

    try {
      setRollingBack(revisionId);

      // In a real implementation, this would call your rollback API
      await new Promise(resolve => setTimeout(resolve, 1500));

      toast.success('Successfully rolled back to this revision!');

      if (onRollback) {
        onRollback(revisionId);
      }

      // Refresh revisions
      await fetchRevisions();
    } catch (error) {
      console.error('Error rolling back:', error);
      toast.error('Failed to rollback to this revision');
    } finally {
      setRollingBack(null);
    }
  };

  const getChanges = (revision: Revision) => {
    const changes: Record<string, { from: any; to: any }> = {};

    const oldValues = revision.old_values || {};
    const newValues = revision.new_values || {};

    const allKeys = new Set([...Object.keys(oldValues), ...Object.keys(newValues)]);

    allKeys.forEach(key => {
      if (oldValues[key] !== newValues[key]) {
        changes[key] = {
          from: oldValues[key],
          to: newValues[key],
        };
      }
    });

    return changes;
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'create':
        return 'bg-green-100 text-green-700 border-0';
      case 'update':
        return 'bg-blue-100 text-blue-700 border-0';
      case 'delete':
        return 'bg-red-100 text-red-700 border-0';
      default:
        return 'bg-gray-100 text-gray-700 border-0';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'create':
        return '+';
      case 'update':
        return '✎';
      case 'delete':
        return '×';
      default:
        return '•';
    }
  };

  // Filter revisions
  const filteredRevisions = revisions.filter(revision =>
    filterAction === 'all' || revision.action === filterAction
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-prayer-red" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="font-heading text-2xl font-bold flex items-center gap-3">
            <GitCompare className="h-6 w-6 text-prayer-red" />
            Revision History
          </h2>
          <p className="text-muted-foreground">Track and restore previous versions</p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <button
            onClick={() => setFilterAction('all')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              filterAction === 'all' ? 'bg-white shadow-sm' : 'bg-muted/50 hover:bg-muted'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterAction('create')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              filterAction === 'create' ? 'bg-white shadow-sm' : 'bg-muted/50 hover:bg-muted'
            }`}
          >
            Created
          </button>
          <button
            onClick={() => setFilterAction('update')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              filterAction === 'update' ? 'bg-white shadow-sm' : 'bg-muted/50 hover:bg-muted'
            }`}
          >
            Updated
          </button>
          <button
            onClick={() => setFilterAction('delete')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              filterAction === 'delete' ? 'bg-white shadow-sm' : 'bg-muted/50 hover:bg-muted'
            }`}
          >
            Deleted
          </button>
        </div>
      </div>

      {/* Revisions List */}
      <div className="space-y-4">
        {filteredRevisions.length === 0 ? (
          <div className="text-center py-12">
            <GitCompare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-heading text-lg font-bold mb-2">No Revision History</h3>
            <p className="text-muted-foreground">
              {filterAction !== 'all'
                ? `No ${filterAction} revisions found`
                : 'Start making changes to see revision history'}
            </p>
          </div>
        ) : (
          filteredRevisions.map((revision, index) => {
            const changes = getChanges(revision);
            const isExpanded = expandedId === revision.id;
            const changeCount = Object.keys(changes).length;

            return (
              <ScrollReveal key={revision.id} delay={index * 50}>
                <Card className="overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <Badge className={getActionColor(revision.action)}>
                            {getActionIcon(revision.action)} {revision.action.charAt(0).toUpperCase() + revision.action.slice(1)}
                          </Badge>

                          <h3 className="font-heading font-semibold text-lg">
                            {revision.entity_title}
                          </h3>

                          <span className="text-sm text-muted-foreground">
                            {revision.entity_type.replace('_', ' ')}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>{revision.user_name}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>{format(new Date(revision.created_at), 'MMM d, yyyy • h:mm a')}</span>
                          </div>

                          {changeCount > 0 && (
                            <span className="text-xs">
                              {changeCount} change{changeCount > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {revision.action !== 'delete' && (
                          <Button
                            onClick={() => handleRollback(revision.id)}
                            disabled={rollingBack === revision.id}
                            size="sm"
                            variant="outline"
                            className="text-blue-600 hover:text-blue-700"
                          >
                            {rollingBack === revision.id ? (
                              <>
                                <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                                Rolling back...
                              </>
                            ) : (
                              <>
                                <RotateCcw className="h-3 w-3 mr-2" />
                                Rollback
                              </>
                            )}
                          </Button>
                        )}

                        <Button
                          onClick={() => setExpandedId(isExpanded ? null : revision.id)}
                          size="sm"
                          variant="outline"
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp className="h-3 w-3 mr-1" />
                              Hide
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-3 w-3 mr-1" />
                              Details
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Changes Detail */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-4 pt-4 border-t">
                            <h4 className="font-semibold text-sm mb-3">Changes Made</h4>

                            {changeCount === 0 ? (
                              <p className="text-sm text-muted-foreground italic">No changes recorded</p>
                            ) : (
                              <div className="space-y-2">
                                {Object.entries(changes).map(([key, change]) => (
                                  <div key={key} className="text-sm p-3 bg-muted/50 rounded-lg">
                                    <div className="font-medium text-xs text-muted-foreground mb-2">
                                      {key}
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <div className="flex-1">
                                        <span className="text-xs text-red-600 line-through mr-2">
                                          {change.from ? String(change.from) : 'empty'}
                                        </span>
                                        <span className="text-xs text-green-600">
                                          {change.to ? String(change.to) : 'empty'}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </Card>
              </ScrollReveal>
            );
          })
        )}
      </div>
    </div>
  );
}

// Export a simplified version for inline use in other components
export function RevisionBadge({ entityType, entityId }: { entityType: string; entityId: string }) {
  const [revisions, setRevisions] = useState(0);

  useEffect(() => {
    // Fetch revision count (simplified)
    setRevisions(Math.floor(Math.random() * 10));
  }, [entityType, entityId]);

  if (revisions === 0) return null;

  return (
    <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-0">
      {revisions} revision{revisions > 1 ? 's' : ''}
    </Badge>
  );
}