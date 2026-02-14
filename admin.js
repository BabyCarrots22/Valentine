// admin.js
import { db, ref, get, onValue } from './firebase-config.js';

const ADMIN_PASSWORD = 'loveadmin123';
let allData = [];

// ===== LOGIN =====
window.adminLogin = function() {
    const password = document.getElementById('adminPassword').value;
    const errorDiv = document.getElementById('loginError');
    
    if (!password) {
        errorDiv.style.display = 'block';
        errorDiv.textContent = '❌ กรุณากรอกรหัสผ่าน';
        return;
    }
    
    if (password === ADMIN_PASSWORD) {
        document.getElementById('loginBox').style.display = 'none';
        document.getElementById('dashboard').style.display = 'block';
        errorDiv.style.display = 'none';
        loadData();
        startRealtimeUpdates();
    } else {
        errorDiv.style.display = 'block';
        errorDiv.textContent = '❌ รหัสผ่านไม่ถูกต้อง';
    }
};

// ===== LOGOUT =====
window.adminLogout = function() {
    document.getElementById('loginBox').style.display = 'block';
    document.getElementById('dashboard').style.display = 'none';
    document.getElementById('adminPassword').value = '';
};

// ===== LOAD DATA =====
async function loadData() {
    try {
        const snapshot = await get(ref(db, 'valentines'));
        
        if (snapshot.exists()) {
            const data = snapshot.val();
            allData = Object.entries(data).map(([id, value]) => ({
                id, ...value, views: 0
            }));
            
            await loadViews();
            updateTable();
            updateStats();
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// ===== LOAD VIEWS =====
async function loadViews() {
    const viewsSnapshot = await get(ref(db, 'views'));
    if (viewsSnapshot.exists()) {
        const views = viewsSnapshot.val();
        allData.forEach(item => {
            item.views = views[item.id] || 0;
        });
    }
}

// ===== UPDATE STATS =====
function updateStats() {
    const total = allData.length;
    const today = new Date().toDateString();
    const activeToday = allData.filter(item => 
        item.createdAt && new Date(item.createdAt).toDateString() === today
    ).length;
    const totalViews = allData.reduce((sum, item) => sum + (item.views || 0), 0);
    
    document.getElementById('totalValentines').textContent = total;
    document.getElementById('activeToday').textContent = activeToday;
    document.getElementById('totalViews').textContent = totalViews;
}

// ===== UPDATE TABLE =====
function updateTable() {
    const tbody = document.getElementById('tableBody');
    
    if (allData.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 50px;">
            <i class="fas fa-heart" style="font-size: 50px; color: #FFD1DC;"></i>
            <p style="margin-top: 20px;">ยังไม่มีข้อมูล</p>
        </td></tr>`;
        return;
    }
    
    const sorted = [...allData].sort((a, b) => 
        new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    );
    
    tbody.innerHTML = sorted.map(item => `
        <tr>
            <td>${item.createdAt ? new Date(item.createdAt).toLocaleString('th-TH') : '-'}</td>
            <td>${item.yourName || '-'}</td>
            <td>${item.partnerName || '-'}</td>
            <td>
                <a href="#" onclick="showLink('${item.id}')" class="view-link">
                    <i class="fas fa-link"></i> ดู
                </a>
            </td>
            <td>${item.views || 0}</td>
            <td>
                <button class="action-btn" onclick="viewDetails('${item.id}')">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// ===== SHOW LINK =====
window.showLink = function(id) {
    const url = `${window.location.origin}${window.location.pathname.replace('admin.html', 'index.html')}?id=${id}`;
    
    document.getElementById('modalDetail').innerHTML = `
        <h3 style="color: #FF4D6D;">🔗 ลิงก์สำหรับแฟน</h3>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 10px; margin: 20px 0;">
            <input type="text" value="${url}" readonly style="width: 100%; padding: 10px; border: 2px solid #FFD1DC; border-radius: 10px;">
        </div>
        <button onclick="copyToClipboard('${url}')" style="background: #4CAF50; color: white; border: none; padding: 10px 20px; border-radius: 50px; cursor: pointer;">
            <i class="fas fa-copy"></i> คัดลอก
        </button>
        <button onclick="closeModal()" style="margin-left: 10px; padding: 10px 20px; background: #FF6F91; color: white; border: none; border-radius: 50px; cursor: pointer;">ปิด</button>
    `;
    
    document.getElementById('detailModal').style.display = 'flex';
};

// ===== VIEW DETAILS =====
window.viewDetails = function(id) {
    const item = allData.find(d => d.id === id);
    if (!item) return;
    
    document.getElementById('modalDetail').innerHTML = `
        <h2 style="color: #FF4D6D;">📊 รายละเอียด</h2>
        <div style="margin: 20px 0;">
            <p><strong>🆔 ID:</strong> ${id}</p>
            <p><strong>👤 ชื่อคุณ:</strong> ${item.yourName || '-'}</p>
            <p><strong>💝 ชื่อแฟน:</strong> ${item.partnerName || '-'}</p>
            <p><strong>📅 สร้าง:</strong> ${item.createdAt ? new Date(item.createdAt).toLocaleString('th-TH') : '-'}</p>
            <p><strong>👁️ ยอดวิว:</strong> ${item.views || 0}</p>
            <p><strong>💬 ข้อความ:</strong> ${item.cardMessage || '-'}</p>
        </div>
        <button onclick="closeModal()" style="padding: 10px 20px; background: #FF6F91; color: white; border: none; border-radius: 50px; cursor: pointer;">ปิด</button>
    `;
    
    document.getElementById('detailModal').style.display = 'flex';
};

// ===== COPY TO CLIPBOARD =====
window.copyToClipboard = function(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert('✅ คัดลอกแล้ว!');
    });
};

// ===== CLOSE MODAL =====
window.closeModal = function() {
    document.getElementById('detailModal').style.display = 'none';
};

// ===== EXPORT DATA =====
window.exportData = function() {
    const dataStr = JSON.stringify(allData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `valentine_data_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
};

// ===== START REALTIME UPDATES =====
function startRealtimeUpdates() {
    onValue(ref(db, 'valentines'), () => loadData());
}

// ===== SEARCH =====
document.getElementById('searchInput')?.addEventListener('input', function(e) {
    const search = e.target.value.toLowerCase();
    const filtered = allData.filter(item => 
        (item.yourName?.toLowerCase().includes(search) ||
         item.partnerName?.toLowerCase().includes(search))
    );
    
    // อัปเดตตารางชั่วคราว
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = filtered.map(item => `
        <tr>
            <td>${item.createdAt ? new Date(item.createdAt).toLocaleString('th-TH') : '-'}</td>
            <td>${item.yourName || '-'}</td>
            <td>${item.partnerName || '-'}</td>
            <td>
                <a href="#" onclick="showLink('${item.id}')" class="view-link">
                    <i class="fas fa-link"></i> ดู
                </a>
            </td>
            <td>${item.views || 0}</td>
            <td>
                <button class="action-btn" onclick="viewDetails('${item.id}')">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        </tr>
    `).join('');
});