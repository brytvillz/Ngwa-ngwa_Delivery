// NgwaNgwa Delivery - Enugu Locations Database
// Popular neighborhoods and landmarks in Enugu State

console.log("📍 Enugu Locations Database loaded!");

const enuguLocations = [
  // Major Areas (Enugu City)
  "Independence Layout, Enugu",
  "GRA (Government Reserved Area), Enugu",
  "New Haven, Enugu",
  "Trans-Ekulu, Enugu",
  "Achara Layout, Enugu",
  "Uwani, Enugu",
  "Abakpa Nike, Enugu",
  "Coal Camp, Enugu",
  "Ogui New Layout, Enugu",
  "Maryland, Enugu",
  "Asata, Enugu",
  "Emene, Enugu",
  "Garki, Enugu",
  "Obiagu, Enugu",
  "3-3 (Three-Three), Enugu",

  // Business Districts
  "Ogbete Main Market, Enugu",
  "Kenyatta Market, Enugu",
  "Presidential Road, Enugu",
  "Okpara Avenue, Enugu",
  "Nike Lake Road, Enugu",

  // Suburbs & Outskirts
  "Iji-Nike, Enugu",
  "Ugbawka, Enugu",
  "Ninth Mile, Enugu",
  "Iva Valley, Enugu",
  "Emene Industrial Layout, Enugu",

  // Other Major Towns in Enugu State
  "Nsukka, Enugu State",
  "Enugu-Ezike, Enugu State",
  "Udi, Enugu State",
  "Awgu, Enugu State",
  "Ezeagu, Enugu State",
  "Agbani, Enugu State",

  // Landmarks
  "University of Nigeria Teaching Hospital (UNTH), Enugu",
  "Enugu State University of Technology (ESUT), Enugu",
  "Polo Park Mall, Enugu",
  "Shoprite, Enugu",
  "IMT (Institute of Management and Technology), Enugu",
];

// Nigerian cities for delivery destinations
const nigerianCities = [
  // Lagos
  "Victoria Island, Lagos",
  "Lekki, Lagos",
  "Ikeja, Lagos",
  "Surulere, Lagos",
  "Yaba, Lagos",
  "Ikoyi, Lagos",
  "Apapa, Lagos",
  "Festac Town, Lagos",
  "Gbagada, Lagos",
  "Ajah, Lagos",

  // Abuja
  "Garki, Abuja",
  "Wuse, Abuja",
  "Maitama, Abuja",
  "Asokoro, Abuja",
  "Gwarinpa, Abuja",
  "Kubwa, Abuja",
  "Nyanya, Abuja",

  // Port Harcourt
  "GRA, Port Harcourt",
  "Rumuokoro, Port Harcourt",
  "Eliozu, Port Harcourt",
  "Trans Amadi, Port Harcourt",

  // Kano
  "Sabon Gari, Kano",
  "Nassarawa, Kano",
  "Bompai, Kano",

  // Ibadan
  "Bodija, Ibadan",
  "Dugbe, Ibadan",
  "Challenge, Ibadan",

  // Other Major Cities
  "Onitsha, Anambra",
  "Aba, Abia",
  "Owerri, Imo",
  "Calabar, Cross River",
  "Benin City, Edo",
  "Warri, Delta",
  "Asaba, Delta",
  "Jos, Plateau",
  "Kaduna, Kaduna",
  "Maiduguri, Borno",
];

// Combined list for delivery destinations (includes Enugu + other cities)
const allDeliveryLocations = [...enuguLocations, ...nigerianCities].sort();

// Make available globally
window.enuguLocations = enuguLocations;
window.nigerianCities = nigerianCities;
window.allDeliveryLocations = allDeliveryLocations;
