import { getDb } from '../db.js';

export function logChange({ userId, userEmail, tableName, recordId, recordLabel, action, changes }) {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO audit_log (user_id, user_email, table_name, record_id, record_label, action, field_name, old_value, new_value)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const label = recordLabel || null;

  if (action === 'update' && changes) {
    for (const [field, { old: oldVal, new: newVal }] of Object.entries(changes)) {
      if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
        stmt.run(userId, userEmail, tableName, recordId, label, action, field, JSON.stringify(oldVal), JSON.stringify(newVal));
      }
    }
  } else {
    stmt.run(userId, userEmail, tableName, recordId, label, action, null, null, null);
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
