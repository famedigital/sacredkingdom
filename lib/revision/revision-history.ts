import { createClient } from '@/utils/supabase/server';

export interface Revision {
  id: string;
  entity_type: string;
  entity_id: string;
  entity_title: string;
  old_values: Record<string, any>;
  new_values: Record<string, any>;
  action: 'create' | 'update' | 'delete';
  user_id: string;
  user_name: string;
  user_email: string;
  created_at: string;
}

export interface RevisionHistoryOptions {
  entityType?: string;
  entityId?: string;
  limit?: number;
  offset?: number;
}

/**
 * Create a revision history entry
 */
export async function createRevision(params: {
  entityType: string;
  entityId: string;
  entityTitle: string;
  action: 'create' | 'update' | 'delete';
  userId: string;
  userName: string;
  userEmail: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
}) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('revision_history')
    .insert({
      entity_type: params.entityType,
      entity_id: params.entityId,
      entity_title: params.entityTitle,
      action: params.action,
      old_values: params.oldValues || {},
      new_values: params.newValues || {},
      user_id: params.userId,
      user_name: params.userName,
      user_email: params.userEmail,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get revision history for an entity
 */
export async function getRevisionHistory(options: RevisionHistoryOptions = {}) {
  const supabase = await createClient();

  let query = supabase
    .from('revision_history')
    .select('*')
    .order('created_at', { ascending: false });

  if (options.entityType) {
    query = query.eq('entity_type', options.entityType);
  }

  if (options.entityId) {
    query = query.eq('entity_id', options.entityId);
  }

  if (options.limit) {
    query = query.limit(options.limit);
  }

  if (options.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as Revision[];
}

/**
 * Get a specific revision by ID
 */
export async function getRevisionById(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('revision_history')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Revision;
}

/**
 * Rollback an entity to a specific revision
 */
export async function rollbackToRevision(revisionId: string) {
  const supabase = await createClient();

  // Get the revision
  const revision = await getRevisionById(revisionId);

  if (!revision) {
    throw new Error('Revision not found');
  }

  // Get current entity data
  let tableName: string;
  switch (revision.entity_type) {
    case 'tour':
      tableName = 'tours';
      break;
    case 'blog_post':
      tableName = 'blog_posts';
      break;
    case 'about_page':
      tableName = 'content_pages';
      break;
    case 'faq':
      tableName = 'faqs';
      break;
    case 'hero_slide':
      tableName = 'hero_slides';
      break;
    case 'testimonial':
      tableName = 'testimonials';
      break;
    default:
      throw new Error(`Unsupported entity type: ${revision.entity_type}`);
  }

  // Rollback the entity
  const { data, error } = await supabase
    .from(tableName)
    .update(revision.old_values)
    .eq('id', revision.entity_id)
    .select()
    .single();

  if (error) throw error;

  // Create a revision for the rollback
  await createRevision({
    entityType: revision.entity_type,
    entityId: revision.entity_id,
    entityTitle: revision.entity_title,
    action: 'update',
    userId: revision.user_id,
    userName: revision.user_name,
    userEmail: revision.user_email,
    oldValues: revision.new_values,
    newValues: revision.old_values,
  });

  return data;
}

/**
 * Get revision statistics
 */
export async function getRevisionStats() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('revision_history')
    .select('action, created_at')
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) throw error;

  const stats = {
    total: data.length,
    creates: data.filter(r => r.action === 'create').length,
    updates: data.filter(r => r.action === 'update').length,
    deletes: data.filter(r => r.action === 'delete').length,
  };

  return stats;
}

/**
 * Compare two revisions
 */
export function compareRevisions(revision1: Revision, revision2: Revision) {
  const changes: Record<string, { from: any; to: any }> = {};

  const oldValues = revision1.old_values || {};
  const newValues = revision1.new_values || {};

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
}

/**
 * Get revision summary for display
 */
export function getRevisionSummary(revision: Revision) {
  const changes = compareRevisions(revision, revision);

  const changeCount = Object.keys(changes).length;
  const actionText = {
    create: 'Created',
    update: 'Updated',
    delete: 'Deleted',
  }[revision.action];

  let summary = `${actionText} ${revision.entity_title}`;

  if (changeCount > 0) {
    summary += ` (${changeCount} change${changeCount > 1 ? 's' : ''})`;
  }

  return summary;
}