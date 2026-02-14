// script.js
import { db, ref, set, get } from './firebase-config.js';

// State
let currentPage = 1;
let progress = 0;
let sentMessages = [];
let configData = null;
let shareId = null;

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
    checkUrlForId();
    setupEventListeners();
    createFloatingHearts();
    updateLoader();
});

// ===== CHECK URL FOR ID =====
function checkUrlForId() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    
    if (id) {
        // โหมดรับชม - ซ่อนปุ่ม Config
        document.getElementById('configBtn').style.display = 'none';
        loadConfigFromFirebase(id);
    } else {
        // โหมดตั้งค่า - แสดงปุ่ม Config
        document.getElementById('configBtn').style.display = 'flex';
    }
}

// ===== LOAD CONFIG FROM FIREBASE =====
async function loadConfigFromFirebase(id) {
    try {
        const snapshot = await get(ref(db, 'valentines/' + id));
        if (snapshot.exists()) {
            configData = snapshot.val();
            applyConfig(configData);
            
            // อัปเดตยอดวิว
            updateViewCount(id);
        }
    } catch (error) {
        console.error('Error loading config:', error);
    }
}

// ===== UPDATE VIEW COUNT =====
async function updateViewCount(id) {
    const viewRef = ref(db, 'views/' + id);
    const snapshot = await get(viewRef);
    const currentViews = snapshot.val() || 0;
    await set(viewRef, currentViews + 1);
}

// ===== APPLY CONFIG =====
function applyConfig(config) {
    // อัปเดตชื่อ
    if (config.yourName) {
        document.getElementById('yourNameDisplay').textContent = config.yourName;
    }
    if (config.partnerName) {
        document.getElementById('partnerNameDisplay').textContent = config.partnerName;
    }
    
    // อัปเดตรูป
    if (config.yourImage) {
        document.getElementById('yourAvatar').src = config.yourImage;
    }
    if (config.partnerImage) {
        document.getElementById('partnerAvatar').src = config.partnerImage;
    }
    
    // อัปเดตข้อความในการ์ด
    if (config.cardMessage) {
        document.getElementById('cardInnerText').innerHTML = config.cardMessage.replace(/\n/g, '<br>');
    }
    
    // อัปเดตเพลง
    if (config.musicUrl) {
        playYoutubeMusic(config.musicUrl);
    }
}

// ===== PLAY YOUTUBE MUSIC =====
function playYoutubeMusic(url) {
    // ดึง ID จาก YouTube URL
    const regExp = /^.*(youtu.be\/|v\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    
    if (match && match[2].length === 11) {
        const videoId = match[2];
        const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&loop=1&playlist=${videoId}`;
        
        // สร้าง iframe
        const iframe = document.createElement('iframe');
        iframe.src = embedUrl;
        iframe.style.display = 'none';
        iframe.allow = 'autoplay';
        document.body.appendChild(iframe);
    }
}

// ===== SAVE CONFIG TO FIREBASE =====
async function saveConfigToFirebase(config) {
    const id = 'val_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    
    // เพิ่ม metadata
    config.createdAt = new Date().toISOString();
    config.views = 0;
    config.status = 'active';
    config.userAgent = navigator.userAgent;
    
    await set(ref(db, 'valentines/' + id), config);
    
    // สร้างลิงก์
    const shareUrl = `${window.location.origin}${window.location.pathname}?id=${id}`;
    return shareUrl;
}

// ===== SETUP EVENT LISTENERS =====
function setupEventListeners() {
    // Config panel
    document.getElementById('configBtn').addEventListener('click', toggleConfig);
    document.getElementById('closeConfigBtn').addEventListener('click', toggleConfig);
    
    // Preview
    document.getElementById('yourName').addEventListener('input', updatePreview);
    document.getElementById('partnerName').addEventListener('input', updatePreview);
    document.getElementById('previewBtn').addEventListener('click', showPreview);
    
    // Save
    document.getElementById('saveConfigBtn').addEventListener('click', saveAndShare);
    
    // Image uploads
    setupImageUpload('yourImageUpload', 'yourImagePreview', 'yourAvatar');
    setupImageUpload('partnerImageUpload', 'partnerImagePreview', 'partnerAvatar');
    
    // LOVE button
    document.getElementById('loveBtn').addEventListener('click', () => goToPage(2));
    
    // Envelope
    document.getElementById('envelope').addEventListener('click', toggleEnvelope);
    
    // Next buttons
    document.getElementById('cardNextBtn').addEventListener('click', () => goToPage(3));
    document.getElementById('messageNextBtn').addEventListener('click', () => goToPage(4));
    document.getElementById('toGiftBtn').addEventListener('click', () => goToPage(5));
    
    // Send message
    document.getElementById('sendMessageBtn').addEventListener('click', sendMessage);
    
    // Open gift
    document.getElementById('openGiftBtn').addEventListener('click', openGiftBox);
    
    // Volume
    document.getElementById('volumeSlider').addEventListener('input', adjustVolume);
}

// ===== TOGGLE CONFIG PANEL =====
function toggleConfig() {
    document.getElementById('configPanel').classList.toggle('show');
}

// ===== UPDATE PREVIEW =====
function updatePreview() {
    document.getElementById('previewYourName').textContent = 
        document.getElementById('yourName').value || 'คุณ';
    document.getElementById('previewPartnerName').textContent = 
        document.getElementById('partnerName').value || 'แฟน';
}

// ===== SHOW PREVIEW =====
function showPreview() {
    alert('🎀 ตัวอย่างข้อมูลของคุณ:\n' +
          '👤 ชื่อคุณ: ' + document.getElementById('yourName').value + '\n' +
          '💝 ชื่อแฟน: ' + document.getElementById('partnerName').value + '\n' +
          '💬 ข้อความ: ' + document.getElementById('cardMessage').value);
}

// ===== SETUP IMAGE UPLOAD =====
function setupImageUpload(inputId, previewId, targetId) {
    document.getElementById(inputId).addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                document.getElementById(previewId).src = event.target.result;
                if (targetId) {
                    document.getElementById(targetId).src = event.target.result;
                }
            };
            reader.readAsDataURL(file);
        }
    });
}

// ===== SAVE AND SHARE =====
async function saveAndShare() {
    const config = {
        yourName: document.getElementById('yourName').value,
        partnerName: document.getElementById('partnerName').value,
        yourImage: document.getElementById('yourImagePreview').src,
        partnerImage: document.getElementById('partnerImagePreview').src,
        cardMessage: document.getElementById('cardMessage').value,
        musicUrl: document.getElementById('musicUrl').value
    };
    
    const shareUrl = await saveConfigToFirebase(config);
    
    // แสดงลิงก์
    document.getElementById('shareLink').value = shareUrl;
    document.getElementById('shareLinkBox').style.display = 'block';
}

// ===== COPY SHARE LINK =====
window.copyShareLink = function() {
    const link = document.getElementById('shareLink');
    link.select();
    document.execCommand('copy');
    alert('✅ คัดลอกลิงก์แล้ว! ไปส่งให้แฟนเลย 💕');
}

// ===== GO TO PAGE =====
function goToPage(pageNumber) {
    document.querySelectorAll('.page').forEach(page => 
        page.classList.remove('active'));
    document.getElementById(`page${pageNumber}`).classList.add('active');
    currentPage = pageNumber;
}

// ===== TOGGLE ENVELOPE =====
let isEnvelopeOpen = false;
function toggleEnvelope() {
    const envelope = document.getElementById('envelope');
    const cardNextBtn = document.getElementById('cardNextBtn');
    
    if (!isEnvelopeOpen) {
        envelope.classList.add('open');
        isEnvelopeOpen = true;
        setTimeout(() => {
            cardNextBtn.style.display = 'block';
        }, 1000);
    } else {
        envelope.classList.remove('open');
        isEnvelopeOpen = false;
        cardNextBtn.style.display = 'none';
    }
}

// ===== SEND MESSAGE =====
function sendMessage() {
    const message = document.getElementById('messageInput').value.trim();
    
    if (message) {
        sentMessages.push(message);
        
        // แสดง tag
        const tag = document.createElement('div');
        tag.className = 'sent-message-tag';
        tag.textContent = message;
        document.getElementById('sentMessages').appendChild(tag);
        
        // เคลียร์ input
        document.getElementById('messageInput').value = '';
        
        // สร้างลูกโป่ง
        createMessageBalloon(message);
        
        // แสดงปุ่ม next
        if (sentMessages.length > 0) {
            document.getElementById('messageNextBtn').style.display = 'block';
        }
    } else {
        alert('💝 กรุณาพิมพ์ข้อความ');
    }
}

// ===== CREATE MESSAGE BALLOON =====
function createMessageBalloon(message) {
    const container = document.getElementById('balloonsContainer');
    
    const balloon = document.createElement('div');
    balloon.className = 'balloon-item';
    balloon.style.left = (5 + Math.random() * 90) + '%';
    balloon.style.animationDelay = (Math.random() * 3) + 's';
    
    balloon.innerHTML = `
        <div class="balloon-heart-shape">
            <div class="balloon-inner">❤️</div>
        </div>
        <div class="balloon-text">${message}</div>
        <div class="balloon-string"></div>
    `;
    
    container.appendChild(balloon);
    
    setTimeout(() => balloon.remove(), 8000);
}

// ===== OPEN GIFT BOX =====
function openGiftBox() {
    const giftBox = document.getElementById('giftBox');
    const balloonLeft = document.getElementById('balloonLeft');
    const balloonRight = document.getElementById('balloonRight');
    const centerHeart = document.getElementById('centerHeart');
    const openGiftBtn = document.getElementById('openGiftBtn');
    
    giftBox.classList.add('open');
    
    setTimeout(() => {
        balloonLeft.classList.add('show');
        balloonRight.classList.add('show');
        
        setTimeout(() => {
            centerHeart.classList.add('show');
        }, 800);
    }, 600);
    
    openGiftBtn.disabled = true;
}

// ===== ADJUST VOLUME =====
function adjustVolume(e) {
    const volume = e.target.value;
    const audio = document.getElementById('bgMusic');
    if (audio) audio.volume = volume;
    
    const icon = document.getElementById('volumeIcon');
    if (volume == 0) {
        icon.className = 'fas fa-volume-mute';
    } else if (volume < 0.5) {
        icon.className = 'fas fa-volume-low';
    } else {
        icon.className = 'fas fa-volume-high';
    }
}

// ===== FLOATING HEARTS =====
function createFloatingHearts() {
    const container = document.getElementById('floatingHearts');
    const heartCount = window.innerWidth < 768 ? 20 : 35;
    
    for (let i = 0; i < heartCount; i++) {
        const heart = document.createElement('div');
        heart.className = 'floating-heart';
        heart.innerHTML = '❤️';
        heart.style.left = Math.random() * 100 + '%';
        heart.style.animationDuration = (Math.random() * 12 + 12) + 's';
        heart.style.animationDelay = Math.random() * 6 + 's';
        heart.style.fontSize = (Math.random() * 25 + 18) + 'px';
        container.appendChild(heart);
    }
}

// ===== LOADER =====
function updateLoader() {
    const circumference = 326.56;
    const progressCircle = document.querySelector('.progress-ring-circle');
    const loaderPercent = document.getElementById('loaderPercent');
    const loader = document.getElementById('loader');
    const loveBtn = document.getElementById('loveBtn');
    
    let progress = 0;
    const interval = setInterval(() => {
        if (progress < 100) {
            progress += 1;
            loaderPercent.textContent = progress + '%';
            
            const offset = circumference - (progress / 100) * circumference;
            progressCircle.style.strokeDashoffset = offset;
        } else {
            clearInterval(interval);
            setTimeout(() => {
                loader.style.opacity = '0';
                setTimeout(() => {
                    loader.style.display = 'none';
                    loveBtn.style.display = 'block';
                }, 500);
            }, 500);
        }
    }, 30);
}