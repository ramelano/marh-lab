export type QuoteStatus = "Onaylandı" | "Provizyonda" | "Taslak" | "Reddedildi";

export type DrawingType =
  | "katlanir"
  | "giyotin"
  | "surme"
  | "jaluzili"
  | "pergola"
  | "askili"
  | "akordeon"
  | "sabit";

export type SystemCatalogItem = {
  id: string;
  name: string;
  code: string;
  defaultProjectName: string;
  drawingType: DrawingType;
  profilKgM2: number;
  sabitMaliyetM2: number;
  defaultAlumColor: string;
  defaultGlassThicknessId: string;
  defaultOuterGlass: string;
  defaultInnerGlass: string;
  defaultMotor: string;
  termsTemplateKey: "katlanir" | "giyotin" | "surme" | "pergola" | "askili" | "sabit";
};

export type GlassThicknessOption = {
  id: string;
  name: string;
  isIsicam: boolean;
  basePriceM2: number;
};

export type GlassColorOption = {
  name: string;
  extraPriceM2: number;
};

export type MotorOption = {
  name: string;
  extraCostM2: number;
};

export type FirmEngineeringSettings = {
  companyName: string;
  phone: string;
  ownerName: string;
  address: string;
  email: string;
  footerNote: string;
  vatRate: number;
  defaultVatIncluded: boolean;
  aluminumKgPrice: number;
  defaultProfitMarginPct: number;
  lastOrderNo: number;
  orderPrefix: string;
  minHeightCm: number;
  minHeightActive: boolean;
  systems: SystemCatalogItem[];
  alumColors: string[];
  glassThicknesses: GlassThicknessOption[];
  glassColors: GlassColorOption[];
  motors: MotorOption[];
  termsTemplates: Record<string, string>;
};

export const DEFAULT_FIRM_SETTINGS: FirmEngineeringSettings = {
  companyName: "KON-DES METAL",
  phone: "0530 695 92 68",
  ownerName: "Mustafa Duysak",
  address: "Fevziçakmak Mah. 10443. Sk. No:18 Karatay / Konya",
  email: "info@kondesmetal.com",
  footerNote: "KON-DES METAL • Cam Balkon, Giyotin & Pergola Sistemleri",
  vatRate: 20,
  defaultVatIncluded: false,
  aluminumKgPrice: 450,
  defaultProfitMarginPct: 84.24,
  lastOrderNo: 795,
  orderPrefix: "PRJ",
  minHeightCm: 150,
  minHeightActive: false,
  systems: [
    {
      id: "sys_1",
      name: "Alya™ Katlanır Cam Balkon Seri",
      code: "AL-08",
      defaultProjectName: "Katlanır Cam Balkon",
      drawingType: "katlanir",
      profilKgM2: 3.4,
      sabitMaliyetM2: 350,
      defaultAlumColor: "Antrasit Gri",
      defaultGlassThicknessId: "8mm",
      defaultOuterGlass: "Füme",
      defaultInnerGlass: "",
      defaultMotor: "Motorsuz",
      termsTemplateKey: "katlanir",
    },
    {
      id: "sys_2",
      name: "Giosafe™ Motorlu Giyotin Seri",
      code: "GS-110",
      defaultProjectName: "Motorlu Giyotin",
      drawingType: "giyotin",
      profilKgM2: 14.2,
      sabitMaliyetM2: 778.54,
      defaultAlumColor: "Antrasit Gri",
      defaultGlassThicknessId: "4+12+4",
      defaultOuterGlass: "Şeffaf",
      defaultInnerGlass: "Füme",
      defaultMotor: "Mosel 5 Kanallı Kumanda",
      termsTemplateKey: "giyotin",
    },
    {
      id: "sys_3",
      name: "Slide Leon™ Eşikli Sürme Seri",
      code: "SL-3R",
      defaultProjectName: "Sürme Cam Balkon",
      drawingType: "surme",
      profilKgM2: 3.8,
      sabitMaliyetM2: 390,
      defaultAlumColor: "Antrasit Gri",
      defaultGlassThicknessId: "8mm",
      defaultOuterGlass: "Şeffaf",
      defaultInnerGlass: "",
      defaultMotor: "Motorsuz",
      termsTemplateKey: "surme",
    },
    {
      id: "sys_4",
      name: "Xena™ Isıcamlı Katlanır Seri",
      code: "XN-38",
      defaultProjectName: "Isıcamlı Katlanır Cam Balkon",
      drawingType: "katlanir",
      profilKgM2: 4.2,
      sabitMaliyetM2: 480,
      defaultAlumColor: "Antrasit Gri",
      defaultGlassThicknessId: "4+12+4",
      defaultOuterGlass: "Şeffaf",
      defaultInnerGlass: "Füme",
      defaultMotor: "Motorsuz",
      termsTemplateKey: "katlanir",
    },
    {
      id: "sys_5",
      name: "Slide Leon™ Eşiksiz Sürme Seri",
      code: "SL-5R",
      defaultProjectName: "Eşiksiz Sürme",
      drawingType: "surme",
      profilKgM2: 4.3,
      sabitMaliyetM2: 450,
      defaultAlumColor: "Antrasit Gri",
      defaultGlassThicknessId: "10mm",
      defaultOuterGlass: "Füme",
      defaultInnerGlass: "",
      defaultMotor: "Motorsuz",
      termsTemplateKey: "surme",
    },
    {
      id: "sys_6",
      name: "Isıcam Arası Jaluzili Katlanır Seri",
      code: "JL-16",
      defaultProjectName: "Jaluzili Cam Balkon",
      drawingType: "jaluzili",
      profilKgM2: 4.6,
      sabitMaliyetM2: 640,
      defaultAlumColor: "Antrasit Gri",
      defaultGlassThicknessId: "4+16+4",
      defaultOuterGlass: "Şeffaf",
      defaultInnerGlass: "Şeffaf",
      defaultMotor: "Motorsuz",
      termsTemplateKey: "katlanir",
    },
    {
      id: "sys_7",
      name: "Magic Roof™ Bioklimatik Pergola",
      code: "MR-BIO",
      defaultProjectName: "Bioklimatik Pergola",
      drawingType: "pergola",
      profilKgM2: 18.5,
      sabitMaliyetM2: 1150,
      defaultAlumColor: "Antrasit Gri",
      defaultGlassThicknessId: "camsiz",
      defaultOuterGlass: "Şeffaf",
      defaultInnerGlass: "",
      defaultMotor: "Somfy 120Nm",
      termsTemplateKey: "pergola",
    },
    {
      id: "sys_8",
      name: "Üstten Askılı (Raysız) Sistem",
      code: "SK-TOP",
      defaultProjectName: "Üstten Askılı Cam Sistem",
      drawingType: "askili",
      profilKgM2: 5.1,
      sabitMaliyetM2: 560,
      defaultAlumColor: "Siyah",
      defaultGlassThicknessId: "10mm",
      defaultOuterGlass: "Şeffaf",
      defaultInnerGlass: "",
      defaultMotor: "Motorsuz",
      termsTemplateKey: "askili",
    },
    {
      id: "sys_9",
      name: "Akordeon / Tiyatro Katlanır Seri",
      code: "AK-90",
      defaultProjectName: "Akordeon Cam Sistem",
      drawingType: "akordeon",
      profilKgM2: 5.8,
      sabitMaliyetM2: 590,
      defaultAlumColor: "Antrasit Gri",
      defaultGlassThicknessId: "4+12+4",
      defaultOuterGlass: "Şeffaf",
      defaultInnerGlass: "",
      defaultMotor: "Motorsuz",
      termsTemplateKey: "katlanir",
    },
    {
      id: "sys_10",
      name: "Sabit Cam & Rüzgar Kırıcı Seri",
      code: "SB-10",
      defaultProjectName: "Sabit Cam Korkuluk",
      drawingType: "sabit",
      profilKgM2: 3.1,
      sabitMaliyetM2: 290,
      defaultAlumColor: "Antrasit Gri",
      defaultGlassThicknessId: "10mm",
      defaultOuterGlass: "Füme",
      defaultInnerGlass: "",
      defaultMotor: "Motorsuz",
      termsTemplateKey: "sabit",
    },
  ],
  alumColors: ["Bronz", "Antrasit Gri", "Pres", "RAL", "Eloksal", "Siyah"],
  glassThicknesses: [
    { id: "camsiz", name: "Camsız Hesapla", isIsicam: false, basePriceM2: 0 },
    { id: "8mm", name: "8mm", isIsicam: false, basePriceM2: 850 },
    { id: "10mm", name: "10mm", isIsicam: false, basePriceM2: 1100 },
    { id: "4+11+4", name: "4+11+4", isIsicam: true, basePriceM2: 1750 },
    { id: "4+12+4", name: "4+12+4", isIsicam: true, basePriceM2: 1850 },
    { id: "4+16+4", name: "4+16+4 (Jaluzili)", isIsicam: true, basePriceM2: 2150 },
  ],
  glassColors: [
    { name: "Şeffaf", extraPriceM2: 0 },
    { name: "Füme", extraPriceM2: 100 },
    { name: "Bronz", extraPriceM2: 100 },
    { name: "Mavi", extraPriceM2: 150 },
    { name: "Yeşil", extraPriceM2: 150 },
    { name: "Buzlu", extraPriceM2: 120 },
  ],
  motors: [
    { name: "Motorsuz", extraCostM2: 0 },
    { name: "Somfy 100Nm", extraCostM2: 450 },
    { name: "Somfy 120Nm", extraCostM2: 550 },
    { name: "Mosel 1 Kanallı Kumanda", extraCostM2: 0 },
    { name: "Mosel 5 Kanallı Kumanda", extraCostM2: 0 },
  ],
  termsTemplates: {
    katlanir:
      "%100 metal park kanat toplama sistemi\npaslanmaz çelik rulman ve teker takımı\nalüminyum fitil ve EPDM sızdırmazlık contaları\niki yıl mekanik ve montaj garantisi\n%50 peşin, %50 montaj tesliminde ödeme",
    giyotin:
      "krom kaplama çelik zincir tahrik sistemi\nmosel marka tüp motor ve uzaktan kumanda\nsilinebilir özellikli hareketli kanatlar\niki yıl mekanik ve iki yıl motor garantisi\n%100'e kadar su ve rüzgar sızdırmazlık garantisi",
    surme:
      "paslanmaz rulmanlı taşıyıcı sistem\n3'lü ve 5'li su tahliyeli ray profil seçeneği\niki yıl mekanik ve montaj garantisi\n%50 peşin, %50 montaj tesliminde ödeme",
    pergola:
      "IP65 su korumalı motorlu bioklimatik alüminyum tavan\n135° ayarlanabilir güneş ve havalandırma lamelleri\nentegre gizli yağmur oluğu ve gizli su tahliye dikmeleri\niki yıl motor ve mekanik sistem garantisi",
    askili:
      "zeminsiz (raysız) üstten askılı ağır hizmet taşıyıcı ray\n10mm temperli rodajlı emniyet camı\nkenar park istasyonu kilitleme mekanizması\niki yıl mekanik ve montaj garantisi",
    sabit:
      "temperli emniyet camı ve ağır hizmet alüminyum kasa\npaslanmaz çelik ankraj ve bağlantı elemanları\niki yıl malzeme ve montaj garantisi",
  },
};

export type QuoteLineItem = {
  id: string;
  facadeName: string;
  systemId: string;
  systemName: string;
  systemCode: string;
  drawingType: DrawingType;
  widthCm: number;
  heightCm: number;
  panels: number;
  quantity: number;
  glassThicknessId: string;
  glassThicknessName: string;
  outerGlassColor: string;
  innerGlassColor: string;
  alumColor: string;
  motorName: string;
  singleAreaM2: number;
  totalAreaM2: number;
  unitCostM2: number;
  unitSellPriceM2: number;
  totalCost: number;
  lineTotal: number;
};

export type Quote = {
  id: string;
  tenantId: string;
  crmCustomerId?: string;
  code: string;
  projectTitle: string;
  customer: string;
  customerPhone: string;
  customerAddress: string;
  validityLabel: string;
  termsText: string;
  items: QuoteLineItem[];
  discountRate: number;
  includeVat: boolean;
  vatRate: number;
  totalCost: number;
  subTotal: number;
  discountAmount: number;
  vatAmount: number;
  total: number;
  paidAmount: number;
  status: QuoteStatus;
  createdAt: string;
  updatedAt: string;
};

export type CrmCustomer = {
  id: string;
  tenantId: string;
  name: string;
  phone: string;
  address: string;
  taxInfo: string;
  notes: string;
  createdAt: string;
};

export type CrmPayment = {
  id: string;
  tenantId: string;
  customerId: string;
  customerName: string;
  quoteCode: string;
  amount: number;
  method: string;
  date: string;
  note: string;
};

export type TrashEntry = {
  id: string;
  tenantId: string;
  kind: "quote" | "provision" | "payment" | "customer";
  title: string;
  subtitle: string;
  amount: number;
  deletedAt: string;
  payload: unknown;
};

export type BackupSnapshot = {
  id: string;
  tenantId: string;
  createdAt: string;
  reason: string;
  quoteCount: number;
  customerCount: number;
  data: {
    quotes: Quote[];
    customers: CrmCustomer[];
    payments: CrmPayment[];
    trash: TrashEntry[];
    firmSettings: FirmEngineeringSettings;
  };
};

export type ActivityLog = {
  id: string;
  timestamp: string;
  action: string;
  detail: string;
  type: "create" | "approve" | "provision" | "support" | "login" | "security";
};

export type PlanType = "Deneme (3 Gün)" | "Starter (1 Aylık)" | "Pro Studio (6 Aylık)" | "Enterprise (12 Aylık)";

export const PLAN_DURATIONS_DAYS: Record<PlanType, number> = {
  "Deneme (3 Gün)": 3,
  "Starter (1 Aylık)": 30,
  "Pro Studio (6 Aylık)": 180,
  "Enterprise (12 Aylık)": 365,
};

export type TenantMember = {
  id: string;
  companyName: string;
  ownerName: string;
  phone: string;
  email: string;
  city: string;
  address: string;
  username: string;
  password: string;
  mustChangePassword: boolean;
  plan: PlanType;
  isActive: boolean;
  expiresAt: string;
  lastActiveAt: string;
  supportCode: string;
  appVersion: string;
  notes: string;
  activities: ActivityLog[];
};

export type PlatformSettings = {
  whatsappNumber: string;
  brandName: string;
  supportHours: string;
};

export type TrafficPoint = {
  day: string;
  visitors: number;
  waLeads: number;
  memberLogins: number;
};

export const WEEKLY_TRAFFIC: TrafficPoint[] = [
  { day: "Pzt", visitors: 142, waLeads: 6, memberLogins: 19 },
  { day: "Sal", visitors: 168, waLeads: 8, memberLogins: 22 },
  { day: "Çar", visitors: 195, waLeads: 11, memberLogins: 25 },
  { day: "Per", visitors: 214, waLeads: 9, memberLogins: 28 },
  { day: "Cum", visitors: 248, waLeads: 14, memberLogins: 31 },
  { day: "Cmt", visitors: 276, waLeads: 17, memberLogins: 34 },
  { day: "Paz", visitors: 189, waLeads: 10, memberLogins: 21 },
];

export const DEFAULT_PLATFORM_SETTINGS: PlatformSettings = {
  whatsappNumber: "+905052766969",
  brandName: "MARH-LAB",
  supportHours: "Hafta içi & Cumartesi 09:00 – 21:00 • Canlı WhatsApp & Uzaktan Bağlantı",
};

// ONLY ONE REAL MEMBER: KON-DES METAL
export const INITIAL_TENANTS: TenantMember[] = [
  {
    id: "ten-kondes",
    companyName: "KON-DES METAL",
    ownerName: "Mustafa Duysak",
    phone: "0530 695 92 68",
    email: "info@kondesmetal.com",
    city: "Konya",
    address: "Fevziçakmak Mah. 10443. Sk. No:18 Karatay / Konya",
    username: "kondes_metal",
    password: "Kd!2026#92",
    mustChangePassword: false,
    plan: "Enterprise (12 Aylık)",
    isActive: true,
    expiresAt: "2027-11-21",
    lastActiveAt: "Bugün, 19:15",
    supportCode: "SUP-4821",
    appVersion: "v16.5-PRO",
    notes: "Cam balkon, giyotin ve bioklimatik pergola tam modül aktif.",
    activities: [
      { id: "act-1", timestamp: "Bugün 19:15", action: "Teklif Onaylandı", detail: "PRJ-794 (Mavişehir Yapı — 531.100 ₺) onaylanıp cari hesaba işlendi.", type: "approve" },
      { id: "act-2", timestamp: "Bugün 17:40", action: "Provizyona Kaydedildi", detail: "PRJ-795 (Selçuklu Plaza — 2 cephe) müşteri onayı bekliyor.", type: "provision" },
      { id: "act-3", timestamp: "Bugün 14:20", action: "Oturum Açıldı", detail: "Konya merkez üzerinden Firma Çalışma Alanına giriş yapıldı.", type: "login" },
    ],
  },
];

export const INITIAL_CUSTOMERS: CrmCustomer[] = [
  {
    id: "cust-mavisehir",
    tenantId: "ten-kondes",
    name: "Mavişehir Yapı (Müteahhit)",
    phone: "0532 777 88 99",
    address: "Meram Yeni Yol Üzeri No:42 Meram / Konya",
    taxInfo: "Meram V.D. • 6120458910",
    notes: "A Blok 12 Daire tip balkon sözleşmesi.",
    createdAt: "2026-11-21",
  },
  {
    id: "cust-selcuklu",
    tenantId: "ten-kondes",
    name: "Selçuklu Plaza",
    phone: "0533 444 11 22",
    address: "Yazır Mah. Yeni İstanbul Cad. Selçuklu / Konya",
    taxInfo: "Selçuklu V.D. • 7580123490",
    notes: "Giyotin ve ısıcamlı cephe teklifi değerlendirmede.",
    createdAt: "2026-11-21",
  },
];

export const INITIAL_PAYMENTS: CrmPayment[] = [
  {
    id: "pay-1",
    tenantId: "ten-kondes",
    customerId: "cust-mavisehir",
    customerName: "Mavişehir Yapı (Müteahhit)",
    quoteCode: "PRJ-794",
    amount: 250000,
    method: "Havale / EFT",
    date: "2026-11-21",
    note: "%50 peşinat ödemesi alındı.",
  },
];

export const INITIAL_QUOTES: Quote[] = [
  {
    id: "q-795",
    tenantId: "ten-kondes",
    crmCustomerId: "cust-selcuklu",
    code: "PRJ-795",
    projectTitle: "Motorlu Giyotin & Isıcamlı Katlanır",
    customer: "Selçuklu Plaza",
    customerPhone: "0533 444 11 22",
    customerAddress: "Yazır Mah. Yeni İstanbul Cad. Selçuklu / Konya",
    validityLabel: "7 Gün",
    termsText:
      "krom kaplama çelik zincir tahrik sistemi\nmosel marka tüp motor ve uzaktan kumanda\niki yıl mekanik ve iki yıl motor garantisi",
    items: [
      {
        id: "li-1",
        facadeName: "1. Salon Ön Cephe",
        systemId: "sys_2",
        systemName: "Giosafe™ Motorlu Giyotin Seri",
        systemCode: "GS-110",
        drawingType: "giyotin",
        widthCm: 680,
        heightCm: 260,
        panels: 3,
        quantity: 1,
        glassThicknessId: "4+12+4",
        glassThicknessName: "4+12+4",
        outerGlassColor: "Şeffaf",
        innerGlassColor: "Füme",
        alumColor: "Antrasit Gri",
        motorName: "Mosel 5 Kanallı Kumanda",
        singleAreaM2: 17.68,
        totalAreaM2: 17.68,
        unitCostM2: 3320,
        unitSellPriceM2: 6116,
        totalCost: 58698,
        lineTotal: 108131,
      },
      {
        id: "li-2",
        facadeName: "2. Yan Teras Balkonu",
        systemId: "sys_4",
        systemName: "Xena™ Isıcamlı Katlanır Seri",
        systemCode: "XN-38",
        drawingType: "katlanir",
        widthCm: 520,
        heightCm: 240,
        panels: 7,
        quantity: 1,
        glassThicknessId: "4+12+4",
        glassThicknessName: "4+12+4",
        outerGlassColor: "Şeffaf",
        innerGlassColor: "Füme",
        alumColor: "Antrasit Gri",
        motorName: "Motorsuz",
        singleAreaM2: 12.48,
        totalAreaM2: 12.48,
        unitCostM2: 2470,
        unitSellPriceM2: 4550,
        totalCost: 30826,
        lineTotal: 56784,
      },
    ],
    discountRate: 0,
    includeVat: true,
    vatRate: 20,
    totalCost: 89524,
    subTotal: 164915,
    discountAmount: 0,
    vatAmount: 32983,
    total: 197898,
    paidAmount: 0,
    status: "Provizyonda",
    createdAt: "2026-11-21",
    updatedAt: "Bugün 17:40",
  },
  {
    id: "q-794",
    tenantId: "ten-kondes",
    crmCustomerId: "cust-mavisehir",
    code: "PRJ-794",
    projectTitle: "Isıcamlı Katlanır Cam Balkon (12 Daire)",
    customer: "Mavişehir Yapı (Müteahhit)",
    customerPhone: "0532 777 88 99",
    customerAddress: "Meram Yeni Yol Üzeri No:42 Meram / Konya",
    validityLabel: "15 Gün",
    termsText:
      "%100 metal park kanat toplama sistemi\npaslanmaz çelik rulman ve teker takımı\niki yıl mekanik ve montaj garantisi",
    items: [
      {
        id: "li-3",
        facadeName: "Tip Daire Salon Balkonu",
        systemId: "sys_4",
        systemName: "Xena™ Isıcamlı Katlanır Seri",
        systemCode: "XN-38",
        drawingType: "katlanir",
        widthCm: 420,
        heightCm: 230,
        panels: 6,
        quantity: 12,
        glassThicknessId: "4+12+4",
        glassThicknessName: "4+12+4",
        outerGlassColor: "Şeffaf",
        innerGlassColor: "Füme",
        alumColor: "Antrasit Gri",
        motorName: "Motorsuz",
        singleAreaM2: 9.66,
        totalAreaM2: 115.92,
        unitCostM2: 2470,
        unitSellPriceM2: 4550,
        totalCost: 286322,
        lineTotal: 527436,
      },
    ],
    discountRate: 8,
    includeVat: true,
    vatRate: 20,
    totalCost: 286322,
    subTotal: 527436,
    discountAmount: 42195,
    vatAmount: 97048,
    total: 582289,
    paidAmount: 250000,
    status: "Onaylandı",
    createdAt: "2026-11-21",
    updatedAt: "Bugün 19:15",
  },
];

const TENANTS_KEY = "marhlab.saas.tenants.v6";
const QUOTES_KEY = "marhlab.saas.quotes.v6";
const CUSTOMERS_KEY = "marhlab.saas.customers.v6";
const PAYMENTS_KEY = "marhlab.saas.payments.v6";
const TRASH_KEY = "marhlab.saas.trash.v6";
const SNAPSHOTS_KEY = "marhlab.saas.snapshots.v6";
const FIRM_SETTINGS_KEY = "marhlab.saas.firmsettings.v6";
const PLATFORM_SETTINGS_KEY = "marhlab.saas.settings.v6";

export function addDaysISO(baseIso: string, days: number): string {
  const dt = new Date(`${baseIso}T12:00:00`);
  dt.setDate(dt.getDate() + days);
  return dt.toISOString().slice(0, 10);
}

export function loadTenants(): TenantMember[] {
  try {
    const raw = localStorage.getItem(TENANTS_KEY);
    if (!raw) return INITIAL_TENANTS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? parsed : INITIAL_TENANTS;
  } catch {
    return INITIAL_TENANTS;
  }
}
export function saveTenants(v: TenantMember[]) {
  localStorage.setItem(TENANTS_KEY, JSON.stringify(v));
}

export function loadQuotes(): Quote[] {
  try {
    const raw = localStorage.getItem(QUOTES_KEY);
    if (!raw) return INITIAL_QUOTES;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_QUOTES;
  } catch {
    return INITIAL_QUOTES;
  }
}
export function saveQuotes(v: Quote[]) {
  localStorage.setItem(QUOTES_KEY, JSON.stringify(v));
}

export function loadCustomers(): CrmCustomer[] {
  try {
    const raw = localStorage.getItem(CUSTOMERS_KEY);
    if (!raw) return INITIAL_CUSTOMERS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_CUSTOMERS;
  } catch {
    return INITIAL_CUSTOMERS;
  }
}
export function saveCustomers(v: CrmCustomer[]) {
  localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(v));
}

export function loadPayments(): CrmPayment[] {
  try {
    const raw = localStorage.getItem(PAYMENTS_KEY);
    if (!raw) return INITIAL_PAYMENTS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_PAYMENTS;
  } catch {
    return INITIAL_PAYMENTS;
  }
}
export function savePayments(v: CrmPayment[]) {
  localStorage.setItem(PAYMENTS_KEY, JSON.stringify(v));
}

export function loadTrash(): TrashEntry[] {
  try {
    const raw = localStorage.getItem(TRASH_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
export function saveTrash(v: TrashEntry[]) {
  localStorage.setItem(TRASH_KEY, JSON.stringify(v));
}

export function loadSnapshots(): BackupSnapshot[] {
  try {
    const raw = localStorage.getItem(SNAPSHOTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
export function saveSnapshots(v: BackupSnapshot[]) {
  localStorage.setItem(SNAPSHOTS_KEY, JSON.stringify(v));
}

export function loadFirmSettingsMap(): Record<string, FirmEngineeringSettings> {
  try {
    const raw = localStorage.getItem(FIRM_SETTINGS_KEY);
    if (!raw) return { "ten-kondes": DEFAULT_FIRM_SETTINGS };
    return { "ten-kondes": DEFAULT_FIRM_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return { "ten-kondes": DEFAULT_FIRM_SETTINGS };
  }
}
export function saveFirmSettingsMap(v: Record<string, FirmEngineeringSettings>) {
  localStorage.setItem(FIRM_SETTINGS_KEY, JSON.stringify(v));
}

export function loadSettings(): PlatformSettings {
  try {
    const raw = localStorage.getItem(PLATFORM_SETTINGS_KEY);
    if (!raw) return DEFAULT_PLATFORM_SETTINGS;
    return { ...DEFAULT_PLATFORM_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PLATFORM_SETTINGS;
  }
}
export function saveSettings(v: PlatformSettings) {
  localStorage.setItem(PLATFORM_SETTINGS_KEY, JSON.stringify(v));
}

export function formatTRY(value: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat("tr-TR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(`${value}T12:00:00`));
  } catch {
    return value;
  }
}

export function buildWhatsAppUrl(phoneRaw: string, text: string) {
  const digits = phoneRaw.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}
