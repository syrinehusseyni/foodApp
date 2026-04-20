const USER_SERVICE = import.meta.env.VITE_USER_SERVICE;
const DELIVERY_SERVICE = import.meta.env.VITE_DELIVERY_SERVICE;

const parseResponse = async (response) => {
    const contentType = response.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");
    const payload = isJson ? await response.json() : await response.text();

    if (!response.ok) {
        const message =
            typeof payload === "string"
                ? payload
                : payload?.message ||
                  response.statusText ||
                  `Request failed with status ${response.status}.`;
        throw new Error(message);
    }

    return payload;
};

// ── AUTH ──────────────────────────────────────────
export const loginUser = async (email, password) => {
    const response = await fetch(`${USER_SERVICE}/api/users/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    });
    return response.json();
};

export const registerUser = async (data) => {
    const response = await fetch(`${USER_SERVICE}/api/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
    return response.json();
};

// ── RESTAURANTS ───────────────────────────────────
export const getRestaurants = async (token) => {
    const response = await fetch(`${USER_SERVICE}/api/users/restaurants`, {
        headers: { "Authorization": `Bearer ${token}` }
    });
    return response.json();
};

export const getRestaurantById = async (token, id) => {
    const response = await fetch(`${USER_SERVICE}/api/users/restaurants/${id}`, {
        headers: { "Authorization": `Bearer ${token}` }
    });
    return response.json();
};

// ── MENU ──────────────────────────────────────────
export const getMenuByRestaurant = async (token, restaurantId) => {
    const response = await fetch(`${USER_SERVICE}/api/users/menu/${restaurantId}`, {
        headers: { "Authorization": `Bearer ${token}` }
    });
    return response.json();
};

// ── CART ──────────────────────────────────────────
export const addToCart = async (token, cartItem) => {
    const response = await fetch(`${USER_SERVICE}/api/users/cart/add`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(cartItem)
    });
    return response.json();
};

export const getCart = async (token, customerId) => {
    const response = await fetch(`${USER_SERVICE}/api/users/cart/${customerId}`, {
        headers: { "Authorization": `Bearer ${token}` }
    });
    return response.json();
};

export const clearCart = async (token, userId) => {
    await fetch(`${USER_SERVICE}/api/users/cart/${userId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
    });
};

// ── ORDERS ────────────────────────────────────────
export const placeOrder = async (token, orderData) => {
    const response = await fetch(`${USER_SERVICE}/api/users/orders/create`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
    });
    return parseResponse(response);
};


export const getOrderById = async (token, orderId) => {
    const response = await fetch(`${USER_SERVICE}/api/users/orders/${orderId}`, {
        headers: { "Authorization": `Bearer ${token}` }
    });
    return response.json();
};

export const createOrderFromCart = async (token, userId, orderData) => {
    const response = await fetch(`${USER_SERVICE}/api/users/orders/from-cart?userId=${userId}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
    });
    return response.json();
};

// ── DELIVERY ──────────────────────────────────────
export const createDelivery = async (token, deliveryData) => {
    const response = await fetch(`${DELIVERY_SERVICE}/api/delivery`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(deliveryData)
    });
    return parseResponse(response);
};

export const trackDelivery = async (token, deliveryId) => {
    const response = await fetch(`${USER_SERVICE}/api/users/delivery/${deliveryId}/track`, {
        headers: { "Authorization": `Bearer ${token}` }
    });
    return response.json();
};

// ── RATINGS ───────────────────────────────────────
export const addRating = async (token, ratingData) => {
    const response = await fetch(`${USER_SERVICE}/api/ratings`, {  // ← fixed: /api/ratings not /api/users/ratings
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(ratingData)
    });
    return response.json();
};

export const getRatingsByUser = async (token, userId) => {         // ← add this
    const response = await fetch(`${USER_SERVICE}/api/ratings/user/${userId}`, {
        headers: { "Authorization": `Bearer ${token}` }
    });
    return response.json();
};
