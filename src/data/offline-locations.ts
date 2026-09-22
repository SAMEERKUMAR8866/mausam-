// src/data/offline-locations.ts
// Pre-populated, high-density offline location database for Mausam
// Covers national capitals, major tech hubs, state/UT capitals, agricultural zones, and global centers

export interface OfflineLocation {
  id: string;
  name: string;
  region: string;
  country: string;
  lat: number;
  lon: number;
  display: string;
  category: 'Capital' | 'Tech Hub' | 'Metro' | 'District' | 'Agriculture Hub' | 'Coastal' | 'Global';
  aliases: string[];
  isCoastal?: boolean;
}

export const PREPOPULATED_OFFLINE_LOCATIONS: OfflineLocation[] = [
  // =========================================================================
  // 1. National Capital & NCR Major Hubs (Tech, Admin & Agri-corridors)
  // =========================================================================
  {
    id: 'in-delhi',
    name: 'New Delhi',
    region: 'Delhi',
    country: 'India',
    lat: 28.61,
    lon: 77.20,
    display: 'New Delhi, Delhi, India',
    category: 'Capital',
    aliases: ['delhi', 'dilli', 'ncr', 'national capital', 'central delhi', 'connaught place', 'south delhi']
  },
  {
    id: 'in-noida',
    name: 'Greater Noida',
    region: 'Uttar Pradesh',
    country: 'India',
    lat: 28.47,
    lon: 77.50,
    display: 'Greater Noida, Uttar Pradesh, India',
    category: 'Tech Hub',
    aliases: ['noida', 'greater noida west', 'noida extension', 'gautam buddha nagar', 'gb nagar', 'knowledge park', 'yamuna expressway', 'up']
  },
  {
    id: 'in-noida-sec',
    name: 'Noida',
    region: 'Uttar Pradesh',
    country: 'India',
    lat: 28.57,
    lon: 77.32,
    display: 'Noida, Uttar Pradesh, India',
    category: 'Tech Hub',
    aliases: ['noida sector', 'noida city', 'noida expressway', 'gb nagar']
  },
  {
    id: 'in-gurugram',
    name: 'Gurugram',
    region: 'Haryana',
    country: 'India',
    lat: 28.46,
    lon: 77.03,
    display: 'Gurugram, Haryana, India',
    category: 'Tech Hub',
    aliases: ['gurgaon', 'cyber city', 'dlf', 'manesar', 'haryana', 'millennium city', 'sohna']
  },
  {
    id: 'in-ghaziabad',
    name: 'Ghaziabad',
    region: 'Uttar Pradesh',
    country: 'India',
    lat: 28.67,
    lon: 77.42,
    display: 'Ghaziabad, Uttar Pradesh, India',
    category: 'District',
    aliases: ['indirapuram', 'vaishali', 'crossings republik', 'modinagar', 'up']
  },
  {
    id: 'in-faridabad',
    name: 'Faridabad',
    region: 'Haryana',
    country: 'India',
    lat: 28.41,
    lon: 77.31,
    display: 'Faridabad, Haryana, India',
    category: 'District',
    aliases: ['ballabhgarh', 'haryana', 'ncr']
  },

  // =========================================================================
  // 2. Tier-1 Metros & Major Indian Tech Hubs
  // =========================================================================
  {
    id: 'in-bengaluru',
    name: 'Bengaluru',
    region: 'Karnataka',
    country: 'India',
    lat: 12.97,
    lon: 77.59,
    display: 'Bengaluru, Karnataka, India',
    category: 'Tech Hub',
    aliases: ['bangalore', 'silicon valley of india', 'electronic city', 'whitefield', 'koramangala', 'indiranagar', 'karnataka']
  },
  {
    id: 'in-mumbai',
    name: 'Mumbai',
    region: 'Maharashtra',
    country: 'India',
    lat: 19.07,
    lon: 72.87,
    display: 'Mumbai, Maharashtra, India',
    category: 'Metro',
    aliases: ['bombay', 'bandra', 'south bombay', 'andheri', 'navi mumbai', 'thane', 'maharashtra'],
    isCoastal: true
  },
  {
    id: 'in-hyderabad',
    name: 'Hyderabad',
    region: 'Telangana',
    country: 'India',
    lat: 17.38,
    lon: 78.48,
    display: 'Hyderabad, Telangana, India',
    category: 'Tech Hub',
    aliases: ['cyberabad', 'hitec city', 'secunderabad', 'gachibowli', 'telangana', 'charminar']
  },
  {
    id: 'in-pune',
    name: 'Pune',
    region: 'Maharashtra',
    country: 'India',
    lat: 18.52,
    lon: 73.85,
    display: 'Pune, Maharashtra, India',
    category: 'Tech Hub',
    aliases: ['hinjawadi', 'poona', 'pimpri-chinchwad', 'pcmc', 'viman nagar', 'maharashtra']
  },
  {
    id: 'in-chennai',
    name: 'Chennai',
    region: 'Tamil Nadu',
    country: 'India',
    lat: 13.08,
    lon: 80.27,
    display: 'Chennai, Tamil Nadu, India',
    category: 'Metro',
    aliases: ['madras', 'omr', 'tamil nadu', 'velachery', 'adyar', 'marina'],
    isCoastal: true
  },
  {
    id: 'in-kolkata',
    name: 'Kolkata',
    region: 'West Bengal',
    country: 'India',
    lat: 22.57,
    lon: 88.36,
    display: 'Kolkata, West Bengal, India',
    category: 'Metro',
    aliases: ['calcutta', 'salt lake', 'new town', 'howrah', 'west bengal'],
    isCoastal: true
  },
  {
    id: 'in-ahmedabad',
    name: 'Ahmedabad',
    region: 'Gujarat',
    country: 'India',
    lat: 23.02,
    lon: 72.57,
    display: 'Ahmedabad, Gujarat, India',
    category: 'Tech Hub',
    aliases: ['amdavad', 'gift city', 'gandhinagar', 'gujarat', 'sanand']
  },

  // =========================================================================
  // 3. Indian State Capitals & Union Territory Headquarters
  // =========================================================================
  {
    id: 'in-lucknow',
    name: 'Lucknow',
    region: 'Uttar Pradesh',
    country: 'India',
    lat: 26.84,
    lon: 80.94,
    display: 'Lucknow, Uttar Pradesh, India',
    category: 'Capital',
    aliases: ['awadh', 'lko', 'up capital', 'gomti nagar']
  },
  {
    id: 'in-jaipur',
    name: 'Jaipur',
    region: 'Rajasthan',
    country: 'India',
    lat: 26.91,
    lon: 75.78,
    display: 'Jaipur, Rajasthan, India',
    category: 'Capital',
    aliases: ['pink city', 'rajasthan capital', 'mansarovar']
  },
  {
    id: 'in-chandigarh',
    name: 'Chandigarh',
    region: 'Chandigarh',
    country: 'India',
    lat: 30.73,
    lon: 76.77,
    display: 'Chandigarh, Chandigarh, India',
    category: 'Capital',
    aliases: ['tricity', 'mohali', 'panchkula', 'punjab haryana capital']
  },
  {
    id: 'in-patna',
    name: 'Patna',
    region: 'Bihar',
    country: 'India',
    lat: 25.59,
    lon: 85.13,
    display: 'Patna, Bihar, India',
    category: 'Capital',
    aliases: ['patliputra', 'bihar capital', 'ganga basin', 'bihar']
  },
  {
    id: 'in-sasaram',
    name: 'Sasarām',
    region: 'Bihar',
    country: 'India',
    lat: 24.95,
    lon: 84.03,
    display: 'Sasarām, Bihar, India',
    category: 'District',
    aliases: ['sasaram', 'rohtas', 'sher shah suri', 'tomb of sher shah suri', 'bihar', 'south bihar']
  },
  {
    id: 'in-bhopal',
    name: 'Bhopal',
    region: 'Madhya Pradesh',
    country: 'India',
    lat: 23.25,
    lon: 77.41,
    display: 'Bhopal, Madhya Pradesh, India',
    category: 'Capital',
    aliases: ['city of lakes', 'mp capital', 'madhya pradesh']
  },
  {
    id: 'in-ranchi',
    name: 'Ranchi',
    region: 'Jharkhand',
    country: 'India',
    lat: 23.34,
    lon: 85.30,
    display: 'Ranchi, Jharkhand, India',
    category: 'Capital',
    aliases: ['jharkhand capital', 'chota nagpur', 'jharkhand']
  },
  {
    id: 'in-raipur',
    name: 'Raipur',
    region: 'Chhattisgarh',
    country: 'India',
    lat: 21.25,
    lon: 81.63,
    display: 'Raipur, Chhattisgarh, India',
    category: 'Capital',
    aliases: ['nava raipur', 'chhattisgarh capital', 'chhattisgarh']
  },
  {
    id: 'in-bhubaneswar',
    name: 'Bhubaneswar',
    region: 'Odisha',
    country: 'India',
    lat: 20.29,
    lon: 85.82,
    display: 'Bhubaneswar, Odisha, India',
    category: 'Capital',
    aliases: ['temple city', 'odisha capital', 'orissa', 'smart city bhubaneswar']
  },
  {
    id: 'in-dehradun',
    name: 'Dehradun',
    region: 'Uttarakhand',
    country: 'India',
    lat: 30.31,
    lon: 78.03,
    display: 'Dehradun, Uttarakhand, India',
    category: 'Capital',
    aliases: ['doon', 'uttarakhand capital', 'rishikesh', 'mussoorie', 'uttaranchal']
  },
  {
    id: 'in-shimla',
    name: 'Shimla',
    region: 'Himachal Pradesh',
    country: 'India',
    lat: 31.10,
    lon: 77.17,
    display: 'Shimla, Himachal Pradesh, India',
    category: 'Capital',
    aliases: ['simla', 'himachal capital', 'himachal pradesh', 'kufri']
  },
  {
    id: 'in-srinagar',
    name: 'Srinagar',
    region: 'Jammu and Kashmir',
    country: 'India',
    lat: 34.08,
    lon: 74.79,
    display: 'Srinagar, Jammu and Kashmir, India',
    category: 'Capital',
    aliases: ['kashmir', 'dal lake', 'jk capital', 'jammu kashmir']
  },
  {
    id: 'in-jammu',
    name: 'Jammu',
    region: 'Jammu and Kashmir',
    country: 'India',
    lat: 32.72,
    lon: 74.85,
    display: 'Jammu, Jammu and Kashmir, India',
    category: 'District',
    aliases: ['jammu tawi', 'katra', 'jk']
  },
  {
    id: 'in-guwahati',
    name: 'Guwahati',
    region: 'Assam',
    country: 'India',
    lat: 26.14,
    lon: 91.73,
    display: 'Guwahati, Assam, India',
    category: 'Capital',
    aliases: ['dispur', 'assam capital', 'brahmaputra', 'north east gateway', 'assam']
  },
  {
    id: 'in-shillong',
    name: 'Shillong',
    region: 'Meghalaya',
    country: 'India',
    lat: 25.57,
    lon: 91.89,
    display: 'Shillong, Meghalaya, India',
    category: 'Capital',
    aliases: ['scotland of the east', 'meghalaya capital', 'cherrapunji', 'meghalaya']
  },
  {
    id: 'in-gangtok',
    name: 'Gangtok',
    region: 'Sikkim',
    country: 'India',
    lat: 27.33,
    lon: 88.61,
    display: 'Gangtok, Sikkim, India',
    category: 'Capital',
    aliases: ['sikkim capital', 'kanchenjunga', 'sikkim']
  },
  {
    id: 'in-imphal',
    name: 'Imphal',
    region: 'Manipur',
    country: 'India',
    lat: 24.81,
    lon: 93.93,
    display: 'Imphal, Manipur, India',
    category: 'Capital',
    aliases: ['manipur capital', 'loktak', 'manipur']
  },
  {
    id: 'in-aizawl',
    name: 'Aizawl',
    region: 'Mizoram',
    country: 'India',
    lat: 23.73,
    lon: 92.71,
    display: 'Aizawl, Mizoram, India',
    category: 'Capital',
    aliases: ['mizoram capital', 'mizoram']
  },
  {
    id: 'in-kohima',
    name: 'Kohima',
    region: 'Nagaland',
    country: 'India',
    lat: 25.67,
    lon: 94.10,
    display: 'Kohima, Nagaland, India',
    category: 'Capital',
    aliases: ['nagaland capital', 'dimapur', 'nagaland']
  },
  {
    id: 'in-agartala',
    name: 'Agartala',
    region: 'Tripura',
    country: 'India',
    lat: 23.83,
    lon: 91.28,
    display: 'Agartala, Tripura, India',
    category: 'Capital',
    aliases: ['tripura capital', 'tripura']
  },
  {
    id: 'in-itanagar',
    name: 'Itanagar',
    region: 'Arunachal Pradesh',
    country: 'India',
    lat: 27.08,
    lon: 93.60,
    display: 'Itanagar, Arunachal Pradesh, India',
    category: 'Capital',
    aliases: ['arunachal capital', 'naharlagun', 'arunachal pradesh']
  },
  {
    id: 'in-thiruvananthapuram',
    name: 'Thiruvananthapuram',
    region: 'Kerala',
    country: 'India',
    lat: 8.52,
    lon: 76.93,
    display: 'Thiruvananthapuram, Kerala, India',
    category: 'Capital',
    aliases: ['trivandrum', 'kerala capital', 'technopark', 'kerala'],
    isCoastal: true
  },
  {
    id: 'in-amaravati',
    name: 'Amaravati',
    region: 'Andhra Pradesh',
    country: 'India',
    lat: 16.51,
    lon: 80.51,
    display: 'Amaravati, Andhra Pradesh, India',
    category: 'Capital',
    aliases: ['andhra capital', 'guntur', 'andhra pradesh']
  },
  {
    id: 'in-panaji',
    name: 'Panaji',
    region: 'Goa',
    country: 'India',
    lat: 15.49,
    lon: 73.82,
    display: 'Panaji, Goa, India',
    category: 'Capital',
    aliases: ['goa', 'panjim', 'north goa', 'south goa', 'vasco', 'margao'],
    isCoastal: true
  },
  {
    id: 'in-port-blair',
    name: 'Port Blair',
    region: 'Andaman and Nicobar Islands',
    country: 'India',
    lat: 11.62,
    lon: 92.72,
    display: 'Port Blair, Andaman and Nicobar Islands, India',
    category: 'Capital',
    aliases: ['andaman', 'nicobar', 'havelock', 'sri vijaya puram'],
    isCoastal: true
  },

  // =========================================================================
  // 4. Prominent Regional, Industrial & Agricultural Districts
  // =========================================================================
  {
    id: 'in-kanpur',
    name: 'Kanpur',
    region: 'Uttar Pradesh',
    country: 'India',
    lat: 26.44,
    lon: 80.33,
    display: 'Kanpur, Uttar Pradesh, India',
    category: 'District',
    aliases: ['iit kanpur', 'cawnpore', 'leather city', 'up']
  },
  {
    id: 'in-varanasi',
    name: 'Varanasi',
    region: 'Uttar Pradesh',
    country: 'India',
    lat: 25.31,
    lon: 82.97,
    display: 'Varanasi, Uttar Pradesh, India',
    category: 'District',
    aliases: ['banaras', 'kashi', 'ganga ghats', 'up']
  },
  {
    id: 'in-prayagraj',
    name: 'Prayagraj',
    region: 'Uttar Pradesh',
    country: 'India',
    lat: 25.43,
    lon: 81.84,
    display: 'Prayagraj, Uttar Pradesh, India',
    category: 'District',
    aliases: ['allahabad', 'sangam', 'kumbh', 'up']
  },
  {
    id: 'in-agra',
    name: 'Agra',
    region: 'Uttar Pradesh',
    country: 'India',
    lat: 27.17,
    lon: 78.00,
    display: 'Agra, Uttar Pradesh, India',
    category: 'District',
    aliases: ['taj mahal', 'up']
  },
  {
    id: 'in-meerut',
    name: 'Meerut',
    region: 'Uttar Pradesh',
    country: 'India',
    lat: 28.98,
    lon: 77.70,
    display: 'Meerut, Uttar Pradesh, India',
    category: 'District',
    aliases: ['ncr meerut', 'sports city', 'up']
  },
  {
    id: 'in-bareilly',
    name: 'Bareilly',
    region: 'Uttar Pradesh',
    country: 'India',
    lat: 28.36,
    lon: 79.43,
    display: 'Bareilly, Uttar Pradesh, India',
    category: 'District',
    aliases: ['rohailkhand', 'up']
  },
  {
    id: 'in-aligarh',
    name: 'Aligarh',
    region: 'Uttar Pradesh',
    country: 'India',
    lat: 27.89,
    lon: 78.08,
    display: 'Aligarh, Uttar Pradesh, India',
    category: 'District',
    aliases: ['amu', 'lock city', 'up']
  },
  {
    id: 'in-mathura',
    name: 'Mathura',
    region: 'Uttar Pradesh',
    country: 'India',
    lat: 27.49,
    lon: 77.67,
    display: 'Mathura, Uttar Pradesh, India',
    category: 'District',
    aliases: ['vrindavan', 'braj', 'up']
  },
  {
    id: 'in-ayodhya',
    name: 'Ayodhya',
    region: 'Uttar Pradesh',
    country: 'India',
    lat: 26.79,
    lon: 82.20,
    display: 'Ayodhya, Uttar Pradesh, India',
    category: 'District',
    aliases: ['faizabad', 'saryu', 'up']
  },
  {
    id: 'in-gorakhpur',
    name: 'Gorakhpur',
    region: 'Uttar Pradesh',
    country: 'India',
    lat: 26.76,
    lon: 83.37,
    display: 'Gorakhpur, Uttar Pradesh, India',
    category: 'Agriculture Hub',
    aliases: ['eastern up', 'purvanchal', 'up']
  },
  {
    id: 'in-muzaffarnagar',
    name: 'Muzaffarnagar',
    region: 'Uttar Pradesh',
    country: 'India',
    lat: 29.47,
    lon: 77.70,
    display: 'Muzaffarnagar, Uttar Pradesh, India',
    category: 'Agriculture Hub',
    aliases: ['sugar bowl', 'sugarcane belt', 'up']
  },
  {
    id: 'in-moradabad',
    name: 'Moradabad',
    region: 'Uttar Pradesh',
    country: 'India',
    lat: 28.83,
    lon: 78.78,
    display: 'Moradabad, Uttar Pradesh, India',
    category: 'District',
    aliases: ['brass city', 'peetal nagari', 'up']
  },
  {
    id: 'in-ludhiana',
    name: 'Ludhiana',
    region: 'Punjab',
    country: 'India',
    lat: 30.90,
    lon: 75.85,
    display: 'Ludhiana, Punjab, India',
    category: 'Agriculture Hub',
    aliases: ['pau', 'manchester of india', 'punjab agri hub', 'punjab']
  },
  {
    id: 'in-amritsar',
    name: 'Amritsar',
    region: 'Punjab',
    country: 'India',
    lat: 31.63,
    lon: 74.87,
    display: 'Amritsar, Punjab, India',
    category: 'District',
    aliases: ['golden temple', 'wagah', 'punjab']
  },
  {
    id: 'in-jalandhar',
    name: 'Jalandhar',
    region: 'Punjab',
    country: 'India',
    lat: 31.32,
    lon: 75.57,
    display: 'Jalandhar, Punjab, India',
    category: 'District',
    aliases: ['doaba', 'sports goods hub', 'punjab']
  },
  {
    id: 'in-jodhpur',
    name: 'Jodhpur',
    region: 'Rajasthan',
    country: 'India',
    lat: 26.29,
    lon: 73.02,
    display: 'Jodhpur, Rajasthan, India',
    category: 'District',
    aliases: ['blue city', 'sun city', 'thar', 'rajasthan']
  },
  {
    id: 'in-udaipur',
    name: 'Udaipur',
    region: 'Rajasthan',
    country: 'India',
    lat: 24.58,
    lon: 73.71,
    display: 'Udaipur, Rajasthan, India',
    category: 'District',
    aliases: ['city of lakes rajasthan', 'mewar', 'rajasthan']
  },
  {
    id: 'in-kota',
    name: 'Kota',
    region: 'Rajasthan',
    country: 'India',
    lat: 25.18,
    lon: 75.83,
    display: 'Kota, Rajasthan, India',
    category: 'District',
    aliases: ['chambal', 'coaching hub', 'rajasthan']
  },
  {
    id: 'in-indore',
    name: 'Indore',
    region: 'Madhya Pradesh',
    country: 'India',
    lat: 22.71,
    lon: 75.85,
    display: 'Indore, Madhya Pradesh, India',
    category: 'Tech Hub',
    aliases: ['cleanest city', 'malwa', 'iit iim indore', 'madhya pradesh']
  },
  {
    id: 'in-gwalior',
    name: 'Gwalior',
    region: 'Madhya Pradesh',
    country: 'India',
    lat: 26.21,
    lon: 78.17,
    display: 'Gwalior, Madhya Pradesh, India',
    category: 'District',
    aliases: ['chambal gwalior', 'gopachal', 'madhya pradesh']
  },
  {
    id: 'in-jabalpur',
    name: 'Jabalpur',
    region: 'Madhya Pradesh',
    country: 'India',
    lat: 23.18,
    lon: 79.98,
    display: 'Jabalpur, Madhya Pradesh, India',
    category: 'District',
    aliases: ['bhedaghat', 'narmada', 'sanskardhani', 'madhya pradesh']
  },
  {
    id: 'in-surat',
    name: 'Surat',
    region: 'Gujarat',
    country: 'India',
    lat: 21.17,
    lon: 72.83,
    display: 'Surat, Gujarat, India',
    category: 'Tech Hub',
    aliases: ['diamond city', 'textile hub', 'tapi', 'gujarat'],
    isCoastal: true
  },
  {
    id: 'in-vadodara',
    name: 'Vadodara',
    region: 'Gujarat',
    country: 'India',
    lat: 22.30,
    lon: 73.18,
    display: 'Vadodara, Gujarat, India',
    category: 'District',
    aliases: ['baroda', 'sanskari nagari', 'gujarat']
  },
  {
    id: 'in-rajkot',
    name: 'Rajkot',
    region: 'Gujarat',
    country: 'India',
    lat: 22.30,
    lon: 70.80,
    display: 'Rajkot, Gujarat, India',
    category: 'Agriculture Hub',
    aliases: ['saurashtra', 'groundnut belt', 'gujarat']
  },
  {
    id: 'in-nagpur',
    name: 'Nagpur',
    region: 'Maharashtra',
    country: 'India',
    lat: 21.14,
    lon: 79.08,
    display: 'Nagpur, Maharashtra, India',
    category: 'Tech Hub',
    aliases: ['orange city', 'zero mile', 'vidarbha', 'mihan', 'maharashtra']
  },
  {
    id: 'in-nashik',
    name: 'Nashik',
    region: 'Maharashtra',
    country: 'India',
    lat: 19.99,
    lon: 73.78,
    display: 'Nashik, Maharashtra, India',
    category: 'Agriculture Hub',
    aliases: ['wine capital', 'grape city', 'godavari', 'maharashtra']
  },
  {
    id: 'in-chhatrapati-sambhajinagar',
    name: 'Chhatrapati Sambhajinagar',
    region: 'Maharashtra',
    country: 'India',
    lat: 19.87,
    lon: 75.34,
    display: 'Chhatrapati Sambhajinagar, Maharashtra, India',
    category: 'District',
    aliases: ['aurangabad', 'ajanta ellora', 'marathwada', 'maharashtra']
  },
  {
    id: 'in-visakhapatnam',
    name: 'Visakhapatnam',
    region: 'Andhra Pradesh',
    country: 'India',
    lat: 17.68,
    lon: 83.21,
    display: 'Visakhapatnam, Andhra Pradesh, India',
    category: 'Tech Hub',
    aliases: ['vizag', 'steel city', 'eastern naval command', 'andhra pradesh'],
    isCoastal: true
  },
  {
    id: 'in-vijayawada',
    name: 'Vijayawada',
    region: 'Andhra Pradesh',
    country: 'India',
    lat: 16.50,
    lon: 80.64,
    display: 'Vijayawada, Andhra Pradesh, India',
    category: 'District',
    aliases: ['bezawada', 'krishna river', 'andhra pradesh']
  },
  {
    id: 'in-kochi',
    name: 'Kochi',
    region: 'Kerala',
    country: 'India',
    lat: 9.93,
    lon: 76.26,
    display: 'Kochi, Kerala, India',
    category: 'Tech Hub',
    aliases: ['cochin', 'infopark', 'ernakulam', 'queen of arabian sea', 'kerala'],
    isCoastal: true
  },
  {
    id: 'in-kozhikode',
    name: 'Kozhikode',
    region: 'Kerala',
    country: 'India',
    lat: 11.25,
    lon: 75.78,
    display: 'Kozhikode, Kerala, India',
    category: 'District',
    aliases: ['calicut', 'malabar', 'cyberpark', 'kerala'],
    isCoastal: true
  },
  {
    id: 'in-coimbatore',
    name: 'Coimbatore',
    region: 'Tamil Nadu',
    country: 'India',
    lat: 11.01,
    lon: 76.95,
    display: 'Coimbatore, Tamil Nadu, India',
    category: 'Tech Hub',
    aliases: ['kovai', 'manchester of south india', 'tamil nadu']
  },
  {
    id: 'in-madurai',
    name: 'Madurai',
    region: 'Tamil Nadu',
    country: 'India',
    lat: 9.92,
    lon: 78.11,
    display: 'Madurai, Tamil Nadu, India',
    category: 'District',
    aliases: ['meenakshi amman', 'temple city tamil nadu', 'tamil nadu']
  },
  {
    id: 'in-mysuru',
    name: 'Mysuru',
    region: 'Karnataka',
    country: 'India',
    lat: 12.29,
    lon: 76.63,
    display: 'Mysuru, Karnataka, India',
    category: 'District',
    aliases: ['mysore', 'heritage city', 'karnataka']
  },
  {
    id: 'in-hubballi',
    name: 'Hubballi',
    region: 'Karnataka',
    country: 'India',
    lat: 15.36,
    lon: 75.12,
    display: 'Hubballi, Karnataka, India',
    category: 'District',
    aliases: ['hubli', 'dharwad', 'north karnataka', 'karnataka']
  },
  {
    id: 'in-gaya',
    name: 'Gaya',
    region: 'Bihar',
    country: 'India',
    lat: 24.79,
    lon: 85.00,
    display: 'Gaya, Bihar, India',
    category: 'District',
    aliases: ['bodh gaya', 'falgu', 'bihar']
  },
  {
    id: 'in-muzaffarpur',
    name: 'Muzaffarpur',
    region: 'Bihar',
    country: 'India',
    lat: 26.12,
    lon: 85.39,
    display: 'Muzaffarpur, Bihar, India',
    category: 'Agriculture Hub',
    aliases: ['shahi litchi', 'north bihar', 'bihar']
  },
  {
    id: 'in-jamshedpur',
    name: 'Jamshedpur',
    region: 'Jharkhand',
    country: 'India',
    lat: 22.80,
    lon: 86.20,
    display: 'Jamshedpur, Jharkhand, India',
    category: 'District',
    aliases: ['tatanagar', 'steel city jharkhand', 'jharkhand']
  },
  {
    id: 'in-dhanbad',
    name: 'Dhanbad',
    region: 'Jharkhand',
    country: 'India',
    lat: 23.79,
    lon: 86.43,
    display: 'Dhanbad, Jharkhand, India',
    category: 'District',
    aliases: ['coal capital', 'iit ism dhanbad', 'jharkhand']
  },
  {
    id: 'in-cuttack',
    name: 'Cuttack',
    region: 'Odisha',
    country: 'India',
    lat: 20.46,
    lon: 85.88,
    display: 'Cuttack, Odisha, India',
    category: 'District',
    aliases: ['silver city', 'mahanadi', 'odisha']
  },
  {
    id: 'in-siliguri',
    name: 'Siliguri',
    region: 'West Bengal',
    country: 'India',
    lat: 26.72,
    lon: 88.39,
    display: 'Siliguri, West Bengal, India',
    category: 'District',
    aliases: ['chicken neck', 'darjeeling foothills', 'dooars', 'west bengal']
  },
  {
    id: 'in-asansol',
    name: 'Asansol',
    region: 'West Bengal',
    country: 'India',
    lat: 23.68,
    lon: 86.98,
    display: 'Asansol, West Bengal, India',
    category: 'District',
    aliases: ['durgapur asansol', 'raniganj', 'west bengal']
  },
  {
    id: 'in-puri',
    name: 'Puri',
    region: 'Odisha',
    country: 'India',
    lat: 19.81,
    lon: 85.83,
    display: 'Puri, Odisha, India',
    category: 'Coastal',
    aliases: ['jagannath puri', 'odisha coast', 'puri beach'],
    isCoastal: true
  },

  // =========================================================================
  // 5. Global Financial, Tech & Weather Anchor Hubs
  // =========================================================================
  {
    id: 'gb-london',
    name: 'London',
    region: 'Greater London',
    country: 'United Kingdom',
    lat: 51.50,
    lon: -0.12,
    display: 'London, Greater London, United Kingdom',
    category: 'Global',
    aliases: ['uk', 'great britain', 'england', 'westminster', 'heathrow']
  },
  {
    id: 'us-nyc',
    name: 'New York',
    region: 'New York',
    country: 'United States',
    lat: 40.71,
    lon: -74.00,
    display: 'New York, New York, United States',
    category: 'Global',
    aliases: ['nyc', 'manhattan', 'brooklyn', 'usa', 'america', 'queens', 'us'],
    isCoastal: true
  },
  {
    id: 'us-sfo',
    name: 'San Francisco',
    region: 'California',
    country: 'United States',
    lat: 37.77,
    lon: -122.41,
    display: 'San Francisco, California, United States',
    category: 'Global',
    aliases: ['sf', 'bay area', 'silicon valley', 'california', 'palo alto', 'mountain view', 'usa'],
    isCoastal: true
  },
  {
    id: 'jp-tokyo',
    name: 'Tokyo',
    region: 'Kanto',
    country: 'Japan',
    lat: 35.67,
    lon: 139.65,
    display: 'Tokyo, Kanto, Japan',
    category: 'Global',
    aliases: ['japan', 'shinjuku', 'shibuya', 'haneda', 'narita'],
    isCoastal: true
  },
  {
    id: 'ae-dubai',
    name: 'Dubai',
    region: 'Dubai',
    country: 'United Arab Emirates',
    lat: 25.20,
    lon: 55.27,
    display: 'Dubai, Dubai, United Arab Emirates',
    category: 'Global',
    aliases: ['uae', 'emirates', 'burj khalifa', 'deira', 'marina dubai'],
    isCoastal: true
  },
  {
    id: 'sg-singapore',
    name: 'Singapore',
    region: 'Central',
    country: 'Singapore',
    lat: 1.35,
    lon: 103.81,
    display: 'Singapore, Singapore',
    category: 'Global',
    aliases: ['changi', 'marina bay', 'lion city', 'sg'],
    isCoastal: true
  },
  {
    id: 'au-sydney',
    name: 'Sydney',
    region: 'New South Wales',
    country: 'Australia',
    lat: -33.86,
    lon: 151.20,
    display: 'Sydney, New South Wales, Australia',
    category: 'Global',
    aliases: ['australia', 'nsw', 'opera house', 'bondi', 'syd'],
    isCoastal: true
  },
  {
    id: 'fr-paris',
    name: 'Paris',
    region: 'Île-de-France',
    country: 'France',
    lat: 48.85,
    lon: 2.35,
    display: 'Paris, Île-de-France, France',
    category: 'Global',
    aliases: ['france', 'eiffel', 'cdg', 'french capital']
  },
  {
    id: 'de-berlin',
    name: 'Berlin',
    region: 'Berlin',
    country: 'Germany',
    lat: 52.52,
    lon: 13.40,
    display: 'Berlin, Berlin, Germany',
    category: 'Global',
    aliases: ['germany', 'deutschland', 'german capital']
  },
  {
    id: 'ca-toronto',
    name: 'Toronto',
    region: 'Ontario',
    country: 'Canada',
    lat: 43.65,
    lon: -79.38,
    display: 'Toronto, Ontario, Canada',
    category: 'Global',
    aliases: ['canada', 'ontario', 'gta', 'cn tower']
  },
  {
    id: 'us-sea',
    name: 'Seattle',
    region: 'Washington',
    country: 'United States',
    lat: 47.60,
    lon: -122.33,
    display: 'Seattle, Washington, United States',
    category: 'Global',
    aliases: ['washington state', 'pacific northwest', 'usa', 'amazon', 'microsoft'],
    isCoastal: true
  }
];

export const REGIONAL_STATE_MAPPINGS: Record<string, string[]> = {
  'delhi': ['in-delhi', 'in-noida', 'in-gurugram', 'in-ghaziabad', 'in-faridabad'],
  'uttar pradesh': ['in-noida', 'in-delhi', 'in-lucknow', 'in-kanpur', 'in-varanasi', 'in-prayagraj', 'in-agra', 'in-meerut', 'in-ayodhya', 'in-gorakhpur', 'in-muzaffarnagar'],
  'up': ['in-noida', 'in-delhi', 'in-lucknow', 'in-kanpur', 'in-varanasi', 'in-prayagraj', 'in-agra', 'in-meerut', 'in-ayodhya', 'in-gorakhpur', 'in-muzaffarnagar'],
  'haryana': ['in-gurugram', 'in-faridabad', 'in-chandigarh'],
  'karnataka': ['in-bengaluru', 'in-mysuru', 'in-hubballi'],
  'maharashtra': ['in-mumbai', 'in-pune', 'in-nagpur', 'in-nashik', 'in-chhatrapati-sambhajinagar'],
  'tamil nadu': ['in-chennai', 'in-coimbatore', 'in-madurai'],
  'telangana': ['in-hyderabad'],
  'andhra pradesh': ['in-visakhapatnam', 'in-vijayawada', 'in-amaravati'],
  'west bengal': ['in-kolkata', 'in-siliguri', 'in-asansol'],
  'gujarat': ['in-ahmedabad', 'in-surat', 'in-vadodara', 'in-rajkot'],
  'rajasthan': ['in-jaipur', 'in-jodhpur', 'in-udaipur', 'in-kota'],
  'madhya pradesh': ['in-bhopal', 'in-indore', 'in-gwalior', 'in-jabalpur'],
  'bihar': ['in-sasaram', 'in-patna', 'in-gaya', 'in-muzaffarpur'],
  'punjab': ['in-chandigarh', 'in-ludhiana', 'in-amritsar', 'in-jalandhar'],
  'kerala': ['in-thiruvananthapuram', 'in-kochi', 'in-kozhikode'],
  'odisha': ['in-bhubaneswar', 'in-cuttack', 'in-puri'],
  'jharkhand': ['in-ranchi', 'in-jamshedpur', 'in-dhanbad'],
  'assam': ['in-guwahati'],
  'uttarakhand': ['in-dehradun'],
  'himachal pradesh': ['in-shimla'],
  'jammu and kashmir': ['in-srinagar', 'in-jammu'],
  'united kingdom': ['gb-london'],
  'united states': ['us-nyc', 'us-sfo', 'us-sea'],
  'japan': ['jp-tokyo'],
  'australia': ['au-sydney'],
  'germany': ['de-berlin'],
  'france': ['fr-paris'],
  'canada': ['ca-toronto'],
  'uae': ['ae-dubai']
};
