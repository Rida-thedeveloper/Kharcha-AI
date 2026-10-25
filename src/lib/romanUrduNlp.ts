import { ExtractedExpense, CategoryName } from '../types/expense';

// Comprehensive dictionary for category detection in Roman Urdu, Urdu, and English
export const CATEGORY_KEYWORDS: Record<CategoryName, string[]> = {
  'Food & Drinks': [
    'biryani', 'biriyani', 'briyani', 'pulao', 'polao', 'nihari', 'nehari', 'haleem',
    'burger', 'burgers', 'zinger', 'pizza', 'pizzas', 'khana', 'lunch', 'dinner',
    'chai', 'tea', 'green tea', 'sabz chai', 'doodh patti', 'coffee', 'cappuccino', 'latte',
    'nashta', 'breakfast', 'shawarma', 'shwarma', 'karahi', 'karai', 'qorma', 'korma',
    'roll', 'rolls', 'paratha roll', 'samosa', 'samose', 'samosay', 'pakora', 'pakoray', 'pakore',
    'bakery', 'cake', 'pastry', 'pastries', 'juice', 'fresh juice', 'milkshake', 'shake',
    'falooda', 'faluda', 'ice cream', 'icecream', 'kulfi', 'biscuit', 'biscuits', 'snack', 'snacks',
    'mcdonalds', 'kfc', 'subway', 'optp', 'hardees', 'cheezious', 'broadway', 'dominos',
    'kabab', 'kebab', 'seekh kabab', 'chapli kabab', 'tikka', 'boti', 'malai boti',
    'salan', 'roti', 'naan', 'nan', 'paratha', 'pratha', 'puri', 'poori', 'halwa puri',
    'lassi', 'dahi bhallay', 'dahi bhalla', 'chaat', 'chana chaat', 'gol gappay', 'golgappa', 'golgappe',
    'cold drink', 'cold drinks', 'coldrink', 'coldrik', 'cold rik', 'colddrink', 'pepsi', 'coke', 'coca cola', '7up', 'seven up', 'sprite',
    'dew', 'mountain dew', 'fanta', 'marinda', 'mirinda', 'sting', 'pakola', 'soft drink', 'soda', 'water bottle', 'pani ki botal',
    'hotel', 'cafe', 'restaurant', 'dhaba', 'chips', 'french fries', 'fries', 'lays', 'kurkure',
    'mithai', 'gulab jamun', 'jalebi', 'rasgulla', 'barfi', 'soup', 'chinese', 'chowmein', 'fried rice',
  ],
  'Transport': [
    'petrol', 'fuel', 'diesel', 'cng', 'patrol', 'pitrol', 'gasoline',
    'rikshaw', 'rickshaw', 'ricksha', 'auto', 'chinchi', 'qingqi', 'chingchi',
    'bus', 'wagon', 'van', 'speedo', 'metro', 'metro bus', 'orange line', 'green line', 'red line',
    'taxi', 'cab', 'careem', 'uber', 'indrive', 'in drive', 'bykea', 'yango',
    'ride', 'drive', 'toll', 'toll plaza', 'mtag', 'm-tag', 'parking', 'puncture', 'panchar',
    'tyre', 'tire', 'car wash', 'gari wash', 'bike service', 'car service', 'oil change', 'mobil oil',
    'train', 'railway', 'train ticket', 'air ticket', 'flight', 'fare', 'kiraya',
  ],
  'Groceries': [
    'grocery', 'groceries', 'rashan', 'ration', 'sauda', 'sauda salaf',
    'doodh', 'dood', 'milk', 'dahi', 'curd', 'yogurt',
    'sabzi', 'sabziyan', 'tarkari', 'vegetable', 'vegetables', 'phal', 'fruit', 'fruits',
    'tamatar', 'tomato', 'pyaz', 'pyaaz', 'onion', 'aalo', 'aloo', 'potato', 'lehsan', 'adrak',
    'atta', 'aata', 'flour', 'chawal', 'rice', 'daal', 'dal', 'daalein', 'lentils',
    'ghee', 'oil', 'cooking oil', 'tail', 'sarson ka tail', 'masalay', 'masala', 'mirch', 'chilli',
    'haldi', 'namak', 'salt', 'chini', 'cheeni', 'sugar', 'patti', 'tea patti', 'lipton', 'tapal',
    'anday', 'ande', 'eggs', 'egg', 'meat', 'gosht', 'chicken', 'murgi', 'beef', 'mutton', 'machli', 'machhli', 'fish',
    'bread', 'double roti', 'bun', 'makhan', 'butter', 'jam', 'cheese', 'paneer',
    'supermarket', 'mart', 'imtiaz', 'chase up', 'bin hashim', 'carrefour', 'store', 'kiryana',
  ],
  'Bills & Utilities': [
    'bijli', 'electricity', 'electric', 'bijli ka bill', 'kelectric', 'k-electric', 'lesco', 'fesco', 'iesco',
    'gepco', 'mepco', 'pesco', 'hesco', 'sepco', 'qesco', 'twt',
    'gas', 'gas bill', 'gas ka bill', 'sui gas', 'ssgc', 'sngpl',
    'pani', 'water', 'water bill', 'pani ka tanker', 'tanker', 'tanki',
    'bill', 'bills', 'wifi', 'wi-fi', 'internet', 'net', 'ptcl', 'nayatel', 'stormfiber', 'broadband',
    'mobile load', 'easyload', 'load', 'balance', 'recharge', 'jazz load', 'telenor load', 'ufone load', 'zong load',
    'utilities', 'maintenance', 'society maintenance', 'generator', 'ups battery', 'solar',
  ],
  'Health': [
    'medicine', 'dawa', 'dawai', 'dawayi', 'dawaein', 'panadol', 'disprin', 'brufen', 'arinate',
    'flagyl', 'augmentin', 'surbex', 'calpol', 'ponstan', 'tablet', 'tablets', 'goli', 'goliyan', 'syrup',
    'doctor', 'doc', 'dr', 'hospital', 'clinic', 'pharmacy', 'medical', 'medical store',
    'd-watson', 'dwatson', 'fazal din', 'servaid', 'dentist', 'daant', 'tooth',
    'test', 'lab test', 'blood test', 'chughtai lab', 'shaukat khanum', 'alnoor',
    'checkup', 'operation', 'drip', 'bandage', 'injection', 'physiotherapy', 'eye test', 'optician',
  ],
  'Education': [
    'school', 'college', 'uni', 'university', 'tuition', 'tution', 'coaching', 'coaching center',
    'academy', 'fees', 'fee', 'school fee', 'college fee', 'parhai',
    'books', 'book', 'kitab', 'kitabein', 'copy', 'copies', 'register', 'stationery',
    'pen', 'pencil', 'khata', 'exam', 'exam fee', 'paper', 'admission', 'course', 'semester', 'degree',
  ],
  'Shopping': [
    'phone', 'mobile', 'smartphone', 'iphone', 'samsung', 'android', 'cellphone', 'cell phone',
    'watch', 'ghari', 'ghadi', 'smartwatch', 'wrist watch', 'apple watch', 'rolex',
    'gadi li', 'gadi liye', 'ghadi li', 'ghadi liye', 'ghadi khareedi', 'ghadi khareeda',
    'kapray', 'kapre', 'clothes', 'dress', 'suit', 'lawn', 'kurta', 'shalwar', 'kameez',
    'shirt', 't-shirt', 'pant', 'pants', 'jeans', 'trousers', 'jacket', 'hoodie', 'sweater',
    'shoes', 'joote', 'jootay', 'chappal', 'sandals', 'heels', 'sneakers', 'joggers', 'socks',
    'shopping', 'daraz', 'daraz order', 'online shopping', 'mall', 'bag', 'handbag', 'purse', 'wallet',
    'cosmetics', 'makeup', 'lipstick', 'kajal', 'perfume', 'itar', 'attar', 'fragrance',
    'glasses', 'chashma', 'jewellery', 'jewelry', 'jhumkay', 'ring',
    'laptop', 'ipad', 'tablet', 'airpods', 'earphones', 'headphones',
  ],
  'Personal Care': [
    'salon', 'saloon', 'parlour', 'parlor', 'haircut', 'hair cut', 'cutting', 'baal katwaye',
    'khat', 'barber', 'nai', 'shave', 'shaving', 'beard trim', 'facial', 'massage', 'wax', 'waxing',
    'manicure', 'pedicure', 'bleach', 'beauty', 'spa', 'soap', 'sabun', 'shampoo', 'conditioner',
    'lotion', 'cream', 'toothpaste', 'face wash', 'sunblock', 'perfume',
  ],
  'Entertainment': [
    'cinema', 'movie', 'film', 'cinepax', 'nueplex', 'arena', 'tickets', 'snooker', 'cue',
    'gaming', 'playstation', 'ps5', 'ps4', 'arcade', 'bowling', 'concert',
    'funland', 'joyland', 'theme park', 'carnival', 'match', 'cricket match', 'psl ticket', 'stadium',
  ],
  'Rent': [
    'rent', 'kiraya', 'kirayah', 'room rent', 'flat rent', 'house rent', 'makan ka kiraya',
    'shop rent', 'dukan ka kiraya', 'office rent', 'hostel', 'hostel fee', 'mess fee',
  ],
  'Subscriptions': [
    'subscription', 'subscriptions', 'netflix', 'spotify', 'youtube premium',
    'apple music', 'icloud', 'google drive', 'chatgpt', 'prime', 'amazon prime', 'patreon',
  ],
  'Travel': [
    'tour', 'trip', 'travel', 'holiday', 'vacation', 'murree', 'hunza', 'swat', 'skardu',
    'northern areas', 'hotel stay', 'resort', 'booking', 'visa', 'passport', 'luggage', 'picnic',
  ],
  'Other': [],
};

// Conversational Roman Urdu & English Stopwords / Fillers to strip completely from titles
export const STOPWORDS_REGEX = new RegExp(
  '\\b(' +
    [
      // Slang / Friendly fillers
      'yr', 'yrr', 'yrrr', 'yar', 'yaar', 'yaara', 'yara',
      'bhai', 'bhae', 'bhaiya', 'bro', 'boss', 'dost', 'janaab', 'janab', 'janu', 'meri jaan',
      'suno', 'sun', 'dekho', 'dekh', 'acha', 'achha', 'accha', 'han', 'haan', 'theek', 'thik', 'bas', 'sirf',

      // Temporal / Day words
      'aaj', 'aj', 'kal', 'parson', 'parso', 'tarso',
      'subah', 'subha', 'shaam', 'sham', 'raat', 'dopahar', 'dupehr',
      'abhi', 'today', 'yesterday', 'tomorrow', 'morning', 'evening', 'night',

      // Subject pronouns & possessives
      'maine', 'mainay', 'mene', 'meine', 'main', 'mai',
      'humne', 'hmne', 'hum', 'hamara', 'hamari', 'hamare',
      'mera', 'meri', 'mere', 'apna', 'apni', 'apne',
      'mujhe', 'mujh', 'usne', 'isne', 'unhone', 'i', 'we', 'my', 'our',

      // Prepositions / Conjunctions / Particles
      'ka', 'ki', 'ke', 'k', 'ko', 'se', 'say', 'sy',
      'me', 'mein', 'mai', 'pe', 'par', 'per', 'ne', 'nay',
      'wali', 'wala', 'wale', 'bhi', 'toh', 'tou', 'to',
      'aur', 'and', 'or', 'phir', 'then', 'plus', 'saath', 'sath',
      'balke', 'lekin', 'total', 'pura', 'pure', 'lagbhag', 'around', 'approx',

      // Verbs: eating, drinking, taking, giving, spending, buying, traveling
      'khayi', 'khaya', 'khaye', 'kahyae', 'khai', 'khae', 'khayein', 'khana', 'khalo', 'khilaya', 'ate', 'had', 'eating',
      'piya', 'peeya', 'pee', 'pi', 'peeyay', 'peeni', 'peena', 'drank',
      'liya', 'li', 'lia', 'lee', 'le', 'leta', 'leti', 'lete', 'liye', 'laye', 'lae', 'took', 'bought', 'got',
      'diya', 'di', 'dia', 'dee', 'de', 'deta', 'deti', 'dete', 'diye', 'gave', 'paid', 'spent',
      'karaya', 'karwaya', 'karwayi', 'dalwaya', 'dalwayi', 'bharwaya', 'bhara', 'karaya tha', 'dalwaya tha',
      'kareeda', 'kareedi', 'kareede', 'kharida', 'kharidi', 'kharide', 'khareeda', 'khareedi', 'khareede', 'khareed', 'purchase', 'purchased',
      'mangwaya', 'mangwayi', 'order kiya', 'order ki', 'order kara', 'ordered',
      'chahiye', 'hoga', 'hogi', 'hoge', 'gaya', 'gayi', 'gaye',
      'tha', 'thi', 'the', 'thay', 'was', 'were',
      'hai', 'hain', 'hein', 'he', 'is', 'are',

      // Currency / units words
      'rupya', 'rupay', 'rupe', 'rupees', 'rs', 'rs\\.', 'pkr', 'paise', 'pesay', 'pese', 'rupaye',
      'dollar', 'dollars', 'usd', 'aed', 'sar', 'inr', 'eur', 'gbp',

      // Payment methods and transaction fillers
      'cash', 'card', 'debit', 'credit', 'easypaisa', 'easy paisa', 'jazzcash', 'jazz cash',
      'nayapay', 'naya pay', 'sadapay', 'sada pay', 'via', 'through', 'pay', 'payment',

      // Generic action words
      'spent', 'spend', 'paying', 'cost', 'kharcha', 'kharch', 'kharche', 'expense',
    ].join('|') +
    ')\\b',
  'gi'
);

/**
 * Detect the expense category accurately from text keywords
 */
export function detectExpenseCategory(text: string): CategoryName {
  const lower = text.toLowerCase();

  // If text mentions mobile/phone recharge or load, prioritize Bills & Utilities
  if (/\b(mobile\s+load|easyload|phone\s+load|load|balance|recharge)\b/i.test(lower)) {
    return 'Bills & Utilities';
  }

  // If text mentions phone, watch, ghadi, or buying electronics, prioritize Shopping
  if (
    /\b(phone|mobile|smartphone|iphone|samsung|android|cellphone|cell\s*phone)\b/i.test(lower) ||
    /\b(ghadi|ghari|watch|smartwatch|wrist\s*watch|apple\s*watch|rolex)\b/i.test(lower) ||
    /\b(gadi\s+(?:li|liya|liye|lee|khareed|khareeda|kharida|hai))\b/i.test(lower)
  ) {
    return 'Shopping';
  }

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (category === 'Other') continue;
    for (const kw of keywords) {
      // Use boundary match for short words to avoid false positive substrings
      if (kw.length <= 4) {
        const regex = new RegExp(`\\b${kw}\\b`, 'i');
        if (regex.test(lower)) return category as CategoryName;
      } else {
        if (lower.includes(kw.toLowerCase())) return category as CategoryName;
      }
    }
  }

  return 'Other';
}

/**
 * English Rephrasing Rules:
 * Translates and rephrases conversational Roman Urdu into clean, professional English titles
 */
interface TitleRephraseRule {
  pattern: RegExp;
  englishTitle: string;
}

export const ENGLISH_REPHRASE_RULES: TitleRephraseRule[] = [
  // Shopping - Phones & Gadgets (as explicitly requested: "Bought Phone")
  { pattern: /\b(phone|mobile|smartphone|iphone|samsung|android|cell\s*phone|cellphone)\b/i, englishTitle: 'Bought Phone' },
  // Shopping - Watches (as explicitly requested: "Bought Watch", handles "gadi li hai", "ghadi", "ghari", "watch")
  { pattern: /\b(ghadi|ghari|watch|smartwatch|wrist\s*watch|apple\s*watch|rolex|gadi\s+(?:li|liya|liye|lee|khareed|khareeda|kharida|hai))\b/i, englishTitle: 'Bought Watch' },

  // Food & Drinks
  { pattern: /\b(chicken\s+biryani|murgi\s+biryani)\b/i, englishTitle: 'Chicken Biryani' },
  { pattern: /\b(beef\s+biryani|mutton\s+biryani|gosht\s+biryani)\b/i, englishTitle: 'Beef / Mutton Biryani' },
  { pattern: /\b(biryani|biriyani|briyani)\b/i, englishTitle: 'Biryani' },
  { pattern: /\b(pulao|polao|yakhni\s+pulao)\b/i, englishTitle: 'Pulao' },
  { pattern: /\b(nihari|nehari)\b/i, englishTitle: 'Nihari' },
  { pattern: /\b(haleem)\b/i, englishTitle: 'Haleem' },
  { pattern: /\b(karahi|karai|chicken\s+karahi|qorma|korma)\b/i, englishTitle: 'Karahi & Curry' },
  { pattern: /\b(zinger|zinger\s+burger)\b/i, englishTitle: 'Zinger Burger' },
  { pattern: /\b(burger|burgers)\b/i, englishTitle: 'Burger' },
  { pattern: /\b(pizza|pizzas)\b/i, englishTitle: 'Pizza' },
  { pattern: /\b(shawarma|shwarma|paratha\s+roll|roll)\b/i, englishTitle: 'Shawarma & Roll' },
  { pattern: /\b(halwa\s+puri|halwapuri)\b/i, englishTitle: 'Halwa Puri' },
  { pattern: /\b(chai\s+nashta|nashta\s+chai|breakfast)\b/i, englishTitle: 'Breakfast & Tea' },
  { pattern: /\b(nashta)\b/i, englishTitle: 'Breakfast' },
  { pattern: /\b(doodh\s+patti)\b/i, englishTitle: 'Doodh Patti Tea' },
  { pattern: /\b(green\s+tea|sabz\s+chai|kehwa)\b/i, englishTitle: 'Green Tea / Kehwa' },
  { pattern: /\b(chai|tea)\b/i, englishTitle: 'Tea' },
  { pattern: /\b(coffee|cappuccino|latte)\b/i, englishTitle: 'Coffee' },
  { pattern: /\b(pepsi)\b/i, englishTitle: 'Pepsi' },
  { pattern: /\b(coke|coca\s*cola)\b/i, englishTitle: 'Coca Cola' },
  { pattern: /\b(sprite)\b/i, englishTitle: 'Sprite' },
  { pattern: /\b(7up|seven\s*up)\b/i, englishTitle: '7Up' },
  { pattern: /\b(dew|mountain\s*dew)\b/i, englishTitle: 'Mountain Dew' },
  { pattern: /\b(fanta)\b/i, englishTitle: 'Fanta' },
  { pattern: /\b(sting)\b/i, englishTitle: 'Sting Energy Drink' },
  { pattern: /\b(pakola)\b/i, englishTitle: 'Pakola' },
  { pattern: /\b(cold\s*drink|cold\s*drinks|colddrink|coldrink|coldrik|cold\s*rik|soft\s*drink|soda)\b/i, englishTitle: 'Cold Drink' },
  { pattern: /\b(fresh\s+juice|juice|shake|milkshake)\b/i, englishTitle: 'Fresh Juice' },
  { pattern: /\b(falooda|faluda)\b/i, englishTitle: 'Falooda' },
  { pattern: /\b(ice\s*cream|icecream|kulfi)\b/i, englishTitle: 'Ice Cream' },
  { pattern: /\b(samosa|samose|pakora|pakoray|snack|snacks)\b/i, englishTitle: 'Snacks & Samosa' },
  { pattern: /\b(bakery|cake|pastry|biscuits|biscuit)\b/i, englishTitle: 'Bakery' },
  { pattern: /\b(mithai|gulab\s+jamun|jalebi|barfi)\b/i, englishTitle: 'Traditional Sweets' },
  { pattern: /\b(mcdonalds|kfc|subway|optp|hardees|cheezious)\b/i, englishTitle: 'Fast Food' },
  { pattern: /\b(lunch)\b/i, englishTitle: 'Lunch' },
  { pattern: /\b(dinner)\b/i, englishTitle: 'Dinner' },
  { pattern: /\b(khana|restaurant|hotel|dhaba)\b/i, englishTitle: 'Food & Dining' },

  // Transport
  { pattern: /\b(petrol|patrol|pitrol|fuel)\b/i, englishTitle: 'Fuel / Petrol Refill' },
  { pattern: /\b(diesel)\b/i, englishTitle: 'Diesel Fuel Refill' },
  { pattern: /\b(cng)\b/i, englishTitle: 'CNG Fuel Refill' },
  { pattern: /\b(careem)\b/i, englishTitle: 'Careem Cab Ride' },
  { pattern: /\b(uber)\b/i, englishTitle: 'Uber Cab Ride' },
  { pattern: /\b(indrive|in\s*drive)\b/i, englishTitle: 'InDrive Cab Ride' },
  { pattern: /\b(bykea)\b/i, englishTitle: 'Bykea Bike Ride' },
  { pattern: /\b(rikshaw|rickshaw|auto|chinchi|qingqi|chingchi)\b/i, englishTitle: 'Rickshaw Commute' },
  { pattern: /\b(metro|orange\s+line|green\s+line)\b/i, englishTitle: 'Metro Transit Fare' },
  { pattern: /\b(bus|wagon|speedo)\b/i, englishTitle: 'Public Transit Bus Fare' },
  { pattern: /\b(taxi|cab)\b/i, englishTitle: 'Taxi Cab Fare' },
  { pattern: /\b(toll|toll\s+plaza|mtag|m-tag)\b/i, englishTitle: 'Highway Toll Plaza' },
  { pattern: /\b(parking)\b/i, englishTitle: 'Vehicle Parking Fee' },
  { pattern: /\b(puncture|panchar|tyre|tire)\b/i, englishTitle: 'Tire Puncture Repair' },
  { pattern: /\b(car\s*wash|gari\s*wash|service)\b/i, englishTitle: 'Car Wash & Service' },
  { pattern: /\b(oil\s+change|mobil\s+oil)\b/i, englishTitle: 'Engine Oil Change' },
  { pattern: /\b(train|railway)\b/i, englishTitle: 'Train Railway Ticket' },
  { pattern: /\b(flight|airline|air\s+ticket)\b/i, englishTitle: 'Airline Flight Ticket' },

  // Groceries
  { pattern: /\b(grocery|groceries|rashan|ration|sauda|sauda\s+salaf)\b/i, englishTitle: 'Grocery Provisions' },
  { pattern: /\b(doodh|dood|milk)\b/i, englishTitle: 'Fresh Milk & Dairy' },
  { pattern: /\b(dahi|yogurt|curd)\b/i, englishTitle: 'Fresh Yogurt' },
  { pattern: /\b(sabzi|sabziyan|tarkari|vegetables|vegetable)\b/i, englishTitle: 'Fresh Vegetables' },
  { pattern: /\b(fruit|fruits|phal)\b/i, englishTitle: 'Fresh Seasonal Fruits' },
  { pattern: /\b(atta|aata|flour)\b/i, englishTitle: 'Wheat Flour Provisions' },
  { pattern: /\b(chawal|rice)\b/i, englishTitle: 'Rice Provisions' },
  { pattern: /\b(daal|dal|daalein|lentils)\b/i, englishTitle: 'Lentils & Pulses' },
  { pattern: /\b(ghee|cooking\s+oil|tail)\b/i, englishTitle: 'Cooking Oil & Ghee' },
  { pattern: /\b(masalay|masala|mirch|haldi|namak|salt)\b/i, englishTitle: 'Spices & Seasoning' },
  { pattern: /\b(cheeni|chini|sugar)\b/i, englishTitle: 'Sugar Provisions' },
  { pattern: /\b(patti|tea\s+patti)\b/i, englishTitle: 'Tea Leaves Provisions' },
  { pattern: /\b(anday|ande|eggs|egg)\b/i, englishTitle: 'Farm Fresh Eggs' },
  { pattern: /\b(chicken|murgi)\b/i, englishTitle: 'Fresh Chicken Meat' },
  { pattern: /\b(beef|mutton|gosht|meat)\b/i, englishTitle: 'Fresh Meat Provisions' },
  { pattern: /\b(machli|machhli|fish)\b/i, englishTitle: 'Fresh Seafood & Fish' },
  { pattern: /\b(bread|double\s+roti|bun)\b/i, englishTitle: 'Bread & Bakery Staples' },
  { pattern: /\b(makhan|butter|cheese)\b/i, englishTitle: 'Butter & Cheese' },
  { pattern: /\b(supermarket|mart|imtiaz|chase|bin\s+hashim|carrefour)\b/i, englishTitle: 'Supermarket Groceries' },

  // Bills & Utilities
  { pattern: /\b(bijli|electricity|electric|kelectric|k-electric|lesco|fesco|iesco|gepco)\b/i, englishTitle: 'Electricity Utility Bill' },
  { pattern: /\b(gas|sui\s+gas|ssgc|sngpl)\b/i, englishTitle: 'Gas Utility Bill' },
  { pattern: /\b(pani|water|tanker|pani\s+ka\s+tanker)\b/i, englishTitle: 'Water Supply / Tanker' },
  { pattern: /\b(wifi|wi-fi|internet|ptcl|nayatel|stormfiber|broadband|net)\b/i, englishTitle: 'Internet & WiFi Bill' },
  { pattern: /\b(mobile\s+load|easyload|load|balance|recharge)\b/i, englishTitle: 'Mobile Phone Recharge' },
  { pattern: /\b(generator|ups|battery)\b/i, englishTitle: 'Generator / Power Supply' },
  { pattern: /\b(maintenance|society\s+maintenance)\b/i, englishTitle: 'Society Maintenance Fee' },

  // Health
  { pattern: /\b(panadol|disprin|brufen|calpol|ponstan)\b/i, englishTitle: 'Panadol & Pharmacy Medicine' },
  { pattern: /\b(dawa|dawai|dawayi|medicine|medicines|tablet|tablets|syrup)\b/i, englishTitle: 'Prescription Medicine' },
  { pattern: /\b(doctor|doc|dr|physician|consultation)\b/i, englishTitle: 'Doctor Medical Consultation' },
  { pattern: /\b(hospital|clinic)\b/i, englishTitle: 'Hospital Clinic Care' },
  { pattern: /\b(test|lab\s+test|blood\s+test|chughtai)\b/i, englishTitle: 'Clinical Laboratory Test' },
  { pattern: /\b(dentist|daant)\b/i, englishTitle: 'Dental Consultation' },
  { pattern: /\b(pharmacy|medical\s+store|d-watson|servaid)\b/i, englishTitle: 'Pharmacy Medical Supplies' },

  // Education
  { pattern: /\b(school\s+fee|school)\b/i, englishTitle: 'School Tuition Fee' },
  { pattern: /\b(college\s+fee|college)\b/i, englishTitle: 'College Tuition Fee' },
  { pattern: /\b(uni|university)\b/i, englishTitle: 'University Tuition Fee' },
  { pattern: /\b(tuition|tution|coaching|academy)\b/i, englishTitle: 'Tuition & Coaching Fee' },
  { pattern: /\b(books|book|kitab|kitabein)\b/i, englishTitle: 'Books & Textbooks' },
  { pattern: /\b(stationery|copy|copies|register|pen|pencil)\b/i, englishTitle: 'Stationery & Notebooks' },
  { pattern: /\b(exam|exam\s+fee)\b/i, englishTitle: 'Examination Fee' },

  // Shopping - General & Apparel
  { pattern: /\b(kapray|kapre|clothes|clothing|suit|lawn|kurta|dress)\b/i, englishTitle: 'Clothing & Apparel Shopping' },
  { pattern: /\b(shirt|t-shirt|pant|pants|jeans|trousers)\b/i, englishTitle: 'Casual Apparel Wear' },
  { pattern: /\b(shoes|joote|jootay|chappal|sandals|sneakers)\b/i, englishTitle: 'Footwear & Shoes' },
  { pattern: /\b(daraz|daraz\s+order)\b/i, englishTitle: 'Daraz Online Shopping' },
  { pattern: /\b(cosmetics|makeup|lipstick)\b/i, englishTitle: 'Cosmetics & Beauty' },
  { pattern: /\b(perfume|attar|itar|fragrance)\b/i, englishTitle: 'Perfume & Fragrance' },
  { pattern: /\b(bag|handbag|purse|wallet)\b/i, englishTitle: 'Bags & Accessories' },
  { pattern: /\b(shopping|mall)\b/i, englishTitle: 'Retail Shopping' },

  // Personal Care
  { pattern: /\b(haircut|hair\s+cut|cutting|baal\s+katwaye|barber|nai)\b/i, englishTitle: 'Haircut & Grooming' },
  { pattern: /\b(shave|shaving|khat|beard)\b/i, englishTitle: 'Shave & Beard Grooming' },
  { pattern: /\b(salon|saloon|parlour|parlor|spa)\b/i, englishTitle: 'Beauty Salon & Parlour' },
  { pattern: /\b(facial|massage|wax|waxing)\b/i, englishTitle: 'Facial & Skincare' },

  // Rent
  { pattern: /\b(rent|kiraya|kirayah|ghar\s+ka\s+kiraya|house\s+rent|flat\s+rent|room\s+rent)\b/i, englishTitle: 'House Rent Payment' },
  { pattern: /\b(hostel|mess)\b/i, englishTitle: 'Hostel Accommodation Fee' },

  // Subscriptions
  { pattern: /\b(netflix)\b/i, englishTitle: 'Netflix Subscription' },
  { pattern: /\b(spotify)\b/i, englishTitle: 'Spotify Music Subscription' },
  { pattern: /\b(youtube|youtube\s+premium)\b/i, englishTitle: 'YouTube Subscription' },
  { pattern: /\b(chatgpt|openai)\b/i, englishTitle: 'ChatGPT Subscription' },
  { pattern: /\b(subscription|subscriptions)\b/i, englishTitle: 'Digital Subscription' },

  // Travel
  { pattern: /\b(murree|hunza|swat|skardu|northern\s+areas)\b/i, englishTitle: 'Northern Areas Tour' },
  { pattern: /\b(tour|trip|travel|holiday|vacation)\b/i, englishTitle: 'Travel & Tour Trip' },
  { pattern: /\b(hotel\s+stay|resort|booking)\b/i, englishTitle: 'Hotel Accommodation' },
];

/**
 * Rephrase an extracted expense into clean, professional, concise English Title Case
 */
export function rephraseToEnglishTitle(rawText: string, category: CategoryName | string = 'Other'): string {
  if (!rawText) {
    return category !== 'Other' ? `${category} Expense` : 'General Expense';
  }

  // 1. Strip ALL currency symbols (₹, ₨, $, €, £, ¥, ₩, etc.) and currency codes
  const strippedText = rawText
    .replace(/[\u20B9\u20A8₹₨$€£¥₩¢]/g, ' ')
    .replace(/\b(rs\.?|pkr|inr|usd|eur|gbp|aed|sar|cad|rupees?|rupaye?|rupay)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const lower = strippedText.toLowerCase();

  // 2. Check direct English rephrase rules
  for (const rule of ENGLISH_REPHRASE_RULES) {
    if (rule.pattern.test(lower)) {
      return rule.englishTitle;
    }
  }

  // 3. Clean stopwords and strip conversational fillers
  const cleaned = cleanExpenseTitle(strippedText, category);

  // 4. If cleaned text is too generic
  if (!cleaned || cleaned.toLowerCase() === 'expense' || cleaned.length < 2) {
    return category !== 'Other' ? `${category} Expense` : 'General Expense';
  }

  return cleaned;
}

/**
 * Clean and sanitize an expense title, removing all conversational fillers like "yr", "aj mainay", "kahyae"
 * and stripping any currency signs (like ₹, ₨, Rs, etc.)
 */
export function cleanExpenseTitle(rawTitle: string, categoryFallback: string = 'Other'): string {
  if (!rawTitle) return categoryFallback !== 'Other' ? categoryFallback : 'Expense';

  // 1. Remove currency symbols, numbers, punctuation
  let cleaned = rawTitle
    .replace(/[\u20B9\u20A8₹₨$€£¥₩¢]/g, ' ')
    .replace(/\b(rs\.?|pkr|inr|usd|eur|gbp|aed|sar|cad|rupees?|rupaye?|rupay)\b/gi, ' ')
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'’]/g, ' ')
    .replace(/\b\d+(?:,\d+)*(?:\.\d+)?\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // 2. Remove Roman Urdu and conversational stopwords / fillers
  cleaned = cleaned.replace(STOPWORDS_REGEX, ' ');
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  // 3. Fallback if empty or too short
  if (!cleaned || cleaned.length < 2) {
    return categoryFallback !== 'Other' ? categoryFallback : 'Expense';
  }

  // 4. Convert to Title Case
  return cleaned
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Parse verbal numbers in Roman Urdu / English
 */
function parseVerbalAmount(text: string): number {
  const lower = text.toLowerCase();

  // Check direct digits first
  const numMatch = text.match(/(\d+(?:,\d+)*(?:\.\d+)?)/);
  if (numMatch) {
    return parseFloat(numMatch[1].replace(/,/g, ''));
  }

  // Common spoken Urdu / English numbers
  if (/\b(sau|so|hundred)\b/i.test(lower)) {
    if (/\b(ek|one|1)\b/i.test(lower)) return 100;
    if (/\b(do|two|2)\b/i.test(lower)) return 200;
    if (/\b(teen|three|3)\b/i.test(lower)) return 300;
    if (/\b(char|chaar|four|4)\b/i.test(lower)) return 400;
    if (/\b(panch|paanch|five|5)\b/i.test(lower)) return 500;
    if (/\b(cheh|six|6)\b/i.test(lower)) return 600;
    if (/\b(saat|seven|7)\b/i.test(lower)) return 700;
    if (/\b(aath|eight|8)\b/i.test(lower)) return 800;
    if (/\b(nau|nine|9)\b/i.test(lower)) return 900;
    return 100;
  }

  if (/\b(hazar|hazaar|thousand)\b/i.test(lower)) {
    if (/\b(ek|one|1)\b/i.test(lower)) return 1000;
    if (/\b(do|two|2)\b/i.test(lower)) return 2000;
    if (/\b(teen|three|3)\b/i.test(lower)) return 3000;
    if (/\b(char|chaar|four|4)\b/i.test(lower)) return 4000;
    if (/\b(panch|paanch|five|5)\b/i.test(lower)) return 5000;
    if (/\b(dus|das|ten|10)\b/i.test(lower)) return 10000;
    if (/\b(pandrah|fifteen|15)\b/i.test(lower)) return 15000;
    if (/\b(bees|twenty|20)\b/i.test(lower)) return 20000;
    if (/\b(pachas|fifty|50)\b/i.test(lower)) return 50000;
    return 1000;
  }

  if (/\b(lakh|laakh)\b/i.test(lower)) {
    if (/\b(ek|one|1)\b/i.test(lower)) return 100000;
    if (/\b(do|two|2)\b/i.test(lower)) return 200000;
    return 100000;
  }

  if (/\b(pachas|fifty)\b/i.test(lower)) return 50;
  if (/\b(bees|twenty)\b/i.test(lower)) return 20;
  if (/\b(tees|thirty)\b/i.test(lower)) return 30;
  if (/\b(chalis|forty)\b/i.test(lower)) return 40;

  return 0;
}

/**
 * Regular expression matching multi-expense and accompaniment conjunctions in Roman Urdu & English:
 * e.g., "aur", "and", "kay sath", "ke sath", "k sath", "with", "saath", "plus", etc.
 */
export const MULTI_ITEM_SPLIT_REGEX =
  /\s*(?:,|aur|and|plus|phir|phr|\+|\b(?:kay\s+saath|ke\s+saath|k\s+saath|ky\s+saath|kay\s+sath|ke\s+sath|k\s+sath|ky\s+sath|sath\s+mein|sath\s+me|saath\s+mein|saath\s+me|sath|saath|with)\b)\s*/i;

/**
 * Intelligent local parser for Roman Urdu, Urdu, and English expense descriptions
 */
export function parseRomanUrduExpenses(
  transcript: string,
  options: { todayStr?: string; currency?: string } = {}
): ExtractedExpense[] {
  const text = transcript.trim();
  if (!text) return [];

  const todayStr = options.todayStr || new Date().toISOString().split('T')[0];
  const targetCurrency = options.currency || 'PKR';

  // Split by multi-expense conjunctions (aur, and, plus, phir, +, commas, kay sath, ke sath, with, etc.)
  let rawClauses = text.split(MULTI_ITEM_SPLIT_REGEX).map((c) => c.trim()).filter(Boolean);

  // If only 1 clause was found, check if it mentions both a main food dish (e.g. biryani) and a beverage (e.g. coldrik, coldrink)
  const clauses: string[] = [];
  for (const c of rawClauses) {
    const hasFood = /\b(biryani|biriyani|briyani|pulao|nihari|haleem|karahi|zinger|burger|pizza|shawarma|roll|paratha)\b/i.test(c);
    const hasDrink = /\b(cold\s*drink|coldrink|coldrik|colddrink|pepsi|coke|coca\s*cola|sprite|7up|dew|fanta|sting|pakola|chai|tea)\b/i.test(c);

    if (hasFood && hasDrink) {
      // Split on the drink boundary
      const drinkMatch = c.match(/\b(cold\s*drink|coldrink|coldrik|colddrink|pepsi|coke|coca\s*cola|sprite|7up|dew|fanta|sting|pakola|chai|tea)\b/i);
      if (drinkMatch && drinkMatch.index !== undefined) {
        const foodPart = c.substring(0, drinkMatch.index).trim();
        const drinkPart = c.substring(drinkMatch.index).trim();
        if (foodPart) clauses.push(foodPart);
        if (drinkPart) clauses.push(drinkPart);
        continue;
      }
    }
    clauses.push(c);
  }

  const results: ExtractedExpense[] = [];

  for (const clause of clauses) {
    if (!clause.trim()) continue;

    const amount = parseVerbalAmount(clause);
    const category = detectExpenseCategory(clause);
    const title = rephraseToEnglishTitle(clause, category);

    // Date resolution
    let date = todayStr;
    const isYesterday =
      /\b(kal|yesterday|guzra kal)\b/i.test(clause) &&
      /\b(tha|thi|the|li|diya|gaya|karaya|spent|paid|khayi|khaya|order)\b/i.test(clause);
    if (isYesterday) {
      const d = new Date(todayStr);
      d.setDate(d.getDate() - 1);
      date = d.toISOString().split('T')[0];
    }

    const isFuturePlan =
      /\b(karna hai|khana hai|jaunga|jaungi|dena hai|plan|will buy|tomorrow|lena hai)\b/i.test(clause) &&
      !/\b(tha|chuka|li|diya|gaya)\b/i.test(clause);

    // Payment method detection
    let paymentMethod = 'Cash';
    if (/\b(card|debit|credit|visa|mastercard)\b/i.test(clause)) paymentMethod = 'Card';
    else if (/\b(easypaisa|easy paisa)\b/i.test(clause)) paymentMethod = 'EasyPaisa';
    else if (/\b(jazzcash|jazz cash)\b/i.test(clause)) paymentMethod = 'JazzCash';
    else if (/\b(nayapay|naya pay)\b/i.test(clause)) paymentMethod = 'Nayapay';
    else if (/\b(sadapay|sada pay)\b/i.test(clause)) paymentMethod = 'SadaPay';
    else if (/\b(online|bank|transfer|account|ibft)\b/i.test(clause)) paymentMethod = 'Bank Transfer';

    results.push({
      id: 'exp_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6),
      title,
      amount,
      currency: targetCurrency,
      category,
      expenseDate: date,
      paymentMethod,
      notes: clause.trim(),
      originalTranscript: transcript,
      createdAt: new Date().toISOString(),
      isFuturePlan,
      missingAmount: amount <= 0,
      clarificationNeeded: amount <= 0 ? 'Amount was not detected. Please enter amount.' : undefined,
    });
  }

  return results;
}

/**
 * Sanitizes and validates an extracted expense item (from Gemini or elsewhere)
 * ensuring titles are professionally rephrased into English and categories match.
 */
export function sanitizeExtractedItem(
  item: Partial<ExtractedExpense>,
  fallbackDate: string = new Date().toISOString().split('T')[0],
  fallbackCurrency: string = 'PKR'
): ExtractedExpense {
  // Strip any currency signs (₹, ₨, $, etc.) and currency codes from raw title
  let rawTitle = (item.title || 'Expense')
    .replace(/[\u20B9\u20A8₹₨$€£¥₩¢]/g, ' ')
    .replace(/\b(rs\.?|pkr|inr|usd|eur|gbp|aed|sar|cad|rupees?|rupaye?|rupay)\b/gi, ' ')
    .trim();

  let category = item.category || 'Other';

  // If category is Other or missing, re-check using title & notes
  const contextText = `${rawTitle} ${item.notes || ''} ${item.originalTranscript || ''}`.trim();
  const detected = detectExpenseCategory(contextText);
  if (detected !== 'Other' || category === 'Other') {
    category = detected;
  }

  // Rephrase and translate title to proper English Title Case (e.g. "Bought Phone", "Bought Watch", "Biryani", "Cold Drink")
  const textForTitle = (rawTitle && rawTitle.toLowerCase() !== 'expense')
    ? rawTitle
    : (item.notes && item.notes.toLowerCase() !== 'expense' ? item.notes : rawTitle);

  let rephrasedTitle = rephraseToEnglishTitle(textForTitle, category);

  // Strip any remaining currency symbol from rephrased title as an absolute guarantee
  rephrasedTitle = rephrasedTitle.replace(/[\u20B9\u20A8₹₨$€£¥₩¢]/g, '').trim();

  // If category is STILL Other, re-check with rephrasedTitle
  if (category === 'Other') {
    const detectedFromTitle = detectExpenseCategory(rephrasedTitle);
    if (detectedFromTitle !== 'Other') {
      category = detectedFromTitle;
    }
  }
      category = detected;
    }
  }

  return {
    id: item.id || 'exp_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6),
    title: rephrasedTitle,
    amount: typeof item.amount === 'number' ? Math.max(0, item.amount) : 0,
    currency: item.currency || fallbackCurrency,
    category: category as CategoryName,
    expenseDate: item.expenseDate || fallbackDate,
    paymentMethod: item.paymentMethod || 'Cash',
    notes: item.notes || '',
    originalTranscript: item.originalTranscript || '',
    createdAt: item.createdAt || new Date().toISOString(),
    isFuturePlan: !!item.isFuturePlan,
    missingAmount: !!item.missingAmount || (Number(item.amount) || 0) <= 0,
    clarificationNeeded: item.clarificationNeeded,
  };
}

/**
 * Post-processes a list of extracted expenses to ensure that if an utterance mentioned
 * multiple items (such as "biryani kay sath coldrik"), they are split into separate items
 * with distinct titles rather than merged into a single entry.
 */
export function splitCombinedExpenses(
  items: ExtractedExpense[],
  fallbackDate: string = new Date().toISOString().split('T')[0],
  fallbackCurrency: string = 'PKR'
): ExtractedExpense[] {
  const finalItems: ExtractedExpense[] = [];

  for (const item of items) {
    if (items.length === 1) {
      // Check if this single lone item contains both food and beverage
      const fullContext = `${item.title} ${item.notes} ${item.originalTranscript}`.toLowerCase();
      const hasBiryani = /\b(biryani|biriyani|briyani)\b/i.test(fullContext);
      const hasDrink = /\b(cold\s*drink|coldrink|coldrik|colddrink|pepsi|coke|sprite|7up|dew|fanta|sting|soft\s*drink)\b/i.test(fullContext);

      if (hasBiryani && hasDrink) {
        const amt = item.amount > 0 ? item.amount : 0;
        finalItems.push({
          id: 'exp_' + Date.now().toString(36) + '_biryani',
          title: 'Biryani',
          amount: amt,
          currency: item.currency || fallbackCurrency,
          category: 'Food & Drinks',
          expenseDate: item.expenseDate || fallbackDate,
          paymentMethod: item.paymentMethod || 'Cash',
          notes: 'Biryani',
          originalTranscript: item.originalTranscript,
          createdAt: item.createdAt || new Date().toISOString(),
          isFuturePlan: item.isFuturePlan,
          missingAmount: amt <= 0,
          clarificationNeeded: amt <= 0 ? 'Enter amount for Biryani' : undefined,
        });

        finalItems.push({
          id: 'exp_' + (Date.now() + 1).toString(36) + '_drink',
          title: 'Cold Drink',
          amount: 0,
          currency: item.currency || fallbackCurrency,
          category: 'Food & Drinks',
          expenseDate: item.expenseDate || fallbackDate,
          paymentMethod: item.paymentMethod || 'Cash',
          notes: 'Cold drink',
          originalTranscript: 'cold drink',
          createdAt: item.createdAt || new Date().toISOString(),
          isFuturePlan: item.isFuturePlan,
          missingAmount: true,
          clarificationNeeded: undefined,
        });
        continue;
      }
    } else {
      // Multiple items exist: only split an item if its TITLE itself contains both ("Biryani with Cold Drink")
      const titleContext = `${item.title} ${item.notes}`.toLowerCase();
      const titleHasBiryani = /\b(biryani|biriyani|briyani)\b/i.test(titleContext);
      const titleHasDrink = /\b(cold\s*drink|coldrink|coldrik|colddrink|pepsi|coke|sprite|7up|dew|fanta|sting)\b/i.test(titleContext);
      const titleHasConjunction = /\b(with|and|&|\+|kay sath|ke sath)\b/i.test(titleContext);

      if (titleHasBiryani && titleHasDrink && titleHasConjunction) {
        const amt = item.amount > 0 ? item.amount : 0;
        finalItems.push({
          id: 'exp_' + Date.now().toString(36) + '_biryani',
          title: 'Biryani',
          amount: amt,
          currency: item.currency || fallbackCurrency,
          category: 'Food & Drinks',
          expenseDate: item.expenseDate || fallbackDate,
          paymentMethod: item.paymentMethod || 'Cash',
          notes: 'Biryani',
          originalTranscript: item.originalTranscript,
          createdAt: item.createdAt || new Date().toISOString(),
          isFuturePlan: item.isFuturePlan,
          missingAmount: amt <= 0,
        });
        finalItems.push({
          id: 'exp_' + (Date.now() + 1).toString(36) + '_drink',
          title: 'Cold Drink',
          amount: 0,
          currency: item.currency || fallbackCurrency,
          category: 'Food & Drinks',
          expenseDate: item.expenseDate || fallbackDate,
          paymentMethod: item.paymentMethod || 'Cash',
          notes: 'Cold drink',
          originalTranscript: 'cold drink',
          createdAt: item.createdAt || new Date().toISOString(),
          isFuturePlan: item.isFuturePlan,
          missingAmount: true,
        });
        continue;
      }
    }

    finalItems.push(item);
  }

  return finalItems;
}
