import { supabase, isSupabaseConfigured } from './supabase';

export interface SyncOperation {
  id: string;
  table: string;
  action: 'insert' | 'update' | 'delete';
  data: any;
  filter?: { key: string; value: any };
  createdAt: string;
}

const STORAGE_KEY = 'ramito_sync_queue';

// Get current pending operations from local storage
export function getPendingOperations(): SyncOperation[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch (e) {
    console.error('Error parsing sync queue:', e);
    return [];
  }
}

// Save operations list to local storage
function savePendingOperations(ops: SyncOperation[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ops));
}

// Add a new operation to the queue
export function enqueueOperation(
  table: string,
  action: 'insert' | 'update' | 'delete',
  data: any,
  filter?: { key: string; value: any }
): void {
  const ops = getPendingOperations();
  
  // Clean up duplicate pending updates to optimize sync
  let filteredOps = ops;
  if (action === 'update' && filter) {
    // If there is already a pending update for the same record and same table, we can merge or replace it
    filteredOps = ops.filter(op => 
      !(op.table === table && 
        op.action === 'update' && 
        op.filter && 
        op.filter.key === filter.key && 
        op.filter.value === filter.value)
    );
  }

  const newOp: SyncOperation = {
    id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    table,
    action,
    data,
    filter,
    createdAt: new Date().toISOString()
  };

  filteredOps.push(newOp);
  savePendingOperations(filteredOps);
  
  // Dispatch a custom event to notify AppContext of queue changes
  window.dispatchEvent(new CustomEvent('ramito_sync_queue_changed', { detail: filteredOps.length }));
}

// Clear the queue
export function clearQueue(): void {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new CustomEvent('ramito_sync_queue_changed', { detail: 0 }));
}

// Execute the operations in order to sync with Supabase
export async function syncPendingOperations(): Promise<{ success: boolean; syncedCount: number }> {
  if (!isSupabaseConfigured) {
    return { success: false, syncedCount: 0 };
  }

  const ops = getPendingOperations();
  if (ops.length === 0) {
    return { success: true, syncedCount: 0 };
  }

  console.log(`🔄 Syncing ${ops.length} pending operations to Supabase...`);
  const remainingOps: SyncOperation[] = [...ops];
  let syncedCount = 0;

  for (const op of ops) {
    try {
      let error = null;

      if (op.action === 'insert') {
        const { error: insertErr } = await supabase.from(op.table).insert([op.data]);
        error = insertErr;
      } else if (op.action === 'update') {
        if (op.filter) {
          const { error: updateErr } = await supabase
            .from(op.table)
            .update(op.data)
            .eq(op.filter.key, op.filter.value);
          error = updateErr;
        } else {
          console.warn(`Skipping sync update for ${op.table} as it lacks filter.`);
        }
      } else if (op.action === 'delete') {
        if (op.filter) {
          const { error: deleteErr } = await supabase
            .from(op.table)
            .delete()
            .eq(op.filter.key, op.filter.value);
          error = deleteErr;
        } else {
          // General clear (e.g. neq id 0)
          const { error: deleteErr } = await supabase
            .from(op.table)
            .delete()
            .neq('id', '0');
          error = deleteErr;
        }
      }

      if (error) {
        console.error(`❌ Sync failed for operation ${op.id} on table ${op.table}:`, error);
        // If it's a constraint error or not-found, we might skip it or keep trying.
        // For simplicity, we keep it in queue to avoid data loss.
        break; 
      }

      console.log(`✓ Operation synced successfully: ${op.action} on ${op.table}`);
      syncedCount++;
      // Remove it from remaining list
      const idx = remainingOps.findIndex(o => o.id === op.id);
      if (idx !== -1) {
        remainingOps.splice(idx, 1);
      }
      savePendingOperations(remainingOps);
      window.dispatchEvent(new CustomEvent('ramito_sync_queue_changed', { detail: remainingOps.length }));

    } catch (e) {
      console.error(`Catastrophic error syncing operation ${op.id}:`, e);
      break; // Stop sync loop if we hit a network issue
    }
  }

  const success = remainingOps.length === 0;
  return { success, syncedCount };
}
