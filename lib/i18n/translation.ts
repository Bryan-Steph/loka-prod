export const translations = {
  en: {
    // Navigation
    'nav.home':    'Home',
    'nav.search':  'Search',
    'nav.chat':    'Chat',
    'nav.alerts':  'Alerts',
    'nav.profile': 'Profile',

    // Common actions
    'common.signIn':    'Sign In',
    'common.signOut':   'Sign Out',
    'common.save':      'Save',
    'common.cancel':    'Cancel',
    'common.follow':    'Follow',
    'common.following': 'Following',
    'common.message':   'Message',
    'common.loading':   'Loading…',
    'common.retry':     'Retry',

    // Home page
    'home.searchPlaceholder':      'Search products, vendors...',
    'home.heroTitle':              "Bamenda's Market, Now Online",
    'home.heroSubtitle':           'Verified vendors. Safe bargaining. Real pickup.',
    'home.browseProducts':         'Browse Products',
    'home.sellWithLoka':           'Sell with LOKA',
    'home.verifiedVendors':        'Verified Vendors',
    'home.trending':               'Trending in Bamenda',
    'home.fromVendorsYouFollow':   'From Vendors You Follow',
    'home.seeAll':                 'See all',
    'home.noProducts':             'No products listed yet. Vendors are being verified.',
    'home.noProductsCategory':     'No products found in this category.',
    'home.noVendors':              'No verified vendors yet.',
  },
  fr: {
    // Navigation
    'nav.home':    'Accueil',
    'nav.search':  'Recherche',
    'nav.chat':    'Discussion',
    'nav.alerts':  'Alertes',
    'nav.profile': 'Profil',

    // Common actions
    'common.signIn':    'Connexion',
    'common.signOut':   'Déconnexion',
    'common.save':      'Enregistrer',
    'common.cancel':    'Annuler',
    'common.follow':    'Suivre',
    'common.following': 'Suivi',
    'common.message':   'Message',
    'common.loading':   'Chargement…',
    'common.retry':     'Réessayer',

    // Home page
    'home.searchPlaceholder':      'Rechercher produits, vendeurs...',
    'home.heroTitle':              'Le marché de Bamenda, en ligne',
    'home.heroSubtitle':           'Vendeurs vérifiés. Négociation sûre. Retrait réel.',
    'home.browseProducts':         'Parcourir les produits',
    'home.sellWithLoka':           'Vendre sur LOKA',
    'home.verifiedVendors':        'Vendeurs vérifiés',
    'home.trending':               'Tendances à Bamenda',
    'home.fromVendorsYouFollow':   'Vendeurs que vous suivez',
    'home.seeAll':                 'Voir tout',
    'home.noProducts':             'Aucun produit pour le moment.',
    'home.noProductsCategory':     'Aucun produit dans cette catégorie.',
    'home.noVendors':              'Aucun vendeur vérifié pour le moment.',
  },
} as const

export type Lang = keyof typeof translations
export type TranslationKey = keyof typeof translations.en