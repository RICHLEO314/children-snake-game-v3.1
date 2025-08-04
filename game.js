document.addEventListener('DOMContentLoaded', () => {
    // 获取DOM元素
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const score1Display = document.getElementById('score1');
    const score2Display = document.getElementById('score2');
    const lives1Display = document.getElementById('lives1');
    const lives2Display = document.getElementById('lives2');
    const player1NameInput = document.getElementById('player1Name');
    const player2NameInput = document.getElementById('player2Name');
    // 注意：startScreen元素在HTML中不存在，已注释
    // const startScreen = document.getElementById('startScreen');
    const winScreen = document.getElementById('winScreen');
    const winnerNameDisplay = document.getElementById('winnerName');
    const finalScoreDisplay = document.getElementById('finalScore');
    const startButton = document.getElementById('startButton');
    const restartButton = document.getElementById('restartButton');
    const respawn1Button = document.createElement('button');
    const respawn2Button = document.createElement('button');
    const bgMusic = document.getElementById('bgMusic');
    const winMusic = document.getElementById('winMusic');
    // 添加对难度选择界面的引用
    const difficultyScreen = document.getElementById('difficultyScreen');
    // 确认窗口引用已移除
    let pauseScreen = document.getElementById('pauseScreen');

    // 🌟 儿童游戏优化 - 新增变量
    let achievements = []; // 成就系统
    let mathQuestions = []; // 数学题库
    let currentMathFood = null; // 当前数学食物
    let encouragementMessages = [
        "太棒了！你真聪明！", "继续加油！", "你做得很好！", 
        "数学小天才！", "你真是太厉害了！", "再来一个！", 
        "你的进步真大！", "哇，你太聪明了！"
    ];
    let parentalControls = {
        maxPlayTime: 30, // 分钟
        mathDifficulty: 'easy', // easy, medium, hard
        soundEnabled: true,
        encouragementEnabled: true,
        mathFrequency: 'normal' // low, normal, high
    };

    // 🎯 数学题频率控制
    let mathFoodCooldown = 0; // 数学题冷却时间（毫秒）
    let lastMathTime = 0; // 上次数学题时间
    let currentMathFoodCount = 0; // 当前数学题食物数量

    // 🎨 可爱角色类型定义
    const characterTypes = {
        player1: { type: 'dragon', name: '小火龙', emoji: '🐲' },
        player2: { type: 'rainbow', name: '彩虹蛇', emoji: '🌈' }
    };

    // 🍎 教育食物类型
    const educationalFoods = [
        { type: 'apple', emoji: '🍎', math: () => generateMathQuestion() },
        { type: 'banana', emoji: '🍌', math: () => generateMathQuestion() },
        { type: 'orange', emoji: '🍊', math: () => generateMathQuestion() },
        { type: 'grapes', emoji: '🍇', math: () => generateMathQuestion() },
        { type: 'candy', emoji: '🍭', math: () => generateMathQuestion() }
    ];

    // 🎯 成就系统定义
    const achievementDefinitions = [
        { id: 'first_food', name: '第一口美食', desc: '吃到第一个食物', icon: '🎉' },
        { id: 'math_genius', name: '数学小天才', desc: '答对10道数学题', icon: '🧮' },
        { id: 'no_collision_5min', name: '小心翼翼', desc: '5分钟内没有碰撞', icon: '🛡️' },
        { id: 'long_snake', name: '超级大蛇', desc: '蛇身长度达到20节', icon: '🐍' },
        { id: 'speed_master', name: '速度之王', desc: '在困难模式下获胜', icon: '⚡' }
    ];

    // 🎯 智能判断是否应该生成数学题
    function shouldGenerateMathQuestion() {
        const now = Date.now();
        
        // 1. 检查冷却时间
        if (now - lastMathTime < mathFoodCooldown) {
            return false;
        }
        
        // 2. 检查当前数学题食物数量限制
        const maxMathFoods = getMaxMathFoods();
        if (currentMathFoodCount >= maxMathFoods) {
            return false;
        }
        
        // 3. 根据家长设置的频率决定概率
        const probability = getMathProbability();
        
        // 4. 随机判断
        return Math.random() < probability;
    }

    // 📊 获取数学题概率
    function getMathProbability() {
        switch(parentalControls.mathFrequency) {
            case 'low': return 0.08;    // 8% 概率（约每12-13个食物1个数学题）
            case 'normal': return 0.15; // 15% 概率（约每6-7个食物1个数学题）
            case 'high': return 0.25;   // 25% 概率（约每4个食物1个数学题）
            default: return 0.15;
        }
    }

    // 🔢 获取最大数学题食物数量
    function getMaxMathFoods() {
        const totalFoods = foodCount;
        switch(parentalControls.mathFrequency) {
            case 'low': return Math.max(1, Math.floor(totalFoods * 0.06));   // 最多6%
            case 'normal': return Math.max(2, Math.floor(totalFoods * 0.12)); // 最多12%
            case 'high': return Math.max(3, Math.floor(totalFoods * 0.20));   // 最多20%
            default: return Math.max(2, Math.floor(totalFoods * 0.12));
        }
    }

    // ⏰ 设置数学题冷却时间
    function setMathCooldown() {
        mathFoodCooldown = 8000; // 8秒冷却时间
        lastMathTime = Date.now();
    }

    // 📊 生成数学题目
    function generateMathQuestion() {
        const difficulty = parentalControls.mathDifficulty;
        let num1, num2, operator, answer;
        
        switch(difficulty) {
            case 'easy':
                num1 = Math.floor(Math.random() * 10) + 1;
                num2 = Math.floor(Math.random() * 10) + 1;
                operator = Math.random() > 0.5 ? '+' : '-';
                if (operator === '-' && num1 < num2) [num1, num2] = [num2, num1];
                answer = operator === '+' ? num1 + num2 : num1 - num2;
                break;
            case 'medium':
                operator = ['+', '-', '×'][Math.floor(Math.random() * 3)];
                if (operator === '×') {
                    num1 = Math.floor(Math.random() * 10) + 1;
                    num2 = Math.floor(Math.random() * 10) + 1;
                } else {
                    num1 = Math.floor(Math.random() * 20) + 1;
                    num2 = Math.floor(Math.random() * 20) + 1;
                    if (operator === '-' && num1 < num2) [num1, num2] = [num2, num1];
                }
                break;
            case 'hard':
                operator = ['+', '-', '×', '÷'][Math.floor(Math.random() * 4)];
                if (operator === '×') {
                    num1 = Math.floor(Math.random() * 12) + 1;
                    num2 = Math.floor(Math.random() * 12) + 1;
                } else if (operator === '÷') {
                    num2 = Math.floor(Math.random() * 10) + 2; // 除数 2-11
                    num1 = num2 * (Math.floor(Math.random() * 10) + 1); // 确保整除
                } else {
                    num1 = Math.floor(Math.random() * 50) + 1;
                    num2 = Math.floor(Math.random() * 50) + 1;
                    if (operator === '-' && num1 < num2) [num1, num2] = [num2, num1];
                }
                break;
        }
        
        switch(operator) {
            case '+': 
                answer = num1 + num2; 
                break;
            case '-': 
                answer = num1 - num2; 
                break;
            case '×': 
                answer = num1 * num2; 
                break;
            case '÷': 
                answer = Math.floor(num1 / num2); // 已经确保整除
                break;
        }
        
        return { question: `${num1} ${operator} ${num2}`, answer, num1, num2, operator };
    }

    // 🏆 成就检查
    function checkAchievements(player) {
        const newAchievements = [];
        
        // 检查各种成就条件
        achievementDefinitions.forEach(achievement => {
            if (!achievements.includes(achievement.id)) {
                let earned = false;
                
                switch(achievement.id) {
                    case 'first_food':
                        earned = (player === 1 && score1 >= 10) || (player === 2 && score2 >= 10);
                        break;
                    case 'long_snake':
                        earned = (player === 1 && snake1.length >= 20) || (player === 2 && snake2.length >= 20);
                        break;
                    // 可以添加更多成就检查
                }
                
                if (earned) {
                    achievements.push(achievement.id);
                    newAchievements.push(achievement);
                }
            }
        });
        
        // 显示新获得的成就
        newAchievements.forEach(achievement => {
            showAchievement(achievement);
        });
    }

    // 🎊 显示成就获得
    function showAchievement(achievement) {
        const achievementDiv = document.createElement('div');
        achievementDiv.className = 'fixed top-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-400 text-white p-4 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-500';
        achievementDiv.innerHTML = `
            <div class="flex items-center">
                <span class="text-3xl mr-3">${achievement.icon}</span>
                <div>
                    <h4 class="font-bold text-lg">🎉 成就解锁！</h4>
                    <h5 class="font-bold">${achievement.name}</h5>
                    <p class="text-sm opacity-90">${achievement.desc}</p>
                </div>
            </div>
        `;
        
        document.body.appendChild(achievementDiv);
        
        // 动画效果
        setTimeout(() => {
            achievementDiv.style.transform = 'translateX(0)';
        }, 100);
        
        setTimeout(() => {
            achievementDiv.style.transform = 'translateX(100%)';
            setTimeout(() => {
                achievementDiv.remove();
                // 更新成就面板显示
                updateAchievementsList();
            }, 500);
        }, 4000);
        
        // 播放成就音效
        playEncouragementSound(true);
    }

    // 🔊 播放鼓励音效
    function playEncouragementSound(showMessage = false) {
        if (parentalControls.soundEnabled && parentalControls.encouragementEnabled) {
            // 可以播放鼓励音效
            if (showMessage) {
                const msg = encouragementMessages[Math.floor(Math.random() * encouragementMessages.length)];
                showEncouragementMessage(msg);
            }
        }
    }

    // 💬 显示鼓励消息
    function showEncouragementMessage(message) {
        const msgDiv = document.createElement('div');
        msgDiv.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-pink-400 to-purple-500 text-white px-6 py-3 rounded-full text-xl font-bold shadow-lg z-50 animate-bounce bg-opacity-90';
        msgDiv.textContent = message;
        
        document.body.appendChild(msgDiv);
        
        setTimeout(() => {
            msgDiv.remove();
        }, 2000);
    }

    // 🎮 家长控制面板
    function createParentalControlsPanel() {
        const panel = document.createElement('div');
        panel.id = 'parentalControlsPanel';
        panel.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 hidden';
        panel.innerHTML = `
            <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <h3 class="text-2xl font-bold mb-4 text-center text-gray-800">👨‍👩‍👧‍👦 家长控制</h3>
                
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">游戏时长限制 (分钟)</label>
                        <select id="maxPlayTime" class="w-full p-2 border rounded bg-blue-50 text-blue-800 font-bold">
                            <option value="15" class="bg-blue-50 text-blue-800">15分钟</option>
                            <option value="30" selected class="bg-blue-50 text-blue-800">30分钟</option>
                            <option value="45" class="bg-blue-50 text-blue-800">45分钟</option>
                            <option value="60" class="bg-blue-50 text-blue-800">60分钟</option>
                        </select>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">数学难度</label>
                        <select id="mathDifficulty" class="w-full p-2 border rounded bg-green-50 text-green-800 font-bold">
                            <option value="easy" selected class="bg-green-50 text-green-800">简单 (10以内加减法)</option>
                            <option value="medium" class="bg-green-50 text-green-800">中等 (20以内四则运算)</option>
                            <option value="hard" class="bg-green-50 text-green-800">困难 (50以内四则运算)</option>
                        </select>
                    </div>
                    
                    <div class="flex items-center justify-between">
                        <label class="text-sm font-medium text-gray-700">音效开关</label>
                        <input type="checkbox" id="soundEnabled" checked class="w-5 h-5">
                    </div>
                    
                    <div class="flex items-center justify-between">
                        <label class="text-sm font-medium text-gray-700">鼓励消息</label>
                        <input type="checkbox" id="encouragementEnabled" checked class="w-5 h-5">
                    </div>
                </div>
                
                <div class="flex space-x-3 mt-6">
                    <button id="saveParentalControls" class="flex-1 bg-green-500 text-white py-2 rounded hover:bg-green-600">保存设置</button>
                    <button id="closeParentalControls" class="flex-1 bg-gray-500 text-white py-2 rounded hover:bg-gray-600">关闭</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(panel);
        
        // 绑定事件
        document.getElementById('saveParentalControls').addEventListener('click', () => {
            parentalControls.maxPlayTime = parseInt(document.getElementById('maxPlayTime').value);
            parentalControls.mathDifficulty = document.getElementById('mathDifficulty').value;
            parentalControls.soundEnabled = document.getElementById('soundEnabled').checked;
            parentalControls.encouragementEnabled = document.getElementById('encouragementEnabled').checked;
            
            panel.classList.add('hidden');
            showEncouragementMessage('设置已保存！');
        });
        
        document.getElementById('closeParentalControls').addEventListener('click', () => {
            panel.classList.add('hidden');
        });
    }

    // 初始化重生按钮
    respawn1Button.id = 'respawn1Button';
    respawn1Button.className = 'px-8 py-3 bg-gradient-to-r from-player1 to-player1/70 rounded-full text-white font-bold shadow-lg hover:shadow-primary/30 hover:scale-105 transition-all duration-300 hidden';
    respawn1Button.innerHTML = `<i class="fa fa-refresh mr-2"></i>${player1NameInput.value}重生`;

    respawn2Button.id = 'respawn2Button';
    respawn2Button.className = 'px-8 py-3 bg-gradient-to-r from-player2 to-player2/70 rounded-full text-white font-bold shadow-lg hover:shadow-primary/30 hover:scale-105 transition-all duration-300 hidden';
    respawn2Button.innerHTML = `<i class="fa fa-refresh mr-2"></i>${player2NameInput.value}重生`;

    // 将重生按钮添加到胜利界面
    const winScreenContainer = winScreen.querySelector('div');
    if (winScreenContainer) {
        winScreenContainer.appendChild(respawn1Button);
        winScreenContainer.appendChild(respawn2Button);
    }

    // 添加昵称输入变化事件监听器
    player1NameInput.addEventListener('input', () => {
        respawn1Button.innerHTML = `<i class="fa fa-refresh mr-2"></i>${player1NameInput.value}重生`;
    });

    player2NameInput.addEventListener('input', () => {
        respawn2Button.innerHTML = `<i class="fa fa-refresh mr-2"></i>${player2NameInput.value}重生`;
    });
    
    // 游戏变量
    let snake1 = [];
    let snake2 = [];
    let foods = [];
    let corpses = []; // 尸体数组
    let gameMode = 'multi'; // 默认双人模式
    let isAIMode = false; // AI模式标志
    let direction1 = 'right';
    let direction2 = 'left';
    let nextDirection1 = 'right';
    let nextDirection2 = 'left';
    let score1 = 0;
    let score2 = 0;
    let lives1 = 3;
    let lives2 = 3;
    let gameSpeed = 150;
    let gameInterval;
    let isGameActive = false;
    let gridSize;
    let snakeSize;
    let foodSize;
    let foodCount = 50; // 同时存在的食物数量
    let currentDifficulty = 'medium'; // 默认难度
    let bigFoodChance = 0.1; // 10%的概率生成大方块
    // 儿童提醒功能变量
    let childReminderTimer = null;
    let reminderShown = false;
    const REMINDER_TIME = 1 * 60 * 1000; // 30分钟
    const CLOSE_TIME = 1 * 30 * 1000; // 1分钟

    
    // 设置Canvas尺寸 - 横向宽屏设计
    function resizeCanvas() {
        // 取窗口宽度的95%作为画布宽度
        const width = window.innerWidth * 0.95;
        // 高度设为宽度的45%，保持横向宽屏比例
        const height = Math.min(width * 0.45, window.innerHeight * 0.65);
        
        canvas.width = width;
        canvas.height = height;
    }
    
    resizeCanvas();
    window.addEventListener('resize', () => {
        resizeCanvas();
        if (isGameActive) {
            redrawGame();
        }
    });
    
    // 根据难度设置游戏参数
    function setDifficulty(difficulty) {
        currentDifficulty = difficulty;
        switch(difficulty) {
            case 'easy':
                gameSpeed = 224;  // 更慢 (在降低40%的基础上再降低20%)
                foodCount = 30;   // 较少食物 (增加一倍)
                bigFoodChance = 0.25; // 25%概率出现大方块 (增加5倍)
                break;
            case 'medium':
                gameSpeed = 150;  // 中等
                foodCount = 50;   // 中等食物数量
                bigFoodChance = 0.1;  // 10%概率出现大方块
                break;
            case 'hard':
                gameSpeed = 100;  // 较快
                foodCount = 80;   // 较多食物
                bigFoodChance = 0.15; // 15%概率出现大方块
                break;
        }
    }

    // 初始化游戏
    function initGame(showDifficultyScreen = true) {
        // 计算网格和元素大小
        gridSize = Math.floor(canvas.width / 60); // 更多列，适应宽屏
        if (gridSize < 8) gridSize = 8; // 最小网格大小
        snakeSize = gridSize * 0.8;
        foodSize = gridSize * 0.7;

        // 根据当前难度设置参数
        setDifficulty(currentDifficulty);

        // 获取难度选择界面元素
        const difficultyScreen = document.getElementById('difficultyScreen');

        // 重置游戏状态
        // 玩家1从左侧开始，向右移动
        snake1 = [
            {x: 10 * gridSize, y: Math.floor(canvas.height/2/gridSize) * gridSize},
            {x: 9 * gridSize, y: Math.floor(canvas.height/2/gridSize) * gridSize},
            {x: 8 * gridSize, y: Math.floor(canvas.height/2/gridSize) * gridSize}
        ];
        direction1 = 'right';
        nextDirection1 = 'right';

        // 玩家2从右侧开始，向左移动
        snake2 = [
            {x: (canvas.width/gridSize - 10) * gridSize, y: Math.floor(canvas.height/2/gridSize) * gridSize},
            {x: (canvas.width/gridSize - 9) * gridSize, y: Math.floor(canvas.height/2/gridSize) * gridSize},
            {x: (canvas.width/gridSize - 8) * gridSize, y: Math.floor(canvas.height/2/gridSize) * gridSize}
        ];
        direction2 = 'left';
        nextDirection2 = 'left';

        // 重置分数和生命
        score1 = 0;
        score2 = 0;
        lives1 = 3;
        lives2 = 3;
        score1Display.textContent = score1;
        score2Display.textContent = score2;
        lives1Display.textContent = lives1;
        lives2Display.textContent = lives2;

        // 重置游戏状态
        isGameActive = true;
        isPaused = false;
        foods = [];
        corpses = []; // 重置尸体数组
        reminderShown = false; // 重置提醒状态
        clearTimeout(childReminderTimer); // 清除之前的计时器

        // 隐藏暂停界面
        if (pauseScreen) {
            pauseScreen.classList.add('hidden');
        }

        // 隐藏胜利界面
        if (winScreen) winScreen.classList.add('hidden');
        stopConfetti();

        // 根据参数决定是否显示难度选择界面
        if (showDifficultyScreen) {
            setTimeout(() => {
                // 直接在回调函数中获取难度选择界面元素
                const difficultyScreen = document.getElementById('difficultyScreen');
                if (difficultyScreen) {
                    difficultyScreen.classList.remove('hidden');
                    console.log('难度选择界面已显示');
                } else {
                    console.log('未找到难度选择界面元素');
                }
            }, 100);
        } else {
            console.log('跳过显示难度选择界面');
        }

        // 播放背景音乐，暂停胜利音乐
        winMusic.pause();
        winMusic.currentTime = 0;
        bgMusic.volume = 0.3;
        bgMusic.play().catch(e => console.log("背景音乐播放失败:", e));

        // 生成食物
        for (let i = 0; i < foodCount; i++) {
            generateFood();
        }

        // 不立即开始游戏循环，等待用户选择难度
        if (gameInterval) clearInterval(gameInterval);
        gameInterval = null;
    }


    // 重生玩家
    function respawnPlayer(player) {
        // 创建尸体方块（除了头部）
        const bodySegments = player === 1 ? snake1.slice(1) : snake2.slice(1);
        if (bodySegments.length > 0) {
            // 从蛇身创建尸体方块
            bodySegments.forEach((segment, index) => {
                // 延迟添加尸体方块，创造蛇死亡碎裂的效果
                setTimeout(() => {
                    corpses.push({
                        x: segment.x,
                        y: segment.y,
                        player: player,
                        // 随机选择一种尸体类型
                        type: Math.random() > 0.5 ? 'bone' : 'skull',
                        // 随时间淡化的效果
                        opacity: 1
                    });
                }, index * 100);
            });
        }
    // 停止庆祝效果
    stopConfetti();

    // 隐藏胜利界面
    if (winScreen) winScreen.classList.add('hidden');

    // 重置死亡玩家的状态
    if (player === 1) {
        // 减少生命
        lives1--;
        lives1Display.textContent = lives1;

        // 重置玩家1的位置和方向
        snake1 = [
            {x: 10 * gridSize, y: Math.floor(canvas.height/2/gridSize) * gridSize},
            {x: 9 * gridSize, y: Math.floor(canvas.height/2/gridSize) * gridSize},
            {x: 8 * gridSize, y: Math.floor(canvas.height/2/gridSize) * gridSize}
        ];
        direction1 = 'right';
        nextDirection1 = 'right';

        // 如果还有生命，继续游戏
        if (lives1 > 0) {
            // 播放背景音乐
            bgMusic.volume = 0.3;
            bgMusic.play().catch(e => console.log("背景音乐播放失败:", e));

            // 重置游戏速度为当前难度对应的速度
            setDifficulty(currentDifficulty);
            isGameActive = true;
            // 确保清除旧的定时器
            if (gameInterval) clearInterval(gameInterval);
            // 使用更新后的gameSpeed设置新的定时器
            gameInterval = setInterval(gameLoop, gameSpeed);
        } else {
            // 生命值为0，显示游戏结束窗口
            if (gameMode === 'singleplayer') {
                endGame(`游戏结束! ${player1NameInput.value}的得分: ${score1}`, `${score1}`, 1);
            } else {
                endGame(`${player2NameInput.value}获胜!`, `${score2} - ${score1}`, 1);
            }
            return; // 立即返回
        }
    } else if (player === 2 && (gameMode !== 'singleplayer' || isAIMode)) {
        // 减少生命
        lives2--;
        lives2Display.textContent = lives2;

        // 重置玩家2的位置和方向
        snake2 = [
            {x: (canvas.width/gridSize - 10) * gridSize, y: Math.floor(canvas.height/2/gridSize) * gridSize},
            {x: (canvas.width/gridSize - 9) * gridSize, y: Math.floor(canvas.height/2/gridSize) * gridSize},
            {x: (canvas.width/gridSize - 8) * gridSize, y: Math.floor(canvas.height/2/gridSize) * gridSize}
        ];
        direction2 = 'left';
        nextDirection2 = 'left';

        // 如果还有生命，继续游戏
        if (lives2 > 0) {
            // 播放背景音乐
            bgMusic.volume = 0.3;
            bgMusic.play().catch(e => console.log("背景音乐播放失败:", e));

            // 重置游戏速度为当前难度对应的速度
            setDifficulty(currentDifficulty);
            isGameActive = true;
            // 确保清除旧的定时器
            if (gameInterval) clearInterval(gameInterval);
            // 使用更新后的gameSpeed设置新的定时器
            gameInterval = setInterval(gameLoop, gameSpeed);
        } else {
            // 生命值为0，显示游戏结束窗口
            endGame(`${player1NameInput.value}获胜!`, `${score1} - ${score2}`, 2);
            return; // 立即返回
        }
    }
    }

    // 确认窗口事件监听已移除
    function setupConfirmListeners() {
        // 空函数，保留以避免调用错误
    }
    
    // 🍎 生成教育性食物
    function generateFood() {
        if (foods.length >= foodCount) return;

        const maxX = Math.floor(canvas.width / gridSize) - (Math.random() < bigFoodChance ? 2 : 1);
        const maxY = Math.floor(canvas.height / gridSize) - (Math.random() < bigFoodChance ? 2 : 1);

        // 确保食物不会出现在蛇身上
        let overlapping;
        let newFood;
        const isBigFood = Math.random() < bigFoodChance;

        do {
            overlapping = false;
            const x = Math.floor(Math.random() * maxX) * gridSize;
            const y = Math.floor(Math.random() * maxY) * gridSize;

            // 随机选择教育食物类型
            const foodTypes = ['apple', 'banana', 'orange', 'grapes', 'candy'];
            const educationType = foodTypes[Math.floor(Math.random() * foodTypes.length)];
            
            // 🎯 智能数学题生成控制
            const mathQuestion = shouldGenerateMathQuestion() ? generateMathQuestion() : null;
            
            newFood = {
                x: x,
                y: y,
                value: isBigFood ? 40 : (mathQuestion ? 30 : (Math.random() > 0.7 ? 20 : 10)),
                color: isBigFood ? '#FF6B6B' : (mathQuestion ? '#FFD700' : (Math.random() > 0.5 ? '#4ADE80' : '#60A5FA')),
                isBig: isBigFood,
                educationType: educationType,
                mathQuestion: mathQuestion,
                needsMathAnswer: !!mathQuestion // 标记是否需要回答数学题
            };

            // 🔢 更新数学题食物计数
            if (mathQuestion) {
                currentMathFoodCount++;
            }

            // 检查是否与蛇重叠
            if (isBigFood) {
                // 大方块需要检查2x2的区域
                for (let dx = 0; dx < 2; dx++) {
                    for (let dy = 0; dy < 2; dy++) {
                        const checkX = x + dx * gridSize;
                        const checkY = y + dy * gridSize;
                        for (let segment of snake1.concat(snake2)) {
                            if (segment.x === checkX && segment.y === checkY) {
                                overlapping = true;
                                break;
                            }
                        }
                        if (overlapping) break;
                    }
                    if (overlapping) break;
                }
            } else {
                // 小方块只需要检查单个位置
                for (let segment of snake1.concat(snake2)) {
                    if (segment.x === x && segment.y === y) {
                        overlapping = true;
                        break;
                    }
                }
            }

            // 检查是否与其他食物重叠
            if (!overlapping) {
                for (let f of foods) {
                    if (isBigFood) {
                        // 检查大方块是否与其他食物重叠
                        for (let dx = 0; dx < 2; dx++) {
                            for (let dy = 0; dy < 2; dy++) {
                                const checkX = x + dx * gridSize;
                                const checkY = y + dy * gridSize;
                                if (f.x === checkX && f.y === checkY) {
                                    overlapping = true;
                                    break;
                                }
                            }
                            if (overlapping) break;
                        }
                    } else {
                        // 检查小方块是否与其他食物重叠
                        if (f.isBig) {
                            // 检查是否与其他大方块重叠
                            for (let dx = 0; dx < 2; dx++) {
                                for (let dy = 0; dy < 2; dy++) {
                                    const checkX = f.x + dx * gridSize;
                                    const checkY = f.y + dy * gridSize;
                                    if (x === checkX && y === checkY) {
                                        overlapping = true;
                                        break;
                                    }
                                }
                                if (overlapping) break;
                            }
                        } else if (f.x === x && f.y === y) {
                            overlapping = true;
                            break;
                        }
                    }
                }
            }
        } while (overlapping);

        foods.push(newFood);
    }
    
    // 🎨 绘制可爱的小动物蛇
    function drawSnakes() {
        // 绘制玩家1的小火龙🐲
        snake1.forEach((segment, index) => {
            if (index === 0) {
                // 绘制小火龙头部
                drawDragonHead(segment, direction1, '#4F46E5');
            } else {
                // 绘制可爱身体
                drawCuteBody(segment, '#4F46E5', '#6366F1', index);
            }
        });
        
        // 在多人模式或AI模式下绘制玩家2的彩虹蛇🌈
        if (gameMode === 'multiplayer' || isAIMode) {
            snake2.forEach((segment, index) => {
                if (index === 0) {
                    // 绘制彩虹蛇头部
                    drawRainbowHead(segment, direction2);
                } else {
                    // 绘制彩虹身体
                    drawRainbowBody(segment, index);
                }
            });
        }
    }

    // 🐲 绘制小火龙头部
    function drawDragonHead(segment, direction, color) {
        ctx.save();
        
        // 基础圆形头部
        const gradient = ctx.createRadialGradient(
            segment.x + gridSize/2, segment.y + gridSize/2, 0,
            segment.x + gridSize/2, segment.y + gridSize/2, gridSize/2
        );
        gradient.addColorStop(0, lightenColor(color, 40));
        gradient.addColorStop(1, color);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(segment.x + gridSize/2, segment.y + gridSize/2, gridSize/2 - 2, 0, Math.PI * 2);
        ctx.fill();
        
        // 绘制可爱的大眼睛
        drawCuteEyes(segment, direction, '#fff', true);
        
        // 绘制小鼻孔
        ctx.fillStyle = '#333';
        const noseX = segment.x + gridSize/2;
        const noseY = segment.y + gridSize/2 + gridSize/6;
        ctx.beginPath();
        ctx.arc(noseX - gridSize/8, noseY, gridSize/16, 0, Math.PI * 2);
        ctx.arc(noseX + gridSize/8, noseY, gridSize/16, 0, Math.PI * 2);
        ctx.fill();
        
        // 绘制小角角
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.moveTo(segment.x + gridSize/4, segment.y + gridSize/8);
        ctx.lineTo(segment.x + gridSize/3, segment.y);
        ctx.lineTo(segment.x + gridSize/2.5, segment.y + gridSize/6);
        ctx.fill();
        
        ctx.restore();
    }

    // 🌈 绘制彩虹蛇头部
    function drawRainbowHead(segment, direction) {
        ctx.save();
        
        // 彩虹渐变头部
        const gradient = ctx.createLinearGradient(
            segment.x, segment.y,
            segment.x + gridSize, segment.y + gridSize
        );
        gradient.addColorStop(0, '#FF6B6B');
        gradient.addColorStop(0.2, '#FFD93D');
        gradient.addColorStop(0.4, '#6BCF7F');
        gradient.addColorStop(0.6, '#4D96FF');
        gradient.addColorStop(0.8, '#9B59B6');
        gradient.addColorStop(1, '#E84393');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(segment.x + gridSize/2, segment.y + gridSize/2, gridSize/2 - 2, 0, Math.PI * 2);
        ctx.fill();
        
        // 绘制闪亮眼睛
        drawCuteEyes(segment, direction, '#fff', true);
        
        // 绘制星星装饰
        drawStar(segment.x + gridSize/4, segment.y + gridSize/8, gridSize/10, '#FFD700');
        drawStar(segment.x + gridSize*3/4, segment.y + gridSize/8, gridSize/12, '#FFF');
        
        ctx.restore();
    }

    // ⭐ 绘制小星星
    function drawStar(x, y, size, color) {
        ctx.save();
        ctx.fillStyle = color;
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (i * 144) * Math.PI / 180;
            const px = x + Math.cos(angle) * size;
            const py = y + Math.sin(angle) * size;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    // 💖 绘制可爱身体
    function drawCuteBody(segment, color1, color2, index) {
        const gradient = ctx.createLinearGradient(
            segment.x, segment.y, 
            segment.x + gridSize, segment.y + gridSize
        );
        gradient.addColorStop(0, color1);
        gradient.addColorStop(1, color2);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(
            segment.x + 2, segment.y + 2,
            gridSize - 4, gridSize - 4, gridSize / 3
        );
        ctx.fill();
        
        // 添加可爱的小点点装饰
        if (index % 3 === 0) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.beginPath();
            ctx.arc(segment.x + gridSize/2, segment.y + gridSize/2, gridSize/8, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // 🌈 绘制彩虹身体
    function drawRainbowBody(segment, index) {
        const colors = ['#FF6B6B', '#FFD93D', '#6BCF7F', '#4D96FF', '#9B59B6', '#E84393'];
        const color = colors[index % colors.length];
        
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.roundRect(
            segment.x + 2, segment.y + 2,
            gridSize - 4, gridSize - 4, gridSize / 3
        );
        ctx.fill();
        
        // 添加亮光效果
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.roundRect(
            segment.x + 4, segment.y + 4,
            gridSize/3, gridSize/3, gridSize/6
        );
        ctx.fill();
    }
    
    // 👀 绘制可爱大眼睛
    function drawCuteEyes(segment, direction, color, isCute = false) {
        const eyeSize = isCute ? gridSize / 6 : gridSize / 8;
        const offset = gridSize * 0.25;
        
        // 根据方向调整眼睛位置
        let leftEyeX, leftEyeY, rightEyeX, rightEyeY;
        
        switch(direction) {
            case 'right':
                leftEyeX = segment.x + gridSize * 0.55;
                leftEyeY = segment.y + gridSize * 0.35;
                rightEyeX = segment.x + gridSize * 0.55;
                rightEyeY = segment.y + gridSize * 0.65;
                break;
            case 'left':
                leftEyeX = segment.x + gridSize * 0.45;
                leftEyeY = segment.y + gridSize * 0.35;
                rightEyeX = segment.x + gridSize * 0.45;
                rightEyeY = segment.y + gridSize * 0.65;
                break;
            case 'up':
                leftEyeX = segment.x + gridSize * 0.35;
                leftEyeY = segment.y + gridSize * 0.45;
                rightEyeX = segment.x + gridSize * 0.65;
                rightEyeY = segment.y + gridSize * 0.45;
                break;
            case 'down':
                leftEyeX = segment.x + gridSize * 0.35;
                leftEyeY = segment.y + gridSize * 0.55;
                rightEyeX = segment.x + gridSize * 0.65;
                rightEyeY = segment.y + gridSize * 0.55;
                break;
        }
        
        // 绘制眼白
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(leftEyeX, leftEyeY, eyeSize, 0, Math.PI * 2);
        ctx.arc(rightEyeX, rightEyeY, eyeSize, 0, Math.PI * 2);
        ctx.fill();
        
        // 绘制瞳孔
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(leftEyeX, leftEyeY, eyeSize * 0.6, 0, Math.PI * 2);
        ctx.arc(rightEyeX, rightEyeY, eyeSize * 0.6, 0, Math.PI * 2);
        ctx.fill();
        
        // 绘制高光点（让眼睛更生动）
        if (isCute) {
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(leftEyeX - eyeSize/3, leftEyeY - eyeSize/3, eyeSize/4, 0, Math.PI * 2);
            ctx.arc(rightEyeX - eyeSize/3, rightEyeY - eyeSize/3, eyeSize/4, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // 兼容旧函数名
    function drawEyes(segment, direction, color) {
        drawCuteEyes(segment, direction, color, false);
    }
    
    // 绘制尸体方块
    function drawCorpses() {
        // 优化性能：如果没有尸体，直接返回
        if (corpses.length === 0) return;

        // 先保存当前上下文状态
        ctx.save();

        // 更新尸体方块的状态
        corpses = corpses.filter(corpse => {
            // 逐渐降低透明度
            corpse.opacity -= 0.005;
            // 移除透明度为0的尸体
            return corpse.opacity > 0;
        });

        corpses.forEach(corpse => {
            // 设置当前尸体的透明度
            ctx.globalAlpha = corpse.opacity;

            // 绘制尸体
            ctx.beginPath();
            if (corpse.type === 'bone') {
                // 绘制骨头形状
                ctx.fillStyle = corpse.player === 1 ? '#6366F1' : '#F472B6';
                ctx.moveTo(corpse.x + gridSize/4, corpse.y + gridSize/3);
                ctx.lineTo(corpse.x + gridSize*3/4, corpse.y + gridSize/3);
                ctx.lineTo(corpse.x + gridSize*5/6, corpse.y + gridSize/2);
                ctx.lineTo(corpse.x + gridSize*1/6, corpse.y + gridSize/2);
                ctx.closePath();
                ctx.fill();

                ctx.beginPath();
                ctx.moveTo(corpse.x + gridSize*1/6, corpse.y + gridSize/2);
                ctx.lineTo(corpse.x + gridSize*1/6, corpse.y + gridSize*2/3);
                ctx.lineTo(corpse.x + gridSize*5/6, corpse.y + gridSize*2/3);
                ctx.lineTo(corpse.x + gridSize*5/6, corpse.y + gridSize/2);
                ctx.closePath();
                ctx.fill();
            } else if (corpse.type === 'skull') {
                // 绘制骷髅头形状
                ctx.fillStyle = '#E5E7EB';
                ctx.arc(corpse.x + gridSize/2, corpse.y + gridSize/2, gridSize/4, 0, Math.PI * 2);
                ctx.fill();

                // 眼睛
                ctx.fillStyle = '#000';
                ctx.beginPath();
                ctx.arc(corpse.x + gridSize*3/8, corpse.y + gridSize*2/5, gridSize/20, 0, Math.PI * 2);
                ctx.arc(corpse.x + gridSize*5/8, corpse.y + gridSize*2/5, gridSize/20, 0, Math.PI * 2);
                ctx.fill();

                // 嘴巴
                ctx.beginPath();
                ctx.arc(corpse.x + gridSize/2, corpse.y + gridSize*3/5, gridSize/12, 0, Math.PI);
                ctx.fill();
            }
        });

        // 恢复上下文状态
        ctx.restore();
    }

    // 🍎 绘制教育性食物
    function drawFoods() {
        foods.forEach(food => {
            ctx.save();
            
            if (food.isBig) {
                // 绘制大奖励食物
                drawBigEducationalFood(food);
            } else {
                // 绘制普通教育食物
                drawEducationalFood(food);
            }
            
            ctx.restore();
        });
    }

    // 🍎 绘制普通教育食物
    function drawEducationalFood(food) {
        const centerX = food.x + gridSize / 2;
        const centerY = food.y + gridSize / 2;
        const radius = gridSize / 2 - 4;
        
        // 根据食物类型绘制不同的水果
        switch(food.educationType || 'apple') {
            case 'apple':
                drawApple(centerX, centerY, radius);
                break;
            case 'banana':
                drawBanana(centerX, centerY, radius);
                break;
            case 'orange':
                drawOrange(centerX, centerY, radius);
                break;
            case 'grapes':
                drawGrapes(centerX, centerY, radius);
                break;
            case 'candy':
                drawCandy(centerX, centerY, radius);
                break;
            default:
                drawApple(centerX, centerY, radius);
        }
        
        // 绘制数学题目（如果有）
        if (food.mathQuestion) {
            drawMathQuestion(food);
        }
        
        // 绘制分数标记
        if (food.value > 10) {
            ctx.fillStyle = '#FFD700';
            ctx.font = `bold ${gridSize/4}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.fillText(`+${food.value}`, centerX, food.y - gridSize/4);
        }
    }

    // 🍎 绘制苹果
    function drawApple(x, y, radius) {
        // 苹果身体
        ctx.fillStyle = '#FF6B6B';
        ctx.beginPath();
        ctx.arc(x, y, radius * 0.8, 0, Math.PI * 2);
        ctx.fill();
        
        // 苹果顶部凹陷
        ctx.fillStyle = '#FF4757';
        ctx.beginPath();
        ctx.arc(x - radius/3, y - radius/2, radius/4, 0, Math.PI * 2);
        ctx.arc(x + radius/3, y - radius/2, radius/4, 0, Math.PI * 2);
        ctx.fill();
        
        // 苹果柄
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(x - 2, y - radius, 4, radius/3);
        
        // 叶子
        ctx.fillStyle = '#2ECC71';
        ctx.beginPath();
        ctx.ellipse(x + radius/3, y - radius * 0.7, radius/4, radius/6, Math.PI/4, 0, Math.PI * 2);
        ctx.fill();
    }

    // 🍌 绘制香蕉
    function drawBanana(x, y, radius) {
        ctx.fillStyle = '#FFD93D';
        ctx.beginPath();
        ctx.arc(x - radius/4, y, radius/2, 0, Math.PI * 2);
        ctx.arc(x + radius/4, y, radius/2, 0, Math.PI * 2);
        ctx.arc(x, y - radius/3, radius/2, 0, Math.PI * 2);
        ctx.fill();
        
        // 香蕉纹理
        ctx.strokeStyle = '#F39C12';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x - radius/2, y - radius/4);
        ctx.lineTo(x + radius/2, y + radius/4);
        ctx.moveTo(x - radius/3, y + radius/3);
        ctx.lineTo(x + radius/3, y - radius/3);
        ctx.stroke();
    }

    // 🍊 绘制橙子
    function drawOrange(x, y, radius) {
        ctx.fillStyle = '#FF8C42';
        ctx.beginPath();
        ctx.arc(x, y, radius * 0.8, 0, Math.PI * 2);
        ctx.fill();
        
        // 橙子纹理
        ctx.strokeStyle = '#E67E22';
        ctx.lineWidth = 1;
        for (let i = 0; i < 8; i++) {
            const angle = (i * Math.PI * 2) / 8;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + Math.cos(angle) * radius * 0.6, y + Math.sin(angle) * radius * 0.6);
            ctx.stroke();
        }
    }

    // 🍇 绘制葡萄
    function drawGrapes(x, y, radius) {
        const grapeRadius = radius / 4;
        const colors = ['#9B59B6', '#8E44AD'];
        
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3 - row; col++) {
                const grapeX = x + (col - (2 - row) / 2) * grapeRadius;
                const grapeY = y - radius/2 + row * grapeRadius * 1.2;
                
                ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
                ctx.beginPath();
                ctx.arc(grapeX, grapeY, grapeRadius, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    // 🍭 绘制糖果
    function drawCandy(x, y, radius) {
        // 糖果身体
        ctx.fillStyle = '#E84393';
        ctx.beginPath();
        ctx.arc(x, y, radius * 0.7, 0, Math.PI * 2);
        ctx.fill();
        
        // 糖果条纹
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 3;
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.arc(x, y, radius * 0.7 - i * radius/4, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        // 糖果棒
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(x - 2, y + radius/2, 4, radius);
    }

    // 🍓 绘制大奖励食物
    function drawBigEducationalFood(food) {
        const bigFoodSize = gridSize * 2;
        const centerX = food.x + bigFoodSize / 2;
        const centerY = food.y + bigFoodSize / 2;
        
        // 绘制发光效果
        const glowGradient = ctx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, bigFoodSize
        );
        glowGradient.addColorStop(0, 'rgba(255, 215, 0, 0.8)');
        glowGradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
        
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, bigFoodSize / 2 + 10, 0, Math.PI * 2);
        ctx.fill();
        
        // 绘制大草莓
        ctx.fillStyle = '#FF6B6B';
        ctx.beginPath();
        // 草莓形状
        ctx.moveTo(centerX, centerY - bigFoodSize/3);
        ctx.quadraticCurveTo(centerX + bigFoodSize/3, centerY - bigFoodSize/4, centerX + bigFoodSize/4, centerY + bigFoodSize/3);
        ctx.quadraticCurveTo(centerX, centerY + bigFoodSize/2, centerX - bigFoodSize/4, centerY + bigFoodSize/3);
        ctx.quadraticCurveTo(centerX - bigFoodSize/3, centerY - bigFoodSize/4, centerX, centerY - bigFoodSize/3);
        ctx.fill();
        
        // 草莓叶子
        ctx.fillStyle = '#2ECC71';
        ctx.beginPath();
        ctx.moveTo(centerX - bigFoodSize/4, centerY - bigFoodSize/3);
        ctx.lineTo(centerX - bigFoodSize/6, centerY - bigFoodSize/2);
        ctx.lineTo(centerX + bigFoodSize/6, centerY - bigFoodSize/2);
        ctx.lineTo(centerX + bigFoodSize/4, centerY - bigFoodSize/3);
        ctx.fill();
        
        // 草莓种子
        ctx.fillStyle = '#FFF';
        for (let i = 0; i < 8; i++) {
            const seedX = centerX + (Math.random() - 0.5) * bigFoodSize/2;
            const seedY = centerY + (Math.random() - 0.5) * bigFoodSize/3;
            ctx.beginPath();
            ctx.arc(seedX, seedY, 2, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // 绘制大分数
        ctx.fillStyle = '#FFD700';
        ctx.font = `bold ${bigFoodSize/3}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`+${food.value}`, centerX, centerY + bigFoodSize/2 + 20);
    }

    // 📝 绘制数学题目
    function drawMathQuestion(food) {
        if (!food.mathQuestion) return;
        
        const centerX = food.x + gridSize / 2;
        
        // 绘制题目背景
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillRect(food.x - 5, food.y - gridSize/2 - 5, gridSize + 10, gridSize/3);
        
        // 绘制题目文字
        ctx.fillStyle = '#333';
        ctx.font = `bold ${gridSize/6}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(food.mathQuestion.question, centerX, food.y - gridSize/3);
    }
    
    // 颜色调亮辅助函数
    function lightenColor(color, percent) {
        let R = parseInt(color.substring(1, 3), 16);
        let G = parseInt(color.substring(3, 5), 16);
        let B = parseInt(color.substring(5, 7), 16);

        R = Math.floor(R * (100 + percent) / 100);
        G = Math.floor(G * (100 + percent) / 100);
        B = Math.floor(B * (100 + percent) / 100);

        R = (R < 255) ? R : 255;
        G = (G < 255) ? G : 255;
        B = (B < 255) ? B : 255;

        R = Math.round(R);
        G = Math.round(G);
        B = Math.round(B);

        const RR = ((R.toString(16).length === 1) ? "0" + R.toString(16) : R.toString(16));
        const GG = ((G.toString(16).length === 1) ? "0" + G.toString(16) : G.toString(16));
        const BB = ((B.toString(16).length === 1) ? "0" + B.toString(16) : B.toString(16));

        return `#${RR}${GG}${BB}`;
    }
    
    // 找到最近的玩家蛇段
    function findClosestPlayerSegment() {
        const head = snake2[0];
        let closestSegment = null;
        let minDistance = Infinity;

        // 检查玩家蛇的所有段
        snake1.forEach(segment => {
            const distance = Math.hypot(segment.x - head.x, segment.y - head.y);
            if (distance < minDistance) {
                minDistance = distance;
                closestSegment = segment;
            }
        });

        return closestSegment;
    }

    // 预测玩家的移动方向
    function predictPlayerDirection() {
        // 如果玩家蛇长度小于2，无法预测
        if (snake1.length < 2) return direction1;

        const head = snake1[0];
        const neck = snake1[1];

        // 根据头部和颈部的位置关系判断当前方向
        if (head.x > neck.x) return 'right';
        if (head.x < neck.x) return 'left';
        if (head.y > neck.y) return 'down';
        if (head.y < neck.y) return 'up';

        return direction1;
    }

    // 检测是否处于危险中
    function isInDanger() {
        const head = snake2[0];
        const playerDirection = predictPlayerDirection();
        const futurePlayerHead = {...snake1[0]};

        // 预测玩家下一步位置
        switch(playerDirection) {
            case 'up': futurePlayerHead.y -= gridSize; break;
            case 'down': futurePlayerHead.y += gridSize; break;
            case 'left': futurePlayerHead.x -= gridSize; break;
            case 'right': futurePlayerHead.x += gridSize; break;
        }

        // 检查玩家是否正在靠近
        const currentDistance = Math.hypot(head.x - snake1[0].x, head.y - snake1[0].y);
        const futureDistance = Math.hypot(head.x - futurePlayerHead.x, head.y - futurePlayerHead.y);

        return futureDistance < currentDistance - gridSize/2;
    }

    // AI获取方向
    function getAIDirection() {
        // 获取机器蛇头部位置
        const head = snake2[0];
        
        // 寻找最近的食物
        let closestFood = null;
        let minDistance = Infinity;
        
        foods.forEach(food => {
            const distance = Math.hypot(food.x - head.x, food.y - head.y);
            if (distance < minDistance) {
                minDistance = distance;
                closestFood = food;
            }
        });
        
        // 可能的移动方向
        const possibleDirections = ['up', 'down', 'left', 'right'];
        
        // 排除掉反向（不能直接回头）
        const oppositeDirection = {
            'up': 'down',
            'down': 'up',
            'left': 'right',
            'right': 'left'
        };
        
        const validDirections = possibleDirections.filter(dir => dir !== oppositeDirection[direction2]);
        
        // 高级AI逻辑 - 仅在困难难度下启用
        if (currentDifficulty === 'hard') {
            // 检测是否处于危险中
            if (isInDanger()) {
                // 寻找远离玩家的安全方向
                const closestPlayerSegment = findClosestPlayerSegment();
                if (closestPlayerSegment) {
                    // 计算远离玩家的方向优先级
                    const xDiff = head.x - closestPlayerSegment.x;
                    const yDiff = head.y - closestPlayerSegment.y;

                    let priorityDirections = [];

                    if (Math.abs(xDiff) > Math.abs(yDiff)) {
                        // 横向距离更大，优先左右移动
                        priorityDirections.push(xDiff > 0 ? 'right' : 'left');
                        priorityDirections.push(yDiff > 0 ? 'down' : 'up');
                    } else {
                        // 纵向距离更大，优先上下移动
                        priorityDirections.push(yDiff > 0 ? 'down' : 'up');
                        priorityDirections.push(xDiff > 0 ? 'right' : 'left');
                    }

                    // 检查远离玩家的方向是否安全
                    for (const dir of priorityDirections) {
                        if (validDirections.includes(dir) && isSafeMove(snake2, dir, snake1)) {
                            return dir;
                        }
                    }
                }
            } else {
                // 主动追杀玩家
                const closestPlayerSegment = findClosestPlayerSegment();
                if (closestPlayerSegment) {
                    // 预测玩家下一步位置
                    const playerDirection = predictPlayerDirection();
                    const futurePlayerHead = {...snake1[0]};
                    switch(playerDirection) {
                        case 'up': futurePlayerHead.y -= gridSize; break;
                        case 'down': futurePlayerHead.y += gridSize; break;
                        case 'left': futurePlayerHead.x -= gridSize; break;
                        case 'right': futurePlayerHead.x += gridSize; break;
                    }

                    // 计算向玩家移动的方向优先级
                    const xDiff = futurePlayerHead.x - head.x;
                    const yDiff = futurePlayerHead.y - head.y;

                    let priorityDirections = [];

                    if (Math.abs(xDiff) > Math.abs(yDiff)) {
                        // 横向距离更大，优先左右移动
                        priorityDirections.push(xDiff > 0 ? 'right' : 'left');
                        priorityDirections.push(yDiff > 0 ? 'down' : 'up');
                    } else {
                        // 纵向距离更大，优先上下移动
                        priorityDirections.push(yDiff > 0 ? 'down' : 'up');
                        priorityDirections.push(xDiff > 0 ? 'right' : 'left');
                    }

                    // 检查向玩家移动的方向是否安全
                    for (const dir of priorityDirections) {
                        if (validDirections.includes(dir) && isSafeMove(snake2, dir, snake1)) {
                            return dir;
                        }
                    }
                }
            }
        }

        // 优先向食物方向移动 (适用于所有难度)
        if (closestFood) {
            // 根据食物位置确定优先方向
            const xDiff = closestFood.x - head.x;
            const yDiff = closestFood.y - head.y;
            
            // 优先方向列表
            let priorityDirections = [];
            
            if (Math.abs(xDiff) > Math.abs(yDiff)) {
                // 横向距离更大，优先左右移动
                priorityDirections.push(xDiff > 0 ? 'right' : 'left');
                priorityDirections.push(yDiff > 0 ? 'down' : 'up');
            } else {
                // 纵向距离更大，优先上下移动
                priorityDirections.push(yDiff > 0 ? 'down' : 'up');
                priorityDirections.push(xDiff > 0 ? 'right' : 'left');
            }
            
            // 检查优先方向是否有效
            for (const dir of priorityDirections) {
                if (validDirections.includes(dir) && isSafeMove(snake2, dir, snake1)) {
                    return dir;
                }
            }
        }
        
        // 如果没有找到食物或无法直接到达，随机选择一个安全方向
        for (const dir of validDirections.sort(() => Math.random() - 0.5)) {
            if (isSafeMove(snake2, dir, snake1)) {
                return dir;
            }
        }
        
        // 如果所有方向都不安全，返回当前方向（可能导致碰撞，但这是最后的选择）
        return direction2;
    }
    
    // 检查移动是否安全
    function isSafeMove(snake, direction, otherSnake) {
        const head = {...snake[0]};
        
        // 计算新的头部位置
        switch(direction) {
            case 'up':
                head.y -= gridSize;
                break;
            case 'down':
                head.y += gridSize;
                break;
            case 'left':
                head.x -= gridSize;
                break;
            case 'right':
                head.x += gridSize;
                break;
        }
        
        // 检查是否碰到边界
        if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) {
            return false;
        }
        
        // 检查是否碰到自己
        for (let i = 0; i < snake.length; i++) {
            if (head.x === snake[i].x && head.y === snake[i].y) {
                return false;
            }
        }
        
        // 检查是否碰到玩家蛇
        for (let i = 0; i < otherSnake.length; i++) {
            if (head.x === otherSnake[i].x && head.y === otherSnake[i].y) {
                return false;
            }
        }
        
        return true;
    }
    
    // 检查碰撞
    function checkCollision(snake, otherSnake) {
        const head = {...snake[0]};
        
        // 检查是否碰到边界
        if (
            head.x < 0 || 
            head.x >= canvas.width || 
            head.y < 0 || 
            head.y >= canvas.height
        ) {
            return true;
        }
        
        // 检查是否碰到自己
        for (let i = 1; i < snake.length; i++) {
            if (head.x === snake[i].x && head.y === snake[i].y) {
                return true;
            }
        }
        
        // 检查是否碰到对方蛇身
        for (let segment of otherSnake) {
            if (head.x === segment.x && head.y === segment.y) {
                return true;
            }
        }
        
        return false;
    }
    
    // 检查尸体碰撞
    function checkCorpseCollision(head, player) {
        // 使用for循环而非forEach以便正确处理splice
        for (let i = 0; i < corpses.length; i++) {
            const corpse = corpses[i];
            // 如果蛇头与尸体重叠
            if (Math.abs(head.x - corpse.x) < gridSize && Math.abs(head.y - corpse.y) < gridSize) {
                // 移除尸体
                const removedCorpse = corpses.splice(i, 1)[0];
                // 减少循环索引以补偿splice
                i--;
                // 增加分数
                if (player === 1) {
                    score1 += 5;
                    score1Display.textContent = score1;
                } else {
                    score2 += 5;
                    score2Display.textContent = score2;
                }
                // 播放吃尸体音效
                const eatSound = document.getElementById('eatSound');
                if (eatSound) {
                    eatSound.currentTime = 0;
                    eatSound.play().catch(e => console.log("吃尸体音效播放失败:", e));
                }
                return true;
            }
        }
        return false;
    }

    // 🧮 检查教育性食物碰撞
    function checkFoodCollision(head, player) {
        for (let i = 0; i < foods.length; i++) {
            const food = foods[i];
            let collision = false;
            
            if (food.isBig) {
                // 检查是否吃到大方块的任何部分
                collision = head.x >= food.x && head.x < food.x + gridSize * 2 &&
                           head.y >= food.y && head.y < food.y + gridSize * 2;
            } else {
                collision = head.x === food.x && head.y === food.y;
            }
            
            if (collision) {
                // 如果食物有数学题，需要先回答
                if (food.needsMathAnswer && food.mathQuestion) {
                    // 存储当前食物信息，稍后处理
                    currentMathFood = { food, player, index: i };
                    showMathQuestionDialog(food.mathQuestion, player);
                    // 返回 mathPending 状态，让主循环知道这是数学题处理中
                    return { ate: false, isBig: false, mathPending: true };
                }
                
                const foodValue = food.value;
                foods.splice(i, 1);
                generateFood();

                // 增加对应玩家的分数
                if (player === 1) {
                    const scoreToAdd = food.isBig ? foodValue * 4 : foodValue;
                    score1 += scoreToAdd;
                    score1Display.textContent = score1;
                    
                    // 检查成就
                    checkAchievements(1);
                } else {
                    const scoreToAdd = food.isBig ? foodValue * 4 : foodValue;
                    score2 += scoreToAdd;
                    score2Display.textContent = score2;
                    
                    // 检查成就
                    checkAchievements(2);
                }

                // 播放吃食物的鼓励音效
                playEncouragementSound();

                return { ate: true, isBig: food.isBig };
            }
        }
        return { ate: false, isBig: false };
    }

    // 📝 显示数学题目对话框
    function showMathQuestionDialog(mathQuestion, player) {
        // 暂停游戏
        isGameActive = false;
        if (gameInterval) clearInterval(gameInterval);
        
        // 创建数学题目对话框
        const dialog = document.createElement('div');
        dialog.id = 'mathDialog';
        dialog.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50';
        dialog.innerHTML = `
            <div class="bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg p-8 max-w-md w-full mx-4 text-center shadow-2xl transform scale-95 transition-transform duration-300">
                <h3 class="text-2xl font-bold text-white mb-4">🧮 数学挑战！</h3>
                <div class="bg-white rounded-lg p-6 mb-6">
                    <p class="text-3xl font-bold text-gray-800 mb-4">${mathQuestion.question} = ?</p>
                    <input type="number" id="mathAnswer" class="w-full p-3 text-2xl text-center border-2 border-purple-300 rounded-lg focus:border-purple-500 focus:outline-none bg-green-50 text-green-800 placeholder-green-500" placeholder="输入答案">
                </div>
                <div class="flex space-x-4">
                    <button id="submitAnswer" class="flex-1 bg-green-500 text-white py-3 rounded-lg font-bold hover:bg-green-600 transition-colors">✓ 提交答案</button>
                    <button id="skipQuestion" class="flex-1 bg-orange-500 text-white py-3 rounded-lg font-bold hover:bg-orange-600 transition-colors">⏭ 跳过这题</button>
                </div>
                <p class="text-white text-sm mt-4">💡 提示：仔细计算，答对有额外奖励哦！跳过会失去这个食物~</p>
            </div>
        `;
        
        document.body.appendChild(dialog);
        
        // 添加动画效果
        setTimeout(() => {
            dialog.querySelector('.transform').style.transform = 'scale(1)';
        }, 10);
        
        // 聚焦到输入框
        const answerInput = dialog.querySelector('#mathAnswer');
        answerInput.focus();
        
        const submitBtn = dialog.querySelector('#submitAnswer');
        const skipBtn = dialog.querySelector('#skipQuestion');
        
        function cleanup() {
            console.log('清理数学题对话框');
            dialog.style.opacity = '0';
            setTimeout(() => {
                if (dialog.parentNode) {
                    document.body.removeChild(dialog);
                    console.log('数学题对话框已移除');
                }
            }, 300);
        }
        
        function handleMathResult(isCorrect, isSkipped = false) {
            console.log('数学题结果处理:', { isCorrect, isSkipped, currentMathFood });
            cleanup();
            
            if (currentMathFood) {
                const { food, player, index } = currentMathFood;
                
                if (isCorrect) {
                    // 回答正确，给予额外奖励
                    showEncouragementMessage("太棒了！数学小天才！");
                    food.value += 20; // 额外奖励
                    
                    // 处理食物碰撞 - 删除食物并给分数
                    processMathFoodCollision(food, player, index, true, true);
                } else {
                    // 回答错误或跳过 - 删除食物但处理方式不同
                    if (isSkipped) {
                        showEncouragementMessage("没关系，下次再试试数学题吧！");
                        // 跳过：删除食物，不给分数，不增加蛇长度
                        processMathFoodCollision(food, player, index, false, false);
                    } else {
                        showEncouragementMessage("答案不对哦，继续加油！");
                        // 答错：删除食物，给基础分数，不给额外奖励
                        processMathFoodCollision(food, player, index, false, true);
                    }
                }
                
                currentMathFood = null;
            }
            
            // 恢复游戏
            console.log('恢复游戏状态, isGameActive设置为true');
            isGameActive = true;
            if (gameInterval) clearInterval(gameInterval);
            gameInterval = setInterval(gameLoop, gameSpeed);
        }
        
        submitBtn.addEventListener('click', () => {
            const answer = parseInt(answerInput.value);
            const isCorrect = answer === mathQuestion.answer;
            handleMathResult(isCorrect, false); // 不是跳过，是提交答案
        });
        
        skipBtn.addEventListener('click', () => {
            handleMathResult(false, true); // 明确标记为跳过
        });
        
        // 回车键提交答案
        answerInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                submitBtn.click();
            }
        });
    }

    // 🍎 处理数学食物碰撞结果
    function processMathFoodCollision(food, player, index, isCorrect, shouldGiveScore) {
        // 减少数学题食物计数（如果是数学题食物）
        if (food.mathQuestion) {
            currentMathFoodCount = Math.max(0, currentMathFoodCount - 1);
            // 设置冷却时间
            setMathCooldown();
        }
        
        // 总是移除食物并生成新的，避免重复触发
        foods.splice(index, 1);
        generateFood();
        
        // 根据情况决定是否给分数和增加蛇长度
        if (shouldGiveScore) {
            const baseScore = food.isBig ? food.value * 4 : food.value;
            // 如果答对了，分数已经在之前增加了额外奖励
            const scoreToAdd = baseScore;
            
            if (player === 1) {
                score1 += scoreToAdd;
                score1Display.textContent = score1;
                checkAchievements(1);
                
                // 增加蛇长度（模拟吃到食物的效果）
                if (food.isBig) {
                    for (let i = 0; i < 3; i++) {
                        snake1.push({...snake1[snake1.length - 1]});
                    }
                } else {
                    snake1.push({...snake1[snake1.length - 1]});
                }
            } else {
                score2 += scoreToAdd;
                score2Display.textContent = score2;
                checkAchievements(2);
                
                // 增加蛇长度
                if (food.isBig) {
                    for (let i = 0; i < 3; i++) {
                        snake2.push({...snake2[snake2.length - 1]});
                    }
                } else {
                    snake2.push({...snake2[snake2.length - 1]});
                }
            }
            
            // 播放鼓励音效
            playEncouragementSound();
        }
        // 如果 shouldGiveScore 为 false（跳过情况），只删除食物，不给分数，不增加长度
    }

    // 🏆 创建成就展示面板
    function createAchievementsPanel() {
        const panel = document.createElement('div');
        panel.id = 'achievementsPanel';
        panel.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 hidden';
        panel.innerHTML = `
            <div class="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
                <h3 class="text-3xl font-bold mb-6 text-center text-white">🏆 成就系统</h3>
                
                <div id="achievementsList" class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <!-- 成就项目将被动态添加 -->
                </div>
                
                <div class="text-center">
                    <button id="closeAchievements" class="bg-white text-orange-500 px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition-colors">
                        关闭
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(panel);
        
        // 绑定关闭事件
        document.getElementById('closeAchievements').addEventListener('click', () => {
            panel.classList.add('hidden');
        });
        
        // 初始更新成就列表
        updateAchievementsList();
    }

    // 📋 更新成就列表显示
    function updateAchievementsList() {
        const achievementsList = document.getElementById('achievementsList');
        if (!achievementsList) return;
        
        achievementsList.innerHTML = '';
        
        achievementDefinitions.forEach(achievement => {
            const isEarned = achievements.includes(achievement.id);
            const achievementDiv = document.createElement('div');
            achievementDiv.className = `p-4 rounded-lg ${isEarned ? 'bg-green-100 border-2 border-green-400' : 'bg-gray-100 border-2 border-gray-300'} transition-all duration-300`;
            
            achievementDiv.innerHTML = `
                <div class="flex items-center">
                    <span class="text-3xl mr-3 ${isEarned ? '' : 'grayscale opacity-50'}">${achievement.icon}</span>
                    <div class="flex-1">
                        <h4 class="font-bold text-lg ${isEarned ? 'text-green-800' : 'text-gray-600'}">${achievement.name}</h4>
                        <p class="text-sm ${isEarned ? 'text-green-600' : 'text-gray-500'}">${achievement.desc}</p>
                        ${isEarned ? '<p class="text-xs text-green-500 font-bold mt-1">✓ 已获得</p>' : '<p class="text-xs text-gray-400 mt-1">未解锁</p>'}
                    </div>
                </div>
            `;
            
            achievementsList.appendChild(achievementDiv);
        });
        
        // 显示统计信息
        const statsDiv = document.createElement('div');
        statsDiv.className = 'col-span-1 md:col-span-2 bg-white rounded-lg p-4 text-center';
        statsDiv.innerHTML = `
            <h5 class="font-bold text-lg text-gray-800 mb-2">🎯 游戏统计</h5>
            <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                    <span class="block font-bold text-blue-600">已获得成就</span>
                    <span class="text-2xl font-bold text-blue-800">${achievements.length}</span>
                    <span class="text-gray-500">/ ${achievementDefinitions.length}</span>
                </div>
                <div>
                    <span class="block font-bold text-purple-600">完成度</span>
                    <span class="text-2xl font-bold text-purple-800">${Math.round((achievements.length / achievementDefinitions.length) * 100)}</span>
                    <span class="text-gray-500">%</span>
                </div>
            </div>
        `;
        
        achievementsList.appendChild(statsDiv);
    }

    // 🌟 优化的儿童提醒功能
    function startChildReminderTimer() {
        clearTimeout(childReminderTimer);
        reminderShown = false;

        // 使用家长设置的时间限制
        const reminderTime = parentalControls.maxPlayTime * 60 * 1000;
        
        childReminderTimer = setTimeout(() => {
            showChildReminder();
        }, reminderTime);
    }

    // 🎨 显示儿童提醒（优化版）
    function showChildReminder() {
        if (!isGameActive || reminderShown) return;

        reminderShown = true;

        // 创建更友好的提醒界面
        const reminderScreen = document.createElement('div');
        reminderScreen.id = 'childReminderScreen';
        reminderScreen.className = 'fixed inset-0 bg-gradient-to-br from-blue-400 to-purple-500 bg-opacity-95 flex flex-col items-center justify-center z-50 text-white';
        reminderScreen.innerHTML = `
            <div class="text-center max-w-md mx-4">
                <div class="text-6xl mb-4">👀</div>
                <h2 class="text-3xl font-bold mb-4">休息时间到啦！</h2>
                <p class="text-xl mb-6">小朋友，你已经玩了${parentalControls.maxPlayTime}分钟游戏啦！</p>
                <p class="text-lg mb-8">现在让眼睛休息一下，看看远处的绿色植物吧！🌱</p>
                
                <div class="space-y-4">
                    <button id="closeGameBtn" class="block w-full bg-red-500 text-white py-4 rounded-lg font-bold text-lg hover:bg-red-600 transition-colors">
                        🛑 我要休息了
                    </button>
                    <button id="playMoreBtn" class="block w-full bg-green-500 text-white py-4 rounded-lg font-bold text-lg hover:bg-green-600 transition-colors">
                        🎮 再玩10分钟
                    </button>
                </div>
                
                <p class="text-sm mt-6 opacity-75">💡 健康游戏提示：适度游戏益脑，沉迷游戏伤身！</p>
            </div>
        `;
        
        document.body.appendChild(reminderScreen);

        // 绑定按钮事件
        document.getElementById('closeGameBtn').addEventListener('click', () => {
            // 显示感谢信息然后关闭
            reminderScreen.innerHTML = `
                <div class="text-center">
                    <div class="text-6xl mb-4">🌟</div>
                    <h2 class="text-3xl font-bold mb-4">你真是个好孩子！</h2>
                    <p class="text-xl mb-4">记得多喝水，多休息哦！</p>
                    <p class="text-lg">下次再见！👋</p>
                </div>
            `;
            
            setTimeout(() => {
                window.close();
            }, 3000);
        });

        document.getElementById('playMoreBtn').addEventListener('click', () => {
            document.body.removeChild(reminderScreen);
            // 10分钟后再次提醒
            childReminderTimer = setTimeout(() => {
                showChildReminder();
            }, 10 * 60 * 1000);
        });
    }
    
    // 游戏主循环
    function gameLoop() {
        if (!isGameActive) return; // 如果游戏不活跃，立即退出循环
        // 清空画布
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 更新方向
        direction1 = nextDirection1;
        if (gameMode === 'multiplayer') {
            direction2 = nextDirection2;
        } else if (isAIMode) {
            // AI控制逻辑
            direction2 = getAIDirection();
            nextDirection2 = direction2;
        }
        
        // 移动玩家1的蛇
        const head1 = {x: snake1[0].x, y: snake1[0].y};
        switch(direction1) {
            case 'up':
                head1.y -= gridSize;
                break;
            case 'down':
                head1.y += gridSize;
                break;
            case 'left':
                head1.x -= gridSize;
                break;
            case 'right':
                head1.x += gridSize;
                break;
        }
        snake1.unshift(head1);
        
        // 移动玩家2的蛇 (在多人模式或AI模式下)
        let head2 = null;
        if (gameMode === 'multiplayer' || isAIMode) {
            head2 = {x: snake2[0].x, y: snake2[0].y};
            switch(direction2) {
                case 'up':
                    head2.y -= gridSize;
                    break;
                case 'down':
                    head2.y += gridSize;
                    break;
                case 'left':
                    head2.x -= gridSize;
                    break;
                case 'right':
                    head2.x += gridSize;
                    break;
            }
            // 确保玩家2的蛇头坐标与网格对齐
            head2.x = Math.round(head2.x / gridSize) * gridSize;
            head2.y = Math.round(head2.y / gridSize) * gridSize;
            snake2.unshift(head2);
        }
        
        // 检查是否吃到食物或尸体
        const result1 = checkFoodCollision(head1, 1);
        let ateCorpse1 = checkCorpseCollision(head1, 1);
        let result2 = { ate: false, isBig: false };
        let ateCorpse2 = false;
        if (gameMode === 'multiplayer' || isAIMode) {
            result2 = checkFoodCollision(head2, 2);
            ateCorpse2 = checkCorpseCollision(head2, 2);
        }
        
        // 根据是否吃到食物或尸体决定是否移除尾部
        if (!result1.ate && !ateCorpse1 && !result1.mathPending) {
            snake1.pop();
        } else if (result1.isBig && !result1.mathPending) {
            // 吃到大方块，增加4个长度（数学题处理中则跳过）
            for (let i = 0; i < 3; i++) {
                snake1.push({...snake1[snake1.length - 1]});
            }
        } else if (result1.ate && !result1.isBig && !result1.mathPending) {
            // 吃到普通食物，增加1个长度（数学题处理中则跳过）
            snake1.push({...snake1[snake1.length - 1]});
        } else if (ateCorpse1) {
            // 吃到尸体，增加1个长度
            snake1.push({...snake1[snake1.length - 1]});
        }
        
        if (gameMode === 'multiplayer' || isAIMode) {
            if (!result2.ate && !ateCorpse2 && !result2.mathPending) {
                snake2.pop();
            } else if (result2.isBig && !result2.mathPending) {
                // 吃到大方块，增加4个长度（数学题处理中则跳过）
                for (let i = 0; i < 3; i++) {
                    snake2.push({...snake2[snake2.length - 1]});
                }
            } else if (result2.ate && !result2.isBig && !result2.mathPending) {
                // 吃到普通食物，增加1个长度（数学题处理中则跳过）
                snake2.push({...snake2[snake2.length - 1]});
            } else if (ateCorpse2) {
                // 吃到尸体，增加1个长度
                snake2.push({...snake2[snake2.length - 1]});
            }
        }
        
        // 检查碰撞
        let collision1 = false;
        let collision2 = false;
        if (gameMode === 'singleplayer') {
            if (isAIMode) {
                // AI模式下，玩家蛇和机器蛇都检测与对方的碰撞
                collision1 = checkCollision(snake1, snake2);
                collision2 = checkCollision(snake2, snake1);
            } else {
                // 普通单人模式，只检测自身碰撞
                collision1 = checkCollision(snake1, []);
            }
        } else {
            collision1 = checkCollision(snake1, snake2);
            collision2 = checkCollision(snake2, snake1);
        }
        
        // 判断游戏结束
        if (gameMode === 'singleplayer') {
            if (collision1) {
                // 单人模式下玩家碰撞
                playDeathSound();
                respawnPlayer(1);
                // 确保在退出循环前完成所有绘制
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                drawSnakes();
                drawFoods();
                drawCorpses();
                return; // 立即退出循环
            } else if (isAIMode && collision2) {
                // AI模式下机器蛇碰撞
                playDeathSound();
                respawnPlayer(2);
                // 确保在退出循环前完成所有绘制
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                drawSnakes();
                drawFoods();
                drawCorpses();
                return; // 立即退出循环
            }
        } else {
            if (collision1 && collision2) {
                // 两人同时碰撞，都重生
                playDeathSound();
                respawnPlayer(1);
                respawnPlayer(2);
                // 确保在退出循环前完成所有绘制
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                drawSnakes();
                drawFoods();
                drawCorpses();
                return; // 立即退出循环
            } else if (collision1) {
                // 玩家1碰撞
                playDeathSound();
                respawnPlayer(1);
                // 确保在退出循环前完成所有绘制
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                drawSnakes();
                drawFoods();
                drawCorpses();
                return; // 立即退出循环
            } else if (collision2) {
                // 玩家2碰撞
                playDeathSound();
                respawnPlayer(2);
                // 确保在退出循环前完成所有绘制
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                drawSnakes();
                drawFoods();
                drawCorpses();
                return; // 立即退出循环
            }
        }
        
        // 绘制蛇、食物和尸体
        drawSnakes();
        drawFoods();
        drawCorpses();
    }
    
    // 重绘游戏（用于窗口大小改变时）
    function redrawGame() {
        // 重新计算网格大小
        const oldGridSize = gridSize;
        gridSize = Math.floor(canvas.width / 60);
        if (gridSize < 8) gridSize = 8;
        
        // 调整蛇的位置以适应新的网格大小
        if (oldGridSize && gridSize) {
            const scale = gridSize / oldGridSize;
            
            snake1 = snake1.map(segment => ({
                x: Math.round(segment.x * scale / gridSize) * gridSize,
                y: Math.round(segment.y * scale / gridSize) * gridSize
            }));
            
            snake2 = snake2.map(segment => ({
                x: Math.round(segment.x * scale / gridSize) * gridSize,
                y: Math.round(segment.y * scale / gridSize) * gridSize
            }));
            
            foods = foods.map(food => ({
                ...food,
                x: Math.round(food.x * scale / gridSize) * gridSize,
                y: Math.round(food.y * scale / gridSize) * gridSize
            }));
        }
        
        // 重绘
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawSnakes();
        drawFoods();
    }
    
    // 播放死亡音效
    function playDeathSound() {
        const deathSound = document.getElementById('deathSound');
        if (deathSound) {
            // 检查音效是否可以播放
            deathSound.addEventListener('canplaythrough', function playSound() {
                deathSound.currentTime = 0;
                deathSound.play().catch(e => console.log("死亡音效播放失败:", e));
                deathSound.removeEventListener('canplaythrough', playSound);
            }, false);
            // 如果已经可以播放，直接播放
            if (deathSound.readyState >= 4) {
                deathSound.currentTime = 0;
                deathSound.play().catch(e => console.log("死亡音效播放失败:", e));
            }
        } else {
            console.log("未找到死亡音效元素，请确保HTML中已添加id为'deathSound'的audio元素");
        }
    }

    // 游戏结束
    function endGame(winnerName, score, loser) {
        isGameActive = false;
        clearInterval(gameInterval);
        clearTimeout(childReminderTimer); // 清除儿童提醒计时器

        // 暂停背景音乐
        bgMusic.pause();

        // 播放死亡音效
        playDeathSound();


        // 根据游戏模式处理结束逻辑
        if (gameMode === 'singleplayer') {
            // 单人模式
        if (isAIMode) {
            // AI模式
            if (lives1 <= 0 && lives2 <= 0) {
                // 双方都没生命了，比较分数
                if (score1 > score2) {
                    winnerName = `${player1NameInput.value}获胜! 得分: ${score1}`;
                    score = `${score1}`;
                } else if (score2 > score1) {
                    winnerName = `AI获胜! 得分: ${score2}`;
                    score = `${score2}`;
                } else {
                    winnerName = '平局!';
                    score = `${score1}`;
                }
            } else if (lives1 <= 0) {
                winnerName = `AI获胜! 得分: ${score2}`;
                score = `${score2}`;
            } else if (lives2 <= 0) {
                winnerName = `${player1NameInput.value}获胜! 得分: ${score1}`;
                score = `${score1}`;
            } else if (winnerName === undefined) {
                // 重生情况
                winnerName = `${player1NameInput.value}重生!`;
                score = `${score1}`;
            }
        } else {
            // 普通单人模式
            if (lives1 <= 0) {
                winnerName = `游戏结束! 你的得分: ${score1}`;
                score = `${score1}`;
            } else if (winnerName === undefined) {
                // 重生情况
                winnerName = `${player1NameInput.value}重生!`;
                score = `${score1}`;
            }
        }
        } else {
            // 多人模式
            // 检查是否两个玩家都没有生命了
            if (lives1 <= 0 && lives2 <= 0) {
                // 比较分数决定胜负
                if (score1 > score2) {
                    winnerName = `${player1NameInput.value}获胜!`;
                    score = `${score1} - ${score2}`;
                } else if (score2 > score1) {
                    winnerName = `${player2NameInput.value}获胜!`;
                    score = `${score1} - ${score2}`;
                } else {
                    winnerName = '平局!';
                    score = `${score1} - ${score2}`;
                }
            }
        }

        // 显示胜利界面
        winnerNameDisplay.textContent = winnerName;
        finalScoreDisplay.textContent = score;
        winScreen.classList.remove('hidden');

        // 根据游戏模式和失败者显示相应的按钮
        respawn1Button.classList.add('hidden');
        respawn2Button.classList.add('hidden');
        restartButton.classList.add('hidden');
        respawn1Button.classList.remove('mr-4');
        respawn2Button.classList.remove('mr-4');
        restartButton.classList.remove('mr-4');

        if (gameMode === 'singleplayer') {
            if (loser === 1 && lives1 > 0) {
                // 单人模式下玩家1还有生命，显示重生按钮
                respawn1Button.classList.remove('hidden');
                respawn1Button.classList.add('mr-4');
            } else {
                // 游戏结束，显示再来一局按钮
                restartButton.classList.remove('hidden');
                restartButton.classList.add('mr-4');
            }
        } else {
            // 多人模式
            if (loser === 1 && lives1 > 0) {
                // 玩家1还有生命，显示重生按钮
                respawn1Button.classList.remove('hidden');
                respawn1Button.classList.add('mr-4');
            } else if (loser === 2 && lives2 > 0) {
                // 玩家2还有生命，显示重生按钮
                respawn2Button.classList.remove('hidden');
                respawn2Button.classList.add('mr-4');
            } else {
                // 游戏结束或平局，显示再来一局按钮
                restartButton.classList.remove('hidden');
                restartButton.classList.add('mr-4');
            }
        }

        // 播放胜利音乐和效果（只播放一次）
        playWinEffects();
    }
    
    // 胜利效果
    function playWinEffects() {
        // 播放胜利音乐（只播放一次）
        winMusic.volume = 0.5;
        winMusic.play().catch(e => console.log("胜利音乐播放失败:", e));
        
        // 创建庆祝彩屑
        createConfetti();
    }
    
    // 创建彩屑效果
    function createConfetti() {
        const container = document.querySelector('#winScreen');
        const colors = ['#4F46E5', '#6366F1', '#EC4899', '#F472B6', '#FFD700', '#4ADE80', '#60A5FA'];
        
        for (let i = 0; i < 200; i++) {
            const confetti = document.createElement('div');
            confetti.classList.add('confetti');
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.left = `${Math.random() * 100}%`;
            confetti.style.top = `-${Math.random() * 20 + 10}px`;
            confetti.style.width = `${Math.random() * 10 + 5}px`;
            confetti.style.height = `${Math.random() * 10 + 5}px`;
            confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
            container.appendChild(confetti);
            
            // 动画
            setTimeout(() => {
                confetti.style.transition = `all ${Math.random() * 3 + 2}s ease`;
                confetti.style.transform = `translateY(${container.clientHeight + 20}px) rotate(${Math.random() * 360}deg)`;
                confetti.style.opacity = '1';
                
                // 动画结束后移除
                setTimeout(() => confetti.remove(), 5000);
            }, 100 * i / 10);
        }
    }
    
    // 停止彩屑效果
    function stopConfetti() {
        const confetti = document.querySelectorAll('.confetti');
        confetti.forEach(c => c.remove());
    }
    
    // 游戏暂停状态
    let isPaused = false;
    
    // 键盘控制
    document.addEventListener('keydown', (e) => {
        // 游戏暂停时只响应空格键和Enter键
        if (isPaused) {
            if (e.key === ' ') {
                // 再次按空格键恢复游戏
                isPaused = false;
                gameInterval = setInterval(gameLoop, gameSpeed);
                pauseScreen.classList.add('hidden');
                return;
            }
            return;
        }
        
        if (!isGameActive) {
            if (e.key === 'Enter') {
                // 游戏结束时按Enter键触发再来一局
                if (restartButton && !restartButton.classList.contains('hidden')) {
                    restartButton.click();
                }
            }
            return;
        }
        
        // 防止游戏过程中滚动页面
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd', 'W', 'A', 'S', 'D', ' '].includes(e.key)) {
            e.preventDefault();
        }
        
        // 空格键暂停游戏
        if (e.key === ' ') {
            isPaused = true;
            clearInterval(gameInterval);
            // 创建并显示暂停界面
            if (!pauseScreen) {
                pauseScreen = document.createElement('div');
                pauseScreen.id = 'pauseScreen';
                pauseScreen.className = 'fixed inset-0 bg-black bg-opacity-75 flex flex-col items-center justify-center z-50';
                pauseScreen.innerHTML = `
                    <h2 class="text-white text-4xl mb-8">游戏暂停</h2>
                    <p class="text-white text-xl mb-8">按空格键继续游戏</p>
                `;
                document.body.appendChild(pauseScreen);
            } else {
                pauseScreen.classList.remove('hidden');
            }
            return;
        }
        
        // 玩家1控制 (WASD)
        switch(e.key.toLowerCase()) {
            case 'w':
                if (direction1 !== 'down') {
                    nextDirection1 = 'up';
                }
                break;
            case 's':
                if (direction1 !== 'up') {
                    nextDirection1 = 'down';
                }
                break;
            case 'a':
                if (direction1 !== 'right') {
                    nextDirection1 = 'left';
                }
                break;
            case 'd':
                if (direction1 !== 'left') {
                    nextDirection1 = 'right';
                }
                break;
        }
        
        // 玩家2控制 (方向键)
        switch(e.key) {
            case 'ArrowUp':
                if (direction2 !== 'down') {
                    nextDirection2 = 'up';
                }
                break;
            case 'ArrowDown':
                if (direction2 !== 'up') {
                    nextDirection2 = 'down';
                }
                break;
            case 'ArrowLeft':
                if (direction2 !== 'right') {
                    nextDirection2 = 'left';
                }
                break;
            case 'ArrowRight':
                if (direction2 !== 'left') {
                    nextDirection2 = 'right';
                }
                break;
        }
    });
    
    // 按钮事件
    startButton.addEventListener('click', initGame);
    restartButton.addEventListener('click', () => {
        // 直接重新启动游戏
        initGame();
    });

    // 游戏模式变量已在前面定义
    // let gameMode = 'multi'; // 默认双人模式
    // let isAIMode = false; // AI模式标志

    // 确保DOM加载完成后再初始化游戏
    window.addEventListener('DOMContentLoaded', () => {
        console.log('DOM加载完成，开始初始化游戏');

        // 获取模式选择界面和按钮
        const modeScreen = document.getElementById('modeScreen');
        const modeButtons = document.querySelectorAll('.mode-btn');

        // 模式选择按钮事件
        const bindModeButtons = () => {
            console.log('开始绑定模式选择按钮事件');
            console.log('找到的模式按钮数量:', modeButtons.length);

            if (modeButtons.length === 0) {
                // 如果没找到按钮，100ms后重试
                setTimeout(bindModeButtons, 100);
                return;
            }

            modeButtons.forEach(btn => {
                console.log('绑定模式按钮:', btn.dataset.mode);
                btn.addEventListener('click', () => {
                    // 确保游戏模式值与游戏逻辑中使用的值匹配
                    if (btn.dataset.mode === 'multi') {
                        gameMode = 'multiplayer';
                    } else {
                        gameMode = btn.dataset.mode;
                    }
                    console.log('选择游戏模式:', gameMode);

                    // 更新游戏标题
                    const gameTitle = document.querySelector('header h1');
                    if (gameTitle) {
                        if (gameMode === 'singleplayer') {
                            gameTitle.textContent = '贪吃蛇单人挑战模式';
                        } else {
                            gameTitle.textContent = '贪吃蛇双人对战模式';
                        }
                        console.log('已更新游戏标题');
                    }

                    // 隐藏模式选择界面
                    if (modeScreen) {
                        modeScreen.classList.add('hidden');
                        console.log('模式选择界面已隐藏');
                    }

                    // 根据模式调整游戏设置
                        if (gameMode === 'singleplayer') {
                            // 单人模式设置
                            document.getElementById('player2Name').parentElement.style.display = 'none';
                            isAIMode = true; // 单人模式下启用AI
                            console.log('已切换到单人AI模式');
                        } else {
                            // 双人模式设置
                            document.getElementById('player2Name').parentElement.style.display = 'flex';
                            isAIMode = false; // 双人模式下禁用AI
                            console.log('已切换到双人模式');
                        }

                    // 调用initGame并显示难度选择界面
            initGame(true);
                });
            });
        };



        // 定义bindDifficultyButtons函数
        function bindDifficultyButtons() {
            console.log('开始绑定难度选择按钮事件');
            const difficultyButtons = document.querySelectorAll('.difficulty-btn');
            console.log('找到的难度按钮数量:', difficultyButtons.length);
            
            if (difficultyButtons.length === 0) {
                // 如果没找到按钮，100ms后重试
                setTimeout(bindDifficultyButtons, 100);
                return;
            }
            
            difficultyButtons.forEach(btn => {
                console.log('绑定按钮:', btn.dataset.difficulty);
                btn.addEventListener('click', () => {
                    const difficulty = btn.dataset.difficulty;
                    console.log('选择难度:', difficulty);
                    setDifficulty(difficulty);
                    
                    // 隐藏难度选择界面
                    if (difficultyScreen) {
                        difficultyScreen.classList.add('hidden');
                        console.log('难度选择界面已隐藏');
                    }
                    
                    // 确保游戏状态为激活
                    isGameActive = true;
                    
                    // 开始游戏循环
        if (gameInterval) clearInterval(gameInterval);
        gameInterval = setInterval(gameLoop, gameSpeed);
        console.log('游戏循环已启动，速度:', gameSpeed);

        // 启动儿童提醒计时器
        startChildReminderTimer();
                });
            });
        }

        // 开始绑定模式按钮
        bindModeButtons();
        // 开始绑定难度按钮
        bindDifficultyButtons();
        
        // 🎮 初始化儿童友好功能
        createParentalControlsPanel();
        createAchievementsPanel();
        
        // 绑定家长控制和成就按钮
        document.getElementById('parentalControlsBtn').addEventListener('click', () => {
            document.getElementById('parentalControlsPanel').classList.remove('hidden');
        });
        
        document.getElementById('achievementsBtn').addEventListener('click', () => {
            document.getElementById('achievementsPanel').classList.remove('hidden');
        });

        // 重生按钮事件
        respawn1Button.addEventListener('click', () => {
            respawnPlayer(1);
        });
        respawn2Button.addEventListener('click', () => {
            respawnPlayer(2);
        });

        // 游戏将由模式选择后初始化
        // initGame(false);
    });

    // 初始化显示难度选择界面
    // (已合并到上面的window.addEventListener('load')中)
});