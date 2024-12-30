// 模擬數據
const mockData = {
    stats: {
        tables: 12,
        users: 156,
        newItems: 45
    },
    notifications: [
        { id: 1, text: '新用戶加入：王小明', time: '5分鐘前' },
        { id: 2, text: '表格更新：客戶資料', time: '10分鐘前' }
    ]
};

// DOM 加載完成後執行
document.addEventListener('DOMContentLoaded', () => {
    // 側邊欄導航
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            // 移除其他項目的 active 類
            navItems.forEach(i => i.classList.remove('active'));
            // 添加當前項目的 active 類
            item.classList.add('active');
            
            // 更新麵包屑
            const navText = item.querySelector('.nav-text').textContent;
            updateBreadcrumb(navText);
        });
    });

    // 功能卡片點擊
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => {
        card.addEventListener('click', () => {
            const title = card.querySelector('h3').textContent;
            showFeatureModal(title);
        });
    });

    // 通知按鈕
    const notificationBtn = document.querySelector('.notification-btn');
    notificationBtn.addEventListener('click', toggleNotifications);

    // 用戶菜單
    const userMenuBtn = document.querySelector('.user-menu-btn');
    userMenuBtn.addEventListener('click', toggleUserMenu);

    // 登出按鈕
    const logoutBtn = document.querySelector('.logout-button');
    logoutBtn.addEventListener('click', handleLogout);

    // 統計卡片動畫
    animateStatCards();

    // 柱狀圖動畫
    animateBarChart();
});

// 更新麵包屑
function updateBreadcrumb(currentPage) {
    const breadcrumb = document.querySelector('.breadcrumb');
    breadcrumb.innerHTML = `
        <span>首頁</span> / <span>${currentPage}</span>
    `;
}

// 顯示功能模態框
function showFeatureModal(title) {
    // 創建模態框
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>${title}</h3>
            <p>此功能正在開發中...</p>
            <button onclick="this.closest('.modal').remove()">關閉</button>
        </div>
    `;
    document.body.appendChild(modal);
}

// 切換通知面板
function toggleNotifications() {
    // 檢查是否已存在通知面板
    let panel = document.querySelector('.notification-panel');
    
    if (panel) {
        panel.remove();
        return;
    }

    // 創建通知面板
    panel = document.createElement('div');
    panel.className = 'notification-panel';
    panel.innerHTML = `
        <h3>通知</h3>
        ${mockData.notifications.map(note => `
            <div class="notification-item">
                <p>${note.text}</p>
                <span>${note.time}</span>
            </div>
        `).join('')}
    `;
    
    // 定位在通知按鈕下方
    const btn = document.querySelector('.notification-btn');
    const rect = btn.getBoundingClientRect();
    panel.style.top = `${rect.bottom + 10}px`;
    panel.style.right = '20px';
    
    document.body.appendChild(panel);
}

// 統計卡片動畫
function animateStatCards() {
    const cards = document.querySelectorAll('.stat-card');
    cards.forEach(card => {
        const value = card.querySelector('.stat-value');
        const targetValue = parseInt(value.textContent);
        animateNumber(value, targetValue, 1500);
    });
}

// 數字動畫
function animateNumber(element, target, duration = 1500) {
    let current = 0;
    const steps = 60;
    const increment = target / steps;
    
    const interval = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target;
            clearInterval(interval);
        } else {
            element.textContent = Math.floor(current);
        }
    }, duration / steps);
}

// 處理登出
function handleLogout() {
    if (confirm('確定要登出嗎？')) {
        // 模擬登出過程
        document.body.innerHTML = `
            <div class="logout-screen">
                <h2>已登出</h2>
                <p>3秒後重新導向到登入頁面...</p>
            </div>
        `;
        setTimeout(() => {
            alert('這是原型展示，實際功能尚未實現');
            location.reload();
        }, 3000);
    }
}

// 柱狀圖動畫
function animateBarChart() {
    const bar = document.querySelector('.bar');
    if (bar) {
        bar.style.height = '0';
        setTimeout(() => {
            bar.style.height = '100%';
        }, 100);
    }
} 