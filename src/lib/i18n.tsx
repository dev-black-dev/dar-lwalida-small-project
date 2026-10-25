"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";
import type { ReactNode } from "react";

export type Lang = "fr" | "ar";

/** Dictionnaire complet de l'interface (FR par défaut, AR intégral). */
const fr = {
  "nav.home": "Accueil",
  "nav.menu": "Carte",
  "nav.about": "À propos",
  "nav.contact": "Contact",
  "cta.order": "Commander sur WhatsApp",
  "cta.discoverMenu": "Découvrir la carte",
  "skip.main": "Aller au contenu",
  "hero.kicker": "Cuisine marocaine · Rabat",
  "hero.slogan": "Le goût du Maroc, comme à la maison.",
  "hero.support":
    "Découvrez les saveurs authentiques de la cuisine marocaine, entre traditions, épices et plaisir de partager.",
  "hero.note": "Composez votre commande sur le site, puis envoyez-la en un message WhatsApp.",
  "howto.kicker": "Commander",
  "howto.title": "Votre commande en 3 étapes",
  "howto.1.title": "Choisissez vos plats",
  "howto.1.text": "Ajoutez entrées, tajines, desserts et boissons à votre commande.",
  "howto.2.title": "Indiquez vos coordonnées",
  "howto.2.text": "Nom, téléphone, livraison ou à emporter.",
  "howto.3.title": "Envoyez sur WhatsApp",
  "howto.3.text": "Le message est pré-rempli : le restaurant vous confirme ensuite la commande.",
  "menu.kicker": "La carte",
  "menu.title": "Nos plats",
  "menu.intro": "Entrées, tajines, plats du jour, desserts et boissons.",
  "menu.priceNote":
    "Prix indicatifs en dirhams (MAD), susceptibles d'évoluer : le prix final est confirmé par le restaurant sur WhatsApp.",
  "menu.search.label": "Rechercher un plat",
  "menu.search.ph": "Rechercher un plat (ex. tajine, harira…)",
  "menu.search.clear": "Effacer la recherche",
  "menu.search.all": "Tous",
  "menu.search.filter": "Filtrer par catégorie",
  "menu.search.results": "{n} résultat(s) pour « {q} »",
  "menu.search.empty.title": "Aucun plat trouvé",
  "menu.search.empty.text": "Essayez un autre mot ou parcourez les catégories.",
  "menu.items": "{n} plats",
  "menu.add": "Ajouter",
  "menu.photoIllustration": "Illustration",
  "menu.daily.servedOn": "Servi le {day}",
  "menu.daily.today": "Disponible aujourd'hui",
  "menu.daily.unavailable": "Non servi aujourd'hui",
  "menu.daily.hide": "Masquer les plats non servis aujourd'hui",
  "menu.daily.allHidden": "Aucun plat du jour n'est servi aujourd'hui.",
  "cart.title": "Votre commande",
  "cart.view": "Voir ma commande",
  "cart.items": "{n} article(s)",
  "cart.empty.title": "Votre commande est vide",
  "cart.empty.text": "Parcourez la carte et ajoutez vos plats préférés.",
  "cart.browse": "Voir la carte",
  "cart.clear": "Vider la commande",
  "cart.subtotal": "Sous-total",
  "cart.provisional": "Prix indicatifs",
  "cart.each": "l'unité",
  "cart.checkout": "Passer la commande",
  "cart.unavailableLine": "Non servi aujourd'hui — à retirer",
  "cart.unavailableBlock": "Retirez les plats non servis aujourd'hui pour continuer.",
  "cart.disclaimer":
    "Aucun paiement en ligne. Les frais éventuels (livraison…) et le prix final sont confirmés par le restaurant sur WhatsApp.",
  "checkout.title": "Finaliser la commande",
  "checkout.step1": "Coordonnées",
  "checkout.step2": "Vérification",
  "checkout.subtitle": "Vos informations servent uniquement à ce que le restaurant puisse vous répondre.",
  "checkout.name": "Nom complet",
  "checkout.name.ph": "Ex. Amina Benali",
  "checkout.phone": "Téléphone",
  "checkout.phone.ph": "Ex. 06 12 34 56 78",
  "checkout.mode": "Mode de réception",
  "checkout.delivery": "Livraison",
  "checkout.pickup": "À emporter",
  "checkout.address": "Adresse de livraison",
  "checkout.address.ph": "N°, rue, quartier, ville…",
  "checkout.notes": "Notes (facultatif)",
  "checkout.notes.ph": "Étage, code, précisions…",
  "checkout.continue": "Vérifier ma commande",
  "checkout.back": "Modifier",
  "checkout.error.cart": "Votre commande est vide : ajoutez au moins un plat.",
  "checkout.error.unavailable": "Votre commande contient un plat non servi aujourd'hui. Retirez-le pour continuer.",
  "checkout.error.name": "Veuillez indiquer votre nom.",
  "checkout.error.phone": "Numéro invalide. Exemple : 06 12 34 56 78 ou +212 6 12 34 56 78.",
  "checkout.error.address": "Veuillez indiquer l'adresse de livraison.",
  "checkout.error.number":
    "Le numéro WhatsApp du restaurant n'est pas configuré correctement. Merci d'appeler le restaurant directement.",
  "checkout.review.title": "Votre message WhatsApp",
  "checkout.review.help":
    "Voici exactement le message qui sera pré-rempli dans WhatsApp, à destination du {number}.",
  "checkout.open": "Ouvrir WhatsApp",
  "checkout.copy": "Copier le message",
  "checkout.copied": "Message copié",
  "checkout.sentNote":
    "Dans WhatsApp, appuyez sur « Envoyer ». La commande n'est confirmée qu'une fois que le restaurant vous a répondu.",
  "checkout.fallback":
    "WhatsApp ne s'ouvre pas ? Copiez le message et envoyez-le au {number}.",
  "about.kicker": "À propos",
  "about.title": "Dar L'Walida, au cœur de Rabat",
  "about.p1":
    "Dar L'Walida — « شهيوات بلدية مغربية » — vous accueille sur l'avenue Mohammed V, à Rabat, autour d'une cuisine marocaine traditionnelle.",
  "about.p2":
    "Salades marocaines, harira, tajines mijotés, couscous du vendredi et thé à la menthe : des plats de tradition, à partager sur place, à emporter ou à commander via WhatsApp.",
  "about.imageNote":
    "Visuels d'illustration pour cette maquette — les photographies officielles du restaurant prendront leur place.",
  "contact.kicker": "Contact",
  "contact.title": "Nous trouver",
  "contact.visit": "Adresse",
  "contact.phone": "Téléphone",
  "contact.phoneNote": "Numéro public — à confirmer avant mise en ligne.",
  "contact.hours": "Horaires",
  "contact.hoursNote": "Les horaires sont communiqués directement par le restaurant.",
  "contact.directions": "Obtenir l'itinéraire",
  "contact.openMap": "Ouvrir dans Google Maps",
  "contact.order": "Commander sur WhatsApp",
  "contact.tempNumber":
    "Numéro WhatsApp provisoire pour cette démonstration — sera remplacé par le numéro officiel.",
  "contact.toConfirm": "À confirmer",
  "contact.map.title": "Nous trouver",
  "contact.map.kicker": "Plan",
  "contact.map.iframe": "Carte Google Maps — Dar L'Walida, 292 Avenue Mohammed V, Rabat",
  "contact.map.coords": "Coordonnées",
  "contact.map.source":
    "Position issue d'OpenStreetMap (nœud « Dar Lwalida », août 2026). À confirmer par le restaurant.",
  "contact.instagram": "Instagram",
  "footer.tagline": "Le goût du Maroc, comme à la maison.",
  "footer.nav": "Navigation",
  "footer.contact": "Contact",
  "footer.rights": "Tous droits réservés.",
  "footer.demo":
    "Site de démonstration — prix, horaires et photographies à confirmer avec le restaurant avant publication.",
  "footer.instagram": "Instagram",
  "footer.credit": "Designed & Developed by Black.",
  "toast.added": "ajouté à la commande",
  "cart.open": "Ouvrir la commande",
  "cart.close": "Fermer",
  "menu.close": "Fermer le menu",
  "menu.open": "Ouvrir le menu",
  "lang.label": "العربية",
  "lang.switch": "التبديل إلى العربية",
  "aria.quantity": "Quantité de {name}",
  "aria.remove": "Retirer {name} de la commande",
  "aria.decrease": "Diminuer la quantité de {name}",
  "aria.increase": "Augmenter la quantité de {name}",
  "aria.add": "Ajouter {name} à la commande",
};

type Dict = Record<keyof typeof fr, string>;

const ar: Dict = {
  "nav.home": "الرئيسية",
  "nav.menu": "القائمة",
  "nav.about": "من نحن",
  "nav.contact": "اتصل بنا",
  "cta.order": "اطلب عبر واتساب",
  "cta.discoverMenu": "اكتشف القائمة",
  "skip.main": "انتقل إلى المحتوى",
  "hero.kicker": "مطبخ مغربي · الرباط",
  "hero.slogan": "مذاق المغرب، كما في البيت.",
  "hero.support": "اكتشف النكهات الأصيلة للمطبخ المغربي، بين التقاليد والتوابل ومتعة المشاركة.",
  "hero.note": "اختر طلبك على الموقع، ثم أرسله في رسالة واتساب واحدة.",
  "howto.kicker": "الطلب",
  "howto.title": "طلبك في 3 خطوات",
  "howto.1.title": "اختر أطباقك",
  "howto.1.text": "أضف المقبلات والطواجن والحلويات والمشروبات إلى طلبك.",
  "howto.2.title": "أدخل معلوماتك",
  "howto.2.text": "الاسم، الهاتف، التوصيل أو الاستلام.",
  "howto.3.title": "أرسل عبر واتساب",
  "howto.3.text": "الرسالة جاهزة مسبقًا: يؤكد لك المطعم الطلب بعد ذلك.",
  "menu.kicker": "القائمة",
  "menu.title": "أطباقنا",
  "menu.intro": "مقبلات، طواجن، أطباق اليوم، حلويات ومشروبات.",
  "menu.priceNote":
    "أسعار تقريبية بالدرهم (MAD) وقابلة للتغيير: يؤكد المطعم السعر النهائي عبر واتساب.",
  "menu.search.label": "ابحث عن طبق",
  "menu.search.ph": "ابحث عن طبق (مثلًا: طاجين، حريرة…)",
  "menu.search.clear": "مسح البحث",
  "menu.search.all": "الكل",
  "menu.search.filter": "تصفية حسب القسم",
  "menu.search.results": "{n} نتيجة لـ «{q}»",
  "menu.search.empty.title": "لم يتم العثور على أي طبق",
  "menu.search.empty.text": "جرّب كلمة أخرى أو تصفح الأقسام.",
  "menu.items": "{n} أطباق",
  "menu.add": "أضف",
  "menu.photoIllustration": "صورة توضيحية",
  "menu.daily.servedOn": "يُقدَّم يوم {day}",
  "menu.daily.today": "متوفر اليوم",
  "menu.daily.unavailable": "غير متوفر اليوم",
  "menu.daily.hide": "إخفاء الأطباق غير المتوفرة اليوم",
  "menu.daily.allHidden": "لا يوجد طبق يوم متوفر اليوم.",
  "cart.title": "طلبك",
  "cart.view": "عرض طلبي",
  "cart.items": "{n} عنصر",
  "cart.empty.title": "طلبك فارغ",
  "cart.empty.text": "تصفح القائمة وأضف أطباقك المفضلة.",
  "cart.browse": "عرض القائمة",
  "cart.clear": "تفريغ الطلب",
  "cart.subtotal": "المجموع الفرعي",
  "cart.provisional": "أسعار تقريبية",
  "cart.each": "للوحدة",
  "cart.checkout": "متابعة الطلب",
  "cart.unavailableLine": "غير متوفر اليوم — يُرجى حذفه",
  "cart.unavailableBlock": "احذف الأطباق غير المتوفرة اليوم للمتابعة.",
  "cart.disclaimer":
    "لا يوجد دفع عبر الإنترنت. الرسوم المحتملة (التوصيل…) والسعر النهائي يؤكدها المطعم عبر واتساب.",
  "checkout.title": "إتمام الطلب",
  "checkout.step1": "المعلومات",
  "checkout.step2": "المراجعة",
  "checkout.subtitle": "تُستخدم معلوماتك فقط ليتمكن المطعم من الرد عليك.",
  "checkout.name": "الاسم الكامل",
  "checkout.name.ph": "مثال: أمينة بن علي",
  "checkout.phone": "الهاتف",
  "checkout.phone.ph": "مثال: 06 12 34 56 78",
  "checkout.mode": "طريقة الاستلام",
  "checkout.delivery": "توصيل",
  "checkout.pickup": "استلام من المطعم",
  "checkout.address": "عنوان التوصيل",
  "checkout.address.ph": "رقم، شارع، حي، مدينة…",
  "checkout.notes": "ملاحظات (اختياري)",
  "checkout.notes.ph": "الطابق، الرمز، تفاصيل…",
  "checkout.continue": "مراجعة طلبي",
  "checkout.back": "تعديل",
  "checkout.error.cart": "طلبك فارغ: أضف طبقًا واحدًا على الأقل.",
  "checkout.error.unavailable": "طلبك يحتوي على طبق غير متوفر اليوم. احذفه للمتابعة.",
  "checkout.error.name": "من فضلك أدخل اسمك.",
  "checkout.error.phone": "رقم غير صالح. مثال: 06 12 34 56 78 أو ‎+212 6 12 34 56 78.",
  "checkout.error.address": "من فضلك أدخل عنوان التوصيل.",
  "checkout.error.number": "رقم واتساب المطعم غير مضبوط بشكل صحيح. يُرجى الاتصال بالمطعم مباشرة.",
  "checkout.review.title": "رسالتك على واتساب",
  "checkout.review.help": "هذه بالضبط الرسالة التي ستظهر جاهزة في واتساب، موجّهة إلى {number}.",
  "checkout.open": "افتح واتساب",
  "checkout.copy": "نسخ الرسالة",
  "checkout.copied": "تم نسخ الرسالة",
  "checkout.sentNote": "في واتساب، اضغط «إرسال». لا يُعتبر الطلب مؤكدًا إلا بعد رد المطعم.",
  "checkout.fallback": "لم يُفتح واتساب؟ انسخ الرسالة وأرسلها إلى {number}.",
  "about.kicker": "من نحن",
  "about.title": "دار الوليدة، في قلب الرباط",
  "about.p1":
    "دار الوليدة — «شهيوات بلدية مغربية» — تستقبلكم في شارع محمد الخامس بالرباط، حول مطبخ مغربي تقليدي.",
  "about.p2":
    "سلطات مغربية، حريرة، طواجن مطهوة على مهل، كسكس الجمعة وشاي بالنعناع: أطباق تقليدية تُتقاسم في المطعم أو تؤخذ معك أو تُطلب عبر واتساب.",
  "about.imageNote": "صور توضيحية لهذه النسخة — ستحل مكانها الصور الرسمية للمطعم.",
  "contact.kicker": "اتصل بنا",
  "contact.title": "زورونا",
  "contact.visit": "العنوان",
  "contact.phone": "الهاتف",
  "contact.phoneNote": "رقم عام — يُؤكَّد قبل الإطلاق.",
  "contact.hours": "أوقات العمل",
  "contact.hoursNote": "يعلن المطعم عن أوقات العمل مباشرة.",
  "contact.directions": "الحصول على الاتجاهات",
  "contact.openMap": "افتح في خرائط جوجل",
  "contact.order": "اطلب عبر واتساب",
  "contact.tempNumber": "رقم واتساب مؤقت لهذه النسخة التجريبية — سيُستبدل بالرقم الرسمي.",
  "contact.toConfirm": "قيد التأكيد",
  "contact.map.title": "زورونا",
  "contact.map.kicker": "الخريطة",
  "contact.map.iframe": "خريطة جوجل — دار الوليدة، 292 شارع محمد الخامس، الرباط",
  "contact.map.coords": "الإحداثيات",
  "contact.map.source":
    "الموقع من خريطة الشارع المفتوحة (عقدة «Dar Lwalida»، أغسطس 2026). يُؤكَّد من المطعم.",
  "contact.instagram": "إنستغرام",
  "footer.tagline": "مذاق المغرب، كما في البيت.",
  "footer.nav": "التصفح",
  "footer.contact": "اتصال",
  "footer.rights": "جميع الحقوق محفوظة.",
  "footer.demo": "موقع تجريبي — الأسعار والمواعيد والصور تُؤكَّد مع المطعم قبل الإطلاق.",
  "footer.instagram": "إنستغرام",
  "footer.credit": "Designed & Developed by Black.",
  "toast.added": "أُضيف إلى الطلب",
  "cart.open": "فتح الطلب",
  "cart.close": "إغلاق",
  "menu.close": "إغلاق القائمة",
  "menu.open": "فتح القائمة",
  "lang.label": "Français",
  "lang.switch": "Passer au français",
  "aria.quantity": "كمية {name}",
  "aria.remove": "حذف {name} من الطلب",
  "aria.decrease": "إنقاص كمية {name}",
  "aria.increase": "زيادة كمية {name}",
  "aria.add": "إضافة {name} إلى الطلب",
};

const dict: Record<Lang, Dict> = { fr, ar };

export type DictKey = keyof typeof fr;

/* ── Store de langue : source unique, lue via useSyncExternalStore ──
   Évite tout setState dans un effet d'hydratation et garantit une
   seule langue de référence pour toute l'application. */
const LANG_STORAGE_KEY = "dlw.lang";

let langSnapshot: Lang = "fr";
const langListeners = new Set<() => void>();

function subscribeLang(listener: () => void): () => void {
  langListeners.add(listener);
  return () => {
    langListeners.delete(listener);
  };
}

function getLangSnapshot(): Lang {
  return langSnapshot;
}

/** Côté serveur et pendant l'hydratation : français (valeur du HTML rendu). */
function getServerLangSnapshot(): Lang {
  return "fr";
}

function emitLang(): void {
  for (const listener of langListeners) listener();
}

function setGlobalLang(next: Lang): void {
  if (next === langSnapshot) return;
  langSnapshot = next;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(LANG_STORAGE_KEY, next);
    } catch {
      /* stockage indisponible */
    }
  }
  emitLang();
}

function hydrateLang(): void {
  if (typeof window === "undefined") return;
  try {
    const saved = window.localStorage.getItem(LANG_STORAGE_KEY);
    if ((saved === "fr" || saved === "ar") && saved !== langSnapshot) {
      langSnapshot = saved;
      emitLang();
    }
  } catch {
    /* stockage indisponible */
  }
}

interface I18nValue {
  lang: Lang;
  dir: "ltr" | "rtl";
  setLang: (l: Lang) => void;
  t: (key: DictKey, vars?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nValue | null>(null);

export function LangProvider({ children }: { children: ReactNode }) {
  const lang = useSyncExternalStore(subscribeLang, getLangSnapshot, getServerLangSnapshot);

  // Lecture unique de la langue mémorisée (mutate le store externe).
  useEffect(() => {
    hydrateLang();
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  const setLang = useCallback((l: Lang) => setGlobalLang(l), []);

  const value = useMemo<I18nValue>(() => {
    const t = (key: DictKey, vars?: Record<string, string | number>) => {
      let s = dict[lang][key] ?? fr[key] ?? key;
      if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v));
      return s;
    };
    return { lang, dir: lang === "ar" ? "rtl" : "ltr", setLang, t };
  }, [lang, setLang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n doit être utilisé dans <LangProvider>");
  return ctx;
}
