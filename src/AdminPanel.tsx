import React, { useMemo, useState } from "react";
import { Activity, AlertTriangle, Building2, Check, ChevronDown, Edit3, Filter, LogOut, Menu, Plus, RefreshCw, Search, ShieldCheck, Trash2, UserPlus, X } from "lucide-react";

export type AdminFirm = { id: string; username: string; password?: string; companyName: string; ownerName?: string; phone?: string; city?: string; plan?: string; expiresAt?: string; isActive?: boolean; role?: string };
export type AdminAudit = { id?: string; created_at?: string; actor?: string; action: string; module?: string; record_id?: string; tenant_id?: string | null; ip_address?: string | null; user_agent?: string | null; device_type?: string | null; before_data?: any; after_data?: any; source?: string; details?: string };

type Props = {
  firms: AdminFirm[];
  setFirms: React.Dispatch<React.SetStateAction<AdminFirm[]>>;
  audits: AdminAudit[];
  auditConfigured: boolean;
  auditLoading: boolean;
  onRefreshAudits: () => void;
  onAudit: (entry: Omit<AdminAudit, "id" | "created_at">) => void;
  onTenantMutation: (username: string, action: string) => void;
  onOpenMember: (firm: AdminFirm) => void;
  onExit: () => void;
  showToast: (message: string) => void;
};

const blankFirm: Partial<AdminFirm> = { companyName: "", ownerName: "", username: "", password: "", phone: "", city: "", plan: "7 Günlük Demo", isActive: true, role: "Üye" };
const actionLabels: Record<string, string> = { create: "Oluşturma", update: "Güncelleme", delete: "Silme", remove: "Çıkarma", login: "Giriş", logout: "Çıkış", sync: "Senkronizasyon", export: "Dışa aktarma" };

function dateLabel(value?: string) { return value ? new Date(value).toLocaleString("tr-TR") : "Tarih alınamadı"; }
function deviceLabel(value?: string | null) { return value || "Belirlenemedi"; }

export default function AdminPanel({ firms, setFirms, audits, auditConfigured, auditLoading, onRefreshAudits, onAudit, onTenantMutation, onOpenMember, onExit, showToast }: Props) {
  const [section, setSection] = useState("overview");
  const [drawer, setDrawer] = useState(false);
  const [query, setQuery] = useState("");
  const [auditQuery, setAuditQuery] = useState("");
  const [auditAction, setAuditAction] = useState("all");
  const [auditStart, setAuditStart] = useState("");
  const [auditEnd, setAuditEnd] = useState("");
  const [form, setForm] = useState<Partial<AdminFirm>>(blankFirm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmRemove, setConfirmRemove] = useState<AdminFirm | null>(null);
  const [showForm, setShowForm] = useState(false);
  const activeCount = firms.filter((firm) => firm.isActive !== false).length;
  const filteredFirms = useMemo(() => firms.filter((firm) => `${firm.companyName} ${firm.username} ${firm.ownerName || ""} ${firm.city || ""}`.toLocaleLowerCase("tr").includes(query.toLocaleLowerCase("tr"))), [firms, query]);
  const filteredAudits = useMemo(() => audits.filter((item) => {
    const text = `${item.actor || ""} ${item.action} ${item.module || ""} ${item.record_id || ""} ${item.ip_address || ""} ${item.device_type || ""} ${item.details || ""}`.toLocaleLowerCase("tr");
    const date = item.created_at ? item.created_at.slice(0, 10) : "";
    return (!auditQuery || text.includes(auditQuery.toLocaleLowerCase("tr"))) && (auditAction === "all" || item.action === auditAction) && (!auditStart || date >= auditStart) && (!auditEnd || date <= auditEnd);
  }), [audits, auditQuery, auditAction, auditStart, auditEnd]);
  const criticalCount = audits.filter((item) => ["delete", "remove"].includes(item.action)).length;

  const openCreate = () => { setEditingId(null); setForm(blankFirm); setShowForm(true); setSection("members"); };
  const openEdit = (firm: AdminFirm) => { setEditingId(firm.id); setForm({ ...firm }); setShowForm(true); setSection("members"); };
  const saveFirm = () => {
    if (!form.companyName?.trim() || !form.username?.trim()) return showToast("Firma adı ve kullanıcı adı zorunludur.");
    if (!editingId && firms.some((firm) => firm.username.toLowerCase() === form.username!.trim().toLowerCase())) return showToast("Bu kullanıcı adı zaten kayıtlı.");
    const next = { ...form, id: editingId || `firm-${Date.now()}`, companyName: form.companyName.trim(), username: form.username.trim() } as AdminFirm;
    if (editingId) {
      const previous = firms.find((firm) => firm.id === editingId);
      setFirms((current) => current.map((firm) => firm.id === editingId ? next : firm));
      onTenantMutation(next.username, "update");
      onAudit({ actor: "marhlab-admin", action: "update", module: "tenants", record_id: next.id, before_data: previous, after_data: next, details: `${next.companyName} firma kaydı güncellendi.` });
      showToast("Firma kaydı güncellendi.");
    } else {
      setFirms((current) => [...current, next]);
      onTenantMutation(next.username, "create");
      onAudit({ actor: "marhlab-admin", action: "create", module: "tenants", record_id: next.id, after_data: next, details: `${next.companyName} firma kaydı oluşturuldu.` });
      showToast("Firma kaydı oluşturuldu.");
    }
    setShowForm(false); setForm(blankFirm);
  };
  const toggleFirm = (firm: AdminFirm) => {
    const next = { ...firm, isActive: firm.isActive === false };
    setFirms((current) => current.map((item) => item.id === firm.id ? next : item));
    onTenantMutation(firm.username, "status");
    onAudit({ actor: "marhlab-admin", action: "update", module: "tenants", record_id: firm.id, before_data: firm, after_data: next, details: `${firm.companyName} hesabı ${next.isActive ? "aktif" : "pasif"} yapıldı.` });
  };
  const removeFirm = () => {
    if (!confirmRemove) return;
    const firm = confirmRemove;
    setFirms((current) => current.filter((item) => item.id !== firm.id));
    onTenantMutation(firm.username, "remove");
    onAudit({ actor: "marhlab-admin", action: "remove", module: "tenants", record_id: firm.id, before_data: firm, details: `${firm.companyName} tenant listeden çıkarıldı. Bağlı müşteriler, teklifler ve mali kayıtlar Supabase CASCADE/RLS politikasına bağlıdır; bu panel fiziksel bağlı veri silinmesini varsaymaz.` });
    setConfirmRemove(null); showToast("Firma listeden çıkarıldı. Bağlı verilerin durumu log notunda açıkça belirtildi.");
  };

  const nav = [{ id: "overview", label: "Genel Bakış", icon: Activity }, { id: "members", label: "Üyeler / Firmalar", icon: Building2 }, { id: "audit", label: "Denetim Günlüğü", icon: ShieldCheck }];
  return <div className="admin-shell">
    <aside className={`admin-sidebar ${drawer ? "open" : ""}`}>
      <div className="admin-brand"><div className="admin-mark">ML</div><div><strong>MARH-LAB</strong><span>Yönetim merkezi</span></div><button className="admin-mobile-close" onClick={() => setDrawer(false)}><X size={18} /></button></div>
      <div className="admin-nav">{nav.map(({ id, label, icon: Icon }) => <button key={id} className={section === id ? "active" : ""} onClick={() => { setSection(id); setDrawer(false); }}><Icon size={17} />{label}</button>)}</div>
      <div className="admin-sidebar-foot"><div className="admin-security-note"><ShieldCheck size={15} /><span>Yetki kapsamı ve audit durumu görünürdür.</span></div><button className="admin-exit" onClick={onExit}><LogOut size={16} /> Çıkış</button></div>
    </aside>
    {drawer && <button className="admin-drawer-backdrop" onClick={() => setDrawer(false)} aria-label="Menüyü kapat" />}
    <main className="admin-main">
      <header className="admin-topbar"><button className="admin-menu-button" onClick={() => setDrawer(true)}><Menu size={19} /></button><div><div className="admin-eyebrow">KONTROL KULESİ</div><h1>{section === "overview" ? "Sistem özeti" : section === "members" ? "Üye ve firma yönetimi" : "Denetim günlüğü"}</h1></div><div className="admin-top-actions"><span className={`admin-status ${auditConfigured ? "ok" : "warn"}`}><span />{auditConfigured ? "Audit tablosu bağlı" : "Audit tablosu yapılandırılmadı"}</span><button className="admin-ghost" onClick={onRefreshAudits}><RefreshCw size={15} /> Yenile</button></div></header>
      {section === "overview" && <>
        <section className="admin-kpis"><div><span>Toplam firma</span><strong>{firms.length}</strong><small>Tenant kayıtları</small></div><div><span>Aktif firma</span><strong className="green">{activeCount}</strong><small>{firms.length - activeCount} pasif / beklemede</small></div><div><span>Son aktivite</span><strong className="blue">{audits.length ? dateLabel(audits[0].created_at).split(" ").slice(-2).join(" ") : "—"}</strong><small>{audits.length ? "Audit günlüğünden" : "Kayıt alınamadı"}</small></div><div><span>Kritik hareket</span><strong className="red">{criticalCount}</strong><small>Silme / çıkarma</small></div></section>
        <section className="admin-grid-2"><div className="admin-card"><div className="admin-card-head"><div><div className="admin-eyebrow">OPERASYON</div><h2>Hızlı işlemler</h2></div></div><div className="admin-quick-actions"><button onClick={openCreate}><UserPlus size={18} /><b>Yeni firma ekle</b><span>Tenant ve kullanıcı bilgisi oluştur</span></button><button onClick={() => setSection("audit")}><ShieldCheck size={18} /><b>Denetim kayıtlarını incele</b><span>{audits.length ? `${audits.length} kayıt yüklendi` : "Kayıt bulunamadı"}</span></button><button onClick={() => setSection("members")}><Building2 size={18} /><b>Firma listesini yönet</b><span>Aktiflik, yetki ve profil bilgileri</span></button></div></div><div className="admin-card"><div className="admin-card-head"><div><div className="admin-eyebrow">DURUM</div><h2>Senkronizasyon ve güvenlik</h2></div></div><div className="admin-health-list"><div><span className="health-dot green-dot" />Tenant senkronizasyonu</div><div><span className={`health-dot ${auditConfigured ? "green-dot" : "amber-dot"}`} />Audit altyapısı {auditConfigured ? "hazır" : "eksik migration / yetki"}</div><div><span className="health-dot blue-dot" />IP alanı <b>Sunucu/edge kaynağı yoksa boş</b></div><p>Eksik alanlar sahte veriyle doldurulmaz. Tarayıcı üzerinden güvenilir public IP alınamadığı için IP değeri yalnızca backend/edge logu varsa görünür.</p></div></div></section>
        <section className="admin-card"><div className="admin-card-head"><div><div className="admin-eyebrow">SON HAREKETLER</div><h2>Aktivite akışı</h2></div><button className="admin-text-button" onClick={() => setSection("audit")}>Tümünü gör <ChevronDown size={14} /></button></div><AuditRows items={audits.slice(0, 6)} /></section>
      </>}
      {section === "members" && <section className="admin-card"><div className="admin-card-head"><div><div className="admin-eyebrow">TENANTS</div><h2>Üye / firma kayıtları</h2><p>Firma çıkarma işlemi bağlı kayıtları otomatik sildiğini varsaymaz; Supabase CASCADE/RLS davranışı migration ve politika yapılandırmasına bağlıdır.</p></div><button className="admin-primary" onClick={openCreate}><Plus size={16} /> Yeni firma</button></div><div className="admin-toolbar"><label className="admin-search"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Firma, kullanıcı, yetkili veya şehir ara" /></label><span>{filteredFirms.length} / {firms.length} kayıt</span></div>{showForm && <div className="admin-form"><h3>{editingId ? "Firma kaydını düzenle" : "Yeni firma / kullanıcı"}</h3><div className="admin-form-grid">{[["companyName","Firma adı"],["ownerName","Yetkili / kullanıcı"],["username","Kullanıcı adı"],["password","Şifre"],["phone","Telefon"],["city","Şehir"]].map(([key, label]) => <label key={key}>{label}<input value={(form as any)[key] || ""} onChange={(event) => setForm({ ...form, [key]: event.target.value })} /></label>)}<label>Plan<select value={form.plan || "7 Günlük Demo"} onChange={(event) => setForm({ ...form, plan: event.target.value })}><option>7 Günlük Demo</option><option>1 Ay</option><option>12 Ay</option><option>Enterprise (12 Ay)</option></select></label><label>Rol<select value={form.role || "Üye"} onChange={(event) => setForm({ ...form, role: event.target.value })}><option>Üye</option><option>Firma yöneticisi</option><option>Operatör</option></select></label></div><div className="admin-form-actions"><button className="admin-ghost" onClick={() => setShowForm(false)}>Vazgeç</button><button className="admin-primary" onClick={saveFirm}><Check size={16} /> Kaydet</button></div></div>}<div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Firma / kullanıcı</th><th>Yetkili</th><th>Plan / durum</th><th>İletişim</th><th>İşlemler</th></tr></thead><tbody>{filteredFirms.map((firm) => <tr key={firm.id}><td><b>{firm.companyName}</b><small>{firm.username} · {firm.role || "Üye"}</small></td><td>{firm.ownerName || "—"}</td><td><span className={`admin-badge ${firm.isActive === false ? "danger" : "success"}`}>{firm.isActive === false ? "Pasif" : "Aktif"}</span><small>{firm.plan || "Plan belirtilmedi"} · {firm.expiresAt || "Süre belirtilmedi"}</small></td><td>{firm.phone || "—"}<small>{firm.city || "Şehir belirtilmedi"}</small></td><td><div className="admin-row-actions"><button title="Düzenle" onClick={() => openEdit(firm)}><Edit3 size={15} /></button><button title="Aktif/pasif" onClick={() => toggleFirm(firm)}><ShieldCheck size={15} /></button><button title="Firma panelini aç" onClick={() => onOpenMember(firm)}><ChevronDown size={15} /></button><button title="Listeden çıkar" className="danger-action" onClick={() => setConfirmRemove(firm)}><Trash2 size={15} /></button></div></td></tr>)}</tbody></table></div></section>}
      {section === "audit" && <section className="admin-card"><div className="admin-card-head"><div><div className="admin-eyebrow">KİM · NE ZAMAN · NEREDEN · NE YAPTI?</div><h2>Denetim günlüğü</h2><p>IP, cihaz veya değişiklik özeti kaydedilemediyse alan boş/“Belirlenemedi” gösterilir; sentetik veri üretilmez.</p></div><span className="admin-badge neutral"><Filter size={13} /> {filteredAudits.length} kayıt</span></div><div className="audit-filters"><label className="admin-search"><Search size={15} /><input value={auditQuery} onChange={(event) => setAuditQuery(event.target.value)} placeholder="Kullanıcı, IP, cihaz, modül, kayıt ara" /></label><select value={auditAction} onChange={(event) => setAuditAction(event.target.value)}><option value="all">Tüm işlemler</option>{Object.entries(actionLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select><input type="date" value={auditStart} onChange={(event) => setAuditStart(event.target.value)} /><input type="date" value={auditEnd} onChange={(event) => setAuditEnd(event.target.value)} /></div>{!auditConfigured && <div className="admin-warning"><AlertTriangle size={17} /><span>Supabase audit_logs tablosu veya erişim politikası hazır değil. Aşağıdaki kayıtlar yalnızca bu tarayıcıdaki yerel olayları temsil edebilir.</span></div>}{auditLoading ? <div className="admin-empty">Audit kayıtları yükleniyor…</div> : <AuditRows items={filteredAudits} detailed />}</section>}
    </main>
    {confirmRemove && <div className="admin-modal-backdrop"><div className="admin-confirm"><div className="admin-danger-icon"><Trash2 size={19} /></div><h3>Firmayı listeden çıkar?</h3><p><b>{confirmRemove.companyName}</b> ({confirmRemove.username}) pasif yapmak yerine tenant listesinden çıkarılacak. Müşteri, teklif ve mali kayıtların fiziksel silinmesi bu işlem tarafından garanti edilmez; Supabase foreign key/RLS politikalarını kontrol edin.</p><div className="admin-form-actions"><button className="admin-ghost" onClick={() => setConfirmRemove(null)}>Vazgeç</button><button className="admin-danger" onClick={removeFirm}>Çıkar ve logla</button></div></div></div>}
  </div>;
}

function AuditRows({ items, detailed = false }: { items: AdminAudit[]; detailed?: boolean }) { return items.length ? <div className={`audit-list ${detailed ? "detailed" : ""}`}>{items.map((item, index) => <div className="audit-row" key={item.id || `${item.created_at}-${index}`}><span className={`audit-icon ${["delete", "remove"].includes(item.action) ? "danger" : item.action === "update" ? "warn" : "ok"}`}><Activity size={15} /></span><div className="audit-main"><div><b>{actionLabels[item.action] || item.action}</b><span>{item.module || "Modül belirtilmedi"}</span><small>{dateLabel(item.created_at)}</small></div><p>{item.details || `${item.record_id || "Kayıt belirtilmedi"} üzerinde işlem yapıldı.`}</p>{detailed && <div className="audit-meta"><span>Kullanıcı: {item.actor || "Belirlenemedi"}</span><span>IP: {item.ip_address || "Belirlenemedi"}</span><span>Cihaz: {deviceLabel(item.device_type)}</span><span>Kaynak: {item.source || "Belirtilmedi"}</span></div>}</div></div>)}</div> : <div className="admin-empty">Gösterilecek denetim kaydı bulunmuyor.</div>; }
