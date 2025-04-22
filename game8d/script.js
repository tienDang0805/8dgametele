const hoa = document.getElementById("hoa");
const gameContainer = document.getElementById("game-container");
const scoreDisplay = document.getElementById("score");
const message = document.getElementById("message");

// Cài đặt game
let score = 0;
let baseSpeed = 2.0; // Giảm tốc độ xuống
let gameRunning = true;
let activePoops = [];
let lastPoopTime = 0;
let poopInterval = 1200; // Tăng thời gian giữa các cục
let maxActivePoops = 3; // Chỉ 2 cục cùng lúc tối đa

// Tăng kích thước Hoà
hoa.style.width = "150px"; // Tăng từ 100px lên 150px

// Điều khiển bằng chuột
gameContainer.addEventListener("mousemove", (e) => {
  const rect = gameContainer.getBoundingClientRect();
  let x = e.clientX - rect.left - hoa.offsetWidth / 2;
  x = Math.max(0, Math.min(x, rect.width - hoa.offsetWidth));
  hoa.style.left = `${x}px`;
});

function createPoop() {
  if (activePoops.length >= maxActivePoops) return null;
  
  const poop = document.createElement("img");
  poop.src = "img/poop.png";
  poop.className = "poop";
  poop.style.position = "absolute";
  
  // Random kích thước cục cứt
  const size = Math.random() < 0.2 ? "70px" : "50px"; // 20% cục to
  poop.style.width = size;
  poop.style.height = size;
  
  poop.style.left = `${Math.random() * (window.innerWidth - parseInt(size))}px`;
  poop.style.top = `-${size}`;
  gameContainer.appendChild(poop);
  
  // Tốc độ rơi ngẫu nhiên trong khoảng
  const speed = baseSpeed + Math.random() * 0.5;
  const newPoop = { element: poop, speed: speed };
  activePoops.push(newPoop);
  return newPoop;
}

function updatePoops() {
  const now = Date.now();
  
  // Tạo cục mới nếu đủ thời gian
  if (now - lastPoopTime > poopInterval && activePoops.length < maxActivePoops) {
    createPoop();
    lastPoopTime = now;
    // Điều chỉnh tempo dựa trên điểm số
    poopInterval = Math.max(800, 1500 - score * 8); // Giảm chậm hơn
  }
  
  // Cập nhật vị trí các cục
  for (let i = activePoops.length - 1; i >= 0; i--) {
    const poop = activePoops[i];
    let top = parseFloat(poop.element.style.top) + poop.speed;
    poop.element.style.top = `${top}px`;
    
    const hoaRect = hoa.getBoundingClientRect();
    const poopRect = poop.element.getBoundingClientRect();
    
    // Kiểm tra va chạm (hitbox rộng hơn 10px)
    const hit = !(
      poopRect.bottom < hoaRect.top + 10 ||
      poopRect.top > hoaRect.bottom - 10 ||
      poopRect.right < hoaRect.left + 10 ||
      poopRect.left > hoaRect.right - 10
    );
    
    if (hit) {
      showMessage();
      score++;
      scoreDisplay.innerText = `Score: ${score}`;
      baseSpeed += 0.03; // Tăng tốc chậm hơn
      poop.element.remove();
      activePoops.splice(i, 1);
      
      // Mỗi 10 điểm mới tăng độ khó
      if (score % 10 === 0) {
        maxActivePoops = Math.min(3, maxActivePoops + 1);
      }
    } else if (top > window.innerHeight) {
      poop.element.remove();
      activePoops.splice(i, 1);
      endGame();
      return;
    }
  }
  
  if (gameRunning) {
    requestAnimationFrame(updatePoops);
  }
}

function showMessage() {
  message.style.opacity = 1;
  // Hiệu ứng phóng to khi ăn
  hoa.style.transform = "scale(1.1)";
  setTimeout(() => {
    message.style.opacity = 0;
    hoa.style.transform = "scale(1)";
  }, 300);
}

function endGame() {
  gameRunning = false;
  message.innerText = `Game Over! Điểm: ${score}\nClick để chơi lại`;
  message.style.opacity = 1;
  message.style.cursor = "pointer";
  message.addEventListener("click", restartGame);
  
  // Xóa hết cục còn lại
  activePoops.forEach(poop => poop.element.remove());
  activePoops = [];
}

function restartGame() {
  score = 0;
  baseSpeed = 2.0;
  gameRunning = true;
  maxActivePoops = 2;
  scoreDisplay.innerText = `Score: ${score}`;
  message.innerText = "Ngon vãi l**";
  message.style.opacity = 0;
  message.style.cursor = "default";
  message.removeEventListener("click", restartGame);
  updatePoops();
}

// Bắt đầu game
updatePoops();