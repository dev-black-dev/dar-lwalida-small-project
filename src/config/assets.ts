/**
 * ─────────────────────────────────────────────────────────────
 *  Carte des visuels réels & optimisés — public/assets/
 *
 *  Photos officielles et authentiques du restaurant DAR L'WALIDA
 *  (Rabat) issues des archives photographiques du restaurant.
 * ─────────────────────────────────────────────────────────────
 */

export type AssetKey =
  | "hero"
  | "hero-mobile"
  | "exterieur"
  | "ambiance"
  | "table-traditionnelle"
  | "banner-entrees"
  | "banner-tajines"
  | "banner-plats-du-jour"
  | "dish-tajine-kefta-oeufs"
  | "dish-rfissa"
  | "dish-couscous"
  | "dish-seffa"
  | "dish-salade-marocaine"
  | "dish-the-menthe"
  | "dish-salade-lwalida" | "dish-harira" | "dish-taktouka" | "dish-bakkoula" | "dish-zaalouk" | "dish-lentilles" | "dish-haricots-blancs"
  | "dish-tajine-foie-veau" | "dish-tajine-pied-veau" | "dish-tanjia-lwalida" | "dish-tajine-tete-boeuf" | "dish-tajine-queue-boeuf" | "dish-tripes-boeuf" | "dish-tajine-poulet-citron" | "dish-tajine-kefta-sardines"
  | "dish-couscous-boeuf" | "dish-couscous-poulet"
  | "dish-salade-fruits" | "dish-mahlabiya"
  | "dish-cafe-espresso" | "dish-coca-classique" | "dish-coca-zero" | "dish-hawai-tropical" | "dish-poms-pomme" | "dish-sprite-classique" | "dish-sidi-ali";

export interface Asset {
  src: string;
  isConceptual: boolean;
  altFr: string;
  altAr: string;
  w: number;
  h: number;
}

const generatedDish = (name: string, altFr: string, altAr: string): Asset => ({
  src: `/assets/dishes/dish-${name}.webp`,
  isConceptual: true,
  altFr,
  altAr,
  w: 720,
  h: 720,
});

export const assets: Record<AssetKey, Asset> = {
  hero: {
    src: "/assets/hero.jpg",
    isConceptual: false,
    altFr: "Salle de restaurant Dar L'Walida avec tables en bois, lanternes marocaines et ambiance chaleureuse",
    altAr: "صالة مطعم دار الوالدة بطاولات خشبية وفوانيس مغربية وأجواء دافئة",
    w: 1600,
    h: 900,
  },
  "hero-mobile": {
    src: "/assets/hero-mobile.jpg",
    isConceptual: false,
    altFr: "Intérieur chaleureux et lanternes traditionnelles du restaurant Dar L'Walida",
    altAr: "داخل مطعم دار الوالدة وفوانيسه التقليدية بأجواء أصيلة",
    w: 737,
    h: 1024,
  },
  exterieur: {
    src: "/assets/exterieur.jpg",
    isConceptual: false,
    altFr: "Façade et terrasse de Dar L'Walida, 292 Avenue Mohammed V, Rabat",
    altAr: "واجهة وشرفة مطعم دار الوالدة، 292 شارع محمد الخامس، الرباط",
    w: 1024,
    h: 940,
  },
  ambiance: {
    src: "/assets/ambiance.jpg",
    isConceptual: false,
    altFr: "Mural Dar L'Walida, zelliges, lanternes en osier et oliviers",
    altAr: "جدارية دار الوالدة، زليج وفوانيس وأشجار الزيتون",
    w: 900,
    h: 950,
  },
  "table-traditionnelle": {
    src: "/assets/table-traditionnelle.jpg",
    isConceptual: false,
    altFr: "Table marocaine traditionnelle à Dar L'Walida : seffa, tajine, pain chaud, olives et thé à la menthe",
    altAr: "مائدة مغربية تقليدية في دار الوالدة: سفة، طاجين، خبز طازج، زيتون وشاي بالنعناع",
    w: 1200,
    h: 900,
  },
  "banner-entrees": {
    src: "/assets/banners/banner-entrees.jpg",
    isConceptual: false,
    altFr: "Assortiment d'entrées et salades marocaines traditionnelles servies à Dar L'Walida",
    altAr: "تشكيلة من المقبلات والسلطات المغربية التقليدية في دار الوالدة",
    w: 1200,
    h: 650,
  },
  "banner-tajines": {
    src: "/assets/banners/banner-tajines.jpg",
    isConceptual: false,
    altFr: "Tajine marocain traditionnel mijoté en terre cuite à Dar L'Walida",
    altAr: "طاجين مغربي تقليدي مطهو في الفخار بدار الوالدة",
    w: 1200,
    h: 650,
  },
  "banner-plats-du-jour": {
    src: "/assets/banners/banner-plats-du-jour.jpg",
    isConceptual: false,
    altFr: "Couscous marocain aux sept légumes et viande servi dans un plat en terre cuite",
    altAr: "كسكس مغربي بالخضر واللحم في طبق فخاري أصيل",
    w: 1200,
    h: 700,
  },
  "dish-tajine-kefta-oeufs": {
    src: "/assets/dishes/dish-tajine-kefta-oeufs.webp",
    isConceptual: true,
    altFr: "Tajine de kefta aux œufs et sauce tomate mijoté à Dar L'Walida",
    altAr: "طاجين الكفتة بالبيض وصلصة الطماطم بدار الوالدة",
    w: 720,
    h: 720,
  },
  "dish-rfissa": {
    src: "/assets/dishes/dish-rfissa.webp",
    isConceptual: true,
    altFr: "Rfissa traditionnelle au poulet beldi, lentilles et fenugrec à Dar L'Walida",
    altAr: "رفيسة تقليدية بالدجاج والعدس والحلصة بدار الوالدة",
    w: 720,
    h: 720,
  },
  "dish-couscous": {
    src: "/assets/dishes/dish-couscous-boeuf.webp",
    isConceptual: true,
    altFr: "Couscous traditionnel à la viande et légumes frais du vendredi",
    altAr: "كسكس يوم الجمعة باللحم والخضر الطازجة بدار الوالدة",
    w: 720,
    h: 720,
  },
  "dish-seffa": {
    src: "/assets/dishes/dish-seffa.webp",
    isConceptual: true,
    altFr: "Seffa medfouna au poulet, cannelle et amandes grillées",
    altAr: "سفة مدفونة بالدجاج والقرفة واللوز المحمر بدار الوالدة",
    w: 720,
    h: 720,
  },
  "dish-salade-marocaine": {
    src: "/assets/dishes/dish-salade-marocaine.webp",
    isConceptual: true,
    altFr: "Salade marocaine fraîche aux tomates, concombres et olives noires",
    altAr: "سلطة مغربية طازجة بالطماطم والخيار والزيتون الأسود",
    w: 720,
    h: 720,
  },
  "dish-the-menthe": {
    src: "/assets/dishes/dish-the-menthe.webp",
    isConceptual: true,
    altFr: "Thé marocain traditionnel à la menthe fraîche versé à la théière",
    altAr: "أتاي مغربي تقليدي بالنعناع الطازج مسكوب بالبراد",
    w: 720,
    h: 720,
  },
  "dish-salade-lwalida": generatedDish("salade-lwalida", "Salade composée L'Walida", "سلطة الوليدة المشكلة"),
  "dish-harira": generatedDish("harira", "Soupe marocaine harira aux pois chiches et lentilles", "شوربة حريرة مغربية بالحمص والعدس"),
  "dish-taktouka": generatedDish("taktouka", "Taktouka marocaine aux poivrons et tomates", "تكتوكة مغربية بالفلفل والطماطم"),
  "dish-bakkoula": generatedDish("bakkoula", "Bakkoula marocaine aux herbes", "بَقّولة مغربية بالأعشاب"),
  "dish-zaalouk": generatedDish("zaalouk", "Zaalouk d'aubergines et tomates", "زعلوك الباذنجان والطماطم"),
  "dish-lentilles": generatedDish("lentilles", "Lentilles marocaines mijotées", "عدس مغربي مطهو"),
  "dish-haricots-blancs": generatedDish("haricots-blancs", "Haricots blancs à la marocaine", "لوبيا بيضاء على الطريقة المغربية"),
  "dish-tajine-foie-veau": generatedDish("tajine-foie-veau", "Tajine de foie de veau aux épices", "طاجين كبدة العجل بالتوابل"),
  "dish-tajine-pied-veau": generatedDish("tajine-pied-veau", "Tajine de pied de veau", "طاجين كرعين العجل"),
  "dish-tanjia-lwalida": generatedDish("tanjia-lwalida", "Tanjia marocaine L'Walida", "طنجية مغربية من الوليدة"),
  "dish-tajine-tete-boeuf": generatedDish("tajine-tete-boeuf", "Tajine de tête de bœuf", "طاجين رأس البقر"),
  "dish-tajine-queue-boeuf": generatedDish("tajine-queue-boeuf", "Tajine de queue de bœuf", "طاجين ذيل البقر"),
  "dish-tripes-boeuf": generatedDish("tripes-boeuf", "Tripes de bœuf à la marocaine", "كرشة البقر على الطريقة المغربية"),
  "dish-tajine-poulet-citron": generatedDish("tajine-poulet-citron", "Tajine de poulet au citron confit et olives", "طاجين الدجاج بالحامض المرقد والزيتون"),
  "dish-tajine-kefta-sardines": generatedDish("tajine-kefta-sardines", "Tajine de kefta de sardines", "طاجين كفتة السردين"),
  "dish-couscous-boeuf": generatedDish("couscous-boeuf", "Couscous marocain au bœuf et légumes", "كسكس مغربي بلحم البقر والخضر"),
  "dish-couscous-poulet": generatedDish("couscous-poulet", "Couscous marocain au poulet et légumes", "كسكس مغربي بالدجاج والخضر"),
  "dish-salade-fruits": generatedDish("salade-fruits", "Salade de fruits frais", "سلطة فواكه طازجة"),
  "dish-mahlabiya": generatedDish("mahlabiya", "Mahlabiya aux fruits secs", "مهلبية بالمكسرات"),
  "dish-cafe-espresso": generatedDish("cafe-espresso", "Café espresso", "قهوة إسبريسو"),
  "dish-coca-classique": generatedDish("coca-classique", "Boisson cola classique fraîche", "مشروب كولا كلاسيكي بارد"),
  "dish-coca-zero": generatedDish("coca-zero", "Boisson cola sans sucre fraîche", "مشروب كولا بدون سكر بارد"),
  "dish-hawai-tropical": generatedDish("hawai-tropical", "Boisson gazeuse tropicale fraîche", "مشروب غازي استوائي بارد"),
  "dish-poms-pomme": generatedDish("poms-pomme", "Boisson gazeuse à la pomme fraîche", "مشروب غازي بالتفاح بارد"),
  "dish-sprite-classique": generatedDish("sprite-classique", "Boisson gazeuse citron-citron vert fraîche", "مشروب غازي بالليمون والليمون الأخضر بارد"),
  "dish-sidi-ali": generatedDish("sidi-ali", "Eau minérale fraîche", "مياه معدنية باردة"),
};
