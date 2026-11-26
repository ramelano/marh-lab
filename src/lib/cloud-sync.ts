import { supabase } from "./supabase";

const QUEUE_KEY = "marhlab.supabase.pending.v1";
const STATUS_EVENT = "marhlab:supabase-status";

type QueueJob = { id: string; table: string; rows: Record<string, unknown>[]; conflict: string };
export type CustomerRecord = { id: string; name: string; phone?: string; addresses?: string[]; address?: string; city?: string; district?: string; notes?: string };
export type QuoteRecord = Record<string, any>;

export function publishSyncStatus(status: "local" | "syncing" | "synced" | "queued" | "error", message?: string) {
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent(STATUS_EVENT, { detail: { status, message } }));
}

function readQueue(): QueueJob[] {
  try { return JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]"); } catch { return []; }
}
function writeQueue(queue: QueueJob[]) {
  try { localStorage.setItem(QUEUE_KEY, JSON.stringify(queue)); } catch { /* kota doluysa uygulama yine yerel çalışır */ }
}

async function perform(job: QueueJob) {
  if (!supabase) return;
  const { error } = await supabase.from(job.table).upsert(job.rows, { onConflict: job.conflict });
  if (error) throw error;
}

export async function queueUpsert(table: string, rows: Record<string, unknown>[], conflict: string) {
  if (!rows.length) return;
  if (!supabase || !navigator.onLine) {
    writeQueue([...readQueue(), { id: crypto.randomUUID(), table, rows, conflict }]);
    publishSyncStatus("queued", "Bağlantı yok; değişiklikler bu cihazda sıraya alındı.");
    return;
  }
  try {
    publishSyncStatus("syncing");
    await perform({ id: crypto.randomUUID(), table, rows, conflict });
    publishSyncStatus("synced");
  } catch (error) {
    writeQueue([...readQueue(), { id: crypto.randomUUID(), table, rows, conflict }]);
    publishSyncStatus("queued", error instanceof Error ? error.message : "Bulut bağlantısı geçici olarak kurulamadı.");
  }
}

export async function flushCloudQueue() {
  if (!supabase || !navigator.onLine) return;
  const queue = readQueue();
  if (!queue.length) return;
  publishSyncStatus("syncing");
  const remaining: QueueJob[] = [];
  for (const job of queue) {
    try { await perform(job); } catch { remaining.push(job); }
  }
  writeQueue(remaining);
  publishSyncStatus(remaining.length ? "queued" : "synced", remaining.length ? `${remaining.length} işlem daha sonra yeniden denenecek.` : "Bekleyen değişiklikler buluta aktarıldı.");
}

export function subscribeToCloudQueue() {
  if (typeof window === "undefined") return () => {};
  const retry = () => { void flushCloudQueue(); };
  window.addEventListener("online", retry);
  const timer = window.setInterval(retry, 30000);
  return () => { window.removeEventListener("online", retry); window.clearInterval(timer); };
}

export function tenantFromCloud(row: any) {
  return {
    id: row.id,
    username: row.username,
    password: row.password || "",
    companyName: row.company_name || row.username,
    ownerName: row.owner_name || "",
    phone: row.phone || "",
    city: row.city || "",
    address: row.address || "",
    plan: row.plan || "Starter (1 Aylık)",
    expiresAt: row.expires_at || "",
    isActive: row.is_active !== false,
  };
}

export function tenantToCloud(firm: any) {
  return {
    id: firm.id && /^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(firm.id) ? firm.id : crypto.randomUUID(),
    username: firm.username,
    password: firm.password || "",
    company_name: firm.companyName || firm.username,
    owner_name: firm.ownerName || "",
    phone: firm.phone || "",
    city: firm.city || "",
    plan: firm.plan || "Starter (1 Aylık)",
    expires_at: firm.expiresAt || null,
    is_active: firm.isActive !== false,
  };
}

export async function fetchTenant(username: string) {
  if (!supabase) return null;
  const { data, error } = await supabase.from("tenants").select("*").eq("username", username).maybeSingle();
  if (error) throw error;
  return data;
}

export async function fetchAdminTenants() {
  if (!supabase) return [];
  const { data, error } = await supabase.from("tenants").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function persistTenants(firms: any[]) {
  if (!supabase || !firms.length) return;
  await queueUpsert("tenants", firms.map(tenantToCloud), "username");
}

export function settingsToCloud(tenantId: string, settings: any) {
  return {
    tenant_id: tenantId,
    tagline: settings.tagline || "",
    email: settings.email || "",
    address: settings.address || "",
    order_prefix: settings.orderPrefix || "PRJ",
    next_order_number: Number(settings.nextOrderNumber || 1),
    aluminum_kg_price: Number(settings.aluminumKgPrice || 0),
    default_profit_margin: Number(settings.defaultProfitMargin || 0),
    vat_rate: Number(settings.vatRate || 20),
    daily_allowance: Number(settings.dailyAllowance || 0),
    logo_url: settings.logoUrl || "",
    watermark_text: settings.watermarkText || "",
    city_tariffs: settings.cityTariffs || [],
    updated_at: new Date().toISOString(),
  };
}

export function settingsFromCloud(row: any, fallback: any) {
  if (!row) return fallback;
  return {
    ...fallback,
    tagline: row.tagline ?? fallback.tagline,
    email: row.email ?? fallback.email,
    address: row.address ?? fallback.address,
    orderPrefix: row.order_prefix ?? fallback.orderPrefix,
    nextOrderNumber: row.next_order_number ?? fallback.nextOrderNumber,
    aluminumKgPrice: row.aluminum_kg_price ?? fallback.aluminumKgPrice,
    defaultProfitMargin: row.default_profit_margin ?? fallback.defaultProfitMargin,
    vatRate: row.vat_rate ?? fallback.vatRate,
    dailyAllowance: row.daily_allowance ?? fallback.dailyAllowance,
    logoUrl: row.logo_url ?? fallback.logoUrl,
    watermarkText: row.watermark_text ?? fallback.watermarkText,
    cityTariffs: row.city_tariffs ?? fallback.cityTariffs,
  };
}

export function customerToCloud(tenantId: string, customer: CustomerRecord) {
  const address = customer.address || customer.addresses?.[0] || "";
  return {
    tenant_id: tenantId,
    name: customer.name,
    phone: customer.phone || "",
    city: customer.city || "",
    district: customer.district || "",
    address,
    notes: customer.notes || "",
  };
}

export function customerFromCloud(row: any): CustomerRecord {
  return { id: row.id, name: row.name, phone: row.phone || "", address: row.address || "", addresses: row.address ? [row.address] : [], city: row.city || "", district: row.district || "", notes: row.notes || "" };
}

export function quoteToCloud(tenantId: string, quote: QuoteRecord, customerId: string | null, deleted = false) {
  return {
    tenant_id: tenantId,
    customer_id: customerId,
    order_code: quote.orderCode,
    project_title: quote.projectTitle || "",
    status: quote.status || "pending",
    stage: quote.productionStage || quote.stage || "",
    items: quote.items || [],
    discount_percent: Number(quote.discountPercent || 0),
    vat_included: Boolean(quote.vatIncluded),
    site_city: quote.siteCity || "",
    travel_cost: Number(quote.travelCost || 0),
    team_size: Number(quote.teamSize || 0),
    work_days: Number(quote.workDays || 0),
    terms: quote.terms || "",
    validity_days: Number(quote.validityDays || 0),
    is_deleted: deleted,
    deleted_at: deleted ? (quote.deletedAt || new Date().toISOString()) : null,
    updated_at: new Date().toISOString(),
  };
}

export function quoteFromCloud(row: any) {
  return {
    id: row.id,
    orderCode: row.order_code,
    date: row.created_at ? new Date(row.created_at).toLocaleDateString("tr-TR") : "",
    projectTitle: row.project_title || "",
    customerName: row.customer?.name || row.customer_name || "Sayın Müşteri",
    customerPhone: row.customer?.phone || "",
    customerAddress: row.customer?.address || "",
    status: row.status || "pending",
    productionStage: row.stage || "Üretimde",
    vatIncluded: Boolean(row.vat_included),
    showValidity: Boolean(row.validity_days),
    validityDays: Number(row.validity_days || 7),
    discountPercent: Number(row.discount_percent || 0),
    terms: row.terms || "",
    items: Array.isArray(row.items) ? row.items : [],
    siteCity: row.site_city || "",
    travelCost: Number(row.travel_cost || 0),
    teamSize: Number(row.team_size || 0),
    workDays: Number(row.work_days || 0),
    deletedAt: row.deleted_at || null,
  };
}

export async function syncTenantSnapshot(tenantId: string, settings: any, customers: CustomerRecord[], quotes: QuoteRecord[], trash: any[]) {
  if (!supabase) { publishSyncStatus("local"); return; }
  await queueUpsert("tenant_settings", [settingsToCloud(tenantId, settings)], "tenant_id");
  const { data: existingCustomers } = await supabase.from("customers").select("id,name").eq("tenant_id", tenantId);
  const existingCustomerIds = new Map((existingCustomers || []).map((row: any) => [String(row.name).toLocaleLowerCase("tr"), row.id]));
  const cloudCustomers = customers.map((customer) => ({
    ...customerToCloud(tenantId, customer),
    ...(existingCustomerIds.has(String(customer.name).toLocaleLowerCase("tr"))
      ? { id: existingCustomerIds.get(String(customer.name).toLocaleLowerCase("tr")) }
      : {}),
  }));
  if (cloudCustomers.length) await queueUpsert("customers", cloudCustomers, "id");
  const byName = existingCustomerIds;
  const deletedCodes = new Set((trash || []).filter((entry: any) => entry.type === "quote").map((entry: any) => entry.data?.orderCode).filter(Boolean));
  for (const quote of quotes) {
    const customerId = byName.get(String(quote.customerName || "").toLocaleLowerCase("tr")) as string | undefined;
    const payload = quoteToCloud(tenantId, quote, customerId || null, deletedCodes.has(quote.orderCode));
    const { data: existing } = await supabase.from("quotes").select("id").eq("tenant_id", tenantId).eq("order_code", quote.orderCode).maybeSingle();
    if (existing?.id) {
      await queueUpsert("quotes", [{ ...payload, id: existing.id }], "id");
    } else {
      await queueUpsert("quotes", [payload], "id");
    }
  }
  // Eski/silinmiş cloud teklifleri dahil çöp kutusunu, cihazlar arası erişilebilir tut.
  for (const entry of (trash || []).filter((item: any) => item.type === "quote" && item.data)) {
    const quote = entry.data;
    if (quotes.some((item) => item.orderCode === quote.orderCode)) continue;
    const payload = quoteToCloud(tenantId, { ...quote, deletedAt: entry.deletedAt }, null, true);
    const { data: existing } = await supabase.from("quotes").select("id").eq("tenant_id", tenantId).eq("order_code", quote.orderCode).maybeSingle();
    if (existing?.id) await queueUpsert("quotes", [{ ...payload, id: existing.id }], "id");
    else await queueUpsert("quotes", [payload], "id");
  }
}

export async function uploadFirmLogo(tenantId: string, file: File) {
  if (!supabase) return null;
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${tenantId}/${Date.now()}-${safeName}`;
  const { error } = await supabase.storage.from("firm-logos").upload(path, file, { upsert: true, contentType: file.type || undefined });
  if (error) throw error;
  return supabase.storage.from("firm-logos").getPublicUrl(path).data.publicUrl;
}

export async function fetchTenantSnapshot(tenantId: string) {
  if (!supabase) return null;
  const [settingsResult, customersResult, quotesResult] = await Promise.all([
    supabase.from("tenant_settings").select("*").eq("tenant_id", tenantId).maybeSingle(),
    supabase.from("customers").select("*").eq("tenant_id", tenantId).order("created_at", { ascending: true }),
    supabase.from("quotes").select("*,customer:customers(name,phone,address)").eq("tenant_id", tenantId).order("created_at", { ascending: false }),
  ]);
  const error = settingsResult.error || customersResult.error || quotesResult.error;
  if (error) throw error;
  return { settings: settingsResult.data, customers: customersResult.data || [], quotes: quotesResult.data || [] };
}
