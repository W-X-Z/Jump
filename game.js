document.addEventListener('DOMContentLoaded', () => {
  
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 540;
  canvas.height = 1200; // 세로 길이 증가

  let isDragging = false;
  let canJump = true;
  let player = { x: 300, y: 1150, width: 20, height: 20, velocityX: 0, velocityY: 0 };
  let gravity = 0.5;
  let friction = 0.9;

  let gameRunning = true;
  let score = 0;
  let playTime = 0;
  let startTime = Date.now()

  let clearLineHeight = 240; // 캔버스 상단에서 100px 아래에 클리어 선을 설정

  let camera = { x: 0, y: 0 };

  let platforms = [
    {x: 100, y: 1120, width: 100, height: 80},
    {x: 200, y: 1030, width: 150, height: 20},
    {x: 200, y: 940, width: 150, height: 20},
    {x: 400, y: 800, width: 60, height: 300},
    {x: 200, y: 850, width: 40, height: 20},
    {x: 300, y: 750, width: 40, height: 20},
    {x: 250, y: 650, width: 40, height: 20},
    {x: 100, y: 600, width: 100, height: 200},
    {x: 200, y: 520, width: 20, height: 20},
    {x: 250, y: 460, width: 20, height: 20},
    {x: 300, y: 400, width: 20, height: 20},
    {x: 400, y: 460, width: 20, height: 20},
    {x: 500, y: 400, width: 20, height: 20},
    {x: 550, y: 270, width: 20, height: 150},
    {x: 500, y: 320, width: 20, height: 20},
  ];

  let startPoint = { x: 0, y: 0 };
  let endPoint = { x: 0, y: 0 };

  function gameLoop() {
    if(gameRunning){

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 점수와 플레이 시간 업데이트
      updateScoreAndTime();
  
      drawClearLine();
      checkGameClear();
  
      drawPlayerAndPlatforms();
      if (isDragging && canJump) {
        drawPowerLine();
      }

      updateCamera();
      updatePlayerPosition();
      checkCollisions();
  
      // 점수와 플레이 시간 표시
      displayScoreAndTime();
  
      requestAnimationFrame(gameLoop);
    }
  }

  function updateScoreAndTime() {
    // 점수 업데이트 (예시: 최대 높이 - 현재 플레이어의 y 위치)
    score = canvas.height - player.y-20;

    // 플레이 시간 업데이트
    playTime = (Date.now() - startTime) / 1000; // 초 단위로 변환
  }

  function displayScoreAndTime() {
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`자산: ${Math.floor(score)}`, 10, 30);
    ctx.fillText(`투자기간: ${playTime.toFixed(2)}s`, 10, 60);
  } 

  function drawClearLine() {
    ctx.beginPath();
    ctx.moveTo(0, clearLineHeight + camera.y);
    ctx.lineTo(canvas.width, clearLineHeight + camera.y);
    ctx.fillText(`경제적자유`, 10, 230 + camera.y);
    ctx.strokeStyle = 'black'; // 클리어 선의 색상
    ctx.stroke();
  }

  function checkGameClear() {
    if (player.y <= clearLineHeight) {
        // 게임 클리어 처리
        gameRunning = false; // 게임을 멈춤
        displayClearInfo(); // 클리어 정보 표시
    }
  }

  function updateCamera() {
    camera.x = canvas.width / 2 - player.x - player.width / 2;
    camera.y = canvas.height / 2 - player.y - player.height / 2;
  }

  function displayClearInfo() {
    ctx.fillStyle = 'black';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText("경제적자유 달성!", canvas.width / 2, canvas.height / 2);
    ctx.fillText(`자산: ${Math.floor(score)}`, canvas.width / 2, canvas.height / 2 + 30);
    ctx.fillText(`투자기간: ${playTime.toFixed(2)}s`, canvas.width / 2, canvas.height / 2 + 60);
  }

  function drawPlayerAndPlatforms() {
    ctx.fillStyle = 'blue';
    ctx.fillRect(player.x + camera.x, player.y + camera.y, player.width, player.height);
    platforms.forEach(platform => {
        ctx.fillStyle = 'grey';
        ctx.fillRect(platform.x + camera.x, platform.y + camera.y, platform.width, platform.height);
    });
  }

  function updatePlayerPosition() {
    player.x += player.velocityX;
    player.y += player.velocityY;
    player.velocityY += gravity; // 중력 적용
    player.velocityX *= friction; // 마찰력 적용
    player.velocityY *= friction;

    // 플레이어의 속도가 거의 0이라면, 즉 움직임이 멈추었다면 점프 가능 상태로 변경
    if (Math.abs(player.velocityX) < 1 && Math.abs(player.velocityY) < 1) {
      canJump = true;
    } else {
      canJump = false;
    }
  }

  function checkCollisions() {
    platforms.forEach(platform => {
        if (player.x < platform.x + platform.width && player.x + player.width > platform.x &&
            player.y < platform.y + platform.height && player.y + player.height > platform.y) {
            
            // 플레이어의 바닥이 발판의 상단보다 약간 높은 위치에 있는 경우 (위에서 아래로 충돌)
            if (player.velocityY > 0 && player.y + player.height - player.velocityY <= platform.y) {
                player.y = platform.y - player.height; // 플레이어를 발판 위로 위치 조정
                player.velocityY = 0; // 수직 속도를 0으로 설정하여 추가 하강 방지
            }
            // 플레이어의 상단이 발판의 바닥보다 약간 낮은 위치에 있는 경우 (아래에서 위로 충돌)
            else if (player.velocityY < 0 && player.y - player.velocityY >= platform.y + platform.height) {
                player.y = platform.y + platform.height; // 플레이어를 발판 아래로 위치 조정
                player.velocityY = 0; // 수직 속도를 0으로 설정하여 추가 상승 방지
            }
            // 옆면 충돌 검사 (플레이어가 발판의 옆면과 충돌)
            else {
                if (player.x + player.width - player.velocityX <= platform.x || player.x - player.velocityX >= platform.x + platform.width) {
                    player.velocityX *= -1; // 수평 속도 반전
                }
            }
        }
    });

    // 바닥과의 충돌 검사 및 처리
    if (player.y + player.height >= canvas.height) {
        player.y = canvas.height - player.height; // 플레이어를 바닥 위로 위치 조정
        player.velocityY = 0; // 수직 속도를 0으로 설정하여 추가 하강 방지
    }
  }

  function drawPowerLine() {
    // 화살표 그리기에 카메라 오프셋 적용
    let characterScreenX = player.x + camera.x + player.width / 2;
    let characterScreenY = player.y + camera.y + player.height / 2;

    // 드래그 방향을 계산합니다.
    let dx = endPoint.x - startPoint.x;
    let dy = endPoint.y - startPoint.y;
    
    // 드래그 방향이 아래로 향하는 경우 함수 실행을 중단
    if (dy < 0) {
        return; // 화살표를 그리지 않음
    }

    let angle = Math.atan2(dy, dx) + Math.PI; // 드래그 방향의 반대 방향을 가리키도록 각도 조정

    // 화살표의 길이를 제한합니다.
    let dragDistance = Math.sqrt(dx * dx + dy * dy);
    let maxDragDistance = 50; // 최대 드래그 거리로 선의 길이를 제한할 수 있습니다.
    let powerRatio = dragDistance / maxDragDistance; // 드래그 거리와 최대 드래그 거리의 비율
    let jumpPower = Math.min(powerRatio * 20, 20); // 실제 점프 파워 계산
    dragDistance = Math.min(dragDistance, maxDragDistance);

    let adjustedDragDistance = jumpPower * (maxDragDistance / 20);

    // 선(화살표)의 끝점을 조정합니다.
    let adjustedEndPointX = characterScreenX + Math.cos(angle) * adjustedDragDistance;
    let adjustedEndPointY = characterScreenY + Math.sin(angle) * adjustedDragDistance;

    // 화살표 그리기 설정
    ctx.beginPath();
    ctx.moveTo(characterScreenX, characterScreenY);
    ctx.lineTo(adjustedEndPointX, adjustedEndPointY);

    // 선 스타일 설정
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'blue';
    ctx.stroke();

    // 화살표 머리를 그립니다.
    drawArrowhead(ctx, adjustedEndPointX, adjustedEndPointY, angle);
  }

  function drawArrowhead(ctx, x, y, angle) {
    let arrowHeadSize = 10;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - arrowHeadSize * Math.cos(angle - Math.PI / 6), y - arrowHeadSize * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(x - arrowHeadSize * Math.cos(angle + Math.PI / 6), y - arrowHeadSize * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fillStyle = 'blue';
    ctx.fill();
  }

  function handleStart(event) {
    if (canJump) {
        isDragging = true;
        const point = getPoint(event);
        startPoint = { x: point.x, y: point.y };
        endPoint = startPoint; // 초기화
        event.preventDefault(); // 기본 동작 방지
    }
  }

  function handleMove(event) {
      if (isDragging && canJump) {
          const point = getPoint(event);
          endPoint = { x: point.x, y: point.y };
          event.preventDefault(); // 드래그 중 스크롤 등의 기본 동작 방지
      }
  }

  function handleEnd(event) {
      if (isDragging && canJump) {
          isDragging = false;
          const dx = endPoint.x - startPoint.x;
          const dy = endPoint.y - startPoint.y;

          if (dy < 0) { // 아래로 드래그하는 경우, 점프 실행 안함
              event.preventDefault(); // 여기도 기본 동작 방지가 필요하면 추가
              return;
          }

          const dragDistance = Math.sqrt(dx * dx + dy * dy);
          const maxDragDistance = 50; // 최대 드래그 거리 설정
          const maxJumpPower = 20; // 최대 점프 파워 설정
          const powerRatio = Math.min(dragDistance / maxDragDistance, 1); // 드래그 거리를 최대 드래그 거리로 나눈 비율을 계산하고, 1을 초과하지 않도록 합니다.
          const jumpPower = powerRatio * maxJumpPower; // 실제 점프 파워 계산
  
          // 점프 파워를 바탕으로 플레이어의 수평 및 수직 속도 설정
          player.velocityX = -dx / dragDistance * jumpPower;
          player.velocityY = -dy / dragDistance * jumpPower;
          canJump = false;
  
          event.preventDefault();
      }
  }

  function getPoint(event) {
      let x, y;
      if (event.type.startsWith('touch')) {
          const touch = event.touches[0] || event.changedTouches[0];
          x = touch.clientX - canvas.offsetLeft;
          y = touch.clientY - canvas.offsetTop;
      } else { // 마우스 이벤트 처리
          x = event.clientX - canvas.offsetLeft;
          y = event.clientY - canvas.offsetTop;
      }
      return { x, y };
  }

  canvas.addEventListener('mousedown', handleStart);
  canvas.addEventListener('mousemove', handleMove);
  canvas.addEventListener('mouseup', handleEnd);

  canvas.addEventListener('touchstart', handleStart, { passive: false });
  canvas.addEventListener('touchmove', handleMove, { passive: false });
  canvas.addEventListener('touchend', handleEnd, { passive: false });

  gameLoop();
});
