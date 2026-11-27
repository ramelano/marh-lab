import { supabase } from "./supabase";

const QUEUE_KEY = "marhlab.supabase.pending.v1";
const STATUS_EVENT = "marhlab:supabase-status";

type QueueJob = { id: string; table: string; rows: Record<string, unknown>[]; conflict: string; operation?: "upsert" | "delete"; filterId?: string; updatedAt?: string };
export type CustomerRecord = { id: string; name: string; phone?: string; addresses?: string[]; address?: string; city?: string; district?: string; notes?: string };
export type QuoteRecord = Record<string, any>;

export function publishSyncStatus(status: "local" | "syncing" | "synced" | "queued" | "error", message?: string) {
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent(STATUS_EVENT, { detail: { status, message } }));
}

function stableUuid(value: string) {
  let a = 0x811c9dc5;
  let b = 0x9e3779b9;
  for (const char of value) {
    a = Math.imul(a ^ char.charCodeAt(0), 0x01000193);
    b = Math.imul(b ^ char.charCodeAt(0), 0x85ebca6b);
  }
  const hex = `${(a >>> 0).toString(16).padStart(8, "0")}${(b >>> 0).toString(16).padStart(8, "0")}${((a ^ (b >>> 1)) >>> 0).toString(16).padStart(8, "0")}${(Math.imul(a, b) >>> 0).toString(16).padStart(8, "0")}`.replace(/[^0-9a-f]/gi, "0").padStart(32, "0").slice(-32);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

function readQueue(): QueueJob[] {
  try { return JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]"); } catch { return []; }
}
function writeQueue(queue: QueueJob[]) {
  try { localStorage.setItem(QUEUE_KEY, JSON.stringify(queue)); } catch { /* kota doluysa uygulama yine yerel çalışır */ }
}
function readableCloudError(error: unknown, fallback: string) {
  const value = error as any;
  const code = String(value?.code || value?.status || "");
  const raw = error instanceof Error ? error.message : typeof error === "string" ? error : String(value?.message || "");
  const lower = raw.toLocaleLowerCase("tr");
  if (code === "42501" || lower.includes("42501") || lower.includes("permission denied") || lower.includes("row-level security")) return "Bulut erişim izni reddedildi (42501). Yerel modda devam ediliyor; Supabase GRANT/RLS politikalarını kontrol edin.";
  if (code === "42P01" || code === "PGRST205" || lower.includes("does not exist") || lower.includes("table") && lower.includes("not found")) return "Supabase tablosu bulunamadı; yerel modda devam ediliyor. Gerekli migration ve tablo yetkilerini kontrol edin.";
  if (raw && raw !== "[object Object]") return raw;
  if (value && typeof value === "object") { try { const json = JSON.stringify(value); return json === "{}" ? fallback : json; } catch { return fallback; } }
  return fallback;
}
function enqueue(job: QueueJob) {
  const queue = readQueue();
  const key = job.operation === "delete" ? `${job.table}:delete:${job.filterId}` : `${job.table}:upsert:${job.conflict}:${job.rows.map((row) => String(row[job.conflict] || row.id || "")).join(",")}`;
  const index = queue.findIndex((item) => {
    const itemKey = item.operation === "delete" ? `${item.table}:delete:${item.filterId}` : `${item.table}:upsert:${item.conflict}:${item.rows.map((row) => String(row[item.conflict] || row.id || "")).join(",")}`;
    return itemKey === key;
  });
  if (index >= 0) queue[index] = job; else queue.push(job);
  writeQueue(queue);
}

async function perform(job: QueueJob) {
  if (!supabase) return;
  if (job.operation === "delete" && job.filterId) {
    const { error } = await supabase.from(job.table).delete().eq("id", job.filterId);
    if (error) throw error;
    return;
  }
  const { error } = await supabase.from(job.table).upsert(job.rows, { onConflict: job.conflict });
  if (error) throw error;
}

export async function queueUpsert(table: string, rows: Record<string, unknown>[], conflict: string) {
  if (!rows.length) return;
  if (!supabase || !navigator.onLine) {
    enqueue({ id: crypto.randomUUID(), table, rows, conflict, updatedAt: new Date().toISOString() });
    publishSyncStatus("queued", "Bağlantı yok; değişiklikler bu cihazda sıraya alındı.");
    return;
  }
  try {
    publishSyncStatus("syncing");
    await perform({ id: crypto.randomUUID(), table, rows, conflict });
    publishSyncStatus("synced");
  } catch (error) {
    enqueue({ id: crypto.randomUUID(), table, rows, conflict, updatedAt: new Date().toISOString() });
    publishSyncStatus("queued", readableCloudError(error, "Bulut bağlantısı geçici olarak kurulamadı."));
  }
}

export async function queueDelete(table: string, id: string) {
  const job: QueueJob = { id: crypto.randomUUID(), table, rows: [], conflict: "id", operation: "delete", filterId: id };
  if (!supabase || !navigator.onLine) {
    enqueue(job);
    publishSyncStatus("queued", "Silme işlemi bağlantı gelince buluta uygulanacak.");
    return;
  }
  try { await perform(job); publishSyncStatus("synced"); }
  catch (error) {
    enqueue(job);
    publishSyncStatus("queued", readableCloudError(error, "Silme işlemi kuyruğa alındı."));
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
    id: /^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(customer.id) ? customer.id : stableUuid(`${tenantId}:${customer.id}:${customer.name}`),
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

export async function syncTenantSnapshot(tenantId: string, settings: any, customers: CustomerRecord[], quotes: QuoteRecord[], trash: any[], financeEntries: any[] = [], financeCloudEnabled = false, deletedFinanceIds: string[] = []) {
  if (!supabase) { publishSyncStatus("local"); return; }
  await queueUpsert("tenant_settings", [settingsToCloud(tenantId, settings)], "tenant_id");
  const { data: existingCustomers } = await supabase.from("customers").select("id,name,is_deleted").eq("tenant_id", tenantId);
  const existingCustomerIds = new Map((existingCustomers || []).map((row: any) => [String(row.name).toLocaleLowerCase("tr"), row.id]));
  const cloudCustomers = customers.map((customer) => ({
    ...customerToCloud(tenantId, customer),
    ...(existingCustomerIds.has(String(customer.name).toLocaleLowerCase("tr"))
      ? { id: existingCustomerIds.get(String(customer.name).toLocaleLowerCase("tr")) }
      : {}),
  }));
  if (cloudCustomers.length) await queueUpsert("customers", cloudCustomers, "id");
  const byName = new Map(existingCustomerIds);
  cloudCustomers.forEach((row: any) => byName.set(String(row.name).toLocaleLowerCase("tr"), row.id));
  for (const entry of (trash || []).filter((item: any) => item.type === "customer" && item.data)) {
    const id = existingCustomerIds.get(String(entry.data.name || "").toLocaleLowerCase("tr")) || customerToCloud(tenantId, entry.data).id;
    await queueUpsert("customers", [{ ...customerToCloud(tenantId, entry.data), id, is_deleted: true, deleted_at: entry.deletedAt || new Date().toISOString() }], "id");
  }
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
  if (financeCloudEnabled) for (const id of deletedFinanceIds) await queueDelete("financial_transactions", id);
  if (financeCloudEnabled && financeEntries.length) {
    const { data: syncedCustomers } = await supabase.from("customers").select("id,name").eq("tenant_id", tenantId);
    const syncedCustomerIds = new Map((syncedCustomers || []).map((row: any) => [String(row.name).toLocaleLowerCase("tr"), row.id]));
    cloudCustomers.forEach((row: any) => { if (!syncedCustomerIds.has(String(row.name).toLocaleLowerCase("tr"))) syncedCustomerIds.set(String(row.name).toLocaleLowerCase("tr"), row.id); });
    await queueUpsert("financial_transactions", financeEntries.map((entry) => ({
      id: entry.id,
      tenant_id: tenantId,
      customer_id: syncedCustomerIds.get(String(entry.customerName || "").toLocaleLowerCase("tr")) || null,
      customer_name: entry.customerName || "",
      quote_code: entry.quoteCode || null,
      kind: entry.kind,
      amount: Number(entry.amount || 0),
      transaction_date: entry.date,
      due_date: entry.dueDate || null,
      is_closed: Boolean(entry.isClosed),
      description: entry.description || "",
      updated_at: new Date().toISOString(),
    })), "id");
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
  const financeResult = await supabase.from("financial_transactions").select("*").eq("tenant_id", tenantId).order("transaction_date", { ascending: false });
  const missingFinanceTable = financeResult.error && ["PGRST205", "42P01"].includes(financeResult.error.code || "");
  if (financeResult.error && !missingFinanceTable) throw financeResult.error;
  return {
    settings: settingsResult.data,
    customers: customersResult.data || [],
    quotes: quotesResult.data || [],
    financeEntries: financeResult.data || [],
    financeCloudEnabled: !missingFinanceTable,
  };
}
