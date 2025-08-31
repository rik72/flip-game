class LevelEditor {
    constructor() {
        this.currentLevel = 1;
        this.gridWidth = 6;
        this.gridHeight = 6;
        this.selectedNodeType = '__';
        this.selectedBallIndex = -1;
        this.balls = [];
        this.board = {
            front: [],
            rear: []
        };
        this.positioningMode = null; // 'start' or 'end' or null
        this.positioningBallIndex = -1;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.generateGrid();
        this.createNewLevel();
        this.updateToolbarColors();
        this.updateAddBallButton();
    }
    
    setupEventListeners() {
        // Node type selection
        document.querySelectorAll('.node-tool').forEach(tool => {
            tool.addEventListener('click', (e) => {
                document.querySelectorAll('.node-tool').forEach(t => t.classList.remove('selected'));
                tool.classList.add('selected');
                this.selectedNodeType = tool.dataset.type;
            });
        });
        
        // Grid size controls
        document.getElementById('gridWidth').addEventListener('change', (e) => {
            const newWidth = parseInt(e.target.value);
            const oldWidth = this.gridWidth;
            
            this.gridWidth = newWidth;
            this.generateGrid();
        });
        
        document.getElementById('gridHeight').addEventListener('change', (e) => {
            const newHeight = parseInt(e.target.value);
            const oldHeight = this.gridHeight;
            
            this.gridHeight = newHeight;
            this.generateGrid();
        });
        
        // Level number
        document.getElementById('levelNumber').addEventListener('change', (e) => {
            this.currentLevel = parseInt(e.target.value);
        });
        

        
        // Drag and drop for node tools
        document.querySelectorAll('.node-tool').forEach(tool => {
            tool.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', tool.dataset.type);
            });
        });
        

    }
    
    generateGrid() {
        const frontBoard = document.getElementById('frontBoard');
        const rearBoard = document.getElementById('rearBoard');
        
        // Store current board data before clearing
        const oldFrontBoard = [...(this.board.front || [])];
        const oldRearBoard = [...(this.board.rear || [])];
        const oldGridWidth = oldFrontBoard.length > 0 ? oldFrontBoard[0].length : this.gridWidth;
        const oldGridHeight = oldFrontBoard.length;
        
        frontBoard.innerHTML = '';
        rearBoard.innerHTML = '';
        
        frontBoard.style.gridTemplateColumns = `repeat(${this.gridWidth}, 30px)`;
        rearBoard.style.gridTemplateColumns = `repeat(${this.gridWidth}, 30px)`;
        
        // Initialize new board arrays
        this.board.front = [];
        this.board.rear = [];
        
        for (let row = 0; row < this.gridHeight; row++) {
            this.board.front[row] = new Array(this.gridWidth).fill('__');
            this.board.rear[row] = new Array(this.gridWidth).fill('__');
            
            for (let col = 0; col < this.gridWidth; col++) {
                const frontCell = this.createGridCell(row, col, 'front');
                const rearCell = this.createGridCell(row, col, 'rear');
                
                frontBoard.appendChild(frontCell);
                rearBoard.appendChild(rearCell);
            }
        }
        
        // Restore data from old board
        this.restoreBoardData(oldFrontBoard, oldRearBoard, oldGridWidth, oldGridHeight);
    }
    
    restoreBoardData(oldFront, oldRear, oldWidth, oldHeight) {
        // Copy front face data
        for (let row = 0; row < Math.min(oldHeight, this.gridHeight); row++) {
            if (oldFront[row]) {
                const oldRow = oldFront[row];
                
                // Handle both string format (space-separated) and array format
                let oldCells;
                if (typeof oldRow === 'string') {
                    // Parse space-separated format
                    oldCells = oldRow.split(' ');
                } else if (Array.isArray(oldRow)) {
                    // Already in array format
                    oldCells = oldRow;
                } else {
                    continue;
                }
                
                for (let col = 0; col < Math.min(oldCells.length, this.gridWidth); col++) {
                    if (oldCells[col] && oldCells[col] !== '__') {
                        this.board.front[row][col] = oldCells[col];
                    }
                }
            }
        }
        
        // Copy rear face data
        for (let row = 0; row < Math.min(oldHeight, this.gridHeight); row++) {
            if (oldRear[row]) {
                const oldRow = oldRear[row];
                
                // Handle both string format (space-separated) and array format
                let oldCells;
                if (typeof oldRow === 'string') {
                    // Parse space-separated format
                    oldCells = oldRow.split(' ');
                } else if (Array.isArray(oldRow)) {
                    // Already in array format
                    oldCells = oldRow;
                } else {
                    continue;
                }
                
                for (let col = 0; col < Math.min(oldCells.length, this.gridWidth); col++) {
                    if (oldCells[col] && oldCells[col] !== '__') {
                        this.board.rear[row][col] = oldCells[col];
                    }
                }
            }
        }
        
        // Update ball positions if they're outside the new grid
        this.validateBallPositions();
        
        // Update visual representation
        this.updateGridVisuals();
        
        // Update all border colors
        this.updateAllBorderColors();
    }
    

    
    validateBallPositions() {
        this.balls.forEach((ball, index) => {
            // Check start position
            // Use consistent coordinate system: front = [col, row], rear = [-col, -row]
            const startRow = ball.start[1] < 0 ? -ball.start[1] : ball.start[1];
            const startCol = ball.start[0] < 0 ? -ball.start[0] : ball.start[0];
            
            if (startRow >= this.gridHeight || startCol >= this.gridWidth) {
                // Reset to safe position
                ball.start = [0, 0];
                console.warn(`Ball ${index + 1} start position was outside grid, reset to (0, 0)`);
            }
            
            // Check end position
            const endRow = ball.end[1] < 0 ? -ball.end[1] : ball.end[1];
            const endCol = ball.end[0] < 0 ? -ball.end[0] : ball.end[0];
            
            if (endRow >= this.gridHeight || endCol >= this.gridWidth) {
                // Reset to safe position
                ball.end = [this.gridWidth - 1, this.gridHeight - 1];
                console.warn(`Ball ${index + 1} end position was outside grid, reset to (${this.gridWidth - 1}, ${this.gridHeight - 1})`);
            }
        });
    }
    
    createGridCell(row, col, face) {
        const cell = document.createElement('div');
        cell.className = 'grid-cell';
        cell.dataset.row = row;
        cell.dataset.col = col;
        cell.dataset.face = face;
        
        // Click to place node or set ball position
        cell.addEventListener('click', (e) => {
            if (this.positioningMode) {
                this.setBallPosition(row, col, face);
            } else {
                this.placeNode(row, col, face);
            }
        });
        
        // Drag and drop
        cell.addEventListener('dragover', (e) => {
            e.preventDefault();
            cell.classList.add('dragover');
        });
        
        cell.addEventListener('dragleave', (e) => {
            cell.classList.remove('dragover');
        });
        
        cell.addEventListener('drop', (e) => {
            e.preventDefault();
            cell.classList.remove('dragover');
            const nodeType = e.dataTransfer.getData('text/plain');
            this.placeNode(row, col, face, nodeType);
        });
        
        return cell;
    }
    
    placeNode(row, col, face, nodeType = null) {
        const type = nodeType || this.selectedNodeType;
        const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"][data-face="${face}"]`);
        
        if (!cell) return;
        
        // Update the board data
        if (!this.board[face][row]) {
            this.board[face][row] = new Array(this.gridWidth).fill('__');
        }
        
        // Check if the cell already contains the same node type
        const currentType = this.board[face][row][col] || '__';
        if (currentType === type) {
            // If same type is selected, clear the cell
            this.board[face][row][col] = '__';
        } else {
            // Otherwise, place the new node type
            this.board[face][row][col] = type;
        }
        
        // Update the visual representation
        this.updateCellVisual(cell, this.board[face][row][col]);
        
        // Update the border color of the horizontally reflected cell in the other face
        const otherFace = face === 'front' ? 'rear' : 'front';
        const reflectedCol = this.gridWidth - 1 - col;
        const otherCell = document.querySelector(`[data-row="${row}"][data-col="${reflectedCol}"][data-face="${otherFace}"]`);
        if (otherCell) {
            this.updateCellBorderColor(otherCell);
        }
    }
    
    updateCellVisual(cell, nodeType) {
        cell.innerHTML = '';
        
        const nodeDiv = document.createElement('div');
        nodeDiv.className = 'node-type';
        
        // Only show text if it's not an empty cell
        if (nodeType !== '__') {
            nodeDiv.textContent = nodeType;
        }
        
        // Apply color based on node type
        const colors = CONSTANTS.LEVEL_CONFIG.NODE_COLORS;
        if (colors[nodeType]) {
            nodeDiv.style.backgroundColor = colors[nodeType];
            nodeDiv.style.color = this.getContrastColor(colors[nodeType]);
        }
        
        cell.appendChild(nodeDiv);
        
        // Add ball position indicators
        this.addBallPositionIndicators(cell);
        
        // Set border color based on corresponding cell in other face
        this.updateCellBorderColor(cell);
    }
    
    getContrastColor(hexColor) {
        // Simple contrast calculation
        const r = parseInt(hexColor.slice(1, 3), 16);
        const g = parseInt(hexColor.slice(3, 5), 16);
        const b = parseInt(hexColor.slice(5, 7), 16);
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        return brightness > 128 ? '#000000' : '#ffffff';
    }
    
    updateCellBorderColor(cell) {
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        const face = cell.dataset.face;
        const otherFace = face === 'front' ? 'rear' : 'front';
        
        // Calculate the horizontally reflected position in the other face
        const reflectedCol = this.gridWidth - 1 - col;
        
        // Get the node type from the other face at the reflected position
        let otherNodeType = '__';
        if (this.board[otherFace] && this.board[otherFace][row]) {
            otherNodeType = this.board[otherFace][row][reflectedCol] || '__';
        }
        
        // Get the color for the other face's node type
        const colors = CONSTANTS.LEVEL_CONFIG.NODE_COLORS;
        const borderColor = otherNodeType === '__' ? '#222' : (colors[otherNodeType] || '#777');
        
        // Apply the border color
        cell.style.borderColor = borderColor;
        
        // Make the border slightly thicker when there's content in the other face
        if (otherNodeType !== '__') {
            cell.style.borderWidth = '2px';
        } else {
            cell.style.borderWidth = '1px';
        }
    }
    
    updateAllBorderColors() {
        // Update border colors for all cells
        for (let row = 0; row < this.gridHeight; row++) {
            for (let col = 0; col < this.gridWidth; col++) {
                const frontCell = document.querySelector(`[data-row="${row}"][data-col="${col}"][data-face="front"]`);
                const rearCell = document.querySelector(`[data-row="${row}"][data-col="${col}"][data-face="rear"]`);
                
                if (frontCell) {
                    this.updateCellBorderColor(frontCell);
                }
                if (rearCell) {
                    this.updateCellBorderColor(rearCell);
                }
            }
        }
    }
    
    updateToolbarColors() {
        // Apply colors to toolbar node previews using the same constants
        document.querySelectorAll('.node-tool').forEach(tool => {
            const nodeType = tool.dataset.type;
            const preview = tool.querySelector('.node-preview');
            
            if (preview && CONSTANTS.LEVEL_CONFIG.NODE_COLORS[nodeType]) {
                const color = CONSTANTS.LEVEL_CONFIG.NODE_COLORS[nodeType];
                preview.style.backgroundColor = color;
                preview.style.color = this.getContrastColor(color);
            }
        });
    }
    
    addBallPositionIndicators(cell) {
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        const face = cell.dataset.face;
        
        // Check if this cell is a start or end position for any ball
        this.balls.forEach((ball, ballIndex) => {
            const ballColor = CONSTANTS.LEVEL_CONFIG.BALL_COLORS[ball.color] || '#fff';
            
            // Check start position
            // Use consistent coordinate system: front = [col, row], rear = [-col, -row]
            const startRow = ball.start[1] < 0 ? -ball.start[1] : ball.start[1];
            const startCol = ball.start[0] < 0 ? -ball.start[0] : ball.start[0];
            const startFace = ball.start[0] < 0 || ball.start[1] < 0 ? 'rear' : 'front';
            if (row === startRow && col === startCol && face === startFace) {
                const indicator = document.createElement('div');
                indicator.className = 'node-indicator start';
                indicator.innerHTML = '<i class="bi bi-arrow-down"></i>';
                indicator.style.backgroundColor = ballColor;
                indicator.style.color = this.getContrastColor(ballColor);
                cell.appendChild(indicator);
            }
            
            // Check end positions (handle both legacy single and new multiple)
            let endPositions = Array.isArray(ball.end[0]) ? ball.end : [ball.end];
            
            endPositions.forEach((endPos, endIndex) => {
                const endRow = endPos[1] < 0 ? -endPos[1] : endPos[1];
                const endCol = endPos[0] < 0 ? -endPos[0] : endPos[0];
                const endFace = endPos[0] < 0 || endPos[1] < 0 ? 'rear' : 'front';
                
                if (row === endRow && col === endCol && face === endFace) {
                    const indicator = document.createElement('div');
                    indicator.className = 'node-indicator end';
                    indicator.innerHTML = '<i class="bi bi-arrow-up"></i>';
                    indicator.style.backgroundColor = ballColor;
                    indicator.style.color = this.getContrastColor(ballColor);
                    cell.appendChild(indicator);
                }
            });
        });
    }
    
    createNewLevel() {
        this.board = {
            front: [],
            rear: []
        };
        
        // Initialize empty boards
        for (let row = 0; row < this.gridHeight; row++) {
            this.board.front[row] = new Array(this.gridWidth).fill('__');
            this.board.rear[row] = new Array(this.gridWidth).fill('__');
        }
        
        this.balls = [];
        this.updateBallsList();
        this.updateGridVisuals();
        this.updateAllBorderColors();
    }
    
    updateGridVisuals() {
        // Update front face
        for (let row = 0; row < this.gridHeight; row++) {
            for (let col = 0; col < this.gridWidth; col++) {
                const frontCell = document.querySelector(`[data-row="${row}"][data-col="${col}"][data-face="front"]`);
                const rearCell = document.querySelector(`[data-row="${row}"][data-col="${col}"][data-face="rear"]`);
                
                if (frontCell && this.board.front[row]) {
                    const nodeType = this.board.front[row][col] || '__';
                    this.updateCellVisual(frontCell, nodeType);
                }
                
                if (rearCell && this.board.rear[row]) {
                    const nodeType = this.board.rear[row][col] || '__';
                    this.updateCellVisual(rearCell, nodeType);
                }
            }
        }
    }
    
    addBall() {
        // Check if we've reached the maximum number of balls
        if (this.balls.length >= CONSTANTS.GAME_CONFIG.MAX_BALLS) {
            alert(`Maximum number of balls (${CONSTANTS.GAME_CONFIG.MAX_BALLS}) reached. Remove a ball first to add a new one.`);
            return;
        }
        
        // Find available positions that don't conflict with existing balls
        const availablePositions = this.findAvailablePositions();
        
        // Find available colors that aren't already used
        const availableColor = this.findAvailableColor();
        
        const ball = {
            start: availablePositions.start,
            end: [availablePositions.end], // Array of end positions
            color: availableColor
        };
        
        this.balls.push(ball);
        this.updateBallsList();
        this.updateGridVisuals();
    }
    
    findAvailableColor() {
        // Get all colors currently used by existing balls
        const usedColors = new Set();
        this.balls.forEach(ball => {
            usedColors.add(ball.color);
        });
        
        // Get all available colors from constants
        const allColors = Object.keys(CONSTANTS.LEVEL_CONFIG.BALL_COLORS);
        
        // Filter out used colors
        const availableColors = allColors.filter(color => !usedColors.has(color));
        
        // If no colors are available (shouldn't happen with current MAX_BALLS=2), fallback to red
        if (availableColors.length === 0) {
            return 'red';
        }
        
        // Choose a random color from available ones
        const randomIndex = Math.floor(Math.random() * availableColors.length);
        return availableColors[randomIndex];
    }
    
    findAvailablePositions() {
        // Get all occupied positions from existing balls
        const occupiedPositions = new Set();
        
        this.balls.forEach(ball => {
            // Add start position
            const startKey = `${ball.start[0]},${ball.start[1]}`;
            occupiedPositions.add(startKey);
            
            // Add end positions (handle both legacy single and new multiple)
            let endPositions = Array.isArray(ball.end[0]) ? ball.end : [ball.end];
            endPositions.forEach(endPos => {
                const endKey = `${endPos[0]},${endPos[1]}`;
                occupiedPositions.add(endKey);
            });
        });
        
        // Try to find available start and end positions
        let startPos = [0, 0];
        let endPos = [this.gridWidth - 1, this.gridHeight - 1];
        
        // Try different start positions
        const startCandidates = [
            [0, 0], // Top-left
            [this.gridWidth - 1, 0], // Top-right
            [0, this.gridHeight - 1], // Bottom-left
            [this.gridWidth - 1, this.gridHeight - 1], // Bottom-right
            [Math.floor(this.gridWidth / 2), 0], // Top-center
            [0, Math.floor(this.gridHeight / 2)], // Left-center
            [this.gridWidth - 1, Math.floor(this.gridHeight / 2)], // Right-center
            [Math.floor(this.gridWidth / 2), this.gridHeight - 1] // Bottom-center
        ];
        
        for (const candidate of startCandidates) {
            const key = `${candidate[0]},${candidate[1]}`;
            if (!occupiedPositions.has(key)) {
                startPos = candidate;
                break;
            }
        }
        
        // Try different end positions (opposite to start when possible)
        const endCandidates = [
            [this.gridWidth - 1, this.gridHeight - 1], // Bottom-right
            [0, this.gridHeight - 1], // Bottom-left
            [this.gridWidth - 1, 0], // Top-right
            [0, 0], // Top-left
            [Math.floor(this.gridWidth / 2), this.gridHeight - 1], // Bottom-center
            [this.gridWidth - 1, Math.floor(this.gridHeight / 2)], // Right-center
            [0, Math.floor(this.gridHeight / 2)], // Left-center
            [Math.floor(this.gridWidth / 2), 0] // Top-center
        ];
        
        for (const candidate of endCandidates) {
            const key = `${candidate[0]},${candidate[1]}`;
            if (!occupiedPositions.has(key)) {
                endPos = candidate;
                break;
            }
        }
        
        // If we still can't find available positions, try any free position
        if (occupiedPositions.has(`${startPos[0]},${startPos[1]}`)) {
            // Find any available position for start
            for (let row = 0; row < this.gridHeight; row++) {
                for (let col = 0; col < this.gridWidth; col++) {
                    const key = `${col},${row}`;
                    if (!occupiedPositions.has(key)) {
                        startPos = [col, row];
                        break;
                    }
                }
                if (!occupiedPositions.has(`${startPos[0]},${startPos[1]}`)) {
                    break;
                }
            }
        }
        
        if (occupiedPositions.has(`${endPos[0]},${endPos[1]}`)) {
            // Find any available position for end
            for (let row = this.gridHeight - 1; row >= 0; row--) {
                for (let col = this.gridWidth - 1; col >= 0; col--) {
                    const key = `${col},${row}`;
                    if (!occupiedPositions.has(key)) {
                        endPos = [col, row];
                        break;
                    }
                }
                if (!occupiedPositions.has(`${endPos[0]},${endPos[1]}`)) {
                    break;
                }
            }
        }
        
        return { start: startPos, end: endPos };
    }
    
    updateBallsList() {
        const ballsList = document.getElementById('ballsList');
        ballsList.innerHTML = '';
        
        this.balls.forEach((ball, index) => {
            const ballItem = document.createElement('div');
            ballItem.className = 'ball-item';
            
            ballItem.innerHTML = `
                <div class="ball-color" style="background-color: ${CONSTANTS.LEVEL_CONFIG.BALL_COLORS[ball.color] || '#fff'}" onclick="editor.editBall(${index})" title="Click to change color"></div>
                <div class="ball-position-buttons">
                    <button class="position-btn start" onclick="editor.selectPositioning(${index}, 'start')" title="Set start position">
                        <i class="bi bi-arrow-down"></i>
                    </button>
                    <button class="position-btn end" onclick="editor.selectPositioning(${index}, 'end')" title="Toggle end position selection">
                        <i class="bi bi-arrow-up"></i>
                    </button>
                </div>
                <div class="ball-info" style="font-size: 14px; font-weight: bold; color: ${CONSTANTS.LEVEL_CONFIG.BALL_COLORS[ball.color] || '#fff'}">
                    ${index + 1}
                </div>
                <div class="ball-actions">
                    <button class="btn btn-sm btn-danger" onclick="editor.removeBall(${index})">×</button>
                </div>
            `;
            ballsList.appendChild(ballItem);
            
            // Restore active state for positioning buttons if this ball is in positioning mode
            if (this.positioningMode && this.positioningBallIndex === index) {
                const selectedBtn = ballItem.querySelector(`.position-btn.${this.positioningMode}`);
                if (selectedBtn) {
                    selectedBtn.classList.add('active');
                }
            }
        });
        
        // Update the Add Ball button state
        this.updateAddBallButton();
    }
    
    updateAddBallButton() {
        const addBallButton = document.querySelector('button[onclick="addBall()"]');
        if (addBallButton) {
            const isAtMax = this.balls.length >= CONSTANTS.GAME_CONFIG.MAX_BALLS;
            addBallButton.disabled = isAtMax;
            addBallButton.title = isAtMax ? 
                `Maximum number of balls (${CONSTANTS.GAME_CONFIG.MAX_BALLS}) reached` : 
                'Add a new ball to the level';
            
            // Update button appearance
            if (isAtMax) {
                addBallButton.classList.add('btn-secondary');
                addBallButton.classList.remove('btn-primary');
            } else {
                addBallButton.classList.remove('btn-secondary');
                addBallButton.classList.add('btn-primary');
            }
        }
    }
    
    editBall(index) {
        const ball = this.balls[index];
        
        // Create color options from constants
        const colorOptions = Object.keys(CONSTANTS.LEVEL_CONFIG.BALL_COLORS);
        
        // Create select element
        const select = document.createElement('select');
        select.style.cssText = 'padding: 8px; border-radius: 4px; border: 1px solid #ccc; font-size: 14px;';
        
        // Add options
        colorOptions.forEach(color => {
            const option = document.createElement('option');
            option.value = color;
            option.textContent = color.charAt(0).toUpperCase() + color.slice(1);
            option.style.backgroundColor = CONSTANTS.LEVEL_CONFIG.BALL_COLORS[color];
            option.style.color = this.getContrastColor(CONSTANTS.LEVEL_CONFIG.BALL_COLORS[color]);
            if (color === ball.color) {
                option.selected = true;
            }
            select.appendChild(option);
        });
        
        // Add change event listener to automatically apply color
        select.addEventListener('change', () => {
            ball.color = select.value;
            this.updateBallsList();
            this.updateGridVisuals();
            document.body.removeChild(dialog);
        });
        
        // Create modal-like dialog
        const dialog = document.createElement('div');
        dialog.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        `;
        
        const content = document.createElement('div');
        content.style.cssText = `
            background: #333;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #555;
            min-width: 200px;
        `;
        
        const title = document.createElement('div');
        title.textContent = 'Select Ball Color';
        title.style.cssText = 'color: #fff; font-size: 16px; font-weight: bold; margin-bottom: 15px; text-align: center;';
        
        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = 'display: flex; gap: 10px; justify-content: center; margin-top: 15px;';
        
        const cancelButton = document.createElement('button');
        cancelButton.textContent = 'Cancel';
        cancelButton.style.cssText = 'padding: 8px 16px; background: #6c757d; color: #fff; border: none; border-radius: 4px; cursor: pointer;';
        cancelButton.onclick = () => {
            document.body.removeChild(dialog);
        };
        
        // Close on background click
        dialog.onclick = (e) => {
            if (e.target === dialog) {
                document.body.removeChild(dialog);
            }
        };
        
        // Assemble dialog
        buttonContainer.appendChild(cancelButton);
        content.appendChild(title);
        content.appendChild(select);
        content.appendChild(buttonContainer);
        dialog.appendChild(content);
        document.body.appendChild(dialog);
        
        // Focus on select
        select.focus();
    }
    
    removeBall(index) {
        this.balls.splice(index, 1);
        this.updateBallsList();
        this.updateGridVisuals();
        this.updateAddBallButton();
    }
    

    
    selectPositioning(ballIndex, mode) {
        // Check if we're already in positioning mode for the same ball and mode
        if (this.positioningMode === mode && this.positioningBallIndex === ballIndex) {
            // Toggle off the positioning mode
            this.positioningMode = null;
            this.positioningBallIndex = -1;
            
            // Clear button states
            document.querySelectorAll('.position-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Re-enable node tools
            this.updateNodeToolsState(false);
            
            return;
        }
        
        this.positioningMode = mode;
        this.positioningBallIndex = ballIndex;
        
        // Update button states
        document.querySelectorAll('.position-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Highlight the selected button
        const ballItem = document.querySelectorAll('.ball-item')[ballIndex];
        if (ballItem) {
            const selectedBtn = ballItem.querySelector(`.position-btn.${mode}`);
            if (selectedBtn) {
                selectedBtn.classList.add('active');
            }
        }
        
        // Disable node tools when positioning mode is active
        this.updateNodeToolsState(true);
        
        // Show visual feedback
        const modeText = mode === 'start' ? 'start position' : 'end position';
        const ballColor = CONSTANTS.LEVEL_CONFIG.BALL_COLORS[this.balls[ballIndex].color] || '#fff';
    }
    
    updateNodeToolsState(disabled) {
        const nodeTools = document.querySelectorAll('.node-tool');
        nodeTools.forEach(tool => {
            if (disabled) {
                tool.classList.add('disabled');
                tool.style.pointerEvents = 'none';
            } else {
                tool.classList.remove('disabled');
                tool.style.pointerEvents = 'auto';
            }
        });
    }
    
    setBallPosition(row, col, face) {
        if (this.positioningMode && this.positioningBallIndex >= 0) {
            const ball = this.balls[this.positioningBallIndex];
            const mode = this.positioningMode;
            const ballIndex = this.positioningBallIndex;
            
            // Convert to negative coordinates for rear face
            // Use consistent coordinate system: front = [col, row], rear = [-col, -row]
            const coordRow = face === 'rear' ? -row : row;
            const coordCol = face === 'rear' ? -col : col;
            
            if (this.positioningMode === 'start') {
                ball.start = [coordCol, coordRow];
                
                // Clear positioning mode for start position (auto-deselect)
                this.positioningMode = null;
                this.positioningBallIndex = -1;
                
                // Clear button states
                document.querySelectorAll('.position-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                
                // Re-enable node tools
                this.updateNodeToolsState(false);
            } else {
                // Handle multiple end positions - toggle behavior
                if (!Array.isArray(ball.end[0])) {
                    // Convert legacy single end position to array format
                    ball.end = [ball.end];
                }
                
                // Check if this position is already an end position
                const existingIndex = ball.end.findIndex(endPos => 
                    endPos[0] === coordCol && endPos[1] === coordRow
                );
                
                if (existingIndex !== -1) {
                    // Remove the existing end position
                    ball.end.splice(existingIndex, 1);
                    
                    // Ensure at least one end position remains
                    if (ball.end.length === 0) {
                        ball.end = [[coordCol, coordRow]]; // Keep the current position
                    }
                } else {
                    // Add new end position
                    ball.end.push([coordCol, coordRow]);
                }
                
                // Keep positioning mode active for end positions (don't auto-deselect)
                // Button states remain active
            }
            
            // Update visuals
            this.updateGridVisuals();
            this.updateBallsList();
            this.updateAllBorderColors();
        }
    }
    
    shouldIncludeRearFace() {
        // Check if rear face has any non-empty cells
        for (let row = 0; row < this.board.rear.length; row++) {
            for (let col = 0; col < this.gridWidth; col++) {
                const cellCode = this.board.rear[row][col] || '__';
                if (cellCode !== '__') {
                    return true;
                }
            }
        }
        
        // Check if any ball's end position is in the rear face
        for (const ball of this.balls) {
            // Handle both legacy single end position and new multiple end positions
            let endPositions = Array.isArray(ball.end[0]) ? ball.end : [ball.end];
            
            for (const endPos of endPositions) {
                // Use consistent coordinate system: front = [col, row], rear = [-col, -row]
                if (endPos[0] < 0 || endPos[1] < 0) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    saveLevel() {
        // Convert board data to space-separated format for consistency with existing levels
        const boardForSaving = {
            front: []
        };
        
        // Convert front face
        for (let row = 0; row < this.board.front.length; row++) {
            const cells = [];
            for (let col = 0; col < this.gridWidth; col++) {
                const cellCode = this.board.front[row][col] || '__';
                cells.push(cellCode);
            }
            boardForSaving.front.push(cells.join(' '));
        }
        
        // Include rear face if it has content or if any ball's end position is there
        if (this.shouldIncludeRearFace()) {
            boardForSaving.rear = [];
            for (let row = 0; row < this.board.rear.length; row++) {
                const cells = [];
                for (let col = 0; col < this.gridWidth; col++) {
                    const cellCode = this.board.rear[row][col] || '__';
                    cells.push(cellCode);
                }
                boardForSaving.rear.push(cells.join(' '));
            }
        }
        
        const levelData = {
            level: this.currentLevel,
            board: boardForSaving,
            balls: this.balls
        };
        
        const blob = new Blob([JSON.stringify(levelData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `level_${this.currentLevel}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    loadLevel() {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.json';
        fileInput.style.display = 'none';
        
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.loadLevelFromFile(file);
            }
            document.body.removeChild(fileInput);
        });
        
        document.body.appendChild(fileInput);
        fileInput.click();
    }
    
    loadLevelFromFile(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const levelData = JSON.parse(e.target.result);
                
                // Load level number if present (check both root level and board level)
                if (levelData.level) {
                    this.currentLevel = levelData.level;
                    document.getElementById('levelNumber').value = this.currentLevel;
                } else if (levelData.board && levelData.board.level) {
                    this.currentLevel = levelData.board.level;
                    document.getElementById('levelNumber').value = this.currentLevel;
                }
                
                if (levelData.board) {
                    // Convert from space-separated strings to arrays of arrays for internal use
                    this.board = {
                        front: [],
                        rear: []
                    };
                    
                    // Convert front face
                    if (levelData.board.front) {
                        this.gridHeight = levelData.board.front.length;
                        this.gridWidth = levelData.board.front[0].split(' ').length;
                        
                        for (let row = 0; row < this.gridHeight; row++) {
                            this.board.front[row] = levelData.board.front[row].split(' ');
                        }
                    }
                    
                    // Convert rear face
                    if (levelData.board.rear) {
                        for (let row = 0; row < this.gridHeight; row++) {
                            this.board.rear[row] = levelData.board.rear[row].split(' ');
                        }
                    }
                    
                    // Update the input fields
                    document.getElementById('gridHeight').value = this.gridHeight;
                    document.getElementById('gridWidth').value = this.gridWidth;
                }
                
                if (levelData.balls) {
                    // Convert legacy single end positions to array format
                    this.balls = levelData.balls.map(ball => {
                        // Check if end is already in array format
                        if (Array.isArray(ball.end[0])) {
                            return ball; // Already in new format
                        } else {
                            // Convert legacy single end position to array format
                            return {
                                ...ball,
                                end: [ball.end]
                            };
                        }
                    });
                }
                
                this.generateGrid();
                this.updateGridVisuals();
                this.updateBallsList();
                
            } catch (error) {
                alert('Error loading level: ' + error.message);
            }
        };
        reader.readAsText(file);
    }
    
    testLevel() {
        // Convert board data to space-separated format for consistency with existing levels
        const boardForSaving = {
            front: []
        };
        
        // Convert front face
        for (let row = 0; row < this.board.front.length; row++) {
            const cells = [];
            for (let col = 0; col < this.gridWidth; col++) {
                const cellCode = this.board.front[row][col] || '__';
                cells.push(cellCode);
            }
            boardForSaving.front.push(cells.join(' '));
        }
        
        // Include rear face if it has content or if any ball's end position is there
        if (this.shouldIncludeRearFace()) {
            boardForSaving.rear = [];
            for (let row = 0; row < this.board.rear.length; row++) {
                const cells = [];
                for (let col = 0; col < this.gridWidth; col++) {
                    const cellCode = this.board.rear[row][col] || '__';
                    cells.push(cellCode);
                }
                boardForSaving.rear.push(cells.join(' '));
            }
        }
        
        const levelData = {
            level: this.currentLevel,
            board: boardForSaving,
            balls: this.balls
        };
        
        // Save to localStorage for testing
        localStorage.setItem('testLevel', JSON.stringify(levelData));
        
        // Open game in new tab with just the test flag
        const url = `index.html?level=test`;
        window.open(url, '_blank');
    }
    
    clearBoard() {
        if (confirm('Are you sure you want to clear the board?')) {
            this.createNewLevel();
        }
    }
    
    shrinkHorizontally() {
        let removedFirst = false;
        let removedLast = false;
        
        // Check if first column (front) / last column (rear) is empty
        let firstColumnEmpty = true;
        for (let row = 0; row < this.gridHeight; row++) {
            if ((this.board.front[row] && this.board.front[row][0] && this.board.front[row][0] !== '__') ||
                (this.board.rear[row] && this.board.rear[row][this.gridWidth - 1] && this.board.rear[row][this.gridWidth - 1] !== '__')) {
                firstColumnEmpty = false;
                break;
            }
        }
        
        // Check if last column (front) / first column (rear) is empty
        let lastColumnEmpty = true;
        for (let row = 0; row < this.gridHeight; row++) {
            if ((this.board.front[row] && this.board.front[row][this.gridWidth - 1] && this.board.front[row][this.gridWidth - 1] !== '__') ||
                (this.board.rear[row] && this.board.rear[row][0] && this.board.rear[row][0] !== '__')) {
                lastColumnEmpty = false;
                break;
            }
        }
        
        // Remove first column if empty
        if (firstColumnEmpty && this.gridWidth > 1) {
            for (let row = 0; row < this.gridHeight; row++) {
                if (this.board.front[row]) {
                    this.board.front[row].shift(); // Remove first element
                }
                if (this.board.rear[row]) {
                    this.board.rear[row].pop(); // Remove last element
                }
            }
            this.gridWidth--;
            removedFirst = true;
        }
        
        // Remove last column if empty
        if (lastColumnEmpty && this.gridWidth > 1) {
            for (let row = 0; row < this.gridHeight; row++) {
                if (this.board.front[row]) {
                    this.board.front[row].pop(); // Remove last element
                }
                if (this.board.rear[row]) {
                    this.board.rear[row].shift(); // Remove first element
                }
            }
            this.gridWidth--;
            removedLast = true;
        }
        
        if (removedFirst || removedLast) {
            // Relocate ball positions
            this.balls.forEach(ball => {
                // Adjust start position
                if (removedFirst) {
                    // If first column was removed, shift all positions left by 1
                    if (ball.start[0] >= 0) { // Front face
                        ball.start[0] = Math.max(0, ball.start[0] - 1);
                    } else { // Rear face
                        ball.start[0] = Math.min(-1, ball.start[0] + 1);
                    }
                }
                if (removedLast) {
                    // If last column was removed, cap positions at new maximum
                    if (ball.start[0] >= 0) { // Front face
                        ball.start[0] = Math.min(this.gridWidth - 1, ball.start[0]);
                    } else { // Rear face
                        ball.start[0] = Math.max(-this.gridWidth, ball.start[0]);
                    }
                }
                
                // Adjust end positions (handle both legacy single and new multiple)
                let endPositions = Array.isArray(ball.end[0]) ? ball.end : [ball.end];
                
                endPositions.forEach(endPos => {
                    if (removedFirst) {
                        if (endPos[0] >= 0) { // Front face
                            endPos[0] = Math.max(0, endPos[0] - 1);
                        } else { // Rear face
                            endPos[0] = Math.min(-1, endPos[0] + 1);
                        }
                    }
                    if (removedLast) {
                        if (endPos[0] >= 0) { // Front face
                            endPos[0] = Math.min(this.gridWidth - 1, endPos[0]);
                        } else { // Rear face
                            endPos[0] = Math.max(-this.gridWidth, endPos[0]);
                        }
                    }
                });
                
                // Update ball.end to use the new format if it was legacy
                if (!Array.isArray(ball.end[0])) {
                    ball.end = endPositions;
                }
            });
            
            // Update grid size input
            document.getElementById('gridWidth').value = this.gridWidth;
            
            // Regenerate grid and update visuals
            this.generateGrid();
            this.updateGridVisuals();
            this.updateAllBorderColors();
            
            // Validate ball positions after shrinking
            this.validateBallPositions();
            this.updateGridVisuals();
        }
    }
    
    shrinkVertically() {
        let removedFirst = false;
        let removedLast = false;
        
        // Check if first row is empty in both faces
        let firstRowEmpty = true;
        if (this.board.front[0] && this.board.rear[0]) {
            for (let col = 0; col < this.gridWidth; col++) {
                if ((this.board.front[0][col] && this.board.front[0][col] !== '__') ||
                    (this.board.rear[0][col] && this.board.rear[0][col] !== '__')) {
                    firstRowEmpty = false;
                    break;
                }
            }
        }
        
        // Check if last row is empty in both faces
        let lastRowEmpty = true;
        const lastRowIndex = this.gridHeight - 1;
        if (this.board.front[lastRowIndex] && this.board.rear[lastRowIndex]) {
            for (let col = 0; col < this.gridWidth; col++) {
                if ((this.board.front[lastRowIndex][col] && this.board.front[lastRowIndex][col] !== '__') ||
                    (this.board.rear[lastRowIndex][col] && this.board.rear[lastRowIndex][col] !== '__')) {
                    lastRowEmpty = false;
                    break;
                }
            }
        }
        
        // Remove first row if empty
        if (firstRowEmpty && this.gridHeight > 1) {
            this.board.front.shift();
            this.board.rear.shift();
            this.gridHeight--;
            removedFirst = true;
        }
        
        // Remove last row if empty
        if (lastRowEmpty && this.gridHeight > 1) {
            this.board.front.pop();
            this.board.rear.pop();
            this.gridHeight--;
            removedLast = true;
        }
        
        if (removedFirst || removedLast) {
            // Relocate ball positions
            this.balls.forEach(ball => {
                // Adjust start position
                if (removedFirst) {
                    // If first row was removed, shift all positions up by 1
                    if (ball.start[1] >= 0) { // Front face
                        ball.start[1] = Math.max(0, ball.start[1] - 1);
                    } else { // Rear face
                        ball.start[1] = Math.min(-1, ball.start[1] + 1);
                    }
                }
                if (removedLast) {
                    // If last row was removed, cap positions at new maximum
                    if (ball.start[1] >= 0) { // Front face
                        ball.start[1] = Math.min(this.gridHeight - 1, ball.start[1]);
                    } else { // Rear face
                        ball.start[1] = Math.max(-this.gridHeight, ball.start[1]);
                    }
                }
                
                // Adjust end positions (handle both legacy single and new multiple)
                let endPositions = Array.isArray(ball.end[0]) ? ball.end : [ball.end];
                
                endPositions.forEach(endPos => {
                    if (removedFirst) {
                        if (endPos[1] >= 0) { // Front face
                            endPos[1] = Math.max(0, endPos[1] - 1);
                        } else { // Rear face
                            endPos[1] = Math.min(-1, endPos[1] + 1);
                        }
                    }
                    if (removedLast) {
                        if (endPos[1] >= 0) { // Front face
                            endPos[1] = Math.min(this.gridHeight - 1, endPos[1]);
                        } else { // Rear face
                            endPos[1] = Math.max(-this.gridHeight, endPos[1]);
                        }
                    }
                });
                
                // Update ball.end to use the new format if it was legacy
                if (!Array.isArray(ball.end[0])) {
                    ball.end = endPositions;
                }
            });
            
            // Update grid size input
            document.getElementById('gridHeight').value = this.gridHeight;
            
            // Regenerate grid and update visuals
            this.generateGrid();
            this.updateGridVisuals();
            this.updateAllBorderColors();
            
            // Validate ball positions after shrinking
            this.validateBallPositions();
            this.updateGridVisuals();
        }
    }
}

// Global functions for button clicks
let editor;
// Make editor variable globally accessible
window.editor = editor;

// Attach functions to window object to make them globally accessible
window.addBall = function() {
    if (editor) {
        editor.addBall();
    }
};

window.saveLevel = function() {
    if (editor) {
        editor.saveLevel();
    }
};

window.loadLevel = function() {
    if (editor) {
        editor.loadLevel();
    }
};

window.testLevel = function() {
    if (editor) {
        editor.testLevel();
    }
};

window.clearBoard = function() {
    if (editor) {
        editor.clearBoard();
    }
};

window.shrinkHorizontally = function() {
    if (editor) {
        editor.shrinkHorizontally();
    }
};

window.shrinkVertically = function() {
    if (editor) {
        editor.shrinkVertically();
    }
};

window.selectPositioning = function(ballIndex, mode) {
    if (editor) {
        editor.selectPositioning(ballIndex, mode);
    }
};

// Initialize editor when page loads
document.addEventListener('DOMContentLoaded', () => {
    editor = new LevelEditor();
    // Make editor globally accessible
    window.editor = editor;
});

// Hide loading overlay when window is fully loaded
window.addEventListener('load', () => {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.opacity = '0';
        overlay.style.transition = 'opacity 0.3s ease';
        setTimeout(() => {
            overlay.style.display = 'none';
        }, 300);
    }
}); 