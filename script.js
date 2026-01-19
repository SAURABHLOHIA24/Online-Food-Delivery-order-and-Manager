// Data Storage
let orders = [
    { orderId: 'ORD001', restaurantName: 'Pizza Palace', itemCount: 2, isPaid: true, deliveryDistance: 3.5 },
    { orderId: 'ORD002', restaurantName: 'Burger Barn', itemCount: 1, isPaid: false, deliveryDistance: 2.1 },
    { orderId: 'ORD003', restaurantName: 'Sushi Express', itemCount: 3, isPaid: false, deliveryDistance: 5.8 },
    { orderId: 'ORD004', restaurantName: 'Taco Time', itemCount: 2, isPaid: true, deliveryDistance: 1.2 },
];

let currentFilter = 'all';
let maxDistanceFilter = 10;

// DOM Elements
const addOrderForm = document.getElementById('addOrderForm');
const orderId = document.getElementById('orderId');
const restaurantName = document.getElementById('restaurantName');
const itemCount = document.getElementById('itemCount');
const deliveryDistance = document.getElementById('deliveryDistance');
const isPaid = document.getElementById('isPaid');
const maxDistance = document.getElementById('maxDistance');
const assignMaxDistance = document.getElementById('assignMaxDistance');
const assignBtn = document.getElementById('assignBtn');
const tableBody = document.getElementById('tableBody');
const emptyState = document.getElementById('emptyState');
const outputPanel = document.getElementById('outputPanel');
const filterBtns = document.querySelectorAll('.filter-btn');
const distanceValue = document.getElementById('distanceValue');
const assignDistanceValue = document.getElementById('assignDistanceValue');

// Event Listeners
addOrderForm.addEventListener('submit', handleAddOrder);
maxDistance.addEventListener('change', handleDistanceChange);
assignMaxDistance.addEventListener('change', handleAssignDistanceChange);
assignBtn.addEventListener('click', handleAssignDelivery);

filterBtns.forEach(btn => {
    btn.addEventListener('click', handleFilterClick);
});

// Add Order Function
function handleAddOrder(e) {
    e.preventDefault();

    const orderIdValue = orderId.value.trim();
    const restaurantNameValue = restaurantName.value.trim();
    const itemCountValue = parseInt(itemCount.value);
    const deliveryDistanceValue = parseFloat(deliveryDistance.value);
    const isPaidValue = isPaid.checked;

    // Validation
    if (!orderIdValue || !restaurantNameValue) {
        showOutput('Error: Order ID and Restaurant Name are required', 'error');
        return;
    }

    if (orders.some(o => o.orderId === orderIdValue)) {
        showOutput('Error: Order ID already exists', 'error');
        return;
    }

    if (itemCountValue < 1) {
        showOutput('Error: Item count must be at least 1', 'error');
        return;
    }

    if (deliveryDistanceValue < 0) {
        showOutput('Error: Delivery distance cannot be negative', 'error');
        return;
    }

    // Add order
    const newOrder = {
        orderId: orderIdValue,
        restaurantName: restaurantNameValue,
        itemCount: itemCountValue,
        isPaid: isPaidValue,
        deliveryDistance: deliveryDistanceValue
    };

    orders.push(newOrder);
    showOutput(`✓ Order ${orderIdValue} added successfully\nRestaurant: ${restaurantNameValue}\nDistance: ${deliveryDistanceValue} km`, 'success');
    
    // Reset form
    addOrderForm.reset();
    itemCount.value = 1;
    deliveryDistance.value = 0;
    
    // Update UI
    updateTable();
    updateStats();
}

// Delete Order Function
function deleteOrder(orderIdToDelete) {
    const orderIndex = orders.findIndex(o => o.orderId === orderIdToDelete);
    
    if (orderIndex !== -1) {
        orders.splice(orderIndex, 1);
        showOutput(`✓ Order ${orderIdToDelete} deleted successfully`, 'success');
        updateTable();
        updateStats();
    }
}

// Filter by Status Function
function handleFilterClick(e) {
    const filterValue = e.target.getAttribute('data-filter');
    currentFilter = filterValue;
    
    // Update active button
    filterBtns.forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');
    
    // Update table
    updateTable();
}

// Update Distance Filter
function handleDistanceChange() {
    maxDistanceFilter = parseFloat(maxDistance.value);
    distanceValue.textContent = maxDistanceFilter + ' km';
    updateTable();
}

// Update Assign Distance Display
function handleAssignDistanceChange() {
    assignDistanceValue.textContent = assignMaxDistance.value + ' km';
}

// Assign Delivery Function
function handleAssignDelivery() {
    const maxDist = parseFloat(assignMaxDistance.value);
    
    // Filter unpaid orders within distance
    const availableOrders = orders.filter(o => !o.isPaid && o.deliveryDistance <= maxDist);
    
    if (availableOrders.length === 0) {
        showOutput('No order available', 'error');
        return;
    }

    // Find nearest order
    const nearestOrder = availableOrders.reduce((nearest, current) =>
        current.deliveryDistance < nearest.deliveryDistance ? current : nearest
    );

    const message = `✓ Delivery Assigned\n\nOrder ID: ${nearestOrder.orderId}\nRestaurant: ${nearestOrder.restaurantName}\nDistance: ${nearestOrder.deliveryDistance} km\nItems: ${nearestOrder.itemCount}\nStatus: Unpaid`;
    
    showOutput(message, 'success');
}

// Update Table Display
function updateTable() {
    // Filter orders based on current filters
    const filteredOrders = orders.filter(order => {
        if (currentFilter === 'paid' && !order.isPaid) return false;
        if (currentFilter === 'unpaid' && order.isPaid) return false;
        if (order.deliveryDistance > maxDistanceFilter) return false;
        return true;
    });

    // Show/hide empty state
    if (filteredOrders.length === 0) {
        tableBody.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';

    // Build table rows
    tableBody.innerHTML = filteredOrders.map(order => `
        <tr>
            <td><strong>${escapeHtml(order.orderId)}</strong></td>
            <td>${escapeHtml(order.restaurantName)}</td>
            <td style="text-align: center;">${order.itemCount}</td>
            <td style="text-align: center;">${order.deliveryDistance}</td>
            <td style="text-align: center;">
                <span class="badge ${order.isPaid ? 'badge-paid' : 'badge-unpaid'}">
                    ${order.isPaid ? '✓ Paid' : '✗ Unpaid'}
                </span>
            </td>
            <td style="text-align: center;">
                <button class="icon-btn" onclick="deleteOrder('${escapeHtml(order.orderId)}')" title="Delete">🗑️</button>
            </td>
        </tr>
    `).join('');
}

// Update Statistics
function updateStats() {
    const totalCount = orders.length;
    const unpaidCount = orders.filter(o => !o.isPaid).length;
    const paidCount = orders.filter(o => o.isPaid).length;

    document.getElementById('totalOrders').textContent = totalCount;
    document.getElementById('unpaidOrders').textContent = unpaidCount;
    document.getElementById('paidOrders').textContent = paidCount;
}

// Show Output Message
function showOutput(message, type = 'info') {
    outputPanel.textContent = message;
    outputPanel.className = 'output-panel';
    
    if (type === 'success') {
        outputPanel.classList.add('success');
    } else if (type === 'error') {
        outputPanel.classList.add('error');
    }
}

// Utility: Escape HTML to prevent XSS
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    updateTable();
    updateStats();
    showOutput('Welcome! Add a new order to get started.', 'info');
});