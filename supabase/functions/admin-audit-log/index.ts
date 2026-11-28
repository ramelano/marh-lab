import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
const allowedActions = new Set(["create", "update", "delete", "remove", "login", "logout", "sync", "export"]);

function clientIp(req: Request) {
  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || req.headers.get("cf-connecting-ip")?.trim() || null;
}
function json(body: unknown, status = 200) { return new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } }); }

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  try {
    const body = await req.json();
    if (!body?.idempotency_key || !allowedActions.has(String(body.action))) return json({ error: "invalid_audit_payload" }, 400);
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const payload = {
      idempotency_key: body.idempotency_key,
      actor: body.actor || null,
      tenant_id: body.tenant_id || null,
      action: body.action,
      module: body.module || null,
      record_id: body.record_id || null,
      ip_address: clientIp(req),
      user_agent: body.user_agent || req.headers.get("user-agent") || null,
      device_type: body.device_type || null,
      source: "supabase-edge",
      details: body.details || null,
      before_data: body.before_data || null,
      after_data: body.after_data || null,
      created_at: new Date().toISOString(),
    };
    const { data, error } = await supabase.from("audit_logs").upsert(payload, { onConflict: "idempotency_key" }).select("id,idempotency_key,created_at,ip_address").single();
    if (error) return json({ error: "audit_write_failed", detail: error.message }, 500);
    return json({ ok: true, audit: data });
  } catch (error) {
    return json({ error: "invalid_request", detail: error instanceof Error ? error.message : "unknown_error" }, 400);
  }
});
