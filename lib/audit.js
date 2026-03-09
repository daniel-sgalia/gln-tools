import { createServerClient } from './supabase.js';

export async function logChange({ userId, userEmail, tableName, recordId, recordLabel, action, changes }) {
  const db = createServerClient();
  const label = recordLabel || null;

  if (action === 'update' && changes) {
    const rows = [];
    for (const [field, { old: oldVal, new: newVal }] of Object.entries(changes)) {
      if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
        rows.push({
          user_id: userId, user_email: userEmail, table_name: tableName,
          record_id: recordId, record_label: label, action,
          field_name: field, old_value: JSON.stringify(oldVal), new_value: JSON.stringify(newVal),
        });
      }
    }
    if (rows.length > 0) await db.from('audit_log').insert(rows);
  } else {
    await db.from('audit_log').insert({
      user_id: userId, user_email: userEmail, table_name: tableName,
      record_id: recordId, record_label: label, action,
    });
  }
}

export function diffFields(existing, updated, fields) {
  const changes = {};
  for (const field of fields) {
    if (updated[field] !== undefined && existing[field] !== updated[field]) {
      changes[field] = { old: existing[field], new: updated[field] };
    }
  }
  return Object.keys(changes).length > 0 ? changes : null;
}
