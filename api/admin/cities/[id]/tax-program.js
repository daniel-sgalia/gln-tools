import { requireAuth } from '../../../../lib/auth.js';
import { createServerClient } from '../../../../lib/supabase.js';
import { logChange } from '../../../../lib/audit.js';

async function cityLabel(db, cityId) {
  const { data } = await db.from('cities').select('city_name, country').eq('id', cityId).single();
  return data ? `${data.city_name}, ${data.country}` : null;
}

export default async function handler(req, res) {
  if (req.method !== 'PUT') return res.status(405).json({ error: 'Method not allowed' });
  const user = await requireAuth(req, res);
  if (!user) return;
  const db = createServerClient();
  const cityId = parseInt(req.query.id);
  const { programName, programDesc, effectiveRate, method, bracketsRef, caveat, source } = req.body;

  await db.from('destination_tax_programs').upsert({
    city_id: cityId, program_name: programName, program_desc: programDesc,
    effective_rate: effectiveRate ?? null, method, brackets_ref: bracketsRef || null,
    caveat: caveat || null, source: source || null,
    updated_by: user.appUser.id, last_updated: new Date().toISOString(),
  }, { onConflict: 'city_id' });

  await logChange({ userId: user.appUser.id, userEmail: user.email, tableName: 'destination_tax_programs', recordId: cityId, recordLabel: await cityLabel(db, cityId), action: 'update', changes: { taxProgram: { old: 'bulk', new: 'updated' } } });
  res.json({ ok: true });
}
