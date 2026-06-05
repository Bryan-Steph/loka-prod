export type Product = {
  id: string
  name: string
  price: number
  vendor: string
  shed: string
  category: string
  verified?: boolean
  bargainOk?: boolean
  condition?: 'New' | 'Used' | 'Refurbished'
  lastActive?: string
  address?: string
}

export const CATEGORIES = [
  'All',
  'Electronics',
  'Fashion',
  'Food & Drinks',
  'Fresh Produce',
  'Household',
  'Beauty',
  'Phones',
  'Books',
  'Shoes',
]

export const VENDOR_CATEGORIES = [
  'Electronics',
  'Fashion',
  'Food & Drinks',
  'Fresh Produce',
  'Household',
  'Beauty',
  'Phones & Accessories',
  'Books',
  'Shoes',
]

export function formatXAF(amount: number): string {
  return `${amount.toLocaleString('en-US')} XAF`
}

export const TRENDING_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Samsung Galaxy A32 (Unlocked)',
    price: 45000,
    vendor: 'Mama Agnes Electronics',
    shed: 'Shed 12B',
    category: 'Phones',
    verified: true,
    bargainOk: true,
    condition: 'Used',
  },
  {
    id: '2',
    name: 'Ankara Print Dress',
    price: 3500,
    vendor: 'Fabrics Palace',
    shed: 'Shed 3A',
    category: 'Fashion',
    verified: true,
  },
  {
    id: '3',
    name: 'Fresh Avocado (1 dozen)',
    price: 800,
    vendor: 'Green Market Hub',
    shed: 'Shed 9',
    category: 'Fresh Produce',
  },
  {
    id: '4',
    name: 'School Bag (Nike style)',
    price: 5000,
    vendor: 'SportZone Bamenda',
    shed: 'Shed 6C',
    category: 'Fashion',
    bargainOk: true,
  },
  {
    id: '5',
    name: 'Bluetooth Speaker (JBL-style)',
    price: 12000,
    vendor: 'Tech Corner',
    shed: 'Shed 7',
    category: 'Electronics',
    verified: true,
    bargainOk: true,
  },
  {
    id: '6',
    name: 'Palm Oil (5L)',
    price: 4500,
    vendor: 'Mama Blessing Foods',
    shed: 'Shed 15',
    category: 'Food & Drinks',
  },
]

export const VERIFIED_VENDORS = [
  { id: 'v1', name: 'Mama Agnes Electronics', category: 'Electronics', products: 12 },
  { id: 'v2', name: 'Fabrics Palace', category: 'Fashion', products: 34 },
  { id: 'v3', name: 'Tech Corner', category: 'Electronics', products: 21 },
  { id: 'v4', name: 'Green Market Hub', category: 'Produce', products: 18 },
  { id: 'v5', name: 'SportZone Bamenda', category: 'Fashion', products: 9 },
]

export const SEARCH_RESULTS: Product[] = [
  {
    id: '1',
    name: 'Samsung Galaxy A32 (Unlocked)',
    price: 45000,
    vendor: 'Mama Agnes Electronics',
    shed: 'Shed 14A',
    address: 'Shed 14A, Commercial Ave',
    category: 'Phones',
    verified: true,
    bargainOk: true,
    condition: 'Used',
    lastActive: 'Active 2h ago',
  },
  {
    id: '2',
    name: 'Samsung A13 Charger (Type-C)',
    price: 1500,
    vendor: 'Tech Corner',
    shed: 'Shed 7',
    address: 'Shed 7, Up Station',
    category: 'Electronics',
    condition: 'New',
    lastActive: 'Active 1d ago',
  },
  {
    id: '3',
    name: 'Samsung Galaxy A53 (Screen Cracked)',
    price: 25000,
    vendor: 'Phone Fix Bamenda',
    shed: 'Shed 22',
    address: 'Shed 22, Food Market',
    category: 'Phones',
    bargainOk: true,
    condition: 'Used',
    lastActive: 'Active 3h ago',
  },
  {
    id: '4',
    name: 'Samsung Earphones Original',
    price: 3000,
    vendor: 'Mobile Accessories Hub',
    shed: 'Shed 4',
    address: 'Shed 4, Cow Street',
    category: 'Electronics',
    condition: 'New',
    lastActive: 'Active 30m ago',
  },
  {
    id: '5',
    name: 'Power Bank (Samsung-compatible)',
    price: 8000,
    vendor: 'Power Up Store',
    shed: 'Shed 8',
    address: 'Shed 8, Main Market',
    category: 'Electronics',
    bargainOk: true,
    condition: 'New',
    lastActive: 'Active 5h ago',
  },
]

export type Enquiry = {
  id: string
  buyer: string
  product: string
  amount: number
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED'
  time: string
}

export const RECENT_ENQUIRIES: Enquiry[] = [
  { id: 'e1', buyer: 'Nkeng Alain', product: 'Samsung Galaxy A32...', amount: 38000, status: 'PENDING', time: '5m ago' },
  { id: 'e2', buyer: 'Bih Florence', product: 'Samsung Galaxy A32...', amount: 40000, status: 'ACCEPTED', time: '1h ago' },
  { id: 'e3', buyer: 'Junior Tabe', product: 'JBL Speaker...', amount: 8000, status: 'PENDING', time: '2h ago' },
  { id: 'e4', buyer: 'Grace Mbah', product: 'iPhone 12 Case...', amount: 1200, status: 'DECLINED', time: '1d ago' },
]
