// qr_food_order_frontend/script.js

const backendUrl = 'https://render.com/docs/web-services#port-binding'; // URL ของ Backend Server (ต้องตรงกับ server.js)
let menuData = []; // เก็บข้อมูลหมวดหมู่และสินค้าทั้งหมดจาก Backend
let cart = []; // เก็บรายการสินค้าในตะกร้า

// Elements ใน HTML
const categoriesContainer = document.getElementById('categories-container');
const menuItemsContainer = document.getElementById('menu-items-container');
const cartList = document.getElementById('cart-list');
const totalPriceSpan = document.getElementById('total-price');
const sendOrderBtn = document.getElementById('send-order-btn');

// ฟังก์ชันเริ่มต้นเมื่อโหลดหน้าเว็บ
document.addEventListener('DOMContentLoaded', () => {
    fetchMenu();
    sendOrderBtn.addEventListener('click', sendOrder);
});

// ดึงข้อมูลเมนูจาก Backend
async function fetchMenu() {
    try {
        const response = await fetch(`${backendUrl}/menu`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        menuData = await response.json(); // Backend จะส่ง menuCategories มาที่นี่
        console.log('Menu fetched:', menuData);
        displayCategories(); // แสดงหมวดหมู่หลังจากได้ข้อมูลมาแล้ว
        // แสดงสินค้าของหมวดหมู่แรกเป็นค่าเริ่มต้น
        if (menuData.length > 0) {
            displayMenuItems(menuData[0].id);
        }
    } catch (error) {
        console.error('Error fetching menu:', error);
        alert('ไม่สามารถโหลดเมนูได้ กรุณาลองใหม่ภายหลัง');
    }
}

// แสดงปุ่ม/แท็บหมวดหมู่
function displayCategories() {
    categoriesContainer.innerHTML = ''; // เคลียร์ของเก่า
    menuData.forEach(category => {
        const categoryButton = document.createElement('button');
        categoryButton.textContent = category.name;
        categoryButton.classList.add('category-button');
        categoryButton.addEventListener('click', () => {
            // ลบ active class ออกจากปุ่มทั้งหมด
            document.querySelectorAll('.category-button').forEach(btn => btn.classList.remove('active'));
            // เพิ่ม active class ให้ปุ่มที่ถูกคลิก
            categoryButton.classList.add('active');
            displayMenuItems(category.id); // แสดงสินค้าในหมวดหมู่นี้
        });
        categoriesContainer.appendChild(categoryButton);
    });
    // ตั้งค่า active class ให้ปุ่มแรกเมื่อโหลดครั้งแรก
    if (categoriesContainer.firstElementChild) {
        categoriesContainer.firstElementChild.classList.add('active');
    }
}

// แสดงรายการสินค้าในหมวดหมู่ที่เลือก
function displayMenuItems(categoryId) {
    menuItemsContainer.innerHTML = ''; // เคลียร์ของเก่า

    const selectedCategory = menuData.find(cat => cat.id === categoryId);

    if (selectedCategory) {
        selectedCategory.items.forEach(item => {
            const itemCard = document.createElement('div');
            itemCard.classList.add('menu-item-card');
            itemCard.innerHTML = `
                <h3>${item.name}</h3>
                <p>ราคา: ${item.price.toFixed(2)} บาท</p>
                ${item.img ? `<img src="images/${item.img}" alt="${item.name}">` : ''} <button class="add-to-cart-btn" data-item-id="${item.id}">เพิ่มลงตะกร้า</button>
            `;
            // เพิ่ม Event Listener ให้ปุ่มเพิ่มลงตะกร้า
            const addToCartBtn = itemCard.querySelector('.add-to-cart-btn');
            addToCartBtn.addEventListener('click', () => addToCart(item));
            menuItemsContainer.appendChild(itemCard);
        });
    } else {
        menuItemsContainer.innerHTML = '<p>ไม่พบรายการสินค้าในหมวดหมู่นี้</p>';
    }
}

// เพิ่มสินค้าลงตะกร้า
function addToCart(item) {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ ...item, quantity: 1 }); // เพิ่ม quantity เริ่มต้นเป็น 1
    }
    updateCartDisplay();
}

// อัปเดตการแสดงผลตะกร้าสินค้า
function updateCartDisplay() {
    cartList.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
        cartList.innerHTML = '<p>ไม่มีสินค้าในตะกร้า</p>';
    } else {
        cart.forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = `
                ${item.name} x${item.quantity}
                <button class="remove-from-cart-btn" data-item-id="${item.id}">-</button>
                <button class="add-more-btn" data-item-id="${item.id}">+</button>
                <span>(${(item.price * item.quantity).toFixed(2)} บาท)</span>
            `;
            // ปุ่มลดจำนวน
            const removeBtn = li.querySelector('.remove-from-cart-btn');
            removeBtn.addEventListener('click', () => removeFromCart(item.id));
            // ปุ่มเพิ่มจำนวน
            const addMoreBtn = li.querySelector('.add-more-btn');
            addMoreBtn.addEventListener('click', () => addMoreToCart(item.id));

            cartList.appendChild(li);
            total += item.price * item.quantity;
        });
    }


    totalPriceSpan.textContent = total.toFixed(2);
}

// ลดจำนวนสินค้าในตะกร้า
function removeFromCart(itemId) {
    const itemIndex = cart.findIndex(cartItem => cartItem.id === itemId);
    if (itemIndex > -1) {
        if (cart[itemIndex].quantity > 1) {
            cart[itemIndex].quantity--;
        } else {
            cart.splice(itemIndex, 1); // ลบออกจากตะกร้าถ้าเหลือ 1 ชิ้น
        }
    }
    updateCartDisplay();
}

// เพิ่มจำนวนสินค้าในตะกร้า (จากปุ่ม + ในตะกร้า)
function addMoreToCart(itemId) {
    const item = cart.find(cartItem => cartItem.id === itemId);
    if (item) {
        item.quantity++;
    }
    updateCartDisplay();
}

// ส่งออเดอร์ไปยัง Backend
async function sendOrder() {
    if (cart.length === 0) {
        alert('กรุณาเลือกสินค้าก่อนส่งออเดอร์');
        return;
    }

    const orderData = {
        items: cart.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity
        })),
        total: parseFloat(totalPriceSpan.textContent),
        timestamp: new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' }) // เพิ่มเวลาสั่งซื้อ
    };

    try {
        const response = await fetch(`${backendUrl}/order`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        alert(result.message);
        cart = []; // เคลียร์ตะกร้าหลังจากส่งแล้ว
        updateCartDisplay();
    } catch (error) {
        console.error('Error sending order:', error);
        alert('เกิดข้อผิดพลาดในการส่งออเดอร์ กรุณาลองใหม่');
    }
}