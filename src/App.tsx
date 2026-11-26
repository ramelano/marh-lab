import React, { useState, useEffect, useMemo } from "react";
import { supabase, isSupabaseConfigured } from "./lib/supabase";
import {
  customerFromCloud,
  fetchAdminTenants,
  fetchTenant,
  fetchTenantSnapshot,
  flushCloudQueue,
  persistTenants,
  publishSyncStatus,
  quoteFromCloud,
  settingsFromCloud,
  subscribeToCloudQueue,
  syncTenantSnapshot,
  tenantFromCloud,
  uploadFirmLogo,
} from "./lib/cloud-sync";
import {
  Plus,
  Clock,
  CheckCircle2,
  Users,
  Settings,
  Printer,
  FileText,
  Trash2,
  Copy,
  Send,
  Search,
  X,
  Check,
  Phone,
  MapPin,
  Eye,
  EyeOff,
  Compass,
  Play,
  Pause,
  Edit3,
  Sparkles,
  LogOut,
  Upload,
  MessageCircle,
  Lock,
  AlertTriangle,
  ArrowRight,
  Layers,
  ShieldCheck,
  Zap,
  Smartphone,
  Calculator,
  Download,
  DatabaseBackup,
  WalletCards,
} from "lucide-react";

// ============================================================================
// 1. KURUMSAL SABİTLER, CAM BALKON SİSTEM VİTRİNİ & MÜHENDİSLİK KATALOĞU
// ============================================================================

const DEFAULT_FIRM_SETTINGS = {
  username: "kondes_metal",
  companyName: "KON-DES METAL",
  tagline: "Profesyonel Katlanır, Giyotin, Sürme ve Isıcamlı Cam Balkon Sistemleri",
  ownerName: "Mustafa Duysak",
  phone: "0530 695 92 68",
  email: "info@kondesmetal.com",
  address: "Fevziçakmak Mah. 10443. Sk. No:18 Karatay / Konya",
  orderPrefix: "PRJ",
  nextOrderNumber: 797,
  aluminumKgPrice: 450,
  defaultProfitMargin: 84.24,
  vatRate: 20,
  logoUrl: "",
  watermarkText: "KON-DES METAL",
  watermarkOpacity: 0.07,
  cityTariffs: [{ city: "Konya Merkez", unitPrice: 13300, travel: 0 }, { city: "Antalya", unitPrice: 14000, travel: 14000 }, { city: "Muğla", unitPrice: 16800, travel: 16800 }],
  dailyAllowance: 1500,
  password: "Kd!2026#92",
  showClassicSignatures: false,
  termsTemplate: `krom kaplama çelik zincir tahrik sistemi
mosel marka tüp motor ve uzaktan kumanda
silinebilir özellikli hareketli kanatlar
iki yıl mekanik ve iki yıl motor garantisi
%100'e kadar su ve rüzgar sızdırmazlık garantisi`,
};

// Ana Ekran (MARH-LAB SaaS Pazarlama Vitrini) - Sadece Cam Balkon Odaklı 5 Sistem
const SHOWCASE_SYSTEMS = [
  {
    id: "katlanir",
    tabTitle: "Katlanır Cam",
    seriesName: "Alya™ Seri",
    mechanismLabel: "TS EN 12519 • KÖŞE PARK MEKANİZMASI",
    mechanismNote: "Kanatlar ray içinde sola kayar ve köşede 90° kitap yaprağı gibi katlanır",
    heroTitle: "Cam Balkon İşletmeniz İçin Akıllı Teklif ve 3D CAD Yazılımı",
    heroDescription:
      "Ölçüleri girin; Alya™ Katlanır, Giyotin, Sürme ve Xena™ Isıcamlı sistemler için saniyeler içinde ISO 128 teknik çizimli, maliyet hesaplı ve firmanıza özel antetli PDF teklifinizi hazırlayıp WhatsApp'tan gönderin.",
    badges: ["30 Saniyede PDF Teklif", "Otomatik CAD Kesit Çizimi", "WhatsApp Hızlı Paylaşım"],
  },
  {
    id: "giyotin",
    tabTitle: "Giyotin Motorlu",
    seriesName: "Giosafe™ Seri",
    mechanismLabel: "ZİNCİRLİ DİKEY MOTOR HAREKETİ",
    mechanismNote: "Alt cam sabit korkuluk kalır; üst hareketli camlar dikey aşağı toplanır",
    heroTitle: "Motorlu Giyotin Sistemlerde Sıfır Hata Metraj ve Teknik Çizim",
    heroDescription:
      "Cam adedine göre sabit korkuluk ve hareketli üst panelleri otomatik bölen, motor kutusu ve zincir detayını teklif formuna işleyen akıllı cam balkon mühendislik altyapısı.",
    badges: ["Otomatik Cam Bölme", "Motor & Zincir Detayı", "Anlık m² & Kâr Hesabı"],
  },
  {
    id: "surme",
    tabTitle: "Eşiksiz Sürme",
    seriesName: "Linea™ Seri",
    mechanismLabel: "ÇOK RAYLI TELESKOPİK SÜRGÜ",
    mechanismNote: "Kanatlar paralel ray kademelerinde yatay kayarak sabit kanat arkasında toplanır",
    heroTitle: "Sürme ve Eşiksiz Sistemlerde Çoklu Cephe & Şantiye Yönetimi",
    heroDescription:
      "Tek bir müşteri teklifine ister 2 balkon ister 30 dairelik müteahhit cephesi ekleyin; ray kademeleri ve yatay kayma yönleri teknik çizime otomatik yansısın.",
    badges: ["Çoklu Balkon Sepeti", "Ray Kademe Çizimi", "A-Z Müşteri & Şantiye Arşivi"],
  },
  {
    id: "isicamli",
    tabTitle: "Xena™ Isıcamlı",
    seriesName: "Xena™ Seri",
    mechanismLabel: "ISI BARİYERLİ ÇİFT CAM KESİT",
    mechanismNote: "4+16+4 ısıcam ve EPDM çift conta ile yalıtımlı köşe park mekaniği",
    heroTitle: "Xena™ Isıcamlı Sistemlerde Otomatik Cam & Profil Fark Hesabı",
    heroDescription:
      "8mm temperliden 4+16+4 konfor ısıcam seçeneklerine, antrasit griden ahşap desene kadar tüm profil ve cam farklarını tek tıkla hesaplayıp müşterinize sunun.",
    badges: ["4+16+4 Isıcam Hesabı", "Profil Renk Simülasyonu", "Provizyon & Onay Takibi"],
  },
  {
    id: "kose",
    tabTitle: "Köşe Dönüşlü",
    seriesName: "Gold™ Panorama",
    mechanismLabel: "90° / 135° AÇILI CEPHE BİRLEŞİMİ",
    mechanismNote: "L ve U tipi balkonlarda köşe dönüş profili ile kesintisiz panoramik açılım",
    heroTitle: "L ve U Tipi Açılı Balkonlarda Profesyonel Mühendislik Sunumu",
    heroDescription:
      "Köşe dönüş açılarını girin; MARH-LAB iki cepheyi yan yana köşe profiliyle çizsin, müşterinize güven veren kurumsal teklif formunu tek sayfada hazırlasın.",
    badges: ["L & U Balkon Desteği", "Tek Sayfa A4 PDF", "Firma Logo & Filigran"],
  },
];

// Teklif Stüdyosu Cam Balkon Kategorileri ve Serileri (Sadece Cam Balkon Odaklı)
const SYSTEM_CATEGORIES = ["Katlanır", "Giyotin", "Sürme", "Isıcamlı"];

const SYSTEM_SERIES = [
  {
    id: "alya-katlanir",
    category: "Katlanır",
    code: "AL-80",
    name: "Alya™ Katlanır Cam Balkon Serisi (3.4 kg/m²)",
    shortName: "Alya™ Katlanır Cam Balkon Serisi",
    weightPerM2: 3.4,
    baseCostPerM2: 2730,
    defaultUnitPrice: 5214,
    mechType: "katlanir",
  },
  {
    id: "gold-katlanir",
    category: "Katlanır",
    code: "GL-10",
    name: "Gold™ Eşiksiz Vitrin Katlanır Seri (3.8 kg/m²)",
    shortName: "Gold™ Eşiksiz Katlanır Seri",
    weightPerM2: 3.8,
    baseCostPerM2: 3050,
    defaultUnitPrice: 5690,
    mechType: "katlanir",
  },
  {
    id: "giosafe-giyotin",
    category: "Giyotin",
    code: "GS-110",
    name: "Giosafe™ Motorlu Giyotin Seri (5.6 kg/m²)",
    shortName: "Giosafe™ Motorlu Giyotin Seri",
    weightPerM2: 5.6,
    baseCostPerM2: 8400,
    defaultUnitPrice: 13300,
    mechType: "giyotin",
  },
  {
    id: "vela-giyotin",
    category: "Giyotin",
    code: "VL-130",
    name: "Vela™ Zincirli Ağır Hizmet Giyotin (6.1 kg/m²)",
    shortName: "Vela™ Ağır Hizmet Giyotin Seri",
    weightPerM2: 6.1,
    baseCostPerM2: 9100,
    defaultUnitPrice: 15800,
    mechType: "giyotin",
  },
  {
    id: "linea-surme",
    category: "Sürme",
    code: "LN-5R",
    name: "Linea™ 5 Raylı Eşiksiz Sürme Seri (3.9 kg/m²)",
    shortName: "Linea™ Eşiksiz Sürme Seri",
    weightPerM2: 3.9,
    baseCostPerM2: 3150,
    defaultUnitPrice: 5890,
    mechType: "surme",
  },
  {
    id: "panorama-surme",
    category: "Sürme",
    code: "PN-3R",
    name: "Panorama™ Kilitli Sürme Seri (3.6 kg/m²)",
    shortName: "Panorama™ Kilitli Sürme Seri",
    weightPerM2: 3.6,
    baseCostPerM2: 2950,
    defaultUnitPrice: 5490,
    mechType: "surme",
  },
  {
    id: "xena-isicam",
    category: "Isıcamlı",
    code: "XN-32",
    name: "Xena™ Isıcamlı Katlanır Seri (4.8 kg/m²)",
    shortName: "Xena™ Isıcamlı Katlanır Seri",
    weightPerM2: 4.8,
    baseCostPerM2: 4100,
    defaultUnitPrice: 7490,
    mechType: "isicamli",
  },
  {
    id: "thermo-surme",
    category: "Isıcamlı",
    code: "TH-28",
    name: "Thermo™ Isıcamlı Sürme Seri (5.1 kg/m²)",
    shortName: "Thermo™ Isıcamlı Sürme Seri",
    weightPerM2: 5.1,
    baseCostPerM2: 4450,
    defaultUnitPrice: 7990,
    mechType: "surme",
  },
];

const GLASS_OPTIONS = [
  { id: "8mm", label: "8mm Temperli + Rodaj", short: "8mm Cam Temper+Rodaj" },
  { id: "10mm", label: "10mm Temperli + Rodaj", short: "10mm Cam Temper+Rodaj" },
  { id: "4+12+4", label: "4+12+4 Isıcam Temper+Rodaj", short: "4+12+4 Cam Temper+Rodaj" },
  { id: "4+16+4", label: "4+16+4 Konfor Isıcam", short: "4+16+4 Konfor Isıcam" },
];

const GLASS_COLORS = [
  { id: "Şeffaf", label: "Şeffaf", fill: "#bae6fd", opacity: 0.32, stroke: "#0284c7" },
  { id: "Füme", label: "Füme", fill: "#475569", opacity: 0.44, stroke: "#1e293b" },
  { id: "Şeffaf+Füme", label: "Şeffaf+Füme", fill: "#64748b", opacity: 0.38, stroke: "#0f172a" },
  { id: "Bronz", label: "Bronz", fill: "#92400e", opacity: 0.36, stroke: "#78350f" },
  { id: "Mavi", label: "Reflekte Mavi", fill: "#0369a1", opacity: 0.38, stroke: "#075985" },
  { id: "Yeşil", label: "Reflekte Yeşil", fill: "#047857", opacity: 0.35, stroke: "#065f46" },
  { id: "Buzlu", label: "Buzlu / Kumlu", fill: "#cbd5e1", opacity: 0.72, stroke: "#64748b" },
];

const ALUMINUM_COLORS = [
  { id: "Antrasit Gri", fill: "#334155", stroke: "#0f172a", labelColor: "#ffffff" },
  { id: "Siyah", fill: "#0f172a", stroke: "#000000", labelColor: "#ffffff" },
  { id: "Bronz", fill: "#5c3a21", stroke: "#29180c", labelColor: "#ffffff" },
  { id: "Eloksal Gümüş", fill: "#94a3b8", stroke: "#475569", labelColor: "#0f172a" },
  { id: "RAL 9016 Beyaz", fill: "#f1f5f9", stroke: "#334155", labelColor: "#0f172a" },
  { id: "Ahşap Desen", fill: "#854d0e", stroke: "#422006", labelColor: "#ffffff" },
];

const ANGLE_OPTIONS = [
  { value: 0, label: "Düz Cephe (0°)" },
  { value: 90, label: "90° Köşe Dönüş" },
  { value: 135, label: "135° Açılı Dönüş" },
  { value: 45, label: "45° Açılı Dönüş" },
];

const VALIDITY_PILLS = [3, 5, 7, 10, 15, 30];

const INITIAL_CUSTOMERS = [
  {
    id: "c-1",
    name: "Fevzi Kasap",
    phone: "0530 527 35 80",
    addresses: ["Merkez / Burdur"],
  },
  {
    id: "c-2",
    name: "Ahmet Yılmaz",
    phone: "0532 418 72 10",
    addresses: ["Yazır Mah. Turgut Özal Cad. No:42 Selçuklu / Konya"],
  },
  {
    id: "c-3",
    name: "Selçuklu İnşaat & Mimarlık",
    phone: "0533 790 14 22",
    addresses: [
      "Sancak Mah. Veysel Karani Cad. Plaza No:19 / Konya",
      "Bosna Hersek Mah. Yeni İstanbul Cad. B Blok / Konya",
    ],
  },
];

const INITIAL_QUOTES = [
  {
    id: "q-796",
    orderCode: "PRJ-796",
    date: "23 Kas 2026",
    projectTitle: "Motorlu Giyotin",
    customerName: "Fevzi Kasap",
    customerPhone: "0530 527 35 80",
    customerAddress: "Merkez / Burdur",
    status: "pending",
    productionStage: "Üretimde",
    vatIncluded: false,
    showValidity: true,
    validityDays: 7,
    discountPercent: 0,
    terms: DEFAULT_FIRM_SETTINGS.termsTemplate,
    items: [
      {
        id: "item-1",
        facadeName: "1. Salon Teras Cephesi",
        seriesId: "giosafe-giyotin",
        seriesName: "Giosafe™ Motorlu Giyotin Seri",
        seriesCode: "GS-110",
        mechType: "giyotin",
        widthCm: 560,
        heightCm: 240,
        panels: 3,
        angleDeg: 0,
        quantity: 1,
        glassType: "4+12+4",
        glassColor: "Şeffaf+Füme",
        aluminumColor: "Antrasit Gri",
        motorized: true,
        unitPrice: 13300,
      },
    ],
  },
  {
    id: "q-795",
    orderCode: "PRJ-795",
    date: "20 Kas 2026",
    projectTitle: "Katlanır Cam Balkon",
    customerName: "Ahmet Yılmaz",
    customerPhone: "0532 418 72 10",
    customerAddress: "Yazır Mah. Turgut Özal Cad. No:42 Selçuklu / Konya",
    status: "approved",
    productionStage: "Montajda",
    vatIncluded: false,
    showValidity: true,
    validityDays: 7,
    discountPercent: 0,
    terms: DEFAULT_FIRM_SETTINGS.termsTemplate,
    items: [
      {
        id: "item-2",
        facadeName: "1. Ön Balkon",
        seriesId: "alya-katlanir",
        seriesName: "Alya™ Katlanır Cam Balkon Serisi",
        seriesCode: "AL-80",
        mechType: "katlanir",
        widthCm: 490,
        heightCm: 230,
        panels: 7,
        angleDeg: 0,
        quantity: 1,
        glassType: "8mm",
        glassColor: "Füme",
        aluminumColor: "Antrasit Gri",
        motorized: false,
        unitPrice: 5214,
      },
    ],
  },
];

// ============================================================================
// 2. YARDIMCI BİLEŞENLER: iOS SWITCH & ANA EKRAN CAM BALKON SİSTEM VİTRİNİ
// ============================================================================

function IOSSwitch({ checked, onChange, label, sublabel = "", compact = false }) {
  return (
    <label className="inline-flex items-center gap-2.5 cursor-pointer select-none group">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex ${
          compact ? "h-5 w-9" : "h-6 w-11"
        } shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
          checked ? "bg-emerald-500" : "bg-slate-700 group-hover:bg-slate-600"
        }`}
      >
        <span
          className={`pointer-events-none inline-block ${
            compact ? "h-4 w-4" : "h-5 w-5"
          } transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
            checked ? (compact ? "translate-x-4" : "translate-x-5") : "translate-x-0"
          }`}
        />
      </button>
      <div className="flex flex-col text-left">
        <span className="text-xs font-medium text-slate-200 leading-tight">{label}</span>
        {sublabel && <span className="text-[10px] text-slate-400 leading-tight">{sublabel}</span>}
      </div>
    </label>
  );
}

function ShowcaseSystemAnimation({ systemId, openness }) {
  const ratio = Math.max(0, Math.min(100, openness)) / 100;
  const frameLeft = 76;
  const frameTop = 46;
  const frameWidth = 448;
  const frameHeight = 188;

  return (
    <svg viewBox="0 0 600 280" className="w-full h-auto block select-none">
      <defs>
        <linearGradient id="glassGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7dd3fc" stopOpacity="0.34" />
          <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#0284c7" stopOpacity="0.32" />
        </linearGradient>
      </defs>

      <text
        x="300"
        y="24"
        textAnchor="middle"
        fontSize="10"
        fontWeight="700"
        letterSpacing="2.2"
        fill="#f59e0b"
      >
        MARH-LAB • GERÇEK ZAMANLI CAM BALKON SİMÜLASYONU
      </text>

      {/* Dış Alüminyum Ana Kasa Çerçevesi */}
      <rect
        x="68"
        y="38"
        width="464"
        height="204"
        rx="4"
        fill="#0b1220"
        stroke="#475569"
        strokeWidth="6"
      />
      <line x1="74" y1="44" x2="526" y2="44" stroke="#94a3b8" strokeWidth="1.5" />
      <line x1="74" y1="236" x2="526" y2="236" stroke="#94a3b8" strokeWidth="1.5" />
      <rect x="54" y="242" width="492" height="8" rx="3" fill="#64748b" />

      {/* 1. KATLANIR, ISICAMLI (XENA) & KÖŞE DÖNÜŞLÜ CAM BALKON */}
      {(systemId === "katlanir" || systemId === "isicamli" || systemId === "kose") &&
        (() => {
          const count = 7;
          const closedW = frameWidth / count;
          return (
            <g>
              {systemId === "kose" && (
                <>
                  <rect
                    x={frameLeft + frameWidth * 0.57 - 4}
                    y={frameTop}
                    width="8"
                    height={frameHeight}
                    fill="#334155"
                    stroke="#f59e0b"
                    strokeWidth="1"
                  />
                  <text
                    x={frameLeft + frameWidth * 0.57}
                    y={frameTop + 14}
                    textAnchor="middle"
                    fontSize="8.5"
                    fontWeight="800"
                    fill="#fbbf24"
                  >
                    90° KÖŞE
                  </text>
                </>
              )}
              {Array.from({ length: count }).map((_, i) => {
                const closedX = frameLeft + i * closedW;
                const parkX = frameLeft + 6 + i * 11;
                const panelProgress = Math.max(0, Math.min(1, ratio * 1.25 - i * 0.04));
                const currentX = closedX - (closedX - parkX) * panelProgress;
                const foldFactor = Math.max(0, (panelProgress - 0.55) / 0.45);
                const visualWidth = Math.max(11, closedW * (1 - foldFactor * 0.82));
                const skewY = foldFactor * -9;

                return (
                  <g
                    key={i}
                    transform={`translate(${currentX}, ${frameTop + 2}) skewY(${skewY})`}
                  >
                    <rect
                      x="0"
                      y="0"
                      width={visualWidth - 1.5}
                      height={frameHeight - 4}
                      fill="url(#glassGrad)"
                      stroke={systemId === "isicamli" ? "#38bdf8" : "#93c5fd"}
                      strokeWidth={systemId === "isicamli" ? "2" : "1.3"}
                    />
                    {systemId === "isicamli" && visualWidth > 18 && (
                      <rect
                        x="3"
                        y="3"
                        width={visualWidth - 7.5}
                        height={frameHeight - 10}
                        fill="none"
                        stroke="#f59e0b"
                        strokeOpacity="0.65"
                        strokeWidth="0.9"
                      />
                    )}
                    <circle cx="3" cy="6" r="2" fill="#f59e0b" />
                    <circle cx="3" cy={frameHeight - 10} r="2" fill="#f59e0b" />
                    {visualWidth > 22 && (
                      <line
                        x1="8"
                        y1="14"
                        x2={Math.min(visualWidth - 8, 26)}
                        y2="32"
                        stroke="#e0f2fe"
                        strokeOpacity="0.45"
                        strokeWidth="1.2"
                      />
                    )}
                  </g>
                );
              })}
            </g>
          );
        })()}

      {/* 2. MOTORLU GİYOTİN SİSTEM (Giosafe™) */}
      {systemId === "giyotin" &&
        (() => {
          const sashH = frameHeight / 3;
          const bottomY = frameTop + sashH * 2;
          const midY = frameTop + sashH + sashH * ratio;
          const topY = frameTop + sashH * 2 * ratio;

          return (
            <g>
              <rect x={frameLeft} y={frameTop} width="8" height={frameHeight} fill="#1e293b" />
              <rect
                x={frameLeft + frameWidth - 8}
                y={frameTop}
                width="8"
                height={frameHeight}
                fill="#1e293b"
              />
              <line
                x1={frameLeft + 4}
                y1={frameTop + 6}
                x2={frameLeft + 4}
                y2={frameTop + frameHeight - 6}
                stroke="#f59e0b"
                strokeWidth="1.5"
                strokeDasharray="4 3"
              />
              <line
                x1={frameLeft + frameWidth - 4}
                y1={frameTop + 6}
                x2={frameLeft + frameWidth - 4}
                y2={frameTop + frameHeight - 6}
                stroke="#f59e0b"
                strokeWidth="1.5"
                strokeDasharray="4 3"
              />

              <g transform={`translate(${frameLeft + 9}, ${topY + 1})`}>
                <rect
                  width={frameWidth - 18}
                  height={sashH - 2}
                  fill="url(#glassGrad)"
                  stroke="#7dd3fc"
                  strokeWidth="1.4"
                />
              </g>

              <g transform={`translate(${frameLeft + 9}, ${midY + 1})`}>
                <rect
                  width={frameWidth - 18}
                  height={sashH - 2}
                  fill="url(#glassGrad)"
                  stroke="#bae6fd"
                  strokeWidth="1.5"
                />
              </g>

              <g transform={`translate(${frameLeft + 9}, ${bottomY + 1})`}>
                <rect
                  width={frameWidth - 18}
                  height={sashH - 2}
                  fill="url(#glassGrad)"
                  stroke="#f59e0b"
                  strokeWidth="1.8"
                />
                <text
                  x={(frameWidth - 18) / 2}
                  y={sashH / 2 + 4}
                  textAnchor="middle"
                  fontSize="9.5"
                  fontWeight="700"
                  fill="#fde68a"
                >
                  SABİT CAM KORKULUK MODÜLÜ
                </text>
              </g>
            </g>
          );
        })()}

      {/* 3. EŞİKSİZ SÜRME SİSTEM (Linea™) */}
      {systemId === "surme" &&
        (() => {
          const count = 4;
          const panelW = frameWidth / count;
          return Array.from({ length: count }).map((_, i) => {
            const closedX = frameLeft + i * panelW;
            const targetX = frameLeft + i * 8;
            const currentX = closedX - (closedX - targetX) * ratio;
            const railInsetY = i * 2;

            return (
              <g key={i} transform={`translate(${currentX}, ${frameTop + 2 + railInsetY})`}>
                <rect
                  width={panelW}
                  height={frameHeight - 4 - railInsetY * 2}
                  fill="url(#glassGrad)"
                  stroke={i === 0 ? "#f59e0b" : "#93c5fd"}
                  strokeWidth="1.5"
                />
                <rect x="0" y="0" width="4" height={frameHeight - 4 - railInsetY * 2} fill="#64748b" />
                <rect
                  x={panelW - 4}
                  y="0"
                  width="4"
                  height={frameHeight - 4 - railInsetY * 2}
                  fill="#64748b"
                />
                <line
                  x1="16"
                  y1="16"
                  x2="40"
                  y2="42"
                  stroke="#e0f2fe"
                  strokeOpacity="0.4"
                  strokeWidth="1.2"
                />
              </g>
            );
          });
        })()}

      <text x="300" y="268" textAnchor="middle" fontSize="10" fontWeight="600" fill="#94a3b8">
        KASA İÇİ MEKANİK SİMÜLASYON • %{Math.round(openness)} AÇILIM
      </text>
    </svg>
  );
}

// ============================================================================
// 3. FİLİGRAN & ISO 128 / TS EN 12519 DİNAMİK VEKTÖREL (SVG) TEKNİK ÇİZİM
// ============================================================================

function DynamicFirmWatermark({ logoUrl, watermarkText }) {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-0 select-none overflow-hidden">
      <div className="flex flex-col items-center justify-center opacity-[0.07] text-center">
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={watermarkText}
            className="w-32 h-32 object-contain mb-1.5"
          />
        ) : (
          <svg
            width="84"
            height="84"
            viewBox="0 0 100 100"
            className="mb-1 text-amber-600"
            fill="none"
            stroke="currentColor"
            strokeWidth="5"
          >
            <polygon points="50,6 92,28 92,72 50,94 8,72 8,28" />
            <line x1="50" y1="6" x2="50" y2="94" />
            <line x1="8" y1="28" x2="92" y2="72" />
          </svg>
        )}
        <div className="text-[40px] font-black tracking-[0.14em] text-slate-900 uppercase leading-none">
          {watermarkText}
        </div>
        <div className="text-[10px] font-bold tracking-[0.3em] text-slate-600 uppercase mt-1">
          CAM BALKON SİSTEMLERİ
        </div>
      </div>
    </div>
  );
}

/**
 * ISO 128, TS EN 12519 ve ISO 129-1 Standartlarında Dinamik Vektörel (SVG) Teknik Çizim Bileşeni
 */
function ISOTechnicalCADDrawing({ items, largeMode = false }) {
  const safeItems = items && items.length > 0 ? items : [INITIAL_QUOTES[0].items[0]];
  const primaryItem = safeItems[0];

  const totalWidthMm = safeItems.reduce((acc, it) => acc + (Number(it.widthCm) || 0) * 10, 0);
  const maxHeightMm = Math.max(...safeItems.map((it) => (Number(it.heightCm) || 240) * 10));

  const alumSpec =
    ALUMINUM_COLORS.find((a) => a.id === primaryItem.aluminumColor) || ALUMINUM_COLORS[0];
  const glassSpec =
    GLASS_COLORS.find((g) => g.id === primaryItem.glassColor) || GLASS_COLORS[0];

  const hasKatlanir = safeItems.some(
    (it) => it.mechType === "katlanir" || it.mechType === "isicamli"
  );

  const vbWidth = 960;
  const vbHeight = largeMode ? (hasKatlanir ? 350 : 300) : hasKatlanir ? 256 : 212;
  const drawLeft = 96;
  const drawTop = 36;
  const drawTotalW = 790;
  const baseFrameH = largeMode ? 185 : 124;

  const cornerGap = 18;
  const numCorners = Math.max(0, safeItems.length - 1);
  const usableW = drawTotalW - numCorners * cornerGap;

  let cursorX = drawLeft;
  const moduleLayouts = safeItems.map((it, idx) => {
    const modWidthMm = (Number(it.widthCm) || 300) * 10;
    const modHeightMm = (Number(it.heightCm) || 240) * 10;
    const wPx =
      totalWidthMm > 0
        ? Math.max(90, (modWidthMm / totalWidthMm) * usableW)
        : usableW / safeItems.length;
    const hPx =
      maxHeightMm > 0 ? Math.max(70, (modHeightMm / maxHeightMm) * baseFrameH) : baseFrameH;
    const yPx = drawTop + (baseFrameH - hPx);
    const xPx = cursorX;
    cursorX += wPx + cornerGap;
    return {
      item: it,
      index: idx,
      x: xPx,
      y: yPx,
      w: wPx,
      h: hPx,
      modWidthMm,
      modHeightMm,
    };
  });

  const actualRightX =
    moduleLayouts.length > 0
      ? moduleLayouts[moduleLayouts.length - 1].x + moduleLayouts[moduleLayouts.length - 1].w
      : drawLeft + drawTotalW;

  return (
    <div className="border border-slate-300 rounded-md bg-white overflow-hidden">
      {/* Üst Teknik Başlık Bandı */}
      <div className="bg-slate-800 text-white px-3 py-1 flex flex-wrap justify-between items-center text-[9.5px]">
        <div className="flex items-center gap-2">
          <span className="px-1.5 py-0.2 rounded bg-amber-500 text-slate-950 font-black">
            1. ÇİZİM
          </span>
          <span className="font-bold tracking-wide uppercase">
            ISO 128 &amp; TS EN 12519 MİMARİ DOĞRAMA TEKNİK GÖRÜNÜŞÜ
          </span>
        </div>
        <span className="text-amber-300 font-semibold">
          Profil: {primaryItem.aluminumColor} • Cam: {primaryItem.glassType} ({primaryItem.glassColor})
        </span>
      </div>

      {/* Vektörel CAD Sahnesi */}
      <svg viewBox={`0 0 ${vbWidth} ${vbHeight}`} className="w-full h-auto block">
        <defs>
          <pattern id="isoCadGrid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f1f5f9" strokeWidth="0.8" />
          </pattern>
          <pattern id="frostedGlass" width="8" height="8" patternUnits="userSpaceOnUse">
            <path d="M 0 8 L 8 0 M -2 2 L 2 -2 M 6 10 L 10 6" stroke="#94a3b8" strokeWidth="0.7" />
          </pattern>
        </defs>

        <rect x="0" y="0" width={vbWidth} height={vbHeight} fill="url(#isoCadGrid)" />

        {/* 1. ISO 129-1 ÜST TOPLAM GENİŞLİK ÖLÇÜ ÇİZGİSİ (mm) */}
        <line x1={drawLeft} y1="10" x2={drawLeft} y2={drawTop - 3} stroke="#0f172a" strokeWidth="1" />
        <line
          x1={actualRightX}
          y1="10"
          x2={actualRightX}
          y2={drawTop - 3}
          stroke="#0f172a"
          strokeWidth="1"
        />
        <line
          x1={drawLeft}
          y1="17"
          x2={actualRightX}
          y2="17"
          stroke="#0f172a"
          strokeWidth="1.2"
        />
        <polygon points={`${drawLeft},17 ${drawLeft + 8},14 ${drawLeft + 8},20`} fill="#0f172a" />
        <polygon
          points={`${actualRightX},17 ${actualRightX - 8},14 ${actualRightX - 8},20`}
          fill="#0f172a"
        />
        <rect
          x={(drawLeft + actualRightX) / 2 - 74}
          y="9"
          width="148"
          height="15"
          fill="#ffffff"
        />
        <text
          x={(drawLeft + actualRightX) / 2}
          y="20.5"
          textAnchor="middle"
          fontSize="10.5"
          fontWeight="800"
          fill="#0f172a"
        >
          L = {totalWidthMm} mm ({safeItems.length} Cephe)
        </text>

        {/* 2. ISO 129-1 SOL YÜKSEKLİK ÖLÇÜ ÇİZGİSİ (mm) */}
        <line x1="40" y1={drawTop} x2={drawLeft - 5} y2={drawTop} stroke="#0f172a" strokeWidth="1" />
        <line
          x1="40"
          y1={drawTop + baseFrameH}
          x2={drawLeft - 5}
          y2={drawTop + baseFrameH}
          stroke="#0f172a"
          strokeWidth="1"
        />
        <line
          x1="50"
          y1={drawTop}
          x2="50"
          y2={drawTop + baseFrameH}
          stroke="#0f172a"
          strokeWidth="1.2"
        />
        <polygon points={`50,${drawTop} 47,${drawTop + 8} 53,${drawTop + 8}`} fill="#0f172a" />
        <polygon
          points={`50,${drawTop + baseFrameH} 47,${drawTop + baseFrameH - 8} 53,${
            drawTop + baseFrameH - 8
          }`}
          fill="#0f172a"
        />
        <text
          x="36"
          y={drawTop + baseFrameH / 2}
          textAnchor="middle"
          fontSize="10.5"
          fontWeight="800"
          fill="#0f172a"
          transform={`rotate(-90 36 ${drawTop + baseFrameH / 2})`}
        >
          H = {maxHeightMm} mm
        </text>

        {/* 3. CEPHE MODÜLLERİ */}
        {moduleLayouts.map((mod) => {
          const { item, index, x, y, w, h, modWidthMm } = mod;
          const mAlum =
            ALUMINUM_COLORS.find((a) => a.id === item.aluminumColor) || alumSpec;
          const mGlass = GLASS_COLORS.find((g) => g.id === item.glassColor) || glassSpec;
          const mMotorized = Boolean(item.motorized);
          const mType = item.mechType || "katlanir";
          const panelCount = Math.max(1, Math.min(14, Number(item.panels) || 3));

          const topBoxH = mMotorized ? 14 : 6;
          const bottomSillH = 6;
          const sideJambW = 6;
          const innerX = x + sideJambW;
          const innerY = y + topBoxH;
          const innerW = Math.max(20, w - sideJambW * 2);
          const innerH = Math.max(20, h - topBoxH - bottomSillH);

          return (
            <g key={item.id || index}>
              {safeItems.length > 1 && (
                <text
                  x={x + w / 2}
                  y={y - 4}
                  textAnchor="middle"
                  fontSize="9"
                  fontWeight="700"
                  fill="#334155"
                >
                  {item.facadeName}: {modWidthMm} mm
                </text>
              )}

              {/* Dış Alüminyum Kasa */}
              <rect
                x={x}
                y={y}
                width={w}
                height={h}
                fill={mAlum.fill}
                stroke={mAlum.stroke}
                strokeWidth="1.6"
              />

              {/* Motorlu Sistem Motor Kutusu & Zincir Sembolü */}
              {mMotorized && (
                <g>
                  <line
                    x1={x}
                    y1={y + topBoxH}
                    x2={x + w}
                    y2={y + topBoxH}
                    stroke="#f59e0b"
                    strokeWidth="1.2"
                  />
                  <circle
                    cx={x + 14}
                    cy={y + topBoxH / 2}
                    r="5"
                    fill="#f59e0b"
                    stroke="#0f172a"
                    strokeWidth="1"
                  />
                  <text
                    x={x + 14}
                    y={y + topBoxH / 2 + 2.8}
                    textAnchor="middle"
                    fontSize="7"
                    fontWeight="900"
                    fill="#0f172a"
                  >
                    M
                  </text>
                  <line
                    x1={x + 3}
                    y1={y + topBoxH}
                    x2={x + 3}
                    y2={y + h - bottomSillH}
                    stroke="#f59e0b"
                    strokeWidth="1.3"
                    strokeDasharray="3 2"
                  />
                  <line
                    x1={x + w - 3}
                    y1={y + topBoxH}
                    x2={x + w - 3}
                    y2={y + h - bottomSillH}
                    stroke="#f59e0b"
                    strokeWidth="1.3"
                    strokeDasharray="3 2"
                  />
                  <text
                    x={x + 25}
                    y={y + topBoxH / 2 + 3}
                    fontSize="7.5"
                    fontWeight="700"
                    fill={mAlum.labelColor}
                  >
                    MOTOR KUTUSU &amp; ZİNCİR TAHRİK
                  </text>
                </g>
              )}

              {/* A) GİYOTİN SİSTEM: Yatay Üst Üste Cam Bölme (Alt Sabit + Üst Hareketli) */}
              {mType === "giyotin" &&
                (() => {
                  const rowCount = Math.max(2, Math.min(5, panelCount));
                  const rowH = innerH / rowCount;
                  return Array.from({ length: rowCount }).map((_, rIdx) => {
                    const py = innerY + rIdx * rowH;
                    const isBottomFixed = rIdx === rowCount - 1;
                    const midX = innerX + innerW / 2;
                    const midY = py + rowH / 2;

                    return (
                      <g key={rIdx}>
                        <rect
                          x={innerX}
                          y={py}
                          width={innerW}
                          height={rowH}
                          fill={mGlass.fill}
                          fillOpacity={mGlass.opacity}
                          stroke={mAlum.stroke}
                          strokeWidth="1.4"
                        />
                        {item.glassColor === "Buzlu" && (
                          <rect
                            x={innerX}
                            y={py}
                            width={innerW}
                            height={rowH}
                            fill="url(#frostedGlass)"
                          />
                        )}
                        <rect x={innerX} y={py} width={innerW} height="3" fill={mAlum.fill} />
                        <line
                          x1={innerX + 12}
                          y1={py + 7}
                          x2={innerX + 24}
                          y2={py + Math.min(rowH - 5, 19)}
                          stroke="#ffffff"
                          strokeOpacity="0.65"
                          strokeWidth="1.1"
                        />
                        <line
                          x1={innerX + 17}
                          y1={py + 7}
                          x2={innerX + 29}
                          y2={py + Math.min(rowH - 5, 19)}
                          stroke="#ffffff"
                          strokeOpacity="0.65"
                          strokeWidth="1.1"
                        />

                        {isBottomFixed ? (
                          <g>
                            <polygon
                              points={`${midX},${midY - 7} ${midX - 7},${midY + 6} ${
                                midX + 7
                              },${midY + 6}`}
                              fill="none"
                              stroke="#0f172a"
                              strokeWidth="1.2"
                            />
                            <line
                              x1={midX - 4}
                              y1={midY + 1}
                              x2={midX + 4}
                              y2={midY + 1}
                              stroke="#0f172a"
                              strokeWidth="1.2"
                            />
                            <line
                              x1={midX}
                              y1={midY - 3}
                              x2={midX}
                              y2={midY + 5}
                              stroke="#0f172a"
                              strokeWidth="1.2"
                            />
                            <text
                              x={midX + 14}
                              y={midY + 3}
                              fontSize="7.5"
                              fontWeight="800"
                              fill="#0f172a"
                            >
                              SABİT
                            </text>
                          </g>
                        ) : (
                          <g>
                            <line
                              x1={midX}
                              y1={py + 6}
                              x2={midX}
                              y2={py + rowH - 5}
                              stroke="#0f172a"
                              strokeWidth="1.2"
                            />
                            <polyline
                              points={`${midX - 4},${py + 10} ${midX},${py + 6} ${
                                midX + 4
                              },${py + 10}`}
                              fill="none"
                              stroke="#0f172a"
                              strokeWidth="1.2"
                            />
                            <polyline
                              points={`${midX - 4},${py + rowH - 9} ${midX},${
                                py + rowH - 5
                              } ${midX + 4},${py + rowH - 9}`}
                              fill="none"
                              stroke="#0f172a"
                              strokeWidth="1.2"
                            />
                          </g>
                        )}
                      </g>
                    );
                  });
                })()}

              {/* B) KATLANIR & ISICAMLI KATLANIR SİSTEM */}
              {(mType === "katlanir" || mType === "isicamli") &&
                (() => {
                  const colW = innerW / panelCount;
                  return Array.from({ length: panelCount }).map((_, cIdx) => {
                    const px = innerX + cIdx * colW;
                    const cx = px + colW / 2;
                    const cy = innerY + innerH / 2;

                    return (
                      <g key={cIdx}>
                        <rect
                          x={px}
                          y={innerY}
                          width={colW}
                          height={innerH}
                          fill={mGlass.fill}
                          fillOpacity={mGlass.opacity}
                          stroke={mAlum.stroke}
                          strokeWidth="1.2"
                        />
                        {item.glassColor === "Buzlu" && (
                          <rect
                            x={px}
                            y={innerY}
                            width={colW}
                            height={innerH}
                            fill="url(#frostedGlass)"
                          />
                        )}
                        {mType === "isicamli" && (
                          <rect
                            x={px + 2.5}
                            y={innerY + 2.5}
                            width={Math.max(2, colW - 5)}
                            height={Math.max(2, innerH - 5)}
                            fill="none"
                            stroke="#f59e0b"
                            strokeWidth="0.9"
                          />
                        )}
                        <polyline
                          points={`${px + colW - 2},${innerY + 3} ${px + 3},${cy} ${
                            px + colW - 2
                          },${innerY + innerH - 3}`}
                          fill="none"
                          stroke="#0f172a"
                          strokeWidth="1"
                          strokeDasharray="3.5 2.5"
                        />
                        <line
                          x1={px + colW - 8}
                          y1={cy}
                          x2={px + 8}
                          y2={cy}
                          stroke="#0f172a"
                          strokeWidth="1.1"
                        />
                        <polyline
                          points={`${px + 12},${cy - 3.5} ${px + 8},${cy} ${
                            px + 12
                          },${cy + 3.5}`}
                          fill="none"
                          stroke="#0f172a"
                          strokeWidth="1.1"
                        />
                        <rect
                          x={cx - 10}
                          y={innerY + innerH - 16}
                          width="20"
                          height="12"
                          rx="2"
                          fill="#ffffff"
                          fillOpacity="0.9"
                          stroke="#0f172a"
                          strokeWidth="0.8"
                        />
                        <text
                          x={cx}
                          y={innerY + innerH - 7.5}
                          textAnchor="middle"
                          fontSize="8"
                          fontWeight="800"
                          fill="#0f172a"
                        >
                          K{cIdx + 1}
                        </text>
                      </g>
                    );
                  });
                })()}

              {/* C) SÜRME SİSTEM */}
              {mType === "surme" &&
                (() => {
                  const colW = innerW / panelCount;
                  return Array.from({ length: panelCount }).map((_, cIdx) => {
                    const px = innerX + cIdx * colW;
                    const cx = px + colW / 2;
                    const cy = innerY + innerH / 2;
                    const stepOffset = (cIdx % 3) * 2;
                    const isFirstFixed = cIdx === 0;

                    return (
                      <g key={cIdx}>
                        <rect
                          x={px}
                          y={innerY + stepOffset}
                          width={colW}
                          height={innerH - stepOffset * 2}
                          fill={mGlass.fill}
                          fillOpacity={mGlass.opacity}
                          stroke={mAlum.stroke}
                          strokeWidth="1.3"
                        />
                        <rect x={px} y={innerY} width="3" height={innerH} fill={mAlum.fill} />
                        {isFirstFixed ? (
                          <text
                            x={cx}
                            y={cy + 3}
                            textAnchor="middle"
                            fontSize="8"
                            fontWeight="800"
                            fill="#0f172a"
                          >
                            SABİT
                          </text>
                        ) : (
                          <g>
                            <line
                              x1={px + 9}
                              y1={cy}
                              x2={px + colW - 9}
                              y2={cy}
                              stroke="#0f172a"
                              strokeWidth="1.2"
                            />
                            <polyline
                              points={`${px + 13},${cy - 3.5} ${px + 9},${cy} ${
                                px + 13
                              },${cy + 3.5}`}
                              fill="none"
                              stroke="#0f172a"
                              strokeWidth="1.2"
                            />
                            <polyline
                              points={`${px + colW - 13},${cy - 3.5} ${
                                px + colW - 9
                              },${cy} ${px + colW - 13},${cy + 3.5}`}
                              fill="none"
                              stroke="#0f172a"
                              strokeWidth="1.2"
                            />
                          </g>
                        )}
                      </g>
                    );
                  });
                })()}

              {/* Köşe Dönüş Profili */}
              {index < moduleLayouts.length - 1 && (
                <g>
                  <rect
                    x={x + w + 2}
                    y={y}
                    width={cornerGap - 4}
                    height={h}
                    fill="#f59e0b"
                    fillOpacity="0.22"
                    stroke="#d97706"
                    strokeWidth="1"
                    strokeDasharray="3 2"
                  />
                  <text
                    x={x + w + cornerGap / 2}
                    y={y + h / 2}
                    textAnchor="middle"
                    fontSize="7.5"
                    fontWeight="800"
                    fill="#b45309"
                    transform={`rotate(-90 ${x + w + cornerGap / 2} ${y + h / 2})`}
                  >
                    {safeItems[index + 1]?.angleDeg || 90}° KÖŞE
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* 4. KATLANIR SİSTEM 1:20 ÜSTTEN RAY & PARK PLAN KESİTİ */}
        {hasKatlanir && (
          <g transform={`translate(${drawLeft}, ${drawTop + baseFrameH + 12})`}>
            <text x="0" y="9" fontSize="8.5" fontWeight="800" fill="#0f172a">
              1:20 ÖLÇEKLİ ÜSTTEN RAY &amp; KANAT TOPLANMA PLAN KESİTİ
            </text>
            <rect
              x="0"
              y="13"
              width={actualRightX - drawLeft}
              height="16"
              fill="#f8fafc"
              stroke="#334155"
              strokeWidth="1.2"
            />
            <line
              x1="0"
              y1="19"
              x2={actualRightX - drawLeft}
              y2="19"
              stroke="#94a3b8"
              strokeWidth="0.9"
            />
            <line
              x1="0"
              y1="24"
              x2={actualRightX - drawLeft}
              y2="24"
              stroke="#94a3b8"
              strokeWidth="0.9"
            />
            {Array.from({ length: Math.min(10, primaryItem.panels || 7) }).map((_, idx) => (
              <rect
                key={idx}
                x={8 + idx * 7}
                y="10"
                width="4.5"
                height="22"
                fill="#0284c7"
                stroke="#0f172a"
                strokeWidth="0.8"
              />
            ))}
            <text
              x={16 + Math.min(10, primaryItem.panels || 7) * 7}
              y="24"
              fontSize="8.5"
              fontWeight="700"
              fill="#0284c7"
            >
              ◀ PARK / TOPLANMA BÖLGESİ
            </text>
          </g>
        )}

        {/* 5. SAĞ ALT TEKNİK BİLGİ ETİKETİ */}
        <rect
          x={vbWidth - 332}
          y={vbHeight - 20}
          width="322"
          height="16"
          rx="3"
          fill="#f1f5f9"
          stroke="#cbd5e1"
          strokeWidth="0.8"
        />
        <text
          x={vbWidth - 171}
          y={vbHeight - 9}
          textAnchor="middle"
          fontSize="8.5"
          fontWeight="700"
          fill="#334155"
        >
          Bakış Yönü: İçten Bakış | Birim: mm | Ölçek: Orantılı
        </text>
      </svg>
    </div>
  );
}

function optimizeProfileCuts(lengths, stockLength = 6000, kerf = 3) {
  const pieces = lengths.filter(n => Number.isFinite(n) && n > 0).sort((a,b)=>b-a);
  const bars = [];
  pieces.forEach(length => {
    let bin = bars.find(b => b.remaining >= length + kerf);
    if (!bin) { bin = { remaining: stockLength, pieces: [] }; bars.push(bin); }
    bin.pieces.push(length); bin.remaining -= length + kerf;
  });
  const used = pieces.reduce((a,b)=>a+b,0), purchased = bars.length * stockLength;
  return { bars, used, purchased, waste: Math.max(0,purchased-used), wastePct: purchased ? Math.max(0,(purchased-used)/purchased*100) : 0 };
}

const runtimeDataIssues: string[] = [];

function reportAppDataIssue(source: string, error: unknown) {
  const detail = {
    source,
    message: error instanceof Error ? error.message : String(error || "Veri güvenli varsayılana döndürüldü."),
  };
  runtimeDataIssues.push(`${source}: ${detail.message}`);
  console.error("MARH-LAB veri hatası:", detail);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("marhlab:app-error", { detail }));
  }
}

function readStoredArray<T>(key: string, fallback: T[], normalize: (value: any) => T): T[] {
  try {
    const saved = window.localStorage.getItem(key);
    if (!saved) return fallback.map(normalize);
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) {
      reportAppDataIssue(`Yerel kayıt (${key})`, new Error("Beklenen veri bir dizi değildi."));
      return fallback.map(normalize);
    }
    return parsed.map((value: any, index: number) => {
      try { return normalize(value); }
      catch (error) {
        reportAppDataIssue(`Yerel kayıt (${key}, satır ${index + 1})`, error);
        return null;
      }
    }).filter((value: T | null): value is T => value !== null);
  } catch (error) {
    reportAppDataIssue(`Yerel kayıt (${key})`, error);
    return fallback.map(normalize);
  }
}

function readStoredObject(key: string) {
  try {
    const saved = window.localStorage.getItem(key);
    if (!saved) return {};
    const parsed = JSON.parse(saved);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) return parsed;
    reportAppDataIssue(`Yerel kayıt (${key})`, new Error("Beklenen veri bir nesne değildi."));
    return {};
  } catch (error) {
    reportAppDataIssue(`Yerel kayıt (${key})`, error);
    return {};
  }
}

function writeStoredValue(key: string, value: unknown) {
  try { window.localStorage.setItem(key, JSON.stringify(value)); }
  catch (error) { reportAppDataIssue(`Yerel kayıt (${key})`, error); }
}

function normalizeSettings(value: any, base = DEFAULT_FIRM_SETTINGS) {
  if (value !== undefined && (!value || typeof value !== "object" || Array.isArray(value))) {
    reportAppDataIssue("Firma ayarları", new Error("Ayarlar nesne biçiminde değil; geçerli varsayılanlar kullanıldı."));
  }
  const source = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const stringFields = ["username", "companyName", "tagline", "ownerName", "phone", "email", "address", "orderPrefix", "logoUrl", "watermarkText", "password", "termsTemplate"] as const;
  const numberFields = ["nextOrderNumber", "aluminumKgPrice", "defaultProfitMargin", "vatRate", "watermarkOpacity", "dailyAllowance"] as const;
  const normalized = { ...base, ...source };
  for (const key of stringFields) {
    if (typeof source[key] === "string") normalized[key] = source[key];
    else if (source[key] !== undefined) {
      normalized[key] = base[key];
      reportAppDataIssue("Firma ayarları", new Error(`${key} alanının türü geçersiz; varsayılan değer kullanıldı.`));
    }
  }
  for (const key of numberFields) {
    if (Number.isFinite(Number(source[key]))) normalized[key] = Number(source[key]);
    else if (source[key] !== undefined) {
      normalized[key] = base[key];
      reportAppDataIssue("Firma ayarları", new Error(`${key} alanı sonlu bir sayı değil; varsayılan değer kullanıldı.`));
    }
  }
  if (typeof source.showClassicSignatures === "boolean") normalized.showClassicSignatures = source.showClassicSignatures;
  else if (source.showClassicSignatures !== undefined) {
    normalized.showClassicSignatures = base.showClassicSignatures;
    reportAppDataIssue("Firma ayarları", new Error("showClassicSignatures alanının türü geçersiz; varsayılan değer kullanıldı."));
  }
  if (source.cityTariffs !== undefined && !Array.isArray(source.cityTariffs)) {
    reportAppDataIssue("Firma ayarları", new Error("cityTariffs bir liste değil; varsayılan şehir tarifeleri kullanıldı."));
  }
  const validTariffs = Array.isArray(source.cityTariffs) ? source.cityTariffs.filter((row: any) => row && typeof row === "object" && !Array.isArray(row)) : [];
  if (Array.isArray(source.cityTariffs) && validTariffs.length !== source.cityTariffs.length) {
    reportAppDataIssue("Firma ayarları", new Error("Geçersiz şehir tarifesi satırları atlandı."));
  }
  return {
    ...normalized,
    cityTariffs: Array.isArray(source.cityTariffs) ? validTariffs.map((row: any) => ({
      city: String(row.city || ""),
      unitPrice: Number.isFinite(Number(row.unitPrice)) ? Number(row.unitPrice) : 0,
      travel: Number.isFinite(Number(row.travel)) ? Number(row.travel) : 0,
    })) : base.cityTariffs,
  };
}

function normalizeCustomer(value: any) {
  if (!value || typeof value !== "object" || Array.isArray(value)) reportAppDataIssue("Müşteri kaydı", new Error("Kayıt nesne biçiminde değil; güvenli müşteri alanları kullanıldı."));
  const source = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  if (source.addresses !== undefined && !Array.isArray(source.addresses)) reportAppDataIssue("Müşteri kaydı", new Error("Adres listesi dizi değil; tekil adres varsa listeye dönüştürüldü."));
  const addresses = Array.isArray(source.addresses) ? source.addresses : (source.address ? [source.address] : []);
  return {
    ...source,
    id: String(source.id || `customer-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`),
    name: typeof source.name === "string" ? source.name : "Adsız müşteri",
    phone: typeof source.phone === "string" ? source.phone : "",
    addresses: addresses.filter((address: unknown): address is string => typeof address === "string"),
  };
}

function normalizeQuoteItem(value: any) {
  if (!value || typeof value !== "object" || Array.isArray(value)) reportAppDataIssue("Teklif kalemi", new Error("Kalem nesne biçiminde değil; güvenli varsayılanlar kullanıldı."));
  const source = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const numberOr = (input: unknown, fallback: number) => Number.isFinite(Number(input)) ? Number(input) : fallback;
  return {
    ...source,
    id: String(source.id || `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`),
    facadeName: typeof source.facadeName === "string" ? source.facadeName : "Adsız cephe",
    widthCm: numberOr(source.widthCm, 0),
    heightCm: numberOr(source.heightCm, 0),
    panels: Math.max(1, numberOr(source.panels, 1)),
    quantity: Math.max(1, numberOr(source.quantity, 1)),
    unitPrice: numberOr(source.unitPrice, 0),
  };
}

function normalizeQuote(value: any) {
  if (!value || typeof value !== "object" || Array.isArray(value)) reportAppDataIssue("Teklif kaydı", new Error("Kayıt nesne biçiminde değil; güvenli teklif alanları kullanıldı."));
  const source = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  if (source.items !== undefined && !Array.isArray(source.items)) reportAppDataIssue("Teklif kaydı", new Error("Teklif kalemleri dizi değil; boş kalem listesi kullanıldı."));
  return {
    ...source,
    id: String(source.id || `quote-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`),
    orderCode: typeof source.orderCode === "string" ? source.orderCode : "KODSUZ",
    customerName: typeof source.customerName === "string" ? source.customerName : "Sayın Müşteri",
    customerPhone: typeof source.customerPhone === "string" ? source.customerPhone : "",
    customerAddress: typeof source.customerAddress === "string" ? source.customerAddress : "",
    items: Array.isArray(source.items) ? source.items.map(normalizeQuoteItem) : [],
  };
}

function normalizeAdminFirm(value: any) {
  if (!value || typeof value !== "object" || Array.isArray(value)) reportAppDataIssue("Firma kaydı", new Error("Kayıt nesne biçiminde değil; firma giriş alanları güvenli varsayılanlara döndürüldü."));
  const source = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  return { ...source, id: String(source.id || `firm-${Date.now()}`), username: typeof source.username === "string" ? source.username : "", companyName: typeof source.companyName === "string" ? source.companyName : "Adsız firma" };
}

function normalizeFinanceEntry(value: any) {
  if (!value || typeof value !== "object" || Array.isArray(value)) reportAppDataIssue("Finans hareketi", new Error("Kayıt nesne biçiminde değil; güvenli finans alanları kullanıldı."));
  const source = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  return { ...source, id: String(source.id || `finance-${Date.now()}`), customerName: String(source.customerName || ""), kind: String(source.kind || "expense"), amount: Number.isFinite(Number(source.amount)) ? Number(source.amount) : 0, date: String(source.date || "") };
}

function normalizeTrashEntry(value: any) {
  if (!value || typeof value !== "object" || Array.isArray(value)) reportAppDataIssue("Çöp kutusu kaydı", new Error("Kayıt nesne biçiminde değil; güvenli varsayılan kayıt oluşturuldu."));
  const source = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const data = source.type === "customer" ? normalizeCustomer(source.data) : normalizeQuote(source.data);
  return { ...source, id: String(source.id || `trash-${Date.now()}`), type: source.type === "customer" ? "customer" : "quote", data };
}

// ============================================================================
// 4. ANA UYGULAMA BİLEŞENİ (App)
// ============================================================================

export default function App() {
  const [viewMode, setViewMode] = useState("landing");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginError, setLoginError] = useState("");

  const [showcaseIndex, setShowcaseIndex] = useState(0);
  const [showcasePlaying, setShowcasePlaying] = useState(true);
  const [showcaseOpenness, setShowcaseOpenness] = useState(48);
  const [showcaseDirection, setShowcaseDirection] = useState(1);
  const [cloudTenantId, setCloudTenantId] = useState("");
  const [syncState, setSyncState] = useState(isSupabaseConfigured ? "syncing" : "local");
  const [syncMessage, setSyncMessage] = useState("");
  const [runtimeNotice, setRuntimeNotice] = useState(() => runtimeDataIssues[0] || "");

  useEffect(() => {
    const onAppError = (event: CustomEvent<{ source?: string; message?: string }>) => {
      setRuntimeNotice(`${event.detail?.source || "Uygulama verisi"}: ${event.detail?.message || "Beklenmeyen veri hatası."}`);
    };
    window.addEventListener("marhlab:app-error", onAppError as EventListener);
    if (runtimeDataIssues.length) setRuntimeNotice(runtimeDataIssues[0]);
    return () => window.removeEventListener("marhlab:app-error", onAppError as EventListener);
  }, []);

  const [firmSettings, setFirmSettings] = useState(() => {
    try {
      const saved = window.localStorage.getItem(`marhlab.tenant.${DEFAULT_FIRM_SETTINGS.username}.settings`);
      return saved ? normalizeSettings(JSON.parse(saved)) : normalizeSettings(DEFAULT_FIRM_SETTINGS);
    } catch (error) {
      reportAppDataIssue("Firma ayarları", error);
      return DEFAULT_FIRM_SETTINGS;
    }
  });

  const [customers, setCustomers] = useState(() => {
    return readStoredArray(`marhlab.tenant.${DEFAULT_FIRM_SETTINGS.username}.customers`, INITIAL_CUSTOMERS, normalizeCustomer);
  });

  const [quotes, setQuotes] = useState(() => {
    return readStoredArray(`marhlab.tenant.${DEFAULT_FIRM_SETTINGS.username}.quotes`, INITIAL_QUOTES, normalizeQuote);
  });

  useEffect(() => {
    writeStoredValue(`marhlab.tenant.${firmSettings.username}.settings`, firmSettings);
  }, [firmSettings]);

  useEffect(() => {
    writeStoredValue(`marhlab.tenant.${firmSettings.username}.customers`, customers);
  }, [customers]);

  useEffect(() => {
    writeStoredValue(`marhlab.tenant.${firmSettings.username}.quotes`, quotes);
  }, [quotes]);

  useEffect(() => {
    if (viewMode !== "landing" || !showcasePlaying) return;
    const timer = setInterval(() => {
      setShowcaseOpenness((prev) => {
        if (prev >= 96) {
          setShowcaseDirection(-1);
          return 94;
        }
        if (prev <= 4) {
          setShowcaseDirection(1);
          return 6;
        }
        return prev + showcaseDirection * 2;
      });
    }, 65);
    return () => clearInterval(timer);
  }, [viewMode, showcasePlaying, showcaseDirection]);

  const [memberTab, setMemberTab] = useState("studio");
  const [toastMsg, setToastMsg] = useState("");
  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3200);
  };

  const [confirmDialog, setConfirmDialog] = useState(null);

  // TEKLİF STÜDYOSU DURUMLARI
  const [editingQuoteId, setEditingQuoteId] = useState(null);
  const [orderCode, setOrderCode] = useState(
    `${DEFAULT_FIRM_SETTINGS.orderPrefix}-${DEFAULT_FIRM_SETTINGS.nextOrderNumber}`
  );
  const [projectTitle, setProjectTitle] = useState("Motorlu Giyotin");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [selectedArchiveCustomer, setSelectedArchiveCustomer] = useState(null);
  const [customerDropdownOpen, setCustomerDropdownOpen] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState("Giyotin");
  const [facadeName, setFacadeName] = useState("1. Salon Balkonu");
  const [selectedSeriesId, setSelectedSeriesId] = useState("giosafe-giyotin");
  const [widthCm, setWidthCm] = useState(560);
  const [heightCm, setHeightCm] = useState(240);
  const [panels, setPanels] = useState(3);
  const [openingDirection, setOpeningDirection] = useState("Sola Toplanır");
  const [angleDeg, setAngleDeg] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [glassType, setGlassType] = useState("4+12+4");
  const [glassColor, setGlassColor] = useState("Şeffaf+Füme");
  const [aluminumColor, setAluminumColor] = useState("Antrasit Gri");
  const [motorized, setMotorized] = useState(true);
  const [customUnitPrice, setCustomUnitPrice] = useState(13300);

  const [basketItems, setBasketItems] = useState([]);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [vatIncluded, setVatIncluded] = useState(false);
  const [showValidity, setShowValidity] = useState(true);
  const [validityDays, setValidityDays] = useState(7);
  const [quoteTerms, setQuoteTerms] = useState(firmSettings.termsTemplate);

  const [pdfQuote, setPdfQuote] = useState(null);
  const [pdfIncludePage2, setPdfIncludePage2] = useState(false);
  const [pdfShowWatermark, setPdfShowWatermark] = useState(true);
  const [pdfShowUnitPrices, setPdfShowUnitPrices] = useState(true);

  const [adminRevenueVisible, setAdminRevenueVisible] = useState(true);
  const [adminSearch, setAdminSearch] = useState("");
  const [adminAnnouncement, setAdminAnnouncement] = useState("");
  const [showNewFirmForm, setShowNewFirmForm] = useState(false);
  const [newFirm, setNewFirm] = useState({ companyName: "", ownerName: "", username: "", password: "", phone: "", city: "", plan: "7 Günlük Demo" });
  const [adminFirms, setAdminFirms] = useState(() => readStoredArray("marhlab.admin.firms.v1", [{ id: "f-1", username: "kondes_metal", password: "Kd!2026#92", companyName: "KON-DES METAL", ownerName: "Mustafa Duysak", phone: "0530 695 92 68", city: "Konya", plan: "Enterprise (12 Ay)", expiresAt: "01 Haz 2027" }], normalizeAdminFirm));
  useEffect(() => { writeStoredValue("marhlab.admin.firms.v1", adminFirms); }, [adminFirms]);
  useEffect(() => { setAdminFirms(prev => prev.map(f => f.username === firmSettings.username ? { ...f, companyName: firmSettings.companyName, ownerName: firmSettings.ownerName, phone: firmSettings.phone, city: siteCity } : f)); }, [firmSettings.companyName, firmSettings.ownerName, firmSettings.phone, firmSettings.username]);
  const [activeTenantUsername, setActiveTenantUsername] = useState(DEFAULT_FIRM_SETTINGS.username);
  const [siteCity, setSiteCity] = useState("Konya Merkez");
  const [travelCost, setTravelCost] = useState(0);
  const [teamSize, setTeamSize] = useState(2);
  const [workDays, setWorkDays] = useState(1);
  const [targetProfit, setTargetProfit] = useState(185000);
  const [priceMode, setPriceMode] = useState("unit");
  const [siteMode, setSiteMode] = useState(false);
  const [approvedSearch, setApprovedSearch] = useState("");
  const [approvedStage, setApprovedStage] = useState("Tümü");
  const [customerSearch, setCustomerSearch] = useState("");
  const [financeCustomer, setFinanceCustomer] = useState(null);
  const [financeEntries, setFinanceEntries] = useState(() => readStoredArray(`marhlab.tenant.${DEFAULT_FIRM_SETTINGS.username}.finance`, [], normalizeFinanceEntry));
  const [deletedFinanceIds, setDeletedFinanceIds] = useState(() => readStoredArray(`marhlab.tenant.${DEFAULT_FIRM_SETTINGS.username}.deleted-finance`, [], (value) => String(value)));
  const [financeCloudEnabled, setFinanceCloudEnabled] = useState(false);
  const [financeAmount, setFinanceAmount] = useState("");
  const [financeKind, setFinanceKind] = useState("income");
  const [financeDate, setFinanceDate] = useState(new Date().toISOString().slice(0, 10));
  const [financeDescription, setFinanceDescription] = useState("");
  const [financeQuoteCode, setFinanceQuoteCode] = useState("");
  const [ledgerTypeFilter, setLedgerTypeFilter] = useState("all");
  const [ledgerCustomerFilter, setLedgerCustomerFilter] = useState("all");
  const [ledgerDateFilter, setLedgerDateFilter] = useState("");
  const [ledgerAmount, setLedgerAmount] = useState("");
  const [ledgerKind, setLedgerKind] = useState("expense");
  const [ledgerDate, setLedgerDate] = useState(new Date().toISOString().slice(0, 10));
  const [ledgerDescription, setLedgerDescription] = useState("");
  const [ledgerCustomerName, setLedgerCustomerName] = useState("");
  const [trash, setTrash] = useState(() => readStoredArray(`marhlab.tenant.${DEFAULT_FIRM_SETTINGS.username}.trash`, [], normalizeTrashEntry));
  const [cuttingQuote, setCuttingQuote] = useState(null);
  const [tenantCloudReady, setTenantCloudReady] = useState(false);
  const [adminCloudReady, setAdminCloudReady] = useState(false);

  useEffect(() => { writeStoredValue(`marhlab.tenant.${firmSettings.username}.trash`, trash); }, [trash, firmSettings.username]);
  useEffect(() => { writeStoredValue(`marhlab.tenant.${firmSettings.username}.finance`, financeEntries); }, [financeEntries, firmSettings.username]);
  useEffect(() => { writeStoredValue(`marhlab.tenant.${firmSettings.username}.deleted-finance`, deletedFinanceIds); }, [deletedFinanceIds, firmSettings.username]);

  useEffect(() => {
    const onStatus = (event) => {
      setSyncState(event.detail?.status || "synced");
      setSyncMessage(event.detail?.message || "");
    };
    window.addEventListener("marhlab:supabase-status", onStatus);
    const stopQueue = subscribeToCloudQueue();
    return () => { window.removeEventListener("marhlab:supabase-status", onStatus); stopQueue(); };
  }, []);

  useEffect(() => {
    if (viewMode !== "admin") { setAdminCloudReady(false); return; }
    if (!supabase) { setAdminCloudReady(true); publishSyncStatus("local"); return; }
    let cancelled = false;
    (async () => {
      try {
        const remote = await fetchAdminTenants();
        if (cancelled) return;
        const merged = new Map<string, any>(adminFirms.filter((firm) => typeof firm.username === "string").map((firm) => [firm.username.toLowerCase(), firm]));
        (Array.isArray(remote) ? remote : []).map(tenantFromCloud).map(normalizeAdminFirm).forEach((firm) => merged.set(firm.username.toLowerCase(), { ...merged.get(firm.username.toLowerCase()), ...firm }));
        setAdminFirms([...merged.values()]);
        setAdminCloudReady(true);
        publishSyncStatus("synced", "Firma kayıtları buluttan güncellendi.");
      } catch (error) {
        if (!cancelled) { reportAppDataIssue("Bulut firma kayıtları", error); setAdminCloudReady(true); publishSyncStatus("error", error instanceof Error ? error.message : "Firma kayıtları buluttan alınamadı."); }
      }
    })();
    return () => { cancelled = true; };
  }, [viewMode]);

  useEffect(() => {
    if (viewMode !== "admin" || !adminCloudReady || !supabase) return;
    const timer = window.setTimeout(() => { void persistTenants(adminFirms); }, 500);
    return () => window.clearTimeout(timer);
  }, [adminFirms, adminCloudReady, viewMode]);

  useEffect(() => {
    if (viewMode !== "member") { setTenantCloudReady(false); return; }
    if (!supabase) { setTenantCloudReady(true); publishSyncStatus("local"); return; }
    let cancelled = false;
    const username = activeTenantUsername || firmSettings.username;
    (async () => {
      try {
        const tenant = await fetchTenant(username);
        if (!tenant) { if (!cancelled) { setTenantCloudReady(true); publishSyncStatus("queued", "Bu firma bulutta bulunamadı; yerel kayıtlar korunuyor."); } return; }
        if (cancelled) return;
        const snapshot = await fetchTenantSnapshot(tenant.id);
        if (cancelled || !snapshot) return;
        setCloudTenantId(tenant.id);
        const prefix = `marhlab.tenant.${username}.`;
        const cloudCustomers = Array.isArray(snapshot.customers) ? snapshot.customers : [];
        const cloudQuotes = Array.isArray(snapshot.quotes) ? snapshot.quotes : [];
        const remoteCustomers = cloudCustomers.filter((row) => row && !row.is_deleted).map(customerFromCloud).map(normalizeCustomer);
        const remoteQuotes = cloudQuotes.filter((row) => row && !row.is_deleted).map(quoteFromCloud).map(normalizeQuote);
        const deletedQuotes = cloudQuotes.filter((row) => row && row.is_deleted).map((row) => ({ type: "quote", deletedAt: row.deleted_at || new Date().toISOString(), data: normalizeQuote(quoteFromCloud(row)) }));
        const localCustomers = readStoredArray(prefix + "customers", [], normalizeCustomer);
        const localQuotes = readStoredArray(prefix + "quotes", [], normalizeQuote);
        const localTrash = readStoredArray(prefix + "trash", [], normalizeTrashEntry);
        const deletedCustomerNames = new Set(localTrash.filter((entry) => entry.type === "customer").map((entry) => String(entry.data?.name || "").toLocaleLowerCase("tr")));
        const customersByName = new Map(localCustomers.map((customer) => [String(customer.name).toLocaleLowerCase("tr"), customer]));
        remoteCustomers.filter((customer) => !deletedCustomerNames.has(String(customer.name).toLocaleLowerCase("tr"))).forEach((customer) => customersByName.set(String(customer.name).toLocaleLowerCase("tr"), customer));
        const quotesByCode = new Map(localQuotes.map((quote) => [quote.orderCode, quote]));
        remoteQuotes.forEach((quote) => quotesByCode.set(quote.orderCode, quote));
        const trashByCode = new Map(localTrash.map((entry, index) => [`${entry.type || "quote"}:${entry.data?.orderCode || entry.data?.id || index}`, entry]));
        deletedQuotes.forEach((entry) => trashByCode.set(entry.data.orderCode, entry));
        setFirmSettings(normalizeSettings(settingsFromCloud(snapshot.settings, firmSettings), firmSettings));
        setCustomers([...customersByName.values()]);
        setQuotes([...quotesByCode.values()]);
        setTrash([...trashByCode.values()]);
        setFinanceCloudEnabled(snapshot.financeCloudEnabled);
        if (snapshot.financeCloudEnabled) {
        const localFinance = readStoredArray(prefix + "finance", [], normalizeFinanceEntry);
        const mergedFinance = new Map<string, any>(localFinance.map((entry) => [entry.id, entry]));
          const cloudFinanceEntries = (Array.isArray(snapshot.financeEntries) ? snapshot.financeEntries : []).flatMap((entry, index) => {
            if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
              reportAppDataIssue(`Bulut finans satırı ${index + 1}`, new Error("Kayıt nesne biçiminde değil; bu satır atlandı."));
              return [];
            }
            return [normalizeFinanceEntry({
              id: entry.id,
              customerId: entry.customer_id || "",
              customerName: entry.customer_name || "",
              quoteCode: entry.quote_code || "",
              kind: entry.kind,
              amount: entry.amount,
              date: entry.transaction_date,
              description: entry.description || "",
            })];
          });
          cloudFinanceEntries.forEach((entry) => mergedFinance.set(entry.id, entry));
          setFinanceEntries([...mergedFinance.values()].filter((entry) => !deletedFinanceIds.includes(entry.id)));
        }
        setTenantCloudReady(true);
        publishSyncStatus("synced", "Bu firmanın ayar, müşteri ve teklifleri bulutla eşitlendi.");
      } catch (error) {
        if (!cancelled) { reportAppDataIssue("Bulut firma verileri", error); setTenantCloudReady(false); publishSyncStatus("error", error instanceof Error ? error.message : "Bulut verileri yüklenemedi; yerel kayıtlar kullanılmaya devam ediyor."); }
      }
    })();
    return () => { cancelled = true; };
  }, [viewMode, activeTenantUsername]);

  useEffect(() => {
    if (viewMode !== "member" || !tenantCloudReady || !cloudTenantId || !supabase) return;
    const timer = window.setTimeout(() => {
      void syncTenantSnapshot(cloudTenantId, firmSettings, customers, quotes, trash, financeEntries, financeCloudEnabled, deletedFinanceIds);
    }, 800);
    return () => window.clearTimeout(timer);
  }, [viewMode, tenantCloudReady, cloudTenantId, firmSettings, customers, quotes, trash, financeEntries, financeCloudEnabled, deletedFinanceIds]);

  const activeSeriesObj = useMemo(
    () => SYSTEM_SERIES.find((s) => s.id === selectedSeriesId) || SYSTEM_SERIES[0],
    [selectedSeriesId]
  );

  const handleSelectSeries = (newSeriesId) => {
    setSelectedSeriesId(newSeriesId);
    const found = SYSTEM_SERIES.find((s) => s.id === newSeriesId);
    if (found) {
      setCustomUnitPrice(found.defaultUnitPrice);
      setProjectTitle(found.shortName);
      if (found.category === "Giyotin") {
        setMotorized(true);
        setPanels(3);
      } else {
        setPanels(7);
      }
    }
  };

  const automaticUnitPrice = useMemo(() => {
    const glassBase = { "8mm": 850, "10mm": 1100, "4+12+4": 1850, "4+16+4": 2150 }[glassType] || 850;
    const glassExtra = { "Şeffaf": 0, "Füme": 100, "Şeffaf+Füme": 100, "Bronz": 100, "Mavi": 150, "Yeşil": 150, "Buzlu": 120 }[glassColor] || 0;
    const motorExtra = motorized ? (activeSeriesObj.mechType === "giyotin" ? 900 : 450) : 0;
    const aluminumCost = activeSeriesObj.weightPerM2 * Number(firmSettings.aluminumKgPrice || 0);
    const cost = activeSeriesObj.baseCostPerM2 + glassBase + glassExtra + motorExtra + aluminumCost * 0.15;
    return Math.round(cost * (1 + Number(firmSettings.defaultProfitMargin || 0) / 100));
  }, [activeSeriesObj, glassType, glassColor, motorized, firmSettings.aluminumKgPrice, firmSettings.defaultProfitMargin]);

  const currentDraftItem = useMemo(() => {
    const areaM2 =
      ((Number(widthCm) || 0) * (Number(heightCm) || 0) * (Number(quantity) || 1)) / 10000;
    const total = Math.round(areaM2 * (Number(customUnitPrice) || 0));
    const glassLabelObj = GLASS_OPTIONS.find((g) => g.id === glassType);
    return {
      id: "draft-current",
      facadeName: facadeName.trim() || "1. Salon Balkonu",
      seriesId: activeSeriesObj.id,
      seriesName: activeSeriesObj.shortName,
      seriesCode: activeSeriesObj.code,
      mechType: activeSeriesObj.mechType,
      widthCm: Number(widthCm) || 0,
      heightCm: Number(heightCm) || 0,
      panels: Math.max(1, Number(panels) || 1),
      openingDirection,
      angleDeg: Number(angleDeg) || 0,
      quantity: Math.max(1, Number(quantity) || 1),
      glassType,
      glassShortLabel: glassLabelObj ? glassLabelObj.short : glassType,
      glassColor,
      aluminumColor,
      motorized,
      unitPrice: Number(customUnitPrice) || 0,
      areaM2,
      total,
    };
  }, [
    facadeName,
    activeSeriesObj,
    widthCm,
    heightCm,
    panels,
    openingDirection,
    angleDeg,
    quantity,
    glassType,
    glassColor,
    aluminumColor,
    motorized,
    customUnitPrice,
  ]);

  const effectiveItems = useMemo(() => {
    const safeBasketItems = Array.isArray(basketItems) ? basketItems.filter((item) => item && typeof item === "object" && !Array.isArray(item)) : [];
    if (safeBasketItems.length > 0) return safeBasketItems.map(normalizeQuoteItem);
    return [normalizeQuoteItem(currentDraftItem)];
  }, [basketItems, currentDraftItem]);

  const calcQuoteTotals = (items, discount = 0, vat = false) => {
    const totalArea = items.reduce((a, it) => a + (Number(it.widthCm) * Number(it.heightCm) * Number(it.quantity || 1)) / 10000, 0);
    const subtotal = items.reduce((a, it) => a + Math.round(((Number(it.widthCm) * Number(it.heightCm) * Number(it.quantity || 1)) / 10000) * Number(it.unitPrice || 0)), 0);
    const discountAmount = Math.round(subtotal * Number(discount || 0) / 100);
    const taxable = Math.max(0, subtotal - discountAmount);
    const vatAmount = vat ? Math.round(taxable * Number(firmSettings.vatRate || 20) / 100) : 0;
    return { totalArea, subtotal, discountAmount, vatAmount, grandTotal: taxable + vatAmount };
  };

  const financialSummary = useMemo(() => {
    return calcQuoteTotals(effectiveItems, discountPercent, vatIncluded);
  }, [effectiveItems, discountPercent, vatIncluded, firmSettings.vatRate]);

  const matchingCustomers = useMemo(() => {
    const q = customerName.trim().toLocaleLowerCase("tr");
    if (!q || selectedArchiveCustomer) return [];
    return customers.filter(
      (c) =>
        c.name.toLocaleLowerCase("tr").includes(q) ||
        c.phone.replace(/\s+/g, "").includes(q.replace(/\s+/g, ""))
    );
  }, [customerName, customers, selectedArchiveCustomer]);

  const sortedCustomers = useMemo(() => {
    return [...customers].sort((a, b) => a.name.localeCompare(b.name, "tr"));
  }, [customers]);

  const pendingQuotes = useMemo(() => quotes.filter((q) => q.status === "pending"), [quotes]);
  const approvedQuotes = useMemo(() => quotes.filter((q) => q.status === "approved"), [quotes]);
  const allFinanceEntries = useMemo(() => {
    const entries = [...financeEntries];
    for (const quote of approvedQuotes) {
      const legacyDeposit = Number(quote.deposit || 0);
      const id = `legacy-deposit-${quote.id}`;
      if (legacyDeposit > 0 && !entries.some((entry) => entry.id === id)) entries.push({
        id, customerName: quote.customerName, quoteCode: quote.orderCode, kind: "income",
        amount: legacyDeposit, date: quote.date || new Date().toISOString().slice(0, 10), description: "Eski teklif kapora kaydı",
      });
    }
    return entries;
  }, [financeEntries, approvedQuotes]);
  const signedFinanceAmount = (entry) => ["income", "adjustment_in"].includes(entry.kind) ? Number(entry.amount || 0) : -Number(entry.amount || 0);
  const approvedCustomerWork = (name) => approvedQuotes.filter((quote) => quote.customerName === name).reduce((sum, quote) => sum + quoteTotal(quote), 0);
  const customerNetPayments = (name) => allFinanceEntries.filter((entry) => entry.customerName === name).reduce((sum, entry) => sum + signedFinanceAmount(entry), 0);
  const customerReceivable = (name) => Math.max(0, approvedCustomerWork(name) - customerNetPayments(name));
  const totalReceived = allFinanceEntries.filter((entry) => ["income", "adjustment_in"].includes(entry.kind)).reduce((sum, entry) => sum + Number(entry.amount || 0), 0);
  const totalOutgoings = allFinanceEntries.filter((entry) => ["expense", "refund", "adjustment_out"].includes(entry.kind)).reduce((sum, entry) => sum + Number(entry.amount || 0), 0);
  const overallReceivables = [...new Set<string>(approvedQuotes.map((quote) => String(quote.customerName)))].reduce<number>((sum, name) => sum + customerReceivable(name), 0);
  const netCash = totalReceived - totalOutgoings;
  const filteredLedger = allFinanceEntries.filter((entry) =>
    (ledgerTypeFilter === "all" || entry.kind === ledgerTypeFilter) &&
    (ledgerCustomerFilter === "all" || entry.customerName === ledgerCustomerFilter) &&
    (!ledgerDateFilter || entry.date === ledgerDateFilter)
  ).sort((a, b) => String(b.date).localeCompare(String(a.date)));
  const visibleCustomers = sortedCustomers.filter((customer) =>
    `${customer.name} ${customer.phone || ""} ${customer.city || ""} ${customer.district || ""} ${customer.address || ""} ${(Array.isArray(customer.addresses) ? customer.addresses : []).join(" ")}`.toLocaleLowerCase("tr").includes(customerSearch.toLocaleLowerCase("tr"))
  );
  const nextAvailableOrderCode = (quotesToCheck = quotes, trashToCheck = trash, numberFloor = firmSettings.nextOrderNumber) => {
    const allQuotes = [...quotesToCheck, ...trashToCheck.map((entry) => entry.data).filter(Boolean)];
    const used = new Set(allQuotes.map((quote) => String(quote.orderCode || "").trim().toLocaleLowerCase("tr")));
    let maxNumber = Math.max(0, Number(numberFloor || 1) - 1);
    allQuotes.forEach((quote) => {
      const match = String(quote.orderCode || "").match(/(\d+)\s*$/);
      if (match) maxNumber = Math.max(maxNumber, Number(match[1]));
    });
    let next = maxNumber + 1;
    let candidate = `${firmSettings.orderPrefix || "PRJ"}-${next}`;
    while (used.has(candidate.toLocaleLowerCase("tr"))) candidate = `${firmSettings.orderPrefix || "PRJ"}-${++next}`;
    return candidate;
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const u = loginUser.trim();
    const p = loginPass.trim();
    if (u === "marhlab-admin" && p === "MarhLab!2026") {
      setLoginError("");
      setAdminCloudReady(false);
      setShowLoginModal(false);
      setViewMode("admin");
      return;
    }
    let firm = adminFirms.find((f) => typeof f.username === "string" && f.username.toLowerCase() === u.toLowerCase() && (f.password || (u === "kondes_metal" ? "Kd!2026#92" : "")) === p);
    if (!firm && supabase && u && p) {
      try {
        const cloudFirm = await fetchTenant(u.toLowerCase());
        if (cloudFirm?.password === p && cloudFirm.is_active !== false) {
          firm = normalizeAdminFirm(tenantFromCloud(cloudFirm));
          setAdminFirms((prev) => [...prev.filter((item) => item.username.toLowerCase() !== u.toLowerCase()), firm]);
        }
      } catch {
        reportAppDataIssue("Bulut giriş kontrolü", new Error("Bulut giriş kontrolü başarısız; internet bağlantınızı kontrol edin."));
        publishSyncStatus("error", "Bulut giriş kontrolü başarısız; internet bağlantınızı kontrol edin.");
      }
    }
    if (firm) {
      const normalized = u.toLowerCase();
      setActiveTenantUsername(normalized);
      setCloudTenantId("");
      setTenantCloudReady(false);
      const prefix = `marhlab.tenant.${normalized}.`;
      const storedSettings = readStoredObject(prefix + "settings");
      setFirmSettings(normalizeSettings({ ...DEFAULT_FIRM_SETTINGS, username: normalized, companyName: firm.companyName, ownerName: firm.ownerName || "", phone: firm.phone || "", address: firm.address || "", password: p, ...storedSettings }));
      setCustomers(readStoredArray(prefix + "customers", [], normalizeCustomer));
      setQuotes(readStoredArray(prefix + "quotes", [], normalizeQuote));
      setTrash(readStoredArray(prefix + "trash", [], normalizeTrashEntry));
      setFinanceEntries(readStoredArray(prefix + "finance", [], normalizeFinanceEntry));
      setDeletedFinanceIds(readStoredArray(prefix + "deleted-finance", [], (value) => String(value)));
      setFinanceCloudEnabled(false);
      setLoginError(""); setShowLoginModal(false); setViewMode("member"); return;
    }
    setLoginError("Kullanıcı adı veya şifre hatalı.");
  };

  const resetForNewQuote = (prefillCustomer = null) => {
    const nextCode = nextAvailableOrderCode();
    setEditingQuoteId(null);
    setOrderCode(nextCode);
    setBasketItems([]);
    setFacadeName("1. Salon Balkonu");
    setAngleDeg(0);
    setDiscountPercent(0);
    if (prefillCustomer) {
      setCustomerName(prefillCustomer.name);
      setCustomerPhone(prefillCustomer.phone);
      setCustomerAddress("");
      setSelectedArchiveCustomer(prefillCustomer);
      showToast(`${prefillCustomer.name} için yeni şantiye teklifi başlatıldı.`);
    } else {
      setCustomerName("");
      setCustomerPhone("");
      setCustomerAddress("");
      setSelectedArchiveCustomer(null);
      showToast(`Yeni teklif formu hazırlandı (${nextCode}).`);
    }
    setMemberTab("studio");
  };

  const addCurrentFacadeToBasket = () => {
    const nextIndex = basketItems.length + 1;
    const itemToAdd = {
      ...currentDraftItem,
      id: `item-${Date.now()}`,
      facadeName: facadeName.trim() || `${nextIndex}. Cephe / Balkon`,
    };
    setBasketItems((prev) => [...prev, itemToAdd]);
    setFacadeName(`${nextIndex + 1}. Cephe / Balkon`);
    showToast(`"${itemToAdd.facadeName}" teklif sepetine eklendi.`);
  };

  const upsertCustomerInArchive = (name, phone, address) => {
    const cleanName = name.trim();
    if (!cleanName) return;
    setCustomers((prev) => {
      const existingIdx = prev.findIndex(
        (c) => c.name.toLocaleLowerCase("tr") === cleanName.toLocaleLowerCase("tr")
      );
      if (existingIdx >= 0) {
        const updated = [...prev];
        const curr = updated[existingIdx];
        const currentAddresses = Array.isArray(curr.addresses) ? curr.addresses : [];
        const nextAddresses = address && !currentAddresses.includes(address)
          ? [...currentAddresses, address]
          : currentAddresses;
        updated[existingIdx] = {
          ...curr,
          phone: phone || curr.phone,
          addresses: nextAddresses,
        };
        return updated;
      }
      return [
        ...prev,
        {
          id: `c-${Date.now()}`,
          name: cleanName,
          phone: phone || "",
          addresses: address ? [address] : [],
        },
      ];
    });
  };

  const buildQuoteObject = (targetStatus) => {
    const finalCustomerName = customerName.trim() || "Sayın Müşteri";
    const sameDraft = basketItems.some((it) => it.facadeName === currentDraftItem.facadeName && it.widthCm === currentDraftItem.widthCm && it.heightCm === currentDraftItem.heightCm && it.unitPrice === currentDraftItem.unitPrice);
    const itemsToSave = basketItems.length > 0 ? (sameDraft ? basketItems : [...basketItems, { ...currentDraftItem, id: `item-${Date.now()}` }]) : [currentDraftItem];
    return {
      id: editingQuoteId || `q-${Date.now()}`,
      orderCode,
      date: new Date().toLocaleDateString("tr-TR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
      projectTitle: projectTitle.trim() || activeSeriesObj.shortName,
      customerName: finalCustomerName,
      customerPhone: customerPhone.trim(),
      customerAddress: customerAddress.trim(),
      status: targetStatus,
      productionStage: "Üretimde",
      vatIncluded,
      showValidity,
      validityDays,
      discountPercent: Number(discountPercent) || 0,
      terms: quoteTerms,
      items: itemsToSave,
    };
  };

  const saveQuote = (targetStatus) => {
    const qObj = buildQuoteObject(targetStatus);
    const duplicateCode = [...quotes, ...trash.map((entry) => entry.data).filter(Boolean)].some((quote) =>
      quote.id !== qObj.id && String(quote.orderCode || "").trim().toLocaleLowerCase("tr") === String(qObj.orderCode || "").trim().toLocaleLowerCase("tr")
    );
    if (!qObj.orderCode.trim() || duplicateCode) {
      showToast(duplicateCode ? "Bu sipariş kodu kullanılmış. Yeni ve benzersiz bir kod girin." : "Sipariş kodu boş bırakılamaz.");
      return;
    }
    upsertCustomerInArchive(qObj.customerName, qObj.customerPhone, qObj.customerAddress);

    setQuotes((prev) => {
      const idx = prev.findIndex((item) => item.id === qObj.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = qObj;
        return copy;
      }
      return [qObj, ...prev];
    });

    if (!editingQuoteId) {
      const savedNumber = Number(String(qObj.orderCode).match(/(\d+)\s*$/)?.[1] || 0);
      setFirmSettings((prev) => ({
        ...prev,
        nextOrderNumber: Math.max(Number(prev.nextOrderNumber || 1), savedNumber + 1),
      }));
      setOrderCode(nextAvailableOrderCode([...quotes, qObj], trash, Math.max(Number(firmSettings.nextOrderNumber || 1), savedNumber + 1)));
    }

    if (targetStatus === "pending") {
      showToast(`${qObj.orderCode} Provizyonda Bekleyenler listesine kaydedildi.`);
    } else {
      showToast(`✅ ${qObj.orderCode} onaylandı ve Onaylananlar sekmesine işlendi!`);
    }
  };

  const openCurrentInPdf = () => {
    const previewObj = buildQuoteObject("preview");
    setPdfIncludePage2(false);
    setPdfQuote(previewObj);
  };

  const copyWhatsAppSummary = () => {
    const qObj = buildQuoteObject("preview");
    const lines = [
      `*${firmSettings.companyName} — FİYAT TEKLİFİ (${qObj.orderCode})*`,
      `Sayın *${qObj.customerName}*,`,
      `Proje: ${qObj.projectTitle}`,
      ...(Array.isArray(qObj?.items) ? qObj.items : []).map(
        (it, idx) =>
          `${idx + 1}. ${it.facadeName}: ${it.seriesName} (${it.widthCm}×${it.heightCm} cm, ${it.panels} Cam, ${it.quantity} Adet)`
      ),
      `Toplam Alan: *${financialSummary.totalArea.toFixed(2)} m²*`,
      `Genel Toplam (${vatIncluded ? "KDV Dahil" : "KDV Hariç"}): *₺${financialSummary.grandTotal.toLocaleString("tr-TR")}*`,
      `Onaylamak için bu mesajı *ONAYLIYORUM (${qObj.orderCode})* yazarak yanıtlayabilirsiniz.`,
    ];
    navigator.clipboard?.writeText(lines.join("\n"));
    showToast("WhatsApp teklif özeti panoya kopyalandı!");
  };

  const quoteTotal = (q) => calcQuoteTotals(Array.isArray(q?.items) ? q.items : [], q?.discountPercent, q?.vatIncluded).grandTotal;
  const whatsappHref = (q) => `https://wa.me/${(q.customerPhone || "").replace(/\D/g, "").replace(/^0/, "90")}?text=${encodeURIComponent(`${firmSettings.companyName} ${q.orderCode} teklifiniz: ₺${quoteTotal(q).toLocaleString("tr-TR")}`)}`;
  const exportBackup = () => {
    const blob = new Blob([JSON.stringify({ firmSettings, customers, quotes, trash }, null, 2)], { type: "application/json" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `${firmSettings.username}-marhlab-yedek.json`; a.click(); URL.revokeObjectURL(a.href);
  };
  const importBackup = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result));
        if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error("Yedek dosyasının üst düzeyi nesne olmalıdır.");
        if (data.firmSettings) setFirmSettings(normalizeSettings(data.firmSettings));
        if (data.customers !== undefined) {
          if (Array.isArray(data.customers)) setCustomers(data.customers.map(normalizeCustomer));
          else reportAppDataIssue("Yedek içe aktarma", new Error("Müşteri listesi dizi değil; mevcut liste korundu."));
        }
        if (data.quotes !== undefined) {
          if (Array.isArray(data.quotes)) setQuotes(data.quotes.map(normalizeQuote));
          else reportAppDataIssue("Yedek içe aktarma", new Error("Teklif listesi dizi değil; mevcut liste korundu."));
        }
        if (data.trash !== undefined) {
          if (Array.isArray(data.trash)) setTrash(data.trash.map(normalizeTrashEntry));
          else reportAppDataIssue("Yedek içe aktarma", new Error("Çöp kutusu listesi dizi değil; mevcut liste korundu."));
        }
        showToast("Yedek başarıyla içe aktarıldı.");
      } catch (error) {
        reportAppDataIssue("Yedek içe aktarma", error);
        showToast("Geçersiz yedek dosyası; hata ayrıntısı ekranda gösterildi.");
      }
    };
    reader.onerror = () => reportAppDataIssue("Yedek dosyası", reader.error || new Error("Dosya okunamadı."));
    reader.readAsText(file);
  };

  const loadQuoteIntoStudio = (q) => {
    setEditingQuoteId(q.id);
    setOrderCode(q.orderCode);
    setProjectTitle(q.projectTitle);
    setCustomerName(q.customerName);
    setCustomerPhone(q.customerPhone || "");
    setCustomerAddress(q.customerAddress || "");
    setVatIncluded(Boolean(q.vatIncluded));
    setShowValidity(q.showValidity !== false);
    setValidityDays(q.validityDays || 7);
    setDiscountPercent(q.discountPercent || 0);
    setQuoteTerms(q.terms || firmSettings.termsTemplate);
    setBasketItems(q.items || []);
    if (q.items?.[0]) {
      const first = q.items[0];
      setSelectedSeriesId(first.seriesId || "alya-katlanir");
      setWidthCm(first.widthCm);
      setHeightCm(first.heightCm);
      setPanels(first.panels);
      setAngleDeg(first.angleDeg || 0);
      setQuantity(first.quantity);
      setGlassType(first.glassType);
      setGlassColor(first.glassColor);
      setAluminumColor(first.aluminumColor);
      setMotorized(Boolean(first.motorized));
      setCustomUnitPrice(first.unitPrice);
    }
    setMemberTab("studio");
    showToast(`${q.orderCode} düzenleme için stüdyoya yüklendi.`);
  };

  const approvePendingQuote = (quoteId) => {
    setQuotes((prev) =>
      prev.map((q) => (q.id === quoteId ? { ...q, status: "approved", productionStage: "Üretimde" } : q))
    );
    showToast("✅ Teklif onaylandı ve Onaylananlar sekmesine taşındı!");
  };

  const updateProductionStage = (quoteId, stage) => {
    setQuotes((prev) =>
      prev.map((q) => (q.id === quoteId ? { ...q, productionStage: stage } : q))
    );
    showToast(`İş durumu "${stage}" olarak güncellendi.`);
  };

  const unapproveQuote = (quoteId) => {
    setQuotes((prev) => prev.map((quote) => quote.id === quoteId ? { ...quote, status: "pending" } : quote));
    showToast("Teklif provizyona alındı; müşteri alacağı anında güncellendi.");
  };

  const moveQuoteToTrash = (quote) => {
    setConfirmDialog({
      title: "Onaylı Teklifi Çöp Kutusuna Taşı",
      message: `${quote.orderCode} (${quote.customerName}) silinsin mi? İş tutarı ve alacak bakiyeden düşecektir.`,
      onConfirm: () => {
        setQuotes((prev) => prev.filter((item) => item.id !== quote.id));
        setTrash((prev) => [...prev, { type: "quote", deletedAt: new Date().toISOString(), data: quote }]);
        showToast(`${quote.orderCode} çöp kutusuna taşındı; bakiye yenilendi.`);
      },
    });
  };

  const deleteCustomer = (customer) => {
    setConfirmDialog({
      title: "Müşteriyi Sil",
      message: `${customer.name} rehberden silinsin mi? Teklifler ve mali hareketler korunur.`,
      onConfirm: () => {
        setCustomers((prev) => prev.filter((item) => item.id !== customer.id));
        setTrash((prev) => [...prev, { type: "customer", deletedAt: new Date().toISOString(), data: customer }]);
        setFinanceCustomer(null);
        showToast(`${customer.name} müşteri rehberinden silindi.`);
      },
    });
  };

  const addFinanceEntry = (entry) => {
    const amount = Number(entry.amount);
    if (!Number.isFinite(amount) || amount <= 0) { showToast("Tutar sıfırdan büyük olmalıdır."); return false; }
    setFinanceEntries((prev) => [{
      id: crypto.randomUUID(), customerId: entry.customer?.id || "", customerName: entry.customer?.name || entry.customerName || "",
      quoteCode: entry.quoteCode || "", kind: entry.kind, amount, date: entry.date || new Date().toISOString().slice(0, 10),
      description: entry.description?.trim() || "Açıklama eklenmedi",
    }, ...prev]);
    return true;
  };

  const saveCustomerFinance = () => {
    if (!financeCustomer || !addFinanceEntry({
      customer: financeCustomer, kind: financeKind, amount: financeAmount, date: financeDate,
      description: financeDescription, quoteCode: financeQuoteCode,
    })) return;
    showToast(financeKind === "income" ? "Tahsilat müşteri bakiyesine ve muhasebeye işlendi." : "İade / düzeltme mali hareketlere işlendi.");
    setFinanceAmount(""); setFinanceDescription(""); setFinanceQuoteCode("");
  };

  const saveGeneralLedgerEntry = () => {
    const selectedCustomer = customers.find((customer) => customer.name === ledgerCustomerName) || null;
    if (!addFinanceEntry({ kind: ledgerKind, amount: ledgerAmount, date: ledgerDate, description: ledgerDescription, customer: selectedCustomer })) return;
    showToast("Muhasebe hareketi kaydedildi; kasa ve müşteri bakiyesi güncellendi.");
    setLedgerAmount(""); setLedgerDescription("");
  };

  const deleteFinanceEntry = (entry) => {
    if (String(entry.id).startsWith("legacy-deposit-")) {
      const quoteId = String(entry.id).replace("legacy-deposit-", "");
      setQuotes((prev) => prev.map((quote) => quote.id === quoteId ? { ...quote, deposit: 0 } : quote));
    } else {
      setFinanceEntries((prev) => prev.filter((item) => item.id !== entry.id));
      setDeletedFinanceIds((prev) => prev.includes(entry.id) ? prev : [...prev, entry.id]);
    }
    showToast("Mali hareket silindi; kasa ve alacak yeniden hesaplandı.");
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const localLogo = String(reader.result || "");
      setFirmSettings((prev) => ({ ...prev, logoUrl: localLogo }));
      if (supabase) {
        void (async () => {
          try {
            const tenant = cloudTenantId ? { id: cloudTenantId } : await fetchTenant(activeTenantUsername);
            if (tenant?.id) {
              const publicUrl = await uploadFirmLogo(tenant.id, file);
              if (publicUrl) setFirmSettings((prev) => ({ ...prev, logoUrl: publicUrl }));
            }
            showToast("Firma logosu buluta yüklendi; PDF çıktılarında aktif.");
          } catch {
            showToast("Logo yerel olarak kaydedildi; Storage erişilemediği için cihazdaki sürüm kullanılacak.");
          }
        })();
      } else showToast("Firma logosu güncellendi! PDF çıktılarında aktif.");
    };
    reader.readAsDataURL(file);
  };

  const syncLocalDataToCloud = async () => {
    if (!supabase) {
      publishSyncStatus("local", "Supabase ortam değişkenleri tanımlı değil; veriler bu cihazda tutuluyor.");
      showToast("Supabase bağlantısı ayarlı değil. Veriler bu cihazda korunuyor; .env ayarlarını tamamlayın.");
      return;
    }
    try {
      publishSyncStatus("syncing", "Yerel kayıtlar buluta aktarılıyor…");
      const tenant = cloudTenantId ? { id: cloudTenantId } : await fetchTenant(activeTenantUsername);
      if (!tenant?.id) throw new Error("Bu firma Supabase tenants tablosunda bulunamadı.");
      setCloudTenantId(tenant.id);
      await syncTenantSnapshot(tenant.id, firmSettings, customers, quotes, trash, financeEntries, financeCloudEnabled, deletedFinanceIds);
      await flushCloudQueue();
      showToast("Yerel firma verileri bulut eşitleme kuyruğuna aktarıldı.");
    } catch (error) {
      publishSyncStatus("error", error instanceof Error ? error.message : "Bulut aktarımı tamamlanamadı.");
      showToast(`Buluta eşitleme başarısız; yerel kayıtlarınız korunuyor. ${error instanceof Error ? error.message : "Bağlantı veya yetki ayarlarını kontrol edin."}`);
    }
  };

  const pdfTotals = useMemo(() => {
    if (!pdfQuote) return null;
    return calcQuoteTotals(Array.isArray(pdfQuote.items) ? pdfQuote.items : [], pdfQuote.discountPercent, pdfQuote.vatIncluded);
  }, [pdfQuote, firmSettings.vatRate]);

  const activeShowcase = SHOWCASE_SYSTEMS[showcaseIndex] || SHOWCASE_SYSTEMS[0];

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 font-sans selection:bg-amber-500/30 selection:text-amber-200 flex flex-col">
      {runtimeNotice && <div className="no-print mx-auto mt-3 w-[min(96%,1000px)] rounded-xl border border-amber-500/60 bg-amber-950/80 p-4 text-amber-100 shadow-xl" role="alert" aria-live="assertive"><div className="flex items-start justify-between gap-3"><div><div className="font-bold">Uygulama veri uyarısı</div><p className="mt-1 whitespace-pre-wrap break-words text-sm">{runtimeNotice}</p><p className="mt-2 text-xs text-amber-200/80">Güvenli varsayılan verilerle devam edildi. Sorun sürerse hata metnini destek ekibinizle paylaşın.</p></div><button type="button" className="rounded-lg px-2 py-1 text-amber-100 hover:bg-amber-900" aria-label="Uyarıyı kapat" onClick={() => setRuntimeNotice("")}>Kapat</button></div></div>}
      {/* KESİN TEK SAYFA DİKEY A4 YAZDIRMA (@media print) STİL KİLİDİ */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 0 !important;
          }
          html, body {
            width: 210mm !important;
            height: ${pdfIncludePage2 ? "auto" : "297mm"} !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: ${pdfIncludePage2 ? "visible" : "hidden"} !important;
            background: #ffffff !important;
          }
          .no-print {
            display: none !important;
          }
          .print-modal-shell {
            position: static !important;
            inset: auto !important;
            display: block !important;
            width: 210mm !important;
            height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            overflow: visible !important;
          }
          .print-scroll-body {
            display: block !important;
            width: 210mm !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
          }
          #a4-print-root {
            display: block !important;
            width: 210mm !important;
            margin: 0 !important;
            padding: 0 !important;
            gap: 0 !important;
          }
          .a4-sheet {
            width: 210mm !important;
            height: 288mm !important;
            max-height: 288mm !important;
            margin: 0 !important;
            padding: 9mm 11mm !important;
            box-sizing: border-box !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            overflow: hidden !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            page-break-after: ${pdfIncludePage2 ? "auto" : "avoid"} !important;
            break-after: ${pdfIncludePage2 ? "auto" : "avoid"} !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .a4-sheet * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .a4-page-break {
            page-break-before: always !important;
            break-before: page !important;
          }
        }
      `}</style>

      {/* BİLDİRİM TOAST */}
      {toastMsg && (
        <div className="no-print fixed bottom-5 right-5 z-50 bg-slate-900 border border-amber-500/40 text-slate-100 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-medium">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ÖZEL ONAY MODALI */}
      {confirmDialog && (
        <div className="no-print fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">{confirmDialog.title}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{confirmDialog.message}</p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDialog(null)}
                className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={() => {
                  confirmDialog.onConfirm();
                  setConfirmDialog(null);
                }}
                className="px-3.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-xs font-semibold text-white"
              >
                Evet, Sil
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* VIEW 1: MARH-LAB PAZARLAMA & SAAS VİTRİN ANA EKRANI                  */}
      {/* ==================================================================== */}
      {viewMode === "landing" && (
        <div className="no-print flex-1 flex flex-col justify-between bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-amber-950/20 via-[#070b14] to-[#050810]">
          {/* Üst Yüzen Navigasyon (Sadece Giriş Yap, Kayıt Ol ve Bilgi Al) */}
          <header className="max-w-7xl w-full mx-auto px-4 pt-4">
            <nav className="bg-slate-900/85 backdrop-blur-md border border-slate-800/90 rounded-2xl px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center justify-center text-sm shadow-lg shadow-amber-500/20">
                  ML
                </div>
                <div>
                  <div className="font-extrabold text-sm tracking-wide text-white">MARH-LAB</div>
                  <div className="text-[11px] text-slate-400">
                    Cam Balkon İşletmeleri İçin Teklif &amp; 3D CAD Yazılımı
                  </div>
                </div>
              </div>

              <div className="hidden lg:flex items-center gap-6 text-xs font-medium text-slate-300">
                <a href="#sistem-vitrini" className="hover:text-amber-400 transition">
                  Sistem Vitrini
                </a>
                <a href="#kolayliklar" className="hover:text-amber-400 transition">
                  Sağladığımız Kolaylıklar
                </a>
                <a href="#nasil-calisir" className="hover:text-amber-400 transition">
                  Nasıl Çalışır?
                </a>
                <a href="#paketler" className="hover:text-amber-400 transition">
                  Üyelik Paketleri
                </a>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowLoginModal(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-white transition"
                >
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  Giriş Yap
                </button>
                <a
                  href="https://wa.me/905052766969?text=Merhaba%20MARH-LAB%20cam%20balkon%20yazılımı%20için%20kayıt%20olmak%20istiyorum."
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold transition shadow-lg shadow-amber-500/20"
                >
                  Kayıt Ol
                </a>
                <a
                  href="https://wa.me/905052766969?text=Merhaba%20MARH-LAB%20cam%20balkon%20programı%20hakkında%20detaylı%20bilgi%20almak%20istiyorum."
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-extrabold transition shadow-lg shadow-sky-500/20"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  Bilgi Al
                </a>
              </div>
            </nav>
          </header>

          {/* Split Hero: Pazarlama Mesajı + Canlı Cam Balkon Sistem Vitrini */}
          <section
            id="sistem-vitrini"
            className="max-w-7xl w-full mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
          >
            {/* Sol Sütun */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] font-bold tracking-wider uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                CAM BALKON ATÖLYE &amp; BAYİ YÖNETİM YAZILIMI
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-[1.15]">
                {activeShowcase.heroTitle.split(" ").slice(0, -2).join(" ")}{" "}
                <span className="text-amber-400">
                  {activeShowcase.heroTitle.split(" ").slice(-2).join(" ")}
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
                {activeShowcase.heroDescription}
              </p>

              <div className="flex flex-wrap gap-2.5">
                {(activeShowcase?.badges || []).map((badge, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-amber-500/30 text-amber-200 text-xs font-semibold"
                  >
                    <Check className="w-3.5 h-3.5 text-amber-400" />
                    {badge}
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <a
                  href="https://wa.me/905052766969?text=Merhaba%20MARH-LAB%20cam%20balkon%20yazılımı%20için%20kayıt%20olmak%20istiyorum."
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm shadow-lg shadow-amber-500/20 transition"
                >
                  Hemen Kayıt Ol &amp; Kullanmaya Başla
                  <ArrowRight className="w-4 h-4" />
                </a>
                <button
                  type="button"
                  onClick={() => setShowLoginModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-sm transition"
                >
                  <Lock className="w-4 h-4 text-amber-400" />
                  Üye Girişi Yap
                </button>
              </div>
            </div>

            {/* Sağ Sütun: CANLI CAM BALKON SİSTEM VİTRİNİ */}
            <div className="lg:col-span-6">
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">
                    CANLI SİSTEM VİTRİNİ
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    CANLI ÖNİZLEME
                  </span>
                </div>

                <div className="grid grid-cols-5 gap-1.5">
                  {SHOWCASE_SYSTEMS.map((sys, idx) => {
                    const isActive = idx === showcaseIndex;
                    return (
                      <button
                        key={sys.id}
                        type="button"
                        onClick={() => {
                          setShowcaseIndex(idx);
                          setShowcaseOpenness(52);
                        }}
                        className={`p-2 rounded-xl border text-left transition ${
                          isActive
                            ? "bg-slate-800 border-amber-400 text-white shadow-md"
                            : "bg-slate-950/70 border-slate-800 text-slate-400 hover:border-slate-700"
                        }`}
                      >
                        <div className="text-[11px] font-bold truncate">{sys.tabTitle}</div>
                        <div className="text-[9.5px] text-slate-400 truncate">{sys.seriesName}</div>
                      </button>
                    );
                  })}
                </div>

                <div className="rounded-2xl bg-[#070d19] border border-slate-800/90 p-3">
                  <ShowcaseSystemAnimation
                    systemId={activeShowcase.id}
                    openness={showcaseOpenness}
                  />
                  <div className="mt-2 pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                    <span className="font-bold text-amber-400 tracking-wide">
                      {activeShowcase.mechanismLabel}
                    </span>
                    <span className="text-slate-400">{activeShowcase.mechanismNote}</span>
                  </div>
                </div>

                <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">
                      Aktif Seri: <strong className="text-white">{activeShowcase.seriesName}</strong>
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-amber-400">
                        Mekanik Açılım: %{Math.round(showcaseOpenness)}
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowcasePlaying(!showcasePlaying)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold"
                      >
                        {showcasePlaying ? (
                          <>
                            <Pause className="w-3 h-3 text-amber-400" /> Durdur
                          </>
                        ) : (
                          <>
                            <Play className="w-3 h-3 text-emerald-400" /> Oynat
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={showcaseOpenness}
                    onChange={(e) => {
                      setShowcasePlaying(false);
                      setShowcaseOpenness(Number(e.target.value));
                    }}
                    className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* BÖLÜM 2: CAM BALKON FİRMALARINA SAĞLADIĞIMIZ 6 BÜYÜK KOLAYLIK */}
          <section id="kolayliklar" className="max-w-7xl w-full mx-auto px-4 py-10 space-y-6">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-widest text-amber-400">
                NEDEN MARH-LAB YAZILIM?
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Cam Balkon Ustaları ve Bayileri İçin Tasarlanan Kolaylıklar
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Kağıt-kalem hesaplarına, yanlış metrajlara ve dağınık teklif dosyalarına son verin.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                {
                  icon: <Zap className="w-5 h-5 text-amber-400" />,
                  title: "30 Saniyede Hızlı Teklif & PDF",
                  desc: "Şantiyede ölçü alırken cep telefonundan veya bilgisayardan ölçüleri girin; anında firmanıza özel logolu PDF teklifinizi oluşturun.",
                },
                {
                  icon: <Compass className="w-5 h-5 text-sky-400" />,
                  title: "Otomatik ISO 128 & TS EN 12519 CAD Çizimi",
                  desc: "Katlanır kanat yönleri, giyotin sabit/hareketli cam bölmeleri ve sürme ray kademeleri girdiğiniz ölçülere göre otomatik çizilir.",
                },
                {
                  icon: <Calculator className="w-5 h-5 text-emerald-400" />,
                  title: "Sıfır Hata Maliyet & Kâr Marjı Hesabı",
                  desc: "Alüminyum kg fiyatı, 8mm/10mm/ısıcam farkları, profil rengi ve iskonto oranlarını otomatik hesaplayarak zarar etmenizi önler.",
                },
                {
                  icon: <Layers className="w-5 h-5 text-amber-400" />,
                  title: "Çoklu Balkon & Müteahhit Sepeti",
                  desc: "Tek teklif formuna salon balkonu, mutfak balkonu veya 30 dairelik toplu proje kalemlerini tek sepette ekleyip sunun.",
                },
                {
                  icon: <Smartphone className="w-5 h-5 text-sky-400" />,
                  title: "Tek Tıkla WhatsApp Müşteri Onayı",
                  desc: "Hazırladığınız teklifi WhatsApp üzerinden müşteriye gönderin; onaylanan işleri üretim ve montaj aşamalarıyla takip edin.",
                },
                {
                  icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
                  title: "Bulut Müşteri & Şantiye Arşivi",
                  desc: "Tüm müşterileriniz ve şantiye adresleriniz A'dan Z'ye güvenle saklanır; aynı müşteriye saniyeler içinde yeni şantiye teklifi açarsınız.",
                },
              ].map((card, i) => (
                <div
                  key={i}
                  className="bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-5 space-y-2.5 transition"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center">
                    {card.icon}
                  </div>
                  <h3 className="text-base font-bold text-white">{card.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{card.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* BÖLÜM 3: NASIL ÇALIŞIR? */}
          <section id="nasil-calisir" className="max-w-7xl w-full mx-auto px-4 py-8">
            <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  step: "01",
                  title: "Ölçü & Cam Balkon Serisini Girin",
                  desc: "Katlanır, Giyotin, Sürme veya Xena Isıcamlı seriyi seçip genişlik, yükseklik ve cam adedini yazın.",
                },
                {
                  step: "02",
                  title: "Otomatik CAD Çizim & Fiyat Hesaplansın",
                  desc: "Sistem m² alanını, kâr marjınızı ve ISO 128 teknik çizimini anında oluşturur.",
                },
                {
                  step: "03",
                  title: "Tek Sayfa A4 PDF & WhatsApp İle Gönderin",
                  desc: "Firmanızın logosu ve filigranıyla hazırlanan renkli teklif formunu tek tıkla müşteriye iletin.",
                },
              ].map((s, idx) => (
                <div key={idx} className="space-y-2">
                  <span className="inline-block text-xs font-black px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30">
                    ADIM {s.step}
                  </span>
                  <h3 className="text-base font-bold text-white">{s.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* BÖLÜM 4: ÜYELİK PAKETLERİ */}
          <section id="paketler" className="max-w-7xl w-full mx-auto px-4 py-10 space-y-6">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-widest text-amber-400">
                ŞEFFAF SAAS ÜYELİK MODELİ
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                İşletmenizin Ölçeğine Uygun Bulut Paketi Seçin
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                {
                  name: "Atölye Başlangıç",
                  badge: "Bireysel Ustalar İçin",
                  features: [
                    "Sınırsız Teklif & Dikey A4 PDF Çıktısı",
                    "Katlanır, Giyotin, Sürme & Isıcamlı Hesap",
                    "Otomatik ISO 128 Teknik Çizim",
                    "WhatsApp Teklif Özeti Paylaşımı",
                  ],
                  highlight: false,
                },
                {
                  name: "Profesyonel Bayi",
                  badge: "En Çok Tercih Edilen",
                  features: [
                    "Özel Firma Logosu & Arka Plan Filigranı",
                    "Çoklu Cephe / Müteahhit Sepet Modülü",
                    "Provizyon, Onay & Üretim Aşaması Takibi",
                    "A-Z Müşteri & Çoklu Şantiye Rehberi",
                  ],
                  highlight: true,
                },
                {
                  name: "Kurumsal Fabrika",
                  badge: "Çoklu Şube & Ekip",
                  features: [
                    "Çoklu Satış Temsilcisi Yetkilendirme",
                    "Özel Seri & Alüminyum Kg Maliyet Tanımlama",
                    "7/24 Öncelikli Teknik Destek & Kurulum",
                    "Bulut Yedekleme & Özel Antet Tasarımı",
                  ],
                  highlight: false,
                },
              ].map((pkg, idx) => (
                <div
                  key={idx}
                  className={`rounded-3xl p-6 flex flex-col justify-between space-y-5 border ${
                    pkg.highlight
                      ? "bg-slate-900 border-amber-400 shadow-2xl shadow-amber-500/10"
                      : "bg-slate-900/70 border-slate-800"
                  }`}
                >
                  <div className="space-y-3">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                        pkg.highlight
                          ? "bg-amber-500 text-slate-950"
                          : "bg-slate-800 text-slate-300"
                      }`}
                    >
                      {pkg.badge}
                    </span>
                    <h3 className="text-xl font-extrabold text-white">{pkg.name}</h3>
                    <ul className="space-y-2 pt-2">
                      {(Array.isArray(pkg?.features) ? pkg.features : []).map((feat, fIdx) => (
                        <li key={fIdx} className="flex items-center gap-2 text-xs text-slate-300">
                          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <a
                      href={`https://wa.me/905052766969?text=Merhaba%20MARH-LAB%20${encodeURIComponent(
                        pkg.name
                      )}%20paketi%20için%20kayıt%20ve%20bilgi%20almak%20istiyorum.`}
                      target="_blank"
                      rel="noreferrer"
                      className={`flex-1 text-center py-2.5 rounded-xl text-xs font-extrabold transition ${
                        pkg.highlight
                          ? "bg-amber-500 hover:bg-amber-400 text-slate-950"
                          : "bg-slate-800 hover:bg-slate-700 text-white"
                      }`}
                    >
                      Kayıt Ol / Bilgi Al
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <footer className="border-t border-slate-900 bg-slate-950/80 py-4 px-4">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
              <span>MARH-LAB Yazılım Teknolojileri • Cam Balkon &amp; Doğrama Bulut Çözümleri</span>
              <span className="font-semibold text-slate-300">
                Crafted &amp; Engineered by <span className="text-amber-400">ramelano</span> • MARH-LAB SaaS Architecture
              </span>
            </div>
          </footer>
        </div>
      )}

      {/* ==================================================================== */}
      {/* VIEW 2: ÜYE ÇALIŞMA ALANI (TEKLİF & 3D CAD STÜDYOSU)                 */}
      {/* ==================================================================== */}
      {viewMode === "member" && (
        <div className="no-print flex-1 flex flex-col justify-between">
          <div>
            <header className="max-w-[1440px] mx-auto px-3 sm:px-6 pt-4">
              <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center justify-center overflow-hidden shadow-md shrink-0">
                    {firmSettings.logoUrl ? (
                      <img
                        src={firmSettings.logoUrl}
                        alt={firmSettings.companyName}
                        className="w-full h-full object-contain bg-white p-1"
                      />
                    ) : (
                      <span className="text-sm">{firmSettings.companyName.slice(0, 2)}</span>
                    )}
                  </div>
                  <div>
                    <div className="font-extrabold text-sm text-white leading-tight">
                      {firmSettings.companyName}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Teklif, ISO CAD &amp; Müşteri Yönetimi
                    </div>
                  </div>
                </div>

                <nav className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => resetForNewQuote()}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 text-xs font-semibold transition"
                  >
                    <Plus className="w-3.5 h-3.5 text-amber-400" />
                    Yeni Teklif
                  </button>

                  <button
                    type="button"
                    onClick={() => setMemberTab("studio")}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                      memberTab === "studio"
                        ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                        : "text-slate-300 hover:bg-slate-800/70"
                    }`}
                  >
                    <Compass className="w-3.5 h-3.5" />
                    Teklif &amp; CAD Stüdyo
                  </button>

                  <button
                    type="button"
                    onClick={() => setMemberTab("pending")}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                      memberTab === "pending"
                        ? "bg-amber-500 text-slate-950 shadow-md"
                        : "text-slate-300 hover:bg-slate-800/70"
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    Provizyonda Bekleyenler
                    <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 text-[10px]">
                      {pendingQuotes.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMemberTab("approved")}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                      memberTab === "approved"
                        ? "bg-emerald-500 text-slate-950 shadow-md"
                        : "text-slate-300 hover:bg-slate-800/70"
                    }`}
                  >
                    <CheckCircle2
                      className={`w-3.5 h-3.5 ${
                        memberTab === "approved" ? "text-slate-950" : "text-emerald-400"
                      }`}
                    />
                    Onaylananlar
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                        memberTab === "approved"
                          ? "bg-slate-950/20 text-slate-950"
                          : "bg-emerald-500/20 text-emerald-300"
                      }`}
                    >
                      {approvedQuotes.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMemberTab("archive")}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                      memberTab === "archive"
                        ? "bg-amber-500 text-slate-950 shadow-md"
                        : "text-slate-300 hover:bg-slate-800/70"
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    Müşteri Arşivi (A-Z)
                  </button>

                  <button
                    type="button"
                    onClick={() => setMemberTab("settings")}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                      memberTab === "settings"
                        ? "bg-amber-500 text-slate-950 shadow-md"
                        : "text-slate-300 hover:bg-slate-800/70"
                    }`}
                  >
                    <Settings className="w-3.5 h-3.5" />
                    Ayarlar
                  </button>
                  <button
                    type="button"
                    onClick={() => setMemberTab("accounting")}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                      memberTab === "accounting" ? "bg-emerald-500 text-slate-950 shadow-md" : "text-slate-300 hover:bg-slate-800/70"
                    }`}
                  >
                    <WalletCards className="w-3.5 h-3.5" />
                    Genel Muhasebe
                  </button>
                </nav>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={syncLocalDataToCloud}
                    title={syncMessage || (isSupabaseConfigured ? "Firma ayarları, müşteriler, teklifler ve mali hareketleri Supabase ile eşitler. Bağlantı yoksa değişiklikler cihazda sıraya alınır." : "Supabase bağlantısı ayarlı değil. Veriler yerelde kalır; .env içinde VITE_SUPABASE_URL ve VITE_SUPABASE_ANON_KEY tanımlayın.")}
                    aria-label="Yerel firma verilerini Supabase ile eşitle. Bağlantı yoksa değişiklikler çevrimdışı kuyruğa alınır."
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition ${
                      syncState === "error" ? "bg-rose-500/10 border-rose-500/30 text-rose-300" :
                      syncState === "queued" ? "bg-amber-500/10 border-amber-500/30 text-amber-300" :
                      syncState === "synced" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300" :
                      "bg-slate-800 border-slate-700 text-slate-300"
                    }`}
                  >
                    <DatabaseBackup className="w-3.5 h-3.5" />
                    <span>Yerel Verileri Buluta Eşitle</span>
                    <span className="border-l border-current/30 pl-1.5 text-[10px] opacity-80">
                      {syncState === "syncing" ? "Eşitleniyor" : syncState === "synced" ? "Bulut eşitlendi" : syncState === "queued" ? "Kuyrukta" : syncState === "error" ? "Hata" : "Yerel mod"}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={openCurrentInPdf}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-300 text-xs font-semibold transition"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    A4 Teklif PDF
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("landing")}
                    title="Çıkış Yap"
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </header>

            {/* SEKME 1: TEKLİF & ISO CAD STÜDYOSU */}
            {memberTab === "studio" && (
              <div className="max-w-[1440px] mx-auto px-3 sm:px-6 py-5 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* SOL PANEL */}
                <div className="lg:col-span-6 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                        {editingQuoteId
                          ? `DÜZENLENİYOR (${orderCode})`
                          : `YENİ TEKLİF FORMU (${orderCode})`}
                      </span>
                      <h2 className="text-base font-bold text-white">
                        Mühendislik Maliyet &amp; Teklif Formu
                      </h2>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold">
                      {effectiveItems.length} Cephe /{" "}
                      {effectiveItems.reduce((total, item) => total + (Number.isFinite(Number(item?.quantity)) ? Number(item.quantity) : 0), 0)} Adet
                    </span>
                  </div>

                  {/* Cam Balkon Kategori Hapları */}
                  <div className="flex flex-wrap gap-1.5">
                    {SYSTEM_CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          setSelectedCategory(cat);
                          const firstInCat = SYSTEM_SERIES.find((s) => s.category === cat);
                          if (firstInCat) handleSelectSeries(firstInCat.id);
                        }}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition ${
                          selectedCategory === cat
                            ? "bg-amber-500/15 border-amber-400 text-amber-300"
                            : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Sipariş Kodu & Proje Adı */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Sipariş Kodu</label>
                      <input
                        type="text"
                        value={orderCode}
                        onChange={(e) => setOrderCode(e.target.value)}
                        className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs font-bold text-white focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Proje Adı</label>
                      <input
                        type="text"
                        value={projectTitle}
                        onChange={(e) => setProjectTitle(e.target.value)}
                        className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* AKILLI MÜŞTERİ ARAMA KUTUSU */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3.5">
                    <div className="relative">
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] text-slate-300 font-semibold">
                          Müşteri / Müteahhit Adı *
                        </label>
                        {selectedArchiveCustomer && (
                          <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded-full">
                            Arşivden
                            <button
                              type="button"
                              onClick={() => setSelectedArchiveCustomer(null)}
                              className="hover:text-white font-bold"
                            >
                              ×
                            </button>
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        value={customerName}
                        onFocus={() => setCustomerDropdownOpen(true)}
                        onChange={(e) => {
                          setCustomerName(e.target.value);
                          setSelectedArchiveCustomer(null);
                          setCustomerDropdownOpen(true);
                        }}
                        placeholder="İsim yazın..."
                        className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                      />
                      {customerDropdownOpen && matchingCustomers.length > 0 && (
                        <div className="absolute z-30 mt-1 w-full rounded-xl bg-slate-900 border border-slate-700 shadow-2xl max-h-44 overflow-y-auto">
                          {matchingCustomers.map((c) => (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => {
                                setCustomerName(c.name);
                                setCustomerPhone(c.phone);
                                setCustomerAddress("");
                                setSelectedArchiveCustomer(c);
                                setCustomerDropdownOpen(false);
                                showToast(
                                  `${c.name} seçildi — yeni şantiye adresini girebilirsiniz.`
                                );
                              }}
                              className="w-full text-left px-3 py-2 hover:bg-slate-800 flex items-center justify-between border-b border-slate-800 last:border-0"
                            >
                              <div>
                                <div className="text-xs font-bold text-white">{c.name}</div>
                                <div className="text-[10px] text-slate-400">{c.phone}</div>
                              </div>
                              <span className="text-[10px] bg-amber-500/15 text-amber-300 px-2 py-0.5 rounded">
                                + Yeni Şantiye
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-300 font-semibold mb-1">
                        Müşteri Telefon
                      </label>
                      <input
                        type="text"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="0532 000 00 00"
                        className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-300 font-semibold mb-1">
                        Şantiye / Teslimat Adresi
                      </label>
                      <input
                        type="text"
                        value={customerAddress}
                        onChange={(e) => setCustomerAddress(e.target.value)}
                        placeholder="İlçe / İl / Şantiye"
                        className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                      />
                      {selectedArchiveCustomer?.addresses?.length > 0 && !customerAddress && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {(Array.isArray(selectedArchiveCustomer.addresses) ? selectedArchiveCustomer.addresses : []).map((addr, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => setCustomerAddress(addr)}
                              className="text-[10px] text-amber-300/90 hover:text-amber-200 underline truncate max-w-full"
                            >
                              Eski adres: {addr}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* CEPHE / SİSTEM & ÖLÇÜ TANIMLA */}
                  <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                        CEPHE / SİSTEM &amp; ÖLÇÜ TANIMLA
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Tahmini Maliyet:{" "}
                        <strong className="text-slate-200">
                          ₺{activeSeriesObj.baseCostPerM2.toLocaleString("tr-TR")}/m²
                        </strong>
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">
                          Cephe / Bölüm Adı
                        </label>
                        <input
                          type="text"
                          value={facadeName}
                          onChange={(e) => setFacadeName(e.target.value)}
                          className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">
                          Sistem / Profil Serisi
                        </label>
                        <select
                          value={selectedSeriesId}
                          onChange={(e) => handleSelectSeries(e.target.value)}
                          className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 text-xs text-white"
                        >
                          {SYSTEM_SERIES.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Genişlik (cm)</label>
                        <input
                          type="number"
                          value={widthCm}
                          onChange={(e) => setWidthCm(Number(e.target.value))}
                          className="w-full rounded-xl bg-slate-900 border border-slate-800 px-2.5 py-2 text-xs font-bold text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">
                          Yükseklik (cm)
                        </label>
                        <input
                          type="number"
                          value={heightCm}
                          onChange={(e) => setHeightCm(Number(e.target.value))}
                          className="w-full rounded-xl bg-slate-900 border border-slate-800 px-2.5 py-2 text-xs font-bold text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">
                          {activeSeriesObj.mechType === "giyotin"
                            ? "Yatay Cam Adedi"
                            : "Kanat / Cam Adedi"}
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="14"
                          value={panels}
                          onChange={(e) => setPanels(Math.max(1, Number(e.target.value)))}
                          className="w-full rounded-xl bg-slate-900 border border-slate-800 px-2.5 py-2 text-xs font-bold text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">
                          Köşe Dönüş Açısı
                        </label>
                        <select
                          value={angleDeg}
                          onChange={(e) => setAngleDeg(Number(e.target.value))}
                          className="w-full rounded-xl bg-slate-900 border border-slate-800 px-2 py-2 text-xs text-white"
                        >
                          {ANGLE_OPTIONS.map((a) => (
                            <option key={a.value} value={a.value}>
                              {a.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div><label className="block text-[11px] text-slate-400 mb-1">Kanat Toplanma Yönü</label><select value={openingDirection} onChange={e=>setOpeningDirection(e.target.value)} className="w-full rounded-xl bg-slate-900 border border-slate-800 px-2 py-2 text-xs text-white"><option>Sola Toplanır</option><option>Sağa Toplanır</option><option>Ortadan İki Yana</option></select></div>
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Adet</label>
                        <input
                          type="number"
                          min="1"
                          value={quantity}
                          onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                          className="w-full rounded-xl bg-slate-900 border border-slate-800 px-2.5 py-2 text-xs font-bold text-amber-300"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Cam Tipi</label>
                        <select
                          value={glassType}
                          onChange={(e) => setGlassType(e.target.value)}
                          className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 text-xs text-white"
                        >
                          {GLASS_OPTIONS.map((g) => (
                            <option key={g.id} value={g.id}>
                              {g.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Cam Rengi</label>
                        <select
                          value={glassColor}
                          onChange={(e) => setGlassColor(e.target.value)}
                          className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 text-xs text-white"
                        >
                          {GLASS_COLORS.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">
                          Alüminyum Profil Rengi
                        </label>
                        <select
                          value={aluminumColor}
                          onChange={(e) => setAluminumColor(e.target.value)}
                          className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 text-xs text-white"
                        >
                          {ALUMINUM_COLORS.map((col) => (
                            <option key={col.id} value={col.id}>
                              {col.id}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center pt-1">
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">
                          m² Satış Birim Fiyatı (₺)
                        </label>
                        <input
                          type="number"
                          value={customUnitPrice}
                          onChange={(e) => setCustomUnitPrice(Number(e.target.value))}
                          className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 text-xs font-bold text-white"
                        />
                      </div>
                      <div className="pt-4">
                        <IOSSwitch
                          checked={motorized}
                          onChange={setMotorized}
                          label="Motorlu / Kumandalı Sistem"
                          sublabel="Çizimde üst motor kutusu & zincir tahrik gösterilir"
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
                      <span className="text-xs text-slate-300">
                        Bu Kalem: <strong>{currentDraftItem.areaM2.toFixed(2)} m²</strong> ={" "}
                        <strong className="text-amber-400">
                          ₺{currentDraftItem.total.toLocaleString("tr-TR")}
                        </strong>
                      </span>
                      <button
                        type="button"
                        onClick={addCurrentFacadeToBasket}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-amber-300 transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Cephe / Sistem Sepete Ekle
                      </button>
                    </div>
                  </div>

                  <div className="bg-slate-900 border border-amber-500/25 rounded-2xl p-4 space-y-3"><div className="flex items-center justify-between"><h3 className="text-sm font-extrabold text-amber-400">Şantiye Mesafe, Ekip Masrafı & Hedef Net Kâr</h3><button onClick={()=>setSiteMode(!siteMode)} className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs text-sky-300">{siteMode?"Şantiye Hızlı Mod: Açık":"Standart Görünüm / Şantiye Hızlı Mod"}</button></div><div className="grid grid-cols-2 md:grid-cols-5 gap-2"><label className="text-[11px] text-slate-400">Montaj Şehri<select value={siteCity} onChange={e=>{setSiteCity(e.target.value);const c=(firmSettings.cityTariffs||[]).find(x=>x.city===e.target.value);if(c){setTravelCost(Number(c.travel)||0);if(c.unitPrice>0)setCustomUnitPrice(Number(c.unitPrice));}}} className="mt-1 w-full rounded-lg bg-slate-950 border border-slate-800 px-2 py-2 text-xs text-white">{(firmSettings.cityTariffs||[]).map(c=><option key={c.city}>{c.city}</option>)}</select></label><label className="text-[11px] text-slate-400">Yol / Nakliye ₺<input type="number" value={travelCost} onChange={e=>setTravelCost(Number(e.target.value))} className="mt-1 w-full rounded-lg bg-slate-950 border border-slate-800 px-2 py-2 text-xs text-white"/></label><label className="text-[11px] text-slate-400">Eleman Sayısı<input type="number" min="1" value={teamSize} onChange={e=>setTeamSize(Number(e.target.value))} className="mt-1 w-full rounded-lg bg-slate-950 border border-slate-800 px-2 py-2 text-xs text-white"/></label><label className="text-[11px] text-slate-400">Montaj Süresi (Gün)<input type="number" min="1" value={workDays} onChange={e=>setWorkDays(Number(e.target.value))} className="mt-1 w-full rounded-lg bg-slate-950 border border-slate-800 px-2 py-2 text-xs text-white"/></label><div className="text-[11px] text-slate-400">Toplam Ekip Masrafı <div className="mt-2 text-sm font-bold text-sky-300">₺{(teamSize*workDays*Number(firmSettings.dailyAllowance||0)).toLocaleString("tr-TR")}</div></div></div><div className="flex flex-wrap gap-2 items-center"><button onClick={()=>setPriceMode(priceMode==="unit"?"target":"unit")} className="rounded-lg bg-slate-800 px-3 py-2 text-xs text-white">Mod: {priceMode==="unit"?"Birim Fiyat / Kâr (%)":"Hedef Net Kâr (₺)"} • Değiştir</button>{priceMode==="target"?<label className="text-xs text-slate-300">Hedef net kâr ₺ <input type="number" value={targetProfit} onChange={e=>setTargetProfit(Number(e.target.value))} className="ml-2 w-36 rounded-lg bg-slate-950 border border-slate-800 px-2 py-1.5 text-white"/></label>:null}<div className="text-xs text-slate-300">{(()=>{const cost=activeSeriesObj.baseCostPerM2*currentDraftItem.areaM2+travelCost+teamSize*workDays*Number(firmSettings.dailyAllowance||0);const profit=currentDraftItem.total-cost;return <>Toplam iç maliyet ₺{cost.toLocaleString("tr-TR")} • Net kâr ₺{profit.toLocaleString("tr-TR")} • Net marj %{(currentDraftItem.total?profit/currentDraftItem.total*100:0).toFixed(1)}</>;})()} <span className="text-slate-500">(müşteri belgesinde gösterilmez)</span></div>{priceMode==="target"&&<button onClick={()=>{const costs=activeSeriesObj.baseCostPerM2*currentDraftItem.areaM2+travelCost+teamSize*workDays*Number(firmSettings.dailyAllowance||0);setCustomUnitPrice(Math.ceil((costs+targetProfit)/Math.max(.01,currentDraftItem.areaM2)));}} className="rounded-lg bg-amber-500 px-3 py-2 text-xs font-bold text-slate-950">Hedefi Fiyata Uygula</button>}</div></div>
                  {/* SEPETTEKİ ÇOKLU CEPHE KALEMLERİ */}
                  {basketItems.length > 0 && (
                    <div className="bg-slate-950/80 border border-amber-500/30 rounded-2xl p-3.5 space-y-2">
                      <div className="text-[11px] font-bold text-amber-400 uppercase">
                        Teklif Sepetindeki Cepheler ({basketItems.length} Kalem)
                      </div>
                      {basketItems.map((it, idx) => {
                        const rowM2 = (it.widthCm * it.heightCm * it.quantity) / 10000;
                        const rowTotal = Math.round(rowM2 * it.unitPrice);
                        return (
                          <div
                            key={it.id}
                            className="flex items-center justify-between gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs"
                          >
                            <div>
                              <div className="font-bold text-white">
                                {idx + 1}. {it.facadeName} — {it.seriesName}
                              </div>
                              <div className="text-[11px] text-slate-400">
                                {it.widthCm}×{it.heightCm} cm ({it.panels} Cam) • {it.aluminumColor} •{" "}
                                {rowM2.toFixed(2)} m²
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-amber-400">
                                ₺{rowTotal.toLocaleString("tr-TR")}
                              </span>
                              <button type="button" onClick={() => { setEditingQuoteId(it.id); setFacadeName(it.facadeName); setSelectedSeriesId(it.seriesId); setWidthCm(it.widthCm); setHeightCm(it.heightCm); setPanels(it.panels); setAngleDeg(it.angleDeg||0); setQuantity(it.quantity||1); setGlassType(it.glassType); setGlassColor(it.glassColor); setAluminumColor(it.aluminumColor); setMotorized(!!it.motorized); setCustomUnitPrice(it.unitPrice); setOpeningDirection(it.openingDirection||"Sola Toplanır"); setBasketItems(prev=>prev.filter(x=>x.id!==it.id)); }} className="text-sky-300 hover:text-white p-1">Düzenle</button>
                              <button
                                type="button"
                                onClick={() =>
                                  setBasketItems((prev) => prev.filter((x) => x.id !== it.id))
                                }
                                className="text-rose-400 hover:text-rose-300 p-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* GEÇERLİLİK SÜRESİ & KDV */}
                  <div className="space-y-3 bg-slate-950/60 border border-slate-800 rounded-2xl p-3.5">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <IOSSwitch
                        checked={showValidity}
                        onChange={setShowValidity}
                        label="Teklif Geçerlilik Süresi Yazsın"
                      />
                      <IOSSwitch
                        checked={vatIncluded}
                        onChange={setVatIncluded}
                        label={`KDV Dahil Hesapla (%${firmSettings.vatRate})`}
                      />
                    </div>

                    {showValidity && (
                      <div className="flex flex-wrap gap-1.5">
                        {VALIDITY_PILLS.map((d) => (
                          <button
                            key={d}
                            type="button"
                            onClick={() => setValidityDays(d)}
                            className={`px-3 py-1 rounded-full text-xs font-bold border transition ${
                              validityDays === d
                                ? "bg-amber-500/20 border-amber-400 text-amber-300"
                                : "bg-slate-900 border-slate-800 text-slate-400"
                            }`}
                          >
                            {d} Gün
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-start">
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] text-slate-400 mb-1">
                          Teklif Şartları
                        </label>
                        <textarea
                          rows={3}
                          value={quoteTerms}
                          onChange={(e) => setQuoteTerms(e.target.value)}
                          className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">İskonto (%)</label>
                        <input
                          type="number"
                          min="0"
                          max="60"
                          value={discountPercent}
                          onChange={(e) => setDiscountPercent(Number(e.target.value))}
                          className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 text-xs font-bold text-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* FİNANSAL ÖZET & KAYDET / ONAYLA BUTONLARI */}
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 grid grid-cols-3 gap-3">
                    <div>
                      <div className="text-[10px] text-slate-400">Toplam Alan</div>
                      <div className="text-sm font-extrabold text-white">
                        {financialSummary.totalArea.toFixed(2)} m²
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400">Ara Toplam</div>
                      <div className="text-sm font-extrabold text-white">
                        ₺{financialSummary.subtotal.toLocaleString("tr-TR")}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400">Genel Toplam</div>
                      <div className="text-base font-black text-amber-400">
                        ₺{financialSummary.grandTotal.toLocaleString("tr-TR")}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => saveQuote("pending")}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-amber-300 transition"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        Provizyona Kaydet
                      </button>
                      <button
                        type="button"
                        onClick={() => saveQuote("approved")}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-extrabold transition"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Onayla
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={copyWhatsAppSummary}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-bold transition"
                    >
                      <Send className="w-3.5 h-3.5" />
                      WhatsApp Özeti
                    </button>
                  </div>
                </div>

                {/* SAĞ PANEL: CANLI RENKLİ TEKLİF FORMU & ISO 128 CAD ÇİZİM ÖNİZLEMESİ */}
                <div className="lg:col-span-6 space-y-4 sticky top-4">
                  <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-400">
                        Canlı Teklif Formu &amp; ISO 128 CAD Önizleme
                      </span>
                      <button
                        type="button"
                        onClick={openCurrentInPdf}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold transition shadow-lg shadow-amber-500/20"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        Tek Sayfa A4 PDF Aç / Yazdır
                      </button>
                    </div>

                    {/* Görsel 2 Formatında Renkli Kurumsal Önizleme Kartı */}
                    <div className="bg-white text-slate-900 rounded-xl p-4 shadow-inner space-y-3 text-xs relative overflow-hidden">
                      <DynamicFirmWatermark
                        logoUrl={firmSettings.logoUrl}
                        watermarkText={firmSettings.watermarkText || firmSettings.companyName}
                      />

                      {/* Üst Antet */}
                      <div className="relative z-10 flex justify-between items-start">
                        <div className="text-[10.5px] leading-snug">
                          <div className="font-black text-sm text-slate-900 uppercase">
                            {firmSettings.companyName}
                          </div>
                          <div className="text-slate-700 font-semibold">{firmSettings.phone}</div>
                          <div className="text-slate-700 font-semibold uppercase">
                            {firmSettings.ownerName}
                          </div>
                        </div>

                        <div className="text-center">
                          <div className="font-black text-sm tracking-wide text-slate-900">
                            TEKLİF FORMU
                          </div>
                          <div className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded mt-0.5">
                            {orderCode}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center font-black text-sm overflow-hidden shadow">
                            {firmSettings.logoUrl ? (
                              <img
                                src={firmSettings.logoUrl}
                                alt="Logo"
                                className="w-full h-full object-contain bg-white p-0.5"
                              />
                            ) : (
                              firmSettings.companyName.slice(0, 2)
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Renkli Proje Detay Tablosu */}
                      <div className="relative z-10 border border-slate-300 rounded overflow-hidden">
                        <div className="bg-slate-800 text-amber-300 text-center font-extrabold text-[10px] py-1 tracking-wider">
                          PROJE DETAY
                        </div>
                        <table className="w-full text-[10px] border-collapse">
                          <thead>
                            <tr className="bg-slate-100 border-b border-slate-300 text-slate-800">
                              <th className="py-1 px-2 text-left border-r border-slate-300">
                                SİSTEM ADI
                              </th>
                              <th className="py-1 px-2 text-center border-r border-slate-300 w-12">
                                ADET
                              </th>
                              <th className="py-1 px-2 text-right border-r border-slate-300 w-16">
                                ALAN
                              </th>
                              <th className="py-1 px-2 text-right w-24">TOPLAM</th>
                            </tr>
                          </thead>
                          <tbody>
                            {effectiveItems.map((it, idx) => {
                              const m2 = (it.widthCm * it.heightCm * it.quantity) / 10000;
                              const rowT = Math.round(m2 * it.unitPrice);
                              return (
                                <tr
                                  key={it.id || idx}
                                  className="bg-amber-50/80 border-b border-slate-300"
                                >
                                  <td className="py-1.5 px-2 border-r border-slate-300">
                                    <div className="font-bold text-slate-900">
                                      {idx + 1}. {it.seriesName}
                                    </div>
                                    <div className="text-[9px] text-slate-600">
                                      * {it.glassColor} {it.glassShortLabel || it.glassType} • *{" "}
                                      {it.aluminumColor}
                                    </div>
                                  </td>
                                  <td className="py-1.5 px-2 text-center border-r border-slate-300 font-bold">
                                    {it.quantity}
                                  </td>
                                  <td className="py-1.5 px-2 text-right border-r border-slate-300 font-bold">
                                    {m2.toFixed(2)} m²
                                  </td>
                                  <td className="py-1.5 px-2 text-right font-extrabold text-slate-900">
                                    ₺{rowT.toLocaleString("tr-TR")}
                                  </td>
                                </tr>
                              );
                            })}
                            <tr className="bg-slate-900 text-white font-extrabold">
                              <td colSpan={2} className="py-1 px-2 text-right text-amber-300">
                                TOPLAM ALAN: {financialSummary.totalArea.toFixed(2)} m²
                              </td>
                              <td className="py-1 px-2 text-right text-[9.5px]">TOPLAM TUTAR</td>
                              <td className="py-1 px-2 text-right text-amber-400">
                                ₺{financialSummary.grandTotal.toLocaleString("tr-TR")}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      {/* ISO 128 & TS EN 12519 Canlı CAD Çizimi */}
                      <div className="relative z-10">
                        <ISOTechnicalCADDrawing items={effectiveItems} />
                      </div>
                    </div>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                    <div className="text-xs font-bold text-amber-400 uppercase">Çöp Kutusu & Veri Yedeği</div>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={exportBackup} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-300 text-xs font-bold"><Download className="w-3.5 h-3.5" /> JSON Dışa Aktar</button>
                      <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-bold cursor-pointer"><DatabaseBackup className="w-3.5 h-3.5" /> JSON İçe Aktar<input type="file" accept="application/json" onChange={importBackup} className="hidden" /></label>
                      <button type="button" onClick={() => { trash.forEach(item => { if (item.type === "quote") setQuotes(prev => [item.data, ...prev]); }); setTrash([]); showToast("Çöp kutusu geri yüklendi."); }} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold"><Trash2 className="w-3.5 h-3.5" /> Geri Yükle ({trash.length})</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SEKME 2: PROVİZYONDA BEKLEYENLER */}
            {memberTab === "pending" && (
              <div className="max-w-[1440px] mx-auto px-3 sm:px-6 py-6 space-y-4">
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                      MÜŞTERİ ONAYI BEKLEYEN TEKLİFLER
                    </span>
                    <h2 className="text-lg font-bold text-white">
                      Provizyonda Bekleyenler ({pendingQuotes.length} Kayıt)
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => resetForNewQuote()}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold"
                  >
                    <Plus className="w-4 h-4" />
                    Yeni Teklif Oluştur
                  </button>
                </div>

                {pendingQuotes.length === 0 ? (
                  <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-10 text-center text-sm text-slate-400">
                    Provizyonda bekleyen teklif bulunmuyor.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pendingQuotes.map((q) => {
                      const total = (Array.isArray(q?.items) ? q.items : []).reduce(
                        (a, it) =>
                          a +
                          Math.round(
                            ((it.widthCm * it.heightCm * it.quantity) / 10000) * it.unitPrice
                          ),
                        0
                      );
                      return (
                        <div
                          key={q.id}
                          className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-lg"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <span className="text-xs font-extrabold text-amber-400">
                                {q.orderCode}
                              </span>
                              <h3 className="text-base font-bold text-white">{q.customerName}</h3>
                              <p className="text-xs text-slate-400">
                                {q.projectTitle} • {q.customerAddress || "Adres belirtilmedi"}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="text-base font-black text-white">
                                ₺{total.toLocaleString("tr-TR")}
                              </div>
                              <div className="text-[11px] text-slate-400">{q.date}</div>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-800">
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setPdfIncludePage2(false);
                                  setPdfQuote(q);
                                }}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white"
                              >
                                <Printer className="w-3.5 h-3.5 text-amber-400" />
                                A4 PDF
                              </button>
                              <button
                                type="button"
                                onClick={() => loadQuoteIntoStudio(q)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                Düzenle
                              </button>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => approvePendingQuote(q.id)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Onayla
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setConfirmDialog({
                                    title: "Provizyon Kaydını Sil",
                                    message: `${q.orderCode} (${q.customerName}) teklifini silmek istediğinize emin misiniz?`,
                                    onConfirm: () => {
                                      setQuotes((prev) => prev.filter((item) => item.id !== q.id));
                                      setTrash((prev) => [...prev, { type: "quote", deletedAt: new Date().toISOString(), data: q }]);
                                      showToast(`${q.orderCode} çöp kutusuna taşındı.`);
                                    },
                                  })
                                }
                                className="p-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-400"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* SEKME 3: ONAYLANANLAR */}
            {memberTab === "approved" && (
              <div className="max-w-[1440px] mx-auto px-3 sm:px-6 py-6 space-y-4">
                <div className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                      ONAYLANMIŞ &amp; İMALATA ALINAN İŞLER
                    </span>
                    <h2 className="text-lg font-bold text-white">
                      Onaylanan Teklifler ({approvedQuotes.length} Aktif İş)
                    </h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <input value={approvedSearch} onChange={(e) => setApprovedSearch(e.target.value)} placeholder="Müşteri / teklif ara" className="rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-white" />
                    <select value={approvedStage} onChange={(e) => setApprovedStage(e.target.value)} className="rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-white"><option>Tümü</option><option>Üretimde</option><option>Montajda</option><option>Teslim Edildi</option></select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[['Toplam Ciro', approvedQuotes.reduce((a,q)=>a+quoteTotal(q),0)], ['Tahsil Edilen', approvedQuotes.reduce((a,q)=>a+Number(q.deposit || 0),0)], ['Kalan Alacak', approvedQuotes.reduce((a,q)=>a+Math.max(0,quoteTotal(q)-Number(q.deposit || 0)),0)]].map(([label,value]) => <div key={label} className="bg-slate-900 border border-slate-800 rounded-2xl p-4"><div className="text-[11px] font-bold text-slate-400 uppercase">{label}</div><div className="text-xl font-black text-emerald-400 mt-1">₺{Number(value).toLocaleString("tr-TR")}</div></div>)}
                </div>

                {approvedQuotes.length === 0 ? (
                  <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-10 text-center text-sm text-slate-400">
                    Henüz onaylanmış teklif kaydı yok.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {approvedQuotes.filter((q) => (approvedStage === "Tümü" || (q.productionStage || "Üretimde") === approvedStage) && `${q.orderCode} ${q.customerName}`.toLocaleLowerCase("tr").includes(approvedSearch.toLocaleLowerCase("tr"))).map((q) => {
                      const total = (Array.isArray(q?.items) ? q.items : []).reduce(
                        (a, it) =>
                          a +
                          Math.round(
                            ((it.widthCm * it.heightCm * it.quantity) / 10000) * it.unitPrice
                          ),
                        0
                      );
                      return (
                        <div
                          key={q.id}
                          className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-lg"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-extrabold text-emerald-400">
                                  {q.orderCode}
                                </span>
                                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 text-[10px] font-bold">
                                  Onaylandı
                                </span>
                              </div>
                              <h3 className="text-base font-bold text-white mt-0.5">
                                {q.customerName}
                              </h3>
                              <p className="text-xs text-slate-400">
                                {q.projectTitle} • {q.customerAddress || "Şantiye adresi yok"}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="text-base font-black text-emerald-400">
                                ₺{total.toLocaleString("tr-TR")}
                              </div>
                              <div className="text-[11px] text-slate-400">{q.date}</div>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-800">
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setPdfIncludePage2(false);
                                  setPdfQuote(q);
                                }}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-xs font-bold text-sky-300"
                              >
                                <Printer className="w-3.5 h-3.5" />
                                A4 PDF Aç / Yazdır
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  resetForNewQuote({
                                    name: q.customerName,
                                    phone: q.customerPhone,
                                    addresses: q.customerAddress ? [q.customerAddress] : [],
                                  })
                                }
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-xs font-bold text-amber-300"
                              >
                                <Copy className="w-3.5 h-3.5" />
                                Aynı Müşteriye Yeni Teklif
                              </button>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                              <input type="number" min="0" value={q.deposit || 0} onChange={(e) => setQuotes(prev => prev.map(x => x.id === q.id ? { ...x, deposit: Number(e.target.value) } : x))} placeholder="Kapora ₺" className="w-24 rounded-lg bg-slate-950 border border-slate-700 px-2 py-1.5 text-xs text-white" />
                              <a href={whatsappHref(q)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold"><MessageCircle className="w-3.5 h-3.5" /> WhatsApp</a>
                              <button type="button" onClick={() => setCuttingQuote(q)} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-sky-500/15 border border-sky-500/30 text-sky-300 text-xs font-bold"><Layers className="w-3.5 h-3.5" /> Kesim Listesi</button>
                            </div>
                            <select
                              value={q.productionStage || "Üretimde"}
                              onChange={(e) => updateProductionStage(q.id, e.target.value)}
                              className="rounded-lg bg-slate-950 border border-slate-700 px-2.5 py-1.5 text-xs font-semibold text-slate-200"
                            >
                              <option value="Üretimde">🔨 Üretimde</option>
                              <option value="Montajda">🚚 Montajda</option>
                              <option value="Teslim Edildi">✅ Teslim Edildi</option>
                            </select>
                            <button type="button" onClick={() => unapproveQuote(q.id)} className="inline-flex items-center gap-1 rounded-lg bg-amber-500/10 border border-amber-500/25 px-2.5 py-1.5 text-[11px] font-bold text-amber-300">
                              <Clock className="w-3.5 h-3.5" /> Onayı Kaldır / Bekleyene Al
                            </button>
                            <button type="button" onClick={() => moveQuoteToTrash(q)} className="inline-flex items-center gap-1 rounded-lg bg-rose-500/10 border border-rose-500/25 px-2.5 py-1.5 text-[11px] font-bold text-rose-300">
                              <Trash2 className="w-3.5 h-3.5" /> Sil (Çöp Kutusuna Taşı)
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* SEKME 4: MÜŞTERİ ARŞİVİ */}
            {memberTab === "archive" && (
              <div className="max-w-[1440px] mx-auto px-3 sm:px-6 py-6 space-y-4">
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                      ALFABETİK CARİ &amp; ŞANTİYE REHBERİ
                    </span>
                    <h2 className="text-lg font-bold text-white">
                      Müşteri Arşivi (A → Z Sıralı • {visibleCustomers.length} Kayıt)
                    </h2>
                  </div>
                  <div className="relative min-w-[240px]">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                    <input value={customerSearch} onChange={(e) => setCustomerSearch(e.target.value)} placeholder="Ad, telefon, adres veya ilçe ara" className="w-full rounded-xl bg-slate-950 border border-slate-700 py-2 pl-9 pr-3 text-xs text-white focus:border-amber-500 focus:outline-none" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {visibleCustomers.map((c) => (
                    <div
                      key={c.id}
                      className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-3"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-bold text-white">{c.name}</h3>
                          <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full">
                            {(Array.isArray(c.addresses) ? c.addresses : []).length} Şantiye
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-amber-400" />
                          {c.phone || "Telefon yok"}
                        </div>
                        {(Array.isArray(c.addresses) ? c.addresses : []).map((addr, idx) => (
                          <div
                            key={idx}
                            className="text-[11px] text-slate-400 flex items-start gap-1.5"
                          >
                            <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                            <span>{addr}</span>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-2">
                        <button type="button" onClick={() => resetForNewQuote(c)} className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-bold transition">
                          <Plus className="w-3.5 h-3.5" /> Bu Müşteriye Yeni Teklif Hazırla
                        </button>
                        <div className="grid grid-cols-2 gap-2">
                          <button type="button" onClick={() => { setFinanceCustomer(c); setFinanceKind("income"); setFinanceDate(new Date().toISOString().slice(0, 10)); }} className="inline-flex items-center justify-center gap-1 rounded-xl bg-sky-500/10 border border-sky-500/25 px-2 py-2 text-[11px] font-bold text-sky-300">
                            <WalletCards className="w-3.5 h-3.5" /> Mali İşlemler
                          </button>
                          <button type="button" onClick={() => deleteCustomer(c)} className="inline-flex items-center justify-center gap-1 rounded-xl bg-rose-500/10 border border-rose-500/25 px-2 py-2 text-[11px] font-bold text-rose-300">
                            <Trash2 className="w-3.5 h-3.5" /> Müşteriyi Sil
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {memberTab === "accounting" && (
              <div className="max-w-[1440px] mx-auto px-3 sm:px-6 py-6 space-y-4">
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">KASA, TAHSİLAT &amp; MÜŞTERİ ALACAKLARI</span>
                    <h2 className="text-lg font-bold text-white">Genel Muhasebe</h2>
                    <p className="text-xs text-slate-400 mt-1">Onaylı teklifler ve müşteri mali hareketleri bu özetlere anında yansır.</p>
                  </div>
                </div>
                {!financeCloudEnabled && isSupabaseConfigured && (
                  <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-200">
                    Bulut muhasebe tablosu henüz hazır değil; bu cihazdaki hareketler kaybolmadan yerel kaydediliyor. Çoklu cihaz eşitlemesi için ZIP içindeki <code>supabase/member-finance.sql</code> dosyasını Supabase SQL Editor&apos;da çalıştırın.
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                  {[
                    ["Kasa / Net Nakit Durumu", netCash, "income"],
                    ["Toplam Tahsilat (Giren)", totalReceived, "income"],
                    ["Toplam Gider / İade & Ödeme", totalOutgoings, "expense"],
                    ["Toplam Müşteri Alacağı", overallReceivables, "receivable"],
                  ].map(([label, value, type]) => (
                    <div key={label} className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                      <div className="text-[11px] font-bold text-slate-400 uppercase">{label}</div>
                      <div className={`text-xl font-black mt-1 ${type === "expense" ? "text-rose-300" : type === "receivable" ? "text-amber-300" : "text-emerald-400"}`}>₺{Number(value).toLocaleString("tr-TR")}</div>
                    </div>
                  ))}
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <h3 className="text-sm font-bold text-amber-400">Genel Gider / Tahsilat / Düzeltme Ekle</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2">
                    <select value={ledgerKind} onChange={(e) => setLedgerKind(e.target.value)} className="rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-white">
                      <option value="expense">Gider / Ödeme (çıkan)</option><option value="income">Tahsilat (giren)</option><option value="refund">İade (çıkan)</option><option value="adjustment_in">Düzeltme (giren)</option><option value="adjustment_out">Düzeltme (çıkan)</option>
                    </select>
                    <input type="number" min="0.01" step="0.01" value={ledgerAmount} onChange={(e) => setLedgerAmount(e.target.value)} placeholder="Tutar ₺" className="rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-white" />
                    <input type="date" value={ledgerDate} onChange={(e) => setLedgerDate(e.target.value)} className="rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-white" />
                    <select value={ledgerCustomerName} onChange={(e) => setLedgerCustomerName(e.target.value)} className="rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-white"><option value="">Müşteri ilişkilendirme (isteğe bağlı)</option>{sortedCustomers.map((customer) => <option key={customer.id} value={customer.name}>{customer.name}</option>)}</select>
                    <input value={ledgerDescription} onChange={(e) => setLedgerDescription(e.target.value)} placeholder="Açıklama" className="rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-white" />
                    <button type="button" onClick={saveGeneralLedgerEntry} className="rounded-xl bg-amber-500 px-3 py-2 text-xs font-extrabold text-slate-950">Hareketi Kaydet</button>
                  </div>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="text-sm font-bold text-white">Muhasebe Hareket Defteri</h3><div className="flex flex-wrap gap-2">
                    <select value={ledgerTypeFilter} onChange={(e) => setLedgerTypeFilter(e.target.value)} className="rounded-lg bg-slate-950 border border-slate-700 px-2.5 py-2 text-xs text-white"><option value="all">Tüm hareketler</option><option value="income">Tahsilat</option><option value="expense">Gider / Ödeme</option><option value="refund">İade</option><option value="adjustment_in">Düzeltme (giren)</option><option value="adjustment_out">Düzeltme (çıkan)</option></select>
                    <select value={ledgerCustomerFilter} onChange={(e) => setLedgerCustomerFilter(e.target.value)} className="rounded-lg bg-slate-950 border border-slate-700 px-2.5 py-2 text-xs text-white"><option value="all">Tüm müşteriler</option>{[...new Set(allFinanceEntries.map((entry) => entry.customerName).filter(Boolean))].map((name) => <option key={name} value={name}>{name}</option>)}</select>
                    <input type="date" value={ledgerDateFilter} onChange={(e) => setLedgerDateFilter(e.target.value)} className="rounded-lg bg-slate-950 border border-slate-700 px-2.5 py-2 text-xs text-white" />
                  </div></div>
                  <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-xs"><thead><tr className="border-b border-slate-700 text-left text-slate-400"><th className="p-2">Tarih</th><th className="p-2">Tür</th><th className="p-2">Müşteri</th><th className="p-2">Teklif</th><th className="p-2">Açıklama</th><th className="p-2 text-right">Tutar</th><th className="p-2" /></tr></thead><tbody>
                    {filteredLedger.map((entry) => <tr key={entry.id} className="border-b border-slate-800"><td className="p-2 text-slate-300">{entry.date || "—"}</td><td className="p-2 text-slate-200">{{ income: "Tahsilat", expense: "Gider / Ödeme", refund: "İade", adjustment_in: "Düzeltme (giren)", adjustment_out: "Düzeltme (çıkan)" }[entry.kind] || entry.kind}</td><td className="p-2 text-slate-300">{entry.customerName || "Genel"}</td><td className="p-2 text-slate-400">{entry.quoteCode || "—"}</td><td className="p-2 text-slate-400">{entry.description}</td><td className={`p-2 text-right font-bold ${signedFinanceAmount(entry) >= 0 ? "text-emerald-300" : "text-rose-300"}`}>{signedFinanceAmount(entry) >= 0 ? "+" : "−"}₺{Number(entry.amount).toLocaleString("tr-TR")}</td><td className="p-2 text-right"><button type="button" title="Hareketi sil" onClick={() => deleteFinanceEntry(entry)} className="rounded-lg p-1.5 text-rose-300 hover:bg-rose-500/10"><Trash2 className="w-3.5 h-3.5" /></button></td></tr>)}
                    {!filteredLedger.length && <tr><td colSpan={7} className="p-6 text-center text-slate-500">Filtrelere uygun mali hareket bulunamadı.</td></tr>}
                  </tbody></table></div>
                </div>
              </div>
            )}

            {/* SEKME 5: AYARLAR */}
            {memberTab === "settings" && (
              <div className="max-w-5xl mx-auto px-3 sm:px-6 py-6 space-y-5">
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                      FİRMA KİMLİĞİ, LOGO &amp; PDF FİLİGRAN AYARLARI
                    </span>
                    <h2 className="text-lg font-bold text-white">
                      Sistem, Birim Fiyat ve Kurumsal Marka Ayarları
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => showToast("✅ Firma ayarları, logo ve filigran kaydedildi!")}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-extrabold shadow-lg"
                  >
                    <Check className="w-4 h-4" />
                    Değişiklikleri Kaydet
                  </button>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                  <div className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    PDF Antet Logosu, Arka Plan Filigranı &amp; WhatsApp Onay Şeridi
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                    <div className="flex items-center gap-4 bg-slate-950 border border-slate-800 rounded-2xl p-3.5">
                      <div className="w-16 h-16 rounded-xl bg-white flex items-center justify-center overflow-hidden border border-slate-700 shrink-0">
                        {firmSettings.logoUrl ? (
                          <img
                            src={firmSettings.logoUrl}
                            alt="Firma Logosu"
                            className="w-full h-full object-contain p-1"
                          />
                        ) : (
                          <span className="text-slate-950 font-black text-base">
                            {firmSettings.companyName.slice(0, 2)}
                          </span>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <div className="text-xs font-bold text-white">Kurumsal Firma Logosu</div>
                        <p className="text-[11px] text-slate-400">
                          PDF sağ üst köşede ve sayfa ortası filigranda görünür.
                        </p>
                        <div className="flex items-center gap-2">
                          <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold cursor-pointer">
                            <Upload className="w-3.5 h-3.5" />
                            Logo Yükle / Değiştir
                            <input
                              type="file"
                              accept="image/png,image/jpeg,image/svg+xml"
                              className="hidden"
                              onChange={handleLogoUpload}
                            />
                          </label>
                          {firmSettings.logoUrl && (
                            <button
                              type="button"
                              onClick={() =>
                                setFirmSettings((prev) => ({ ...prev, logoUrl: "" }))
                              }
                              className="text-xs text-rose-400 hover:underline font-medium"
                            >
                              Kaldır
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 bg-slate-950 border border-slate-800 rounded-2xl p-3.5">
                      <div>
                        <label className="block text-xs text-slate-300 font-semibold mb-1">
                          PDF Arka Plan Filigran Yazısı
                        </label>
                        <input
                          type="text"
                          value={firmSettings.watermarkText}
                          onChange={(e) =>
                            setFirmSettings((prev) => ({
                              ...prev,
                              watermarkText: e.target.value,
                            }))
                          }
                          className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-xs font-bold text-white"
                        />
                      </div>

                      <IOSSwitch
                        checked={firmSettings.showClassicSignatures}
                        onChange={(val) =>
                          setFirmSettings((prev) => ({ ...prev, showClassicSignatures: val }))
                        }
                        label="PDF Çıktısında Klasik Islak İmza Kutuları Göster"
                        sublabel="Kapalıyken WhatsApp Dijital Onay & Yetkili Şeridi görünür"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4"><div className="flex justify-between items-center"><h3 className="text-sm font-bold text-amber-400">Şehir Tarifeleri & Ekip Maliyeti</h3><button type="button" onClick={() => setFirmSettings(v => ({...v, cityTariffs:[...(v.cityTariffs||[]),{city:"",unitPrice:0,travel:0}]}))} className="px-3 py-1.5 rounded-lg bg-sky-500 text-slate-950 text-xs font-bold">+ Şehir Ekle</button></div>{(firmSettings.cityTariffs||[]).map((t,i)=><div key={i} className="grid grid-cols-1 sm:grid-cols-3 gap-2"><input placeholder="Şehir" value={t.city} onChange={e=>setFirmSettings(v=>({...v,cityTariffs:v.cityTariffs.map((x,n)=>n===i?{...x,city:e.target.value}:x)}))} className="rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white"/><input type="number" placeholder="Baz ₺/m²" value={t.unitPrice} onChange={e=>setFirmSettings(v=>({...v,cityTariffs:v.cityTariffs.map((x,n)=>n===i?{...x,unitPrice:Number(e.target.value)}:x)}))} className="rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white"/><input type="number" placeholder="Gidiş-dönüş yol ₺" value={t.travel} onChange={e=>setFirmSettings(v=>({...v,cityTariffs:v.cityTariffs.map((x,n)=>n===i?{...x,travel:Number(e.target.value)}:x)}))} className="rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white"/></div>)}<label className="text-xs text-slate-300">Günlük eleman harcırahı (yevmiye + konaklama + yemek) ₺ <input type="number" value={firmSettings.dailyAllowance||0} onChange={e=>setFirmSettings(v=>({...v,dailyAllowance:Number(e.target.value)}))} className="ml-2 w-36 rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white"/></label></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                    <div className="text-xs font-bold text-amber-400 uppercase">
                      Firma Bilgileri
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">
                          Firma Ünvanı
                        </label>
                        <input
                          type="text"
                          value={firmSettings.companyName}
                          onChange={(e) =>
                            setFirmSettings((prev) => ({
                              ...prev,
                              companyName: e.target.value,
                              watermarkText: e.target.value,
                            }))
                          }
                          className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">
                          Yetkili Adı Soyadı
                        </label>
                        <input
                          type="text"
                          value={firmSettings.ownerName}
                          onChange={(e) =>
                            setFirmSettings((prev) => ({ ...prev, ownerName: e.target.value }))
                          }
                          className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Telefon</label>
                        <input
                          type="text"
                          value={firmSettings.phone}
                          onChange={(e) =>
                            setFirmSettings((prev) => ({ ...prev, phone: e.target.value }))
                          }
                          className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">E-posta</label>
                        <input
                          type="text"
                          value={firmSettings.email}
                          onChange={(e) =>
                            setFirmSettings((prev) => ({ ...prev, email: e.target.value }))
                          }
                          className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white"
                        />
                      </div>
                      <div><label className="block text-[11px] text-slate-400 mb-1">Giriş Şifresi</label><input type="password" value={firmSettings.password || ""} onChange={(e) => setFirmSettings(prev => ({...prev, password: e.target.value}))} className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white" /></div>
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">
                        Firma Açık Adresi
                      </label>
                      <input
                        type="text"
                        value={firmSettings.address}
                        onChange={(e) =>
                          setFirmSettings((prev) => ({ ...prev, address: e.target.value }))
                        }
                        className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                    <div className="text-xs font-bold text-amber-400 uppercase">
                      Alüminyum Kg Fiyatı, Kâr Oranı &amp; KDV
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">
                          Alüminyum Kg (₺)
                        </label>
                        <input
                          type="number"
                          value={firmSettings.aluminumKgPrice}
                          onChange={(e) =>
                            setFirmSettings((prev) => ({
                              ...prev,
                              aluminumKgPrice: Number(e.target.value),
                            }))
                          }
                          className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">
                          Kâr Oranı (%)
                        </label>
                        <input
                          type="number"
                          value={firmSettings.defaultProfitMargin}
                          onChange={(e) =>
                            setFirmSettings((prev) => ({
                              ...prev,
                              defaultProfitMargin: Number(e.target.value),
                            }))
                          }
                          className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">
                          KDV Oranı (%)
                        </label>
                        <input
                          type="number"
                          value={firmSettings.vatRate}
                          onChange={(e) =>
                            setFirmSettings((prev) => ({
                              ...prev,
                              vatRate: Number(e.target.value),
                            }))
                          }
                          className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">
                        Varsayılan Teklif &amp; Garanti Şartları Şablonu
                      </label>
                      <textarea
                        rows={4}
                        value={firmSettings.termsTemplate}
                        onChange={(e) =>
                          setFirmSettings((prev) => ({ ...prev, termsTemplate: e.target.value }))
                        }
                        className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-slate-200"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <footer className="border-t border-slate-900 bg-slate-950/90 py-3.5 px-4 mt-8">
            <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
              <span>{firmSettings.companyName} • Lisans Aktif (Enterprise Bulut)</span>
              <span className="font-semibold text-slate-300">
                Crafted &amp; Engineered by <span className="text-amber-400">ramelano</span> • MARH-LAB SaaS Architecture
              </span>
            </div>
          </footer>
        </div>
      )}

      {/* ==================================================================== */}
      {/* VIEW 3: MARH-LAB YÖNETİM PANELİ                                      */}
      {/* ==================================================================== */}
      {viewMode === "admin" && (
        <div className="no-print flex-1 flex flex-col justify-between">
          <div className="max-w-7xl w-full mx-auto px-4 py-6 space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl px-5 py-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center justify-center text-sm">
                  ML
                </div>
                <div>
                  <h1 className="text-base font-extrabold text-white">MARH-LAB YÖNETİM MERKEZİ</h1>
                  <p className="text-xs text-slate-400">SaaS Üye, Ciro &amp; Lisans Kontrolü</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setViewMode("member")}
                  className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold"
                >
                  Firma Stüdyosuna Geç
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("landing")}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-4 flex flex-wrap gap-2 items-center"><input value={adminAnnouncement} onChange={(e) => setAdminAnnouncement(e.target.value)} placeholder="Platform duyurusu yazın..." className="flex-1 min-w-[240px] rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white" /><button type="button" onClick={() => showToast(adminAnnouncement ? "Duyuru tüm bayilere yayınlandı." : "Önce duyuru metni yazın.")} className="px-3 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-extrabold">Platform Duyurusu Yayınla</button></div>
            <div className="flex justify-end"><button type="button" onClick={() => setShowNewFirmForm(!showNewFirmForm)} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-extrabold"><Plus className="w-3.5 h-3.5" /> Yeni Üye Firma / Demo Hesabı Oluştur</button></div>
            {showNewFirmForm && <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">{[['companyName','Firma Ünvanı'],['ownerName','Yetkili'],['username','Kullanıcı adı'],['password','Şifre'],['phone','Telefon'],['city','Şehir']].map(([key,label]) => <input key={key} value={newFirm[key]} onChange={(e) => setNewFirm({...newFirm,[key]:e.target.value})} placeholder={label} className="rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white" />)}<select value={newFirm.plan} onChange={(e)=>setNewFirm({...newFirm,plan:e.target.value})} className="rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white"><option>7 Günlük Demo</option><option>1 Ay</option><option>12 Ay</option></select><button type="button" onClick={() => { if (!newFirm.companyName || !newFirm.username || !newFirm.password) return showToast("Firma adı, kullanıcı adı ve şifre zorunludur."); if (adminFirms.some(f => f.username.toLowerCase() === newFirm.username.toLowerCase())) return showToast("Bu kullanıcı adı zaten kayıtlı."); setAdminFirms(prev => [...prev, { id: `f-${Date.now()}`, ...newFirm, expiresAt: newFirm.plan === "7 Günlük Demo" ? "7 gün sonra" : "Lisans süresince" }]); setNewFirm({ companyName:"",ownerName:"",username:"",password:"",phone:"",city:"",plan:"7 Günlük Demo" }); setShowNewFirmForm(false); showToast("Yeni firma hesabı oluşturuldu."); }} className="rounded-xl bg-emerald-500 px-3 py-2 text-xs font-extrabold text-slate-950">Oluştur</button></div>}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <div className="text-[11px] font-bold text-slate-400 uppercase">Aktif Üye Firma</div>
                <div className="text-2xl font-black text-white mt-1">{adminFirms.length} Firma</div>
                <div className="text-[11px] text-emerald-400 mt-1">KON-DES METAL Aktif</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <div className="text-[11px] font-bold text-slate-400 uppercase">
                  Provizyonda Bekleyen
                </div>
                <div className="text-2xl font-black text-amber-400 mt-1">
                  {pendingQuotes.length} adet
                </div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <div className="text-[11px] font-bold text-slate-400 uppercase">Onaylanan Teklif</div>
                <div className="text-2xl font-black text-emerald-400 mt-1">
                  {approvedQuotes.length} adet
                </div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">
                    Platform Teklif Hacmi
                  </span>
                  <button
                    type="button"
                    onClick={() => setAdminRevenueVisible(!adminRevenueVisible)}
                    className="text-slate-400 hover:text-white p-1"
                  >
                    {adminRevenueVisible ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <div className="text-2xl font-black text-emerald-400 mt-1">
                  {adminRevenueVisible ? `₺${quotes.reduce((a,q)=>a+quoteTotal(q),0).toLocaleString("tr-TR")}` : "••••••"}
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-sm font-bold text-white">Kayıtlı SaaS Üye Firmalar</h2>
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={adminSearch}
                    onChange={(e) => setAdminSearch(e.target.value)}
                    placeholder="Firma ara..."
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 pl-8 pr-3 py-1.5 text-xs text-white"
                  />
                </div>
              </div>

              {adminFirms
                .filter((f) =>
                  f.companyName
                    .toLocaleLowerCase("tr")
                    .includes(adminSearch.toLocaleLowerCase("tr"))
                )
                .map((firm) => (
                  <div
                    key={firm.id}
                    className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{firm.companyName}</span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 text-[10px] font-bold">
                          {firm.plan} • Aktif
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Yetkili: {firm.ownerName} • Tel: {firm.phone} • Şehir: {firm.city}
                      </div>
                    </div>
                    <div className="flex gap-2"><button type="button" onClick={() => { navigator.clipboard?.writeText(`Kullanıcı adı: ${firm.username}\nŞifre: ${firm.password || ""}`); showToast("Giriş bilgileri kopyalandı."); }} className="px-3 py-2 rounded-xl bg-slate-800 text-xs font-bold text-sky-300">Bilgileri Kopyala</button><a href={`https://wa.me/?text=${encodeURIComponent(`MARH-LAB giriş bilgileriniz\nKullanıcı adı: ${firm.username}\nŞifre: ${firm.password || ""}`)}`} target="_blank" rel="noreferrer" className="px-3 py-2 rounded-xl bg-emerald-700 text-xs font-bold text-white">WhatsApp</a><button type="button" onClick={() => { setLoginUser(firm.username); setLoginPass(firm.password || ""); setActiveTenantUsername(firm.username); setViewMode("member"); }} className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-amber-300">Firma Panelini Aç</button></div>
                  </div>
                ))}
            </div>
          </div>

          <footer className="border-t border-slate-900 bg-slate-950/90 py-3.5 px-4">
            <div className="max-w-7xl mx-auto flex justify-between text-[11px] text-slate-400">
              <span>MARH-LAB SaaS Yönetim Konsolu</span>
              <span>Crafted &amp; Engineered by ramelano • MARH-LAB SaaS Architecture</span>
            </div>
          </footer>
        </div>
      )}

      {/* ==================================================================== */}
      {/* ÜYE GİRİŞ PENCERESİ                                                  */}
      {/* ==================================================================== */}
      {showLoginModal && (
        <div className="no-print fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center justify-center text-xs">
                  ML
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">MARH-LAB Bulut Girişi</h3>
                  <p className="text-[11px] text-slate-400">Firma hesabınızla giriş yapın</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowLoginModal(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-3">
              <div>
                <label className="block text-xs text-slate-300 mb-1">Kullanıcı Adı</label>
                <input
                  type="text"
                  value={loginUser}
                  onChange={(e) => setLoginUser(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-300 mb-1">Şifre</label>
                <input
                  type="password"
                  value={loginPass}
                  onChange={(e) => setLoginPass(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
              {loginError && <p className="text-xs text-rose-400 font-medium">{loginError}</p>}

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm transition"
              >
                Giriş Yap
              </button>
            </form>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Henüz üyeliğiniz yok mu?</span>
              <a
                href="https://wa.me/905052766969?text=Merhaba%20MARH-LAB%20cam%20balkon%20yazılımı%20için%20kayıt%20olmak%20istiyorum."
                target="_blank"
                rel="noreferrer"
                className="text-amber-400 hover:underline font-bold"
              >
                Hemen Kayıt Olun →
              </a>
            </div>
          </div>
        </div>
      )}

      {cuttingQuote && <div className="no-print fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"><div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-5 space-y-4"><div className="flex justify-between"><h3 className="font-bold text-white">Atölye Kesim Listesi — {cuttingQuote.orderCode}</h3><button onClick={() => setCuttingQuote(null)} className="text-slate-400"><X className="w-4 h-4" /></button></div><div className="overflow-auto"><table className="w-full text-xs"><thead><tr className="text-slate-400 border-b border-slate-700"><th className="text-left p-2">Cephe</th><th className="text-left p-2">Net Cam</th><th className="text-left p-2">Alüminyum Profil</th></tr></thead><tbody>{(Array.isArray(cuttingQuote?.items) ? cuttingQuote.items : []).map(it => <tr key={it.id} className="border-b border-slate-800"><td className="p-2 text-white">{it.facadeName}</td><td className="p-2 text-sky-300">{Math.round(it.widthCm * 10 / Math.max(1,it.panels)) - 20} × {Number(it.heightCm)*10-40} mm × {it.panels} adet</td><td className="p-2 text-amber-300">Üst/alt: {Number(it.widthCm)*10} mm • Dikme: {Number(it.heightCm)*10} mm</td></tr>)}</tbody></table></div><div className="space-y-3"><h4 className="text-xs font-extrabold uppercase tracking-wide text-amber-400">6.000 mm Standart Boy Profil Optimizasyonu (3 mm testere payı dahil)</h4>{(Array.isArray(cuttingQuote?.items) ? cuttingQuote.items : []).map(it=>{const w=Math.round(Number(it.widthCm)*10),h=Math.round(Number(it.heightCm)*10),n=Math.max(1,Number(it.panels)||1);const plans=[{name:"Kasa üst / alt",lengths:[w,w]},{name:"Kasa yan dikme",lengths:[h,h]},{name:"Kanat dikey kayıt",lengths:Array(n*2).fill(Math.max(0,h-80))},{name:"Baza",lengths:[w]}];return <div key={it.id+"-plan"} className="rounded-xl border border-slate-800 overflow-hidden"><div className="px-3 py-2 bg-slate-950 text-white text-xs font-bold">{it.facadeName} — mm cinsinden kesim yerleşimi</div><div className="overflow-x-auto"><table className="w-full text-[11px]"><thead className="text-slate-400"><tr><th className="text-left p-2">Profil grubu</th><th className="text-left p-2">Kesimler (mm)</th><th className="text-right p-2">6 m boy</th><th className="text-right p-2">Tahmini fire</th></tr></thead><tbody>{plans.map(pl=>{const r=optimizeProfileCuts(pl.lengths);return <tr key={pl.name} className="border-t border-slate-800"><td className="p-2 text-slate-200">{pl.name}</td><td className="p-2 text-sky-300">{pl.lengths.join(" + ")} mm</td><td className="p-2 text-right text-white">{r.bars.length} boy</td><td className="p-2 text-right text-amber-300">{r.wastePct.toFixed(1)}% ({Math.round(r.waste)} mm)</td></tr>})}</tbody></table></div></div>})}<p className="text-[10px] text-slate-500">Tahmini şematik optimizasyondur; profil sistemine göre kanal/bağlantı payları ve gerçek testere kerfi atölyede kontrol edilmelidir.</p></div><button onClick={() => window.print()} className="px-3 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold">Yazdır</button></div></div>}

      {/* ==================================================================== */}
      {/* RENKLİ TEK SAYFA DİKEY A4 (210mm x 297mm) PDF ÖNİZLEME & YAZDIRMA    */}
      {/* ==================================================================== */}
      {financeCustomer && viewMode === "member" && (
        <div className="no-print fixed inset-0 z-[70] bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5" onClick={() => setFinanceCustomer(null)}>
          <div className="w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-slate-900 border border-slate-700 rounded-2xl p-4 sm:p-6 space-y-4 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-3"><div><div className="text-[11px] font-bold uppercase tracking-wider text-amber-400">MÜŞTERİ CARİ HESABI</div><h2 className="text-lg font-extrabold text-white">{financeCustomer.name} — Mali İşlemler</h2><p className="text-xs text-slate-400 mt-1">Teklif ve her mali hareket Genel Muhasebe ile birlikte güncellenir.</p></div><button type="button" onClick={() => setFinanceCustomer(null)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-800"><X className="w-4 h-4" /></button></div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[["Toplam Onaylı İş", approvedCustomerWork(financeCustomer.name)], ["Bugüne Kadarki Net Ödeme", customerNetPayments(financeCustomer.name)], ["Kalan Alacak", customerReceivable(financeCustomer.name)]].map(([label, value], index) => <div key={label} className="rounded-xl bg-slate-950 border border-slate-800 p-3"><div className="text-[10px] font-bold uppercase text-slate-400">{label}</div><div className={`text-lg font-black mt-1 ${index === 2 ? "text-amber-300" : "text-emerald-300"}`}>₺{Number(value).toLocaleString("tr-TR")}</div></div>)}
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-3">
              <h3 className="text-sm font-bold text-white">Tahsilat / İade / Düzeltme Ekle</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2">
                <select value={financeKind} onChange={(e) => setFinanceKind(e.target.value)} className="rounded-lg bg-slate-950 border border-slate-700 px-2.5 py-2 text-xs text-white"><option value="income">Tahsilat (giren)</option><option value="refund">İade / Ödeme (çıkan)</option><option value="adjustment_in">Düzeltme (giren)</option><option value="adjustment_out">Düzeltme (çıkan)</option></select>
                <input type="number" min="0.01" step="0.01" value={financeAmount} onChange={(e) => setFinanceAmount(e.target.value)} placeholder="Tutar ₺" className="rounded-lg bg-slate-950 border border-slate-700 px-2.5 py-2 text-xs text-white" />
                <input type="date" value={financeDate} onChange={(e) => setFinanceDate(e.target.value)} className="rounded-lg bg-slate-950 border border-slate-700 px-2.5 py-2 text-xs text-white" />
                <input value={financeQuoteCode} onChange={(e) => setFinanceQuoteCode(e.target.value)} placeholder="Sipariş kodu (isteğe bağlı)" className="rounded-lg bg-slate-950 border border-slate-700 px-2.5 py-2 text-xs text-white" />
                <input value={financeDescription} onChange={(e) => setFinanceDescription(e.target.value)} placeholder="Açıklama" className="rounded-lg bg-slate-950 border border-slate-700 px-2.5 py-2 text-xs text-white" />
                <button type="button" onClick={saveCustomerFinance} className="rounded-lg bg-amber-500 px-3 py-2 text-xs font-extrabold text-slate-950">Hareketi Kaydet</button>
              </div>
            </div>
            <div className="rounded-xl border border-slate-800 overflow-hidden">
              <div className="px-3 py-2 bg-slate-950 text-xs font-bold text-slate-200">Mali Hareket Geçmişi</div>
              <div className="max-h-64 overflow-auto"><table className="w-full min-w-[600px] text-xs"><thead><tr className="border-y border-slate-800 text-left text-slate-400"><th className="p-2">Tarih</th><th className="p-2">Tür / Açıklama</th><th className="p-2">Teklif</th><th className="p-2 text-right">Tutar</th><th className="p-2" /></tr></thead><tbody>
                {allFinanceEntries.filter((entry) => entry.customerName === financeCustomer.name).sort((a, b) => String(b.date).localeCompare(String(a.date))).map((entry) => <tr key={entry.id} className="border-b border-slate-800"><td className="p-2 text-slate-300">{entry.date || "—"}</td><td className="p-2"><div className="text-slate-200">{{ income: "Tahsilat", expense: "Ödeme", refund: "İade", adjustment_in: "Düzeltme (giren)", adjustment_out: "Düzeltme (çıkan)" }[entry.kind] || entry.kind}</div><div className="text-[10px] text-slate-500">{entry.description}</div></td><td className="p-2 text-slate-400">{entry.quoteCode || "—"}</td><td className={`p-2 text-right font-bold ${signedFinanceAmount(entry) > 0 ? "text-emerald-300" : "text-rose-300"}`}>{signedFinanceAmount(entry) > 0 ? "+" : "−"}₺{Number(entry.amount).toLocaleString("tr-TR")}</td><td className="p-2 text-right"><button type="button" onClick={() => deleteFinanceEntry(entry)} title="Bu hareketi sil" className="rounded-lg p-1.5 text-rose-300 hover:bg-rose-500/10"><Trash2 className="w-3.5 h-3.5" /></button></td></tr>)}
                {!allFinanceEntries.some((entry) => entry.customerName === financeCustomer.name) && <tr><td colSpan={5} className="p-5 text-center text-slate-500">Bu müşteri için mali hareket bulunmuyor.</td></tr>}
              </tbody></table></div>
            </div>
          </div>
        </div>
      )}

      {pdfQuote && pdfTotals && (
        <div className="print-modal-shell fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col">
          <div className="no-print bg-slate-900 border-b border-slate-800 px-4 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div className="flex flex-wrap items-center gap-5">
              <div className="font-extrabold text-sm text-white">
                A4 Müşteri Teklif Formu —{" "}
                <span className="text-amber-400">{pdfQuote.orderCode}</span>
              </div>

              <IOSSwitch
                compact
                checked={pdfIncludePage2}
                onChange={setPdfIncludePage2}
                label="2. Sayfa: Büyük CAD Paftası"
              />

              <IOSSwitch
                compact
                checked={pdfShowWatermark}
                onChange={setPdfShowWatermark}
                label="Firma Filigranı"
              />

              <IOSSwitch
                compact
                checked={pdfShowUnitPrices}
                onChange={setPdfShowUnitPrices}
                label="Birim Fiyatları Göster"
              />
            </div>

            <div className="flex items-center gap-2">
              <a href={whatsappHref(pdfQuote)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-extrabold"><MessageCircle className="w-4 h-4" /> WhatsApp ile Paylaş</a>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-extrabold shadow-lg transition"
              >
                <Printer className="w-4 h-4" />
                Yazdır / PDF Kaydet ({pdfIncludePage2 ? "2 Sayfa" : "1 Sayfa"})
              </button>
              <button
                type="button"
                onClick={() => setPdfQuote(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="print-scroll-body flex-1 overflow-y-auto py-6 px-3 flex justify-center">
            <div id="a4-print-root" className="flex flex-col items-center gap-6">
              {/* SAYFA 1: RENKLİ KURUMSAL TEKLİF FORMU (TEK SAYFA KİLİTLİ) */}
              <div className="a4-sheet relative w-[210mm] h-[288mm] bg-white text-slate-900 px-[11mm] py-[9mm] shadow-2xl flex flex-col justify-between overflow-hidden">
                {pdfShowWatermark && (
                  <DynamicFirmWatermark
                    logoUrl={firmSettings.logoUrl}
                    watermarkText={firmSettings.watermarkText || firmSettings.companyName}
                  />
                )}

                <div className="relative z-10 space-y-2.5">
                  {/* 1. ÜST ANTET */}
                  <div className="flex items-start justify-between border-b-2 border-amber-500 pb-2">
                    <div className="text-[10.5px] leading-snug">
                      <div className="text-base font-black tracking-tight text-slate-950 uppercase">
                        {firmSettings.companyName}
                      </div>
                      <div className="font-bold text-slate-700">{firmSettings.phone}</div>
                      <div className="font-bold text-slate-700 uppercase">
                        {firmSettings.ownerName}
                      </div>
                      <div className="text-[9.5px] text-slate-500">{firmSettings.address}</div>
                    </div>

                    <div className="text-center pt-1">
                      <div className="text-lg font-black tracking-wider text-slate-900">
                        TEKLİF FORMU
                      </div>
                      <div className="text-xs font-bold text-slate-600">{pdfQuote.date}</div>
                      <div className="inline-block mt-0.5 px-2.5 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-[10px] font-extrabold text-amber-800">
                        {pdfQuote.orderCode}
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center overflow-hidden shadow-md border border-amber-300">
                        {firmSettings.logoUrl ? (
                          <img
                            src={firmSettings.logoUrl}
                            alt={firmSettings.companyName}
                            className="w-full h-full object-contain bg-white p-1"
                          />
                        ) : (
                          <span className="text-xl font-black">
                            {firmSettings.companyName.slice(0, 2)}
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-black text-slate-900 tracking-tight leading-none">
                          {firmSettings.companyName}
                        </div>
                        <div className="text-[8px] font-bold tracking-widest text-amber-600 uppercase mt-1">
                          CAM BALKON SİSTEMLERİ
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 2. MÜŞTERİ BİLGİLERİ & PROJE BİLGİLERİ */}
                  <div className="grid grid-cols-2 gap-6 text-[10.5px] pt-0.5">
                    <div>
                      <div className="font-extrabold text-slate-900 border-b border-amber-400 pb-0.5 mb-1.5">
                        Müşteri Bilgileri
                      </div>
                      <div className="grid grid-cols-12 gap-y-0.5">
                        <span className="col-span-4 text-slate-500 font-semibold">Ad Soyad</span>
                        <span className="col-span-8 font-bold text-slate-900">
                          {pdfQuote.customerName}
                        </span>
                        <span className="col-span-4 text-slate-500 font-semibold">Telefon</span>
                        <span className="col-span-8 font-semibold text-slate-800">
                          {pdfQuote.customerPhone || "-"}
                        </span>
                        <span className="col-span-4 text-slate-500 font-semibold">Adres</span>
                        <span className="col-span-8 font-semibold text-slate-800">
                          {pdfQuote.customerAddress || "-"}
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="font-extrabold text-slate-900 border-b border-amber-400 pb-0.5 mb-1.5">
                        Proje Bilgileri
                      </div>
                      <div className="grid grid-cols-12 gap-y-0.5">
                        <span className="col-span-4 text-slate-500 font-semibold">Proje Adı</span>
                        <span className="col-span-8 font-bold text-slate-900">
                          {pdfQuote.projectTitle}
                        </span>
                        <span className="col-span-4 text-slate-500 font-semibold">
                          Sipariş Kodu
                        </span>
                        <span className="col-span-8 font-bold text-slate-900">
                          {pdfQuote.orderCode}
                        </span>
                        <span className="col-span-4 text-slate-500 font-semibold">Geçerlilik</span>
                        <span className="col-span-8 font-semibold text-slate-800">
                          {pdfQuote.showValidity ? `${pdfQuote.validityDays} Gün` : "Standart"} •{" "}
                          {pdfQuote.vatIncluded ? `%${firmSettings.vatRate} KDV Dahil` : "KDV Hariç"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 3. RENKLİ PROJE DETAY TABLOSU */}
                  <div className="border border-slate-400 rounded overflow-hidden">
                    <div className="bg-slate-800 text-amber-300 text-center font-extrabold text-[10.5px] py-1 tracking-widest uppercase">
                      PROJE DETAY
                    </div>
                    <table className="w-full text-[10px] border-collapse">
                      <thead>
                        <tr className="bg-slate-100 border-b border-slate-400 text-slate-800 font-extrabold">
                          <th className="py-1.5 px-2 text-left border-r border-slate-300">
                            SİSTEM ADI
                          </th>
                          <th className="py-1.5 px-2 text-center border-r border-slate-300 w-14">
                            ADET
                          </th>
                          <th className="py-1.5 px-2 text-right border-r border-slate-300 w-20">
                            ALAN
                          </th>
                          {pdfShowUnitPrices && (
                            <th className="py-1.5 px-2 text-right border-r border-slate-300 w-24">
                              BİRİM FİYAT
                            </th>
                          )}
                          <th className="py-1.5 px-2 text-right w-28">TOPLAM</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(Array.isArray(pdfQuote?.items) ? pdfQuote.items : []).map((it, idx) => {
                          const rowM2 = (it.widthCm * it.heightCm * it.quantity) / 10000;
                          const rowTotal = Math.round(rowM2 * it.unitPrice);
                          return (
                            <tr
                              key={it.id}
                              className="bg-amber-50/90 border-b border-slate-300"
                            >
                              <td className="py-1.5 px-2 border-r border-slate-300">
                                <div className="font-extrabold text-slate-950">
                                  {idx + 1}. {it.seriesName}
                                </div>
                                <div className="text-slate-700 text-[9.5px]">
                                  * {it.glassColor} {it.glassShortLabel || it.glassType} •{" "}
                                  {it.widthCm}×{it.heightCm} cm ({it.panels} Cam)
                                </div>
                                <div className="text-slate-700 text-[9.5px]">
                                  * {it.aluminumColor} •{" "}
                                  {it.motorized ? "Motorlu & Kumandalı" : "Manuel Sistem"}
                                </div>
                              </td>
                              <td className="py-1.5 px-2 border-r border-slate-300 text-center font-bold text-slate-900">
                                {it.quantity}
                              </td>
                              <td className="py-1.5 px-2 border-r border-slate-300 text-right font-bold text-slate-900">
                                {rowM2.toFixed(2)} m²
                              </td>
                              {pdfShowUnitPrices && (
                                <td className="py-1.5 px-2 border-r border-slate-300 text-right font-semibold text-slate-800">
                                  ₺{it.unitPrice.toLocaleString("tr-TR")}
                                </td>
                              )}
                              <td className="py-1.5 px-2 text-right font-extrabold text-slate-950">
                                ₺{rowTotal.toLocaleString("tr-TR")}
                              </td>
                            </tr>
                          );
                        })}

                        <tr className="border-b border-slate-300 bg-white">
                          <td
                            colSpan={pdfShowUnitPrices ? 3 : 2}
                            className="py-1 px-2 border-r border-slate-300"
                          />
                          <td className="py-1 px-2 text-right font-bold text-slate-600 border-r border-slate-300 text-[9.5px]">
                            ARA TOPLAM
                          </td>
                          <td className="py-1 px-2 text-right font-extrabold text-slate-900">
                            ₺{pdfTotals.subtotal.toLocaleString("tr-TR")}
                          </td>
                        </tr>

                        {pdfTotals.discountAmount > 0 && (
                          <tr className="border-b border-slate-300 bg-white">
                            <td
                              colSpan={pdfShowUnitPrices ? 3 : 2}
                              className="py-1 px-2 border-r border-slate-300"
                            />
                            <td className="py-1 px-2 text-right font-bold text-emerald-700 border-r border-slate-300 text-[9.5px]">
                              İSKONTO (%{pdfQuote.discountPercent})
                            </td>
                            <td className="py-1 px-2 text-right font-extrabold text-emerald-700">
                              -₺{pdfTotals.discountAmount.toLocaleString("tr-TR")}
                            </td>
                          </tr>
                        )}

                        {pdfQuote.vatIncluded && <tr className="border-b border-slate-300 bg-white"><td colSpan={pdfShowUnitPrices ? 3 : 2} className="py-1 px-2 border-r border-slate-300" /><td className="py-1 px-2 text-right font-bold text-sky-700 border-r border-slate-300 text-[9.5px]">KDV (%{firmSettings.vatRate})</td><td className="py-1 px-2 text-right font-extrabold text-sky-700">₺{pdfTotals.vatAmount.toLocaleString("tr-TR")}</td></tr>}
                        <tr className="bg-slate-900 text-white">
                          <td className="py-1.5 px-2 text-right font-bold text-amber-300 border-r border-slate-700">
                            TOPLAM ALAN
                          </td>
                          <td
                            colSpan={2}
                            className="py-1.5 px-2 text-center font-black text-white border-r border-slate-700"
                          >
                            {pdfTotals.totalArea.toFixed(2)} m²
                          </td>
                          {pdfShowUnitPrices && (
                            <td className="py-1.5 px-2 text-right font-bold text-amber-300 border-r border-slate-700 text-[9.5px]">
                              TOPLAM TUTAR
                            </td>
                          )}
                          <td className="py-1.5 px-2 text-right font-black text-xs text-amber-400">
                            ₺{pdfTotals.grandTotal.toLocaleString("tr-TR")}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* 4. PROFESYONEL ISO 128 & TS EN 12519 VEKTÖREL CAD TEKNİK ÇİZİMİ */}
                  <ISOTechnicalCADDrawing items={Array.isArray(pdfQuote?.items) ? pdfQuote.items : []} />
                </div>

                {/* ALT SABİT BLOK: TEKLİF ŞARTLARI & WHATSAPP DİJİTAL ONAY ŞERİDİ */}
                <div className="relative z-10 space-y-2 pt-1.5">
                  <div className="border border-slate-300 rounded overflow-hidden">
                    <div className="bg-slate-200 px-3 py-1 text-center font-extrabold text-[10px] text-slate-800 border-b border-slate-300 tracking-wider">
                      TEKLİF ŞARTLARI
                    </div>
                    <div className="p-2.5 flex justify-between items-end gap-4 bg-white/85">
                      <pre className="font-sans text-[9.5px] text-slate-800 whitespace-pre-wrap leading-snug font-medium">
                        {pdfQuote.terms}
                        {"\n"}
                        <strong>{pdfQuote.vatIncluded ? "KDV DAHİL" : "KDV HARİÇ"}</strong>
                      </pre>

                      {pdfQuote.showValidity && (
                        <div className="text-right shrink-0">
                          <span className="inline-block px-2.5 py-1 rounded bg-amber-100 border border-amber-300 text-[9.5px] font-extrabold text-amber-900">
                            {pdfQuote.validityDays} Gün Geçerlidir
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {firmSettings.showClassicSignatures ? (
                    <div className="grid grid-cols-2 gap-4 text-[9.5px]">
                      <div className="border border-slate-300 rounded p-2 h-14 flex flex-col justify-between">
                        <span className="font-bold text-slate-800">FİRMA YETKİLİSİ</span>
                        <span className="text-center text-slate-500">
                          {firmSettings.ownerName} — Kaşe / İmza
                        </span>
                      </div>
                      <div className="border border-slate-300 rounded p-2 h-14 flex flex-col justify-between">
                        <span className="font-bold text-slate-800">MÜŞTERİ ONAYI</span>
                        <span className="text-center text-slate-500">
                          {pdfQuote.customerName} — Ad Soyad / İmza
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-amber-50/70 border border-amber-300/80 rounded px-3 py-1.5 text-[9px]">
                      <div className="font-extrabold text-slate-900">DÜZENLEYEN YETKİLİ (ELEKTRONİK TEKLİF)</div>
                      <div className="text-slate-700 mt-0.5"><strong>{firmSettings.ownerName}</strong> — {firmSettings.companyName} • Dijital ortamda hazırlanmıştır.</div>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-[8.5px] text-slate-400">
                    <span>{firmSettings.companyName} • MARH-LAB Cam Balkon Yazılımı</span>
                    <span>Sayfa 1 / {pdfIncludePage2 ? "2" : "1"}</span>
                  </div>
                </div>
              </div>

              {/* SAYFA 2 (OPSİYONEL): BÜYÜK MİMARİ CAD PAFTASI */}
              {pdfIncludePage2 && (
                <div className="a4-sheet a4-page-break relative w-[210mm] h-[288mm] bg-white text-slate-900 px-[11mm] py-[9mm] shadow-2xl flex flex-col justify-between overflow-hidden">
                  {pdfShowWatermark && (
                    <DynamicFirmWatermark
                      logoUrl={firmSettings.logoUrl}
                      watermarkText={firmSettings.watermarkText || firmSettings.companyName}
                    />
                  )}

                  <div className="relative z-10 space-y-4">
                    <div className="flex justify-between items-start border-b-2 border-slate-900 pb-3">
                      <div>
                        <div className="text-[10px] font-bold tracking-widest text-amber-600 uppercase">
                          ISO 128 &amp; TS EN 12519 İMALAT VE MONTAJ DETAY PAFTASI
                        </div>
                        <h2 className="text-xl font-black text-slate-950 uppercase mt-0.5">
                          {pdfQuote.customerName} — CEPHE GÖRÜNÜŞ &amp; KESİT PROJESİ
                        </h2>
                      </div>
                      <div className="text-right text-xs">
                        <div className="font-black text-slate-900">PAFTA NO: T-02</div>
                        <div className="text-slate-600">BİRİM: mm • ÖLÇEK: ORANTILI</div>
                      </div>
                    </div>

                    <ISOTechnicalCADDrawing items={Array.isArray(pdfQuote?.items) ? pdfQuote.items : []} largeMode />
                  </div>

                  <div className="relative z-10 border-2 border-slate-900 grid grid-cols-4 text-[10px]">
                    <div className="p-3 border-r border-slate-900">
                      <div className="font-bold text-slate-500">YÜKLENİCİ FİRMA</div>
                      <div className="font-black text-xs text-slate-950 mt-0.5">
                        {firmSettings.companyName}
                      </div>
                      <div className="text-slate-600 mt-0.5">{firmSettings.address}</div>
                    </div>
                    <div className="p-3 border-r border-slate-900">
                      <div className="font-bold text-slate-500">PROJE / MÜŞTERİ</div>
                      <div className="font-black text-xs text-slate-950 mt-0.5">
                        {pdfQuote.customerName}
                      </div>
                      <div className="text-slate-600 mt-0.5">
                        {pdfQuote.customerAddress || "-"}
                      </div>
                    </div>
                    <div className="p-3 border-r border-slate-900">
                      <div className="font-bold text-slate-500">TEKLİF &amp; TARİH</div>
                      <div className="font-black text-xs text-slate-950 mt-0.5">
                        {pdfQuote.orderCode}
                      </div>
                      <div className="text-slate-600 mt-0.5">{pdfQuote.date}</div>
                    </div>
                    <div className="p-3">
                      <div className="font-bold text-slate-500">CAD MOTORU</div>
                      <div className="font-black text-xs text-slate-950 mt-0.5">MARH-LAB CAD</div>
                      <div className="text-slate-600 mt-0.5">Engineered by ramelano</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
