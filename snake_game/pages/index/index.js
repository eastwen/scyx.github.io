Page({
  ctx: null, // 用于存储 Canvas 2D 上下文
  data: {
    snake: [{x: 0, y: 0}],
    food: {x: 5, y: 5},
    direction: 'right',
    interval: null,
    gameOver: false,
    score: 0,
    isPaused: false,
    // 新增画布尺寸和格子大小
    canvasWidth: 300, // 默认值
    canvasHeight: 300, // 默认值
    gridSize: 10, // 每个格子的大小
    gridWidth: 30, // 默认网格宽度
    gridHeight: 30 // 默认网格高度
  },
  onReady: function () {
    console.log('onReady 生命周期触发');
    // 获取 canvas 尺寸和 2D 上下文
    const query = wx.createSelectorQuery();
    query.select('#snakeCanvas')
      .fields({ node: true, size: true })
      .exec((res) => {
        console.log('canvas 查询结果', res);
        if (res[0] && res[0].node) {
          const canvas = res[0].node;
          const ctx = canvas.getContext('2d');
          const dpr = wx.getSystemInfoSync().pixelRatio;
          const canvasWidth = res[0].width;
          const canvasHeight = res[0].height;

          canvas.width = canvasWidth * dpr;
          canvas.height = canvasHeight * dpr;
          ctx.scale(dpr, dpr);

          const gridSize = Math.floor(canvasWidth / this.data.gridWidth); // 根据宽度计算格子大小
          const gridHeight = Math.floor(canvasHeight / gridSize); // 根据高度和格子大小计算网格高度

          this.ctx = ctx; // 保存上下文
          this.canvas = canvas; // 保存 canvas 对象

          this.setData({
            canvasWidth: canvasWidth,
            canvasHeight: canvasHeight,
            gridSize: gridSize,
            gridHeight: gridHeight // 更新动态计算的 gridHeight
          }, () => {
            // 确保 setData 完成后再初始化游戏
            this.initGame();
          });
        } else {
          console.error('无法获取 #snakeCanvas 节点或尺寸');
          console.log('canvas 查询失败，res:', res);
          // 可以设置一个默认值或者提示用户
          this.setData({
            canvasWidth: 300, // 默认值
            canvasHeight: 300, // 默认值
            gridSize: 15 // 默认值
          }, () => {
             this.initGame(); // 即使获取失败也尝试初始化
          });
        }
      });
  },
  // onLoad() { // 移动到 onReady 中
  //   this.startGame();
  // },
  initGame() {
    // 初始化游戏数据
    const gridWidth = this.data.gridWidth;
    const gridHeight = this.data.gridHeight;
    // 确保蛇的初始位置在网格内
    const initialSnake = [
      {x: Math.floor(gridWidth / 4) + 1, y: Math.floor(gridHeight / 2)},
      {x: Math.floor(gridWidth / 4), y: Math.floor(gridHeight / 2)},
      {x: Math.floor(gridWidth / 4) - 1, y: Math.floor(gridHeight / 2)}
    ];
    this.setData({
      snake: initialSnake,
      // food: {x: 15, y: 15}, // 食物位置将在 generateFood 中设置
      direction: 'right',
      gameOver: false,
      score: 0,
      isPaused: false,
      // interval: setInterval(this.moveSnake, 300) // 在 generateFood 后启动定时器
    });
    this.generateFood(); // 生成初始食物
    // 确保在第一次绘制前启动定时器
    if (this.data.interval) clearInterval(this.data.interval); // 清除旧的定时器
    this.setData({
        interval: setInterval(this.moveSnake, 300)
    });
    this.drawGame(); // 统一调用绘制函数
  },
  moveSnake() {
    if (this.data.isPaused || this.data.gameOver) {
      return;
    }
    const snake = this.data.snake.slice(); // 创建浅副本以避免直接修改 data
    const direction = this.data.direction;
    const gridWidth = this.data.gridWidth;
    const gridHeight = this.data.gridHeight;
    let head = Object.assign({}, snake[0]); // 创建头部副本
    switch (direction) {
      case 'right':
        head = {x: head.x + 1, y: head.y};
        break;
      case 'left':
        head = {x: head.x - 1, y: head.y};
        break;
      case 'up':
        head = {x: head.x, y: head.y - 1};
        break;
      case 'down':
        head = {x: head.x, y: head.y + 1};
        break;
    }

    // 检查是否撞墙
    if (head.x < 0 || head.x >= gridWidth || head.y < 0 || head.y >= gridHeight) {
      this.gameOver();
      return;
    }

    // 检查是否撞到自己
    // 从 1 开始检查，避免检查头部与自身碰撞
    for (let i = 1; i < snake.length; i++) {
      if (snake[i].x === head.x && snake[i].y === head.y) {
        this.gameOver();
        return;
      }
    }
    snake.unshift(head);

    // 检查是否吃到食物
    if (this.checkCollision(head)) {
      // 吃到食物，蛇变长，生成新食物，增加分数
      this.generateFood();
      this.setData({
        score: this.data.score + 10
      });
    } else {
      // 未吃到食物，移除尾部
      snake.pop();
    }

    this.setData({snake});
    this.drawGame(); // 统一调用绘制函数
  },
  changeDirection(e) {
    // 改变蛇的方向
    const direction = e.currentTarget.dataset.direction;
    // 防止蛇向相反方向移动（例如向右移动时不能直接向左移动）
    if (
      (direction === 'left' && this.data.direction !== 'right') ||
      (direction === 'right' && this.data.direction !== 'left') ||
      (direction === 'up' && this.data.direction !== 'down') ||
      (direction === 'down' && this.data.direction !== 'up')
    ) {
      this.setData({ direction });
    }
  },
  checkCollision(head) { // 传入 head 以检查新位置
    // 检查碰撞
    // const snake = this.data.snake;
    // const head = snake[0]; // 使用传入的 head
    const food = this.data.food;

    // 检查是否吃到食物
    if (head.x === food.x && head.y === food.y) {
      // 不移除尾部，让蛇变长 (这部分逻辑移到 moveSnake 中)
      // this.generateFood();
      // // 增加分数
      // this.setData({
      //   score: this.data.score + 10
      // });
      return true;
    }
    return false;
  },
  generateFood() {
    // 生成食物
    const gridWidth = this.data.gridWidth;
    const gridHeight = this.data.gridHeight;
    const snake = this.data.snake;
    let newFood;
    // 确保食物不生成在蛇身上
    do {
      newFood = {
        x: Math.floor(Math.random() * gridWidth),
        y: Math.floor(Math.random() * gridHeight)
      };
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));

    this.setData({
      food: newFood
    });
    // 食物生成后，如果游戏未结束，重新绘制一次确保食物显示
    if (!this.data.gameOver) {
        this.drawGame();
    }
  },
  // drawSnake() { // 重命名为 drawGame
  drawGame() {
    const snake = this.data.snake;
    const food = this.data.food;
    const gridSize = this.data.gridSize;
    const canvasWidth = this.data.canvasWidth;
    const canvasHeight = this.data.canvasHeight;
    const ctx = this.ctx; // 使用保存的 2D 上下文

    if (!ctx) {
      console.error('Canvas context is not ready yet.');
      return; // 如果上下文还没准备好，则不绘制
    }

    // 清除画布 - 使用动态尺寸
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // 绘制食物
    ctx.fillStyle = 'red';
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);

    // 绘制蛇
    ctx.fillStyle = 'green';
    snake.forEach(segment => {
      ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
    });

    // Canvas 2D API 不需要显式调用 draw()
  },
  togglePause() {
    // 切换暂停状态
    this.setData({
      isPaused: !this.data.isPaused
    });
  },
  gameOver() {
    clearInterval(this.data.interval);
    this.setData({
      gameOver: true,
      interval: null // 清除 interval 引用
    });
    wx.showModal({
      title: '游戏结束',
      content: `你的得分是: ${this.data.score}`,
      showCancel: false,
      success: () => {
        this.startGame();
      }
    });
  }
});