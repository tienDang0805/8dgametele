const hoa = document.getElementById("hoa");
const gameContainer = document.getElementById("game-container");
const scoreDisplay = document.getElementById("score");
const message = document.getElementById("message");

// Cài đặt game
let score = 0;
let baseSpeed = 3.0; // Tăng tốc độ 1.5 lần
let gameRunning = true;
let activePoops = [];
let lastPoopTime = 0;
let poopInterval = 1000;
let maxActivePoops = 3; // Bắt đầu với 3 cục
let giantPoopChance = 0.005; // 0.5% cơ hội xuất hiện cục khổng lồ

// Kích thước Hoà
hoa.style.width = "150px";

// Điều khiển bằng chuột
gameContainer.addEventListener("mousemove", (e) => {
  if (!gameRunning) return;
  
  const rect = gameContainer.getBoundingClientRect();
  let x = e.clientX - rect.left - hoa.offsetWidth / 2;
  x = Math.max(0, Math.min(x, rect.width - hoa.offsetWidth));
  hoa.style.left = `${x}px`;
});

function createPoop() {
  if (activePoops.length >= maxActivePoops) return null;
  
  const isGiant = Math.random() < giantPoopChance;
  const poop = document.createElement("img");
  poop.src = "img/poop.png";
  poop.className = "poop";
  poop.style.position = "absolute";
  
  // Random kích thước
  if (isGiant) {
    poop.style.width = "300px"; // Gấp đôi Hoà
    poop.style.height = "300px";
    poop.classList.add("giant-poop");
  } else {
    const size = Math.random() < 0.2 ? "70px" : "50px";
    poop.style.width = size;
    poop.style.height = size;
  }
  
  poop.style.left = `${Math.random() * (window.innerWidth - parseInt(poop.style.width))}px`;
  poop.style.top = `-${poop.style.height}`;
  gameContainer.appendChild(poop);
  
  const speed = isGiant ? baseSpeed * 0.7 : baseSpeed + Math.random() * 0.5;
  const newPoop = { 
    element: poop, 
    speed: speed,
    isGiant: isGiant
  };
  activePoops.push(newPoop);
  return newPoop;
}

function updatePoops() {
  const now = Date.now();
  
  // Tạo cục mới
  if (now - lastPoopTime > poopInterval && activePoops.length < maxActivePoops) {
    createPoop();
    lastPoopTime = now;
    poopInterval = Math.max(500, 1200 - score * 5); // Tempo tăng dần
  }
  
  // Cập nhật vị trí các cục
  for (let i = activePoops.length - 1; i >= 0; i--) {
    const poop = activePoops[i];
    let top = parseFloat(poop.element.style.top) + poop.speed;
    poop.element.style.top = `${top}px`;
    
    const hoaRect = hoa.getBoundingClientRect();
    const poopRect = poop.element.getBoundingClientRect();
    
    // Kiểm tra va chạm
    const hit = !(
      poopRect.bottom < hoaRect.top + 10 ||
      poopRect.top > hoaRect.bottom - 10 ||
      poopRect.right < hoaRect.left + 10 ||
      poopRect.left > hoaRect.right - 10
    );
    
    if (hit) {
      if (poop.isGiant) {
        endGame("Cứt to quá đéo đớp nổi\nPhải cút thôi!");
        return;
      }
      
      showMessage();
      score++;
      scoreDisplay.innerText = `Score: ${score}`;
      baseSpeed += 0.04;
      poop.element.remove();
      activePoops.splice(i, 1);
      
      // Tăng độ khó
      if (score % 15 === 0) {
        maxActivePoops = Math.min(5, maxActivePoops + 1);
      }
      if (score % 30 === 0) {
        giantPoopChance = Math.min(0.02, giantPoopChance + 0.002);
      }
    } else if (top > window.innerHeight) {
      poop.element.remove();
      activePoops.splice(i, 1);
      if (!poop.isGiant) {
        endGame("Thua rồi thằng ngu!\nBỏ sót cục cứt rồi!");
      }
      return;
    }
  }
  
  if (gameRunning) {
    requestAnimationFrame(updatePoops);
  }
}

function showMessage() {
  const messages = ["Ngon vãi l**", "Ăn ngon không?", "Mlem mlem", "Thêm cục nữa!"];
  message.innerText = messages[Math.floor(Math.random() * messages.length)];
  message.style.opacity = 1;
  
  // Hiệu ứng nhảy
  hoa.style.transform = "translateY(-20px)";
  setTimeout(() => {
    message.style.opacity = 0;
    hoa.style.transform = "translateY(0)";
  }, 500);
}

function endGame(reason) {
  gameRunning = false;
  message.innerHTML = reason ? reason : `Game Over!<br>Điểm: ${score}`;
  message.innerHTML += `<br><br>Click để chơi lại`;
  message.style.opacity = 1;
  message.style.cursor = "pointer";
  message.style.textAlign = "center";
  message.style.lineHeight = "1.5";
  message.addEventListener("click", restartGame);
  
  // Xóa hết cục còn lại
  activePoops.forEach(poop => poop.element.remove());
  activePoops = [];
}

function restartGame() {
  score = 0;
  baseSpeed = 3.0;
  gameRunning = true;
  maxActivePoops = 3;
  giantPoopChance = 0.005;
  scoreDisplay.innerText = `Score: ${score}`;
  message.style.opacity = 0;
  message.style.cursor = "default";
  message.removeEventListener("click", restartGame);
  updatePoops();
}

// Bắt đầu game
updatePoops();