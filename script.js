// 定义网格类
class Grid {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.cells = [];
        this.start = null;
        this.end = null;
        this.init();
    }

    init() {
        for (let y = 0; y < this.height; y++) {
            this.cells[y] = [];
            for (let x = 0; x < this.width; x++) {
                this.cells[y][x] = {
                    x: x,
                    y: y,
                    isObstacle: false,
                    g: 0,
                    h: 0,
                    f: 0,
                    parent: null
                };
            }
        }
    }
}

// A*算法实现
function aStar(grid) {
    let openSet = [];
    let closedSet = [];
    openSet.push(grid.start);

    while (openSet.length > 0) {
        // 找到f值最小的节点
        let lowestIndex = 0;
        for (let i = 0; i < openSet.length; i++) {
            if (openSet[i].f < openSet[lowestIndex].f) {
                lowestIndex = i;
            }
        }
        let current = openSet[lowestIndex];

        if (current === grid.end) {
            // 找到路径
            let path = [];
            let temp = current;
            path.push(temp);
            while (temp.parent) {
                path.push(temp.parent);
                temp = temp.parent;
            }
            return path;
        }

        // 从openSet中移除当前节点，加入closedSet
        openSet.splice(lowestIndex, 1);
        closedSet.push(current);

        // 检查相邻节点
        let neighbors = getNeighbors(grid, current);
        for (let neighbor of neighbors) {
            if (closedSet.includes(neighbor) || neighbor.isObstacle) {
                continue;
            }
            let tentativeG = current.g + 1;
            if (!openSet.includes(neighbor)) {
                openSet.push(neighbor);
            } else if (tentativeG >= neighbor.g) {
                continue;
            }

            neighbor.parent = current;
            neighbor.g = tentativeG;
            neighbor.h = heuristic(neighbor, grid.end);
            neighbor.f = neighbor.g + neighbor.h;
        }
    }

    return [];
}

// 获取相邻节点
function getNeighbors(grid, cell) {
    let neighbors = [];
    let x = cell.x;
    let y = cell.y;

    if (x > 0) neighbors.push(grid.cells[y][x - 1]);
    if (x < grid.width - 1) neighbors.push(grid.cells[y][x + 1]);
    if (y > 0) neighbors.push(grid.cells[y - 1][x]);
    if (y < grid.height - 1) neighbors.push(grid.cells[y + 1][x]);

    return neighbors;
}

// 启发式函数
function heuristic(a, b) {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

// 初始化变量
let grid;
let isDrawing = false;

// 生成网格
function generateGrid() {
    let width = parseInt(document.getElementById('gridWidth').value);
    let height = parseInt(document.getElementById('gridHeight').value);
    grid = new Grid(width, height);

    let gridElement = document.getElementById('grid');
    gridElement.innerHTML = '';
    gridElement.style.gridTemplateColumns = `repeat(${width}, 20px)`;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.x = x;
            cell.dataset.y = y;

            cell.addEventListener('mousedown', () => {
                isDrawing = true;
                handleCellClick(cell);
            });

            cell.addEventListener('mouseover', () => {
                if (isDrawing) {
                    handleCellClick(cell);
                }
            });

            cell.addEventListener('mouseup', () => {
                isDrawing = false;
            });

            gridElement.appendChild(cell);
        }
    }
}

// 处理单元格点击事件
function handleCellClick(cell) {
    let statusMessage = document.getElementById('statusMessage');

    let x = parseInt(cell.dataset.x);
    let y = parseInt(cell.dataset.y);

    if (!grid.start) {
        statusMessage.textContent = '起点已设置';

        grid.start = grid.cells[y][x];
        cell.classList.add('start');
    } else if (!grid.end) {
        statusMessage.textContent = '终点已设置';

        grid.end = grid.cells[y][x];
        cell.classList.add('end');
    } else {
        if (grid.cells[y][x].isObstacle) {
            statusMessage.textContent = '障碍物已移除';
        } else {
            statusMessage.textContent = '障碍物已设置';
        }

        grid.cells[y][x].isObstacle = !grid.cells[y][x].isObstacle;
        cell.classList.toggle('obstacle', grid.cells[y][x].isObstacle);
    }
}

// 开始搜索
function startSearch() {
    // 清除之前的路径和访问标记
    let gridElement = document.getElementById('grid');
    let cells = gridElement.children;
    for (let i = 0; i < cells.length; i++) {
        cells[i].classList.remove('visited', 'path');
    }
    for (let y = 0; y < grid.height; y++) {
        for (let x = 0; x < grid.width; x++) {
            grid.cells[y][x].parent = null;
        }
    }

    if (!grid.start || !grid.end) {
        alert('请先设置起点和终点！');
        return;
    }

    const algorithmSelect = document.getElementById('algorithmSelect');
    const selectedAlgorithm = algorithmSelect.value;
    let path = [];
    switch (selectedAlgorithm) {
        case 'aStar':
            path = aStar(grid);
            break;
        case 'rrt':
            path = rrt(grid);
            break;
        case 'rrtStar':
            path = rrtStar(grid);
            break;
        case 'bfs':
            path = bfs(grid);
            break;
        case 'dfs':
            path = dfs(grid);
            break;
        case 'dijkstra':
            path = dijkstra(grid);
            break;
    }
    // let gridElement = document.getElementById('grid');
    // let cells = gridElement.children;

    // 标记访问过的节点
    for (let y = 0; y < grid.height; y++) {
        for (let x = 0; x < grid.width; x++) {
            if (grid.cells[y][x].parent && grid.cells[y][x] !== grid.start && grid.cells[y][x] !== grid.end) {
                let index = y * grid.width + x;
                cells[index].classList.add('visited');
            }
        }
    }

    // 标记路径
    for (let i = 0; i < path.length; i++) {
        let index = path[i].y * grid.width + path[i].x;
        cells[index].classList.add('path');
    }
}

// 初始化
document.getElementById('generateGrid').addEventListener('click', generateGrid);
// 暂时添加一个按钮来触发搜索
let searchButton = document.createElement('button');
searchButton.textContent = '开始搜索';
searchButton.addEventListener('click', startSearch);
let controls = document.getElementById('controls');
controls.appendChild(searchButton);

// 初始生成网格
generateGrid();

// RRT算法实现
function rrt(grid) {
    let tree = [grid.start];
    const maxIterations = 5000; // 增加迭代次数
    const bias = 0.1; // 增加随机点生成的偏向性
    for (let i = 0; i < maxIterations; i++) {
        let randomPoint = Math.random() < bias ? grid.end : getRandomPoint(grid); // 优化随机点生成
        let nearestNode = findNearestNode(tree, randomPoint);
        let newNode = extend(nearestNode, randomPoint, grid);
        if (newNode) {
            tree.push(newNode);
            if (distance(newNode, grid.end) < 1) {
                return buildPath(tree, newNode);
            }
        }
    }
    return [];
}

function getRandomPoint(grid) {
    return {
        x: Math.floor(Math.random() * grid.width),
        y: Math.floor(Math.random() * grid.height)
    };
}

function findNearestNode(tree, point) {
    let minDistance = Infinity;
    let nearest = null;
    for (let node of tree) {
        let dist = distance(node, point);
        if (dist < minDistance) {
            minDistance = dist;
            nearest = node;
        }
    }
    return nearest;
}

function extend(nearest, randomPoint, grid) {
    const stepSize = 1;
    let dx = randomPoint.x - nearest.x;
    let dy = randomPoint.y - nearest.y;
    let length = Math.sqrt(dx * dx + dy * dy);
    if (length === 0) return null;
    dx = (dx / length) * stepSize;
    dy = (dy / length) * stepSize;
    let newX = nearest.x + dx;
    let newY = nearest.y + dy;
    if (newX < 0 || newX >= grid.width || newY < 0 || newY >= grid.height) return null;
    if (grid.cells[newY][newX].isObstacle) return null;
    let newNode = {
        x: newX,
        y: newY,
        parent: nearest
    };
    return newNode;
}

function distance(a, b) {
    return Math.sqrt((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y));
}

function buildPath(tree, endNode) {
    let path = [];
    let current = endNode;
    while (current) {
        path.push(current);
        current = current.parent;
    }
    return path.reverse();
}

// RRT*算法实现
function rrtStar(grid) {
    let tree = [grid.start];
    const maxIterations = 5000; // 增加迭代次数
    const bias = 0.1; // 增加随机点生成的偏向性
    const radius = 5;
    for (let i = 0; i < maxIterations; i++) {
        let randomPoint = Math.random() < bias ? grid.end : getRandomPoint(grid); // 优化随机点生成
        let nearestNode = findNearestNode(tree, randomPoint);
        let newNode = extend(nearestNode, randomPoint, grid);
        if (newNode) {
            // 寻找近邻节点
            let nearNodes = findNearNodes(tree, newNode, radius);
            // 选择最优父节点
            let bestParent = selectBestParent(nearNodes, newNode, grid);
            newNode.parent = bestParent;
            tree.push(newNode);
            // 重连
            rewire(nearNodes, newNode, grid);
            if (distance(newNode, grid.end) < 1) {
                return buildPath(tree, newNode);
            }
        }
    }
    return [];
}

function findNearNodes(tree, node, radius) {
    let nearNodes = [];
    for (let other of tree) {
        if (distance(node, other) < radius) {
            nearNodes.push(other);
        }
    }
    return nearNodes;
}

function selectBestParent(nearNodes, newNode, grid) {
    let minCost = Infinity;
    let bestParent = null;
    for (let parent of nearNodes) {
        let tentativeCost = cost(parent) + distance(parent, newNode);
        if (tentativeCost < minCost && !hasCollision(parent, newNode, grid)) {
            minCost = tentativeCost;
            bestParent = parent;
        }
    }
    return bestParent;
}

function cost(node) {
    let cost = 0;
    let current = node;
    while (current.parent) {
        cost += distance(current, current.parent);
        current = current.parent;
    }
    return cost;
}

function hasCollision(a, b, grid) {
    let dx = b.x - a.x;
    let dy = b.y - a.y;
    let length = Math.sqrt(dx * dx + dy * dy);
    let steps = Math.ceil(length);
    for (let i = 0; i <= steps; i++) {
        let t = i / steps;
        let x = Math.round(a.x + t * dx);
        let y = Math.round(a.y + t * dy);
        if (x < 0 || x >= grid.width || y < 0 || y >= grid.height) return true;
        if (grid.cells[y][x].isObstacle) return true;
    }
    return false;
}

function rewire(nearNodes, newNode, grid) {
    for (let other of nearNodes) {
        let tentativeCost = cost(newNode) + distance(newNode, other);
        if (tentativeCost < cost(other) && !hasCollision(newNode, other, grid)) {
            other.parent = newNode;
        }
    }
}

// 广度优先搜索算法实现
function bfs(grid) {
    let queue = [grid.start];
    let visited = new Set();
    while (queue.length > 0) {
        let current = queue.shift();
        if (current === grid.end) {
            return buildPathFromParent(current);
        }
        visited.add(getKey(current));
        let neighbors = getNeighbors(grid, current);
        for (let neighbor of neighbors) {
            if (!visited.has(getKey(neighbor)) && !neighbor.isObstacle) {
                neighbor.parent = current;
                queue.push(neighbor);
                visited.add(getKey(neighbor));
            }
        }
    }
    return [];
}

function getKey(cell) {
    return `${cell.x},${cell.y}`;
}

function buildPathFromParent(endNode) {
    let path = [];
    let current = endNode;
    while (current) {
        path.push(current);
        current = current.parent;
    }
    return path.reverse();
}

// 深度优先搜索算法实现
function dfs(grid) {
    let stack = [grid.start];
    let visited = new Set();
    while (stack.length > 0) {
        let current = stack.pop();
        if (current === grid.end) {
            return buildPathFromParent(current);
        }
        visited.add(getKey(current));
        let neighbors = getNeighbors(grid, current);
        for (let neighbor of neighbors) {
            if (!visited.has(getKey(neighbor)) && !neighbor.isObstacle) {
                neighbor.parent = current;
                stack.push(neighbor);
            }
        }
    }
    return [];
}

// 迪杰斯特拉算法实现
function dijkstra(grid) {
    let openSet = new PriorityQueue();
    let closedSet = new Set();
    openSet.enqueue(grid.start, 0);
    while (!openSet.isEmpty()) {
        let current = openSet.dequeue();
        if (current === grid.end) {
            return buildPathFromParent(current);
        }
        closedSet.add(getKey(current));
        let neighbors = getNeighbors(grid, current);
        for (let neighbor of neighbors) {
            if (closedSet.has(getKey(neighbor)) || neighbor.isObstacle) {
                continue;
            }
            let tentativeG = current.g + 1;
            if (!openSet.contains(neighbor)) {
                neighbor.parent = current;
                neighbor.g = tentativeG;
                openSet.enqueue(neighbor, tentativeG);
            } else if (tentativeG < neighbor.g) {
                neighbor.parent = current;
                neighbor.g = tentativeG;
                openSet.updatePriority(neighbor, tentativeG);
            }
        }
    }
    return [];
}

// 优先队列实现
class PriorityQueue {
    constructor() {
        this.elements = [];
    }

    enqueue(element, priority) {
        this.elements.push({ element, priority });
        this.elements.sort((a, b) => a.priority - b.priority);
    }

    dequeue() {
        if (this.isEmpty()) return null;
        return this.elements.shift().element;
    }

    isEmpty() {
        return this.elements.length === 0;
    }

    contains(element) {
        return this.elements.some(item => item.element === element);
    }

    updatePriority(element, newPriority) {
        for (let item of this.elements) {
            if (item.element === element) {
                item.priority = newPriority;
                break;
            }
        }
        this.elements.sort((a, b) => a.priority - b.priority);
    }
}

// 算法简介对象
const algorithmDescriptions = {
    aStar: 'A*算法是一种启发式搜索算法，结合了Dijkstra算法的最优路径搜索和贪心最佳优先搜索的高效性，通过启发函数来引导搜索方向。',
    rrt: 'RRT（快速随机树）算法是一种用于路径规划的采样算法，通过随机采样来构建一棵树，快速探索搜索空间。',
    rrtStar: 'RRT*算法是RRT算法的改进版本，在RRT的基础上增加了重连机制，保证了渐进最优性。',
    bfs: '广度优先搜索算法是一种盲目搜索算法，从起点开始逐层扩展，直到找到目标节点，能保证找到最短路径。',
    dfs: '深度优先搜索算法是一种盲目搜索算法，从起点开始沿着一条路径尽可能深地探索，直到无法继续再回溯。',
    dijkstra: '迪杰斯特拉算法是一种经典的最短路径算法，通过不断扩展距离起点最近的节点来找到最短路径。'
};

// 获取算法选择下拉框和算法简介容器
const algorithmSelect = document.getElementById('algorithmSelect');
const algorithmDescription = document.getElementById('algorithmDescription');

// 添加事件监听
algorithmSelect.addEventListener('change', () => {
    const selectedAlgorithm = algorithmSelect.value;
    algorithmDescription.textContent = algorithmDescriptions[selectedAlgorithm];
});