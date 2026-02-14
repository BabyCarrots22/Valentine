// script.js
document.addEventListener('DOMContentLoaded', () => {
    // State Management
    let currentPage = 1;
    let progress = 0;
    let audioInitialized = false;
    let sentMessages = [];
    
    // Elements
    const pages = document.querySelectorAll('.page');
    const loader = document.getElementById('loader');
    const loaderPercent = document.getElementById('loaderPercent');
    const progressCircle = document.querySelector('.progress-ring-circle');
    const loveBtn = document.getElementById('loveBtn');
    const bgMusic = document.getElementById('bgMusic');
    const volumeSlider = document.getElementById('volumeSlider');
    const volumeIcon = document.getElementById('volumeIcon');
    
    // Floating Hearts Generator
    function createFloatingHearts() {
        const container = document.getElementById('floatingHearts');
        container.innerHTML = '';
        const heartCount = window.innerWidth < 768 ? 20 : 35;
        
        for (let i = 0; i < heartCount; i++) {
            const heart = document.createElement('div');
            heart.className = 'floating-heart';
            heart.innerHTML = '❤️';
            heart.style.left = Math.random() * 100 + '%';
            heart.style.animationDuration = (Math.random() * 12 + 12) + 's';
            heart.style.animationDelay = Math.random() * 6 + 's';
            heart.style.fontSize = (Math.random() * 25 + 18) + 'px';
            heart.style.opacity = Math.random() * 0.4 + 0.2;
            container.appendChild(heart);
        }
    }
    
    // Loader Progress
    function updateLoader() {
        const circumference = 326.56;
        
        const interval = setInterval(() => {
            if (progress < 100) {
                progress += 1;
                loaderPercent.textContent = progress + '%';
                
                const offset = circumference - (progress / 100) * circumference;
                progressCircle.style.strokeDashoffset = offset;
                
                if (progress > 70) {
                    progressCircle.style.stroke = '#FF4D6D';
                } else if (progress > 40) {
                    progressCircle.style.stroke = '#FF6F91';
                }
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
    
    // Page Navigation
    function goToPage(pageNumber) {
        pages.forEach(page => page.classList.remove('active'));
        document.getElementById(`page${pageNumber}`).classList.add('active');
        currentPage = pageNumber;
        
        if (pageNumber === 2) {
            resetEnvelope();
        } else if (pageNumber === 5) {
            resetGiftBox();
        } else if (pageNumber === 4) {
            setTimeout(() => {
                sentMessages.forEach(msg => {
                    createMessageBalloon(msg);
                });
            }, 500);
        }
    }
    
    // LOVE Button Click
    if (loveBtn) {
        loveBtn.addEventListener('click', () => {
            goToPage(2);
        });
    }
    
    // Envelope Animation
    const envelope = document.getElementById('envelope');
    const cardNextBtn = document.getElementById('cardNextBtn');
    let isEnvelopeOpen = false;
    
    function resetEnvelope() {
        if (envelope) {
            envelope.classList.remove('open');
            isEnvelopeOpen = false;
            if (cardNextBtn) cardNextBtn.style.display = 'none';
        }
    }
    
    if (envelope) {
        envelope.addEventListener('click', () => {
            if (!isEnvelopeOpen) {
                envelope.classList.add('open');
                isEnvelopeOpen = true;
                
                setTimeout(() => {
                    if (cardNextBtn) cardNextBtn.style.display = 'block';
                }, 1000);
            } else {
                envelope.classList.remove('open');
                isEnvelopeOpen = false;
                if (cardNextBtn) cardNextBtn.style.display = 'none';
            }
        });
    }
    
    if (cardNextBtn) {
        cardNextBtn.addEventListener('click', () => {
            goToPage(3);
        });
    }
    
    // Message System
    const messageInput = document.getElementById('messageInput');
    const sendBtn = document.getElementById('sendMessageBtn');
    const sentMessagesDiv = document.getElementById('sentMessages');
    const messageNextBtn = document.getElementById('messageNextBtn');
    
    if (sendBtn) {
        sendBtn.addEventListener('click', () => {
            const message = messageInput.value.trim();
            
            if (message) {
                sentMessages.push(message);
                
                const tag = document.createElement('div');
                tag.className = 'sent-message-tag';
                tag.textContent = message;
                sentMessagesDiv.appendChild(tag);
                
                messageInput.value = '';
                
                createMessageBalloon(message);
                
                if (sentMessages.length > 0 && messageNextBtn) {
                    messageNextBtn.style.display = 'block';
                }
            } else {
                alert('💝 กรุณาพิมพ์ข้อความก่อนส่งค่ะ 💝');
            }
        });
    }
    
    function createMessageBalloon(message) {
        const container = document.getElementById('balloonsContainer');
        
        const balloon = document.createElement('div');
        balloon.className = 'balloon-item';
        
        balloon.style.left = (5 + Math.random() * 90) + '%';
        balloon.style.animationDelay = (Math.random() * 3) + 's';
        
        const colors = ['#FF6F91', '#FF8AAE', '#FFB6C1', '#FF4D6D', '#FFA07A'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        
        balloon.innerHTML = `
            <div class="balloon-heart-shape" style="background: linear-gradient(145deg, ${randomColor}, #FFD1DC);">
                <div class="balloon-inner">❤️</div>
            </div>
            <div class="balloon-text">${message}</div>
            <div class="balloon-string"></div>
        `;
        
        container.appendChild(balloon);
        
        setTimeout(() => {
            balloon.remove();
        }, 8000);
    }
    
    if (messageNextBtn) {
        messageNextBtn.addEventListener('click', () => {
            goToPage(4);
        });
    }
    
    // Gift Box
    const openGiftBtn = document.getElementById('openGiftBtn');
    const giftBox = document.getElementById('giftBox');
    const balloonLeft = document.getElementById('balloonLeft');
    const balloonRight = document.getElementById('balloonRight');
    const centerHeart = document.getElementById('centerHeart');
    const toGiftBtn = document.getElementById('toGiftBtn');
    
    function resetGiftBox() {
        if (giftBox) giftBox.classList.remove('open');
        if (balloonLeft) balloonLeft.classList.remove('show');
        if (balloonRight) balloonRight.classList.remove('show');
        if (centerHeart) centerHeart.classList.remove('show');
        if (openGiftBtn) openGiftBtn.disabled = false;
    }
    
    if (openGiftBtn) {
        openGiftBtn.addEventListener('click', () => {
            giftBox.classList.add('open');
            
            setTimeout(() => {
                balloonLeft.classList.add('show');
                balloonRight.classList.add('show');
                
                setTimeout(() => {
                    centerHeart.classList.add('show');
                }, 800);
                
            }, 600);
            
            openGiftBtn.disabled = true;
        });
    }
    
    if (toGiftBtn) {
        toGiftBtn.addEventListener('click', () => {
            goToPage(5);
        });
    }
    
    // Music System
    function initAudio() {
        if (audioInitialized) return;
        
        bgMusic.volume = 0.5;
        
        bgMusic.play().catch(e => {
            console.log('Autoplay prevented');
            document.body.addEventListener('click', function initOnClick() {
                bgMusic.play();
                document.body.removeEventListener('click', initOnClick);
            }, { once: true });
        });
        
        audioInitialized = true;
    }
    
    // Volume Control
    if (volumeSlider) {
        volumeSlider.addEventListener('input', (e) => {
            const volume = e.target.value;
            bgMusic.volume = volume;
            
            if (volume == 0) {
                volumeIcon.className = 'fas fa-volume-mute';
            } else if (volume < 0.5) {
                volumeIcon.className = 'fas fa-volume-low';
            } else {
                volumeIcon.className = 'fas fa-volume-high';
            }
        });
    }
    
    // Handle resize
    window.addEventListener('resize', () => {
        createFloatingHearts();
    });
    
    // Initialize
    function init() {
        createFloatingHearts();
        updateLoader();
        initAudio();
        console.log('Valentine\'s Interactive Ready! 💝');
    }
    
    init();
    
    // Parallax effect
    window.addEventListener('mousemove', (e) => {
        if (window.innerWidth > 768) {
            const mouseX = (e.clientX / window.innerWidth - 0.5) * 15;
            const mouseY = (e.clientY / window.innerHeight - 0.5) * 15;
            
            const videos = document.querySelectorAll('.bg-video');
            videos.forEach(video => {
                video.style.transform = `scale(1.05) translate(${mouseX}px, ${mouseY}px)`;
            });
        }
    });
});