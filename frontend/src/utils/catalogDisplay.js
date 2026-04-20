const DEFAULT_RESTAURANT_IMAGE =
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800";

const DEFAULT_MENU_IMAGE =
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600";

const restaurantThemes = [
  {
    match: ["pizza", "pizzeria"],
    category: "pizza",
    cuisine: "Pizza",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800",
  },
  {
    match: ["burger"],
    category: "burger",
    cuisine: "Burgers",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800",
  },
  {
    match: ["pasta", "ital", "alfredo", "spaghetti"],
    category: "pates",
    cuisine: "Italian",
    image: "https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=800",
  },
  {
    match: ["salad", "salade", "green"],
    category: "salade",
    cuisine: "Healthy",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800",
  },
  {
    match: ["cake", "dessert", "sweet", "gelato", "ice"],
    category: "dessert",
    cuisine: "Desserts",
    image: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800",
  },
  {
    match: ["chicken", "grill", "bbq"],
    category: "poulet",
    cuisine: "Grill",
    image: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=800",
  },
  {
    match: ["sandwich", "wrap", "snack"],
    category: "sandwich",
    cuisine: "Sandwiches",
    image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800",
  },
];

const menuThemes = [
  {
    match: ["pizza"],
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600",
    category: "pizza",
    supplements: [
      { name: "Extra cheese", price: 2 },
      { name: "Soft drink 33cl", price: 2 },
    ],
  },
  {
    match: ["burger"],
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600",
    category: "burger",
    supplements: [
      { name: "Fries", price: 4 },
      { name: "Extra sauce", price: 1 },
    ],
  },
  {
    match: ["pasta", "spaghetti", "penne", "tagliatelle", "alfredo"],
    image: "https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=600",
    category: "pates",
    supplements: [
      { name: "Extra parmesan", price: 1.5 },
      { name: "Garlic bread", price: 2 },
    ],
  },
  {
    match: ["salad", "salade", "caesar"],
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600",
    category: "salade",
    supplements: [
      { name: "Extra chicken", price: 4 },
      { name: "Extra dressing", price: 1 },
    ],
  },
  {
    match: ["cake", "dessert", "chocolate", "ice", "gelato"],
    image: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=600",
    category: "dessert",
    supplements: [
      { name: "Extra topping", price: 1.5 },
      { name: "Coffee", price: 2 },
    ],
  },
  {
    match: ["chicken", "grill"],
    image: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=600",
    category: "poulet",
    supplements: [
      { name: "Extra portion", price: 4 },
      { name: "Soft drink 33cl", price: 2 },
    ],
  },
];

function findTheme(name, themes) {
  const lowerName = String(name || "").toLowerCase();
  return themes.find((theme) =>
    theme.match.some((keyword) => lowerName.includes(keyword))
  );
}

function deterministicPercent(seed, min, spread) {
  const value = Number(seed || 0);
  return min + (value % spread);
}

export function getRestaurantVisuals(restaurant) {
  const theme = findTheme(restaurant?.name, restaurantThemes);
  const rating = deterministicPercent(restaurant?.id, 90, 9);
  const reviews = 120 + deterministicPercent(restaurant?.id, 0, 380);
  const priceMin = 8 + (Number(restaurant?.id || 0) % 4) * 2;
  const priceMax = priceMin + 10;

  return {
    image: theme?.image || DEFAULT_RESTAURANT_IMAGE,
    category: theme?.category || "all",
    cuisine: theme?.cuisine || "Restaurant",
    rating,
    reviews,
    time: "15-25 min",
    delivery: "Free",
    price: `${priceMin}-${priceMax} DT`,
  };
}

export function getMenuItemVisuals(item) {
  const theme = findTheme(item?.name, menuThemes);
  return {
    image: theme?.image || DEFAULT_MENU_IMAGE,
    category: theme?.category || "all",
    supplements: theme?.supplements || [],
  };
}
