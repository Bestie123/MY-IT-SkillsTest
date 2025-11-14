const treeManager = {
    init() {
        this.treeContainer = document.getElementById('tree');
        this.renderTree();
    },

    renderTree() {
        this.treeContainer.innerHTML = '';
        
        if (techData.categories.length === 0) {
            this.treeContainer.innerHTML = '<p style="text-align: center; color: #6c757d;">Нет данных. Добавьте первую категорию!</p>';
            return;
        }

        const tree = document.createElement('ul');
        this.buildTree(techData.categories, tree, []);
        this.treeContainer.appendChild(tree);
    },

    buildTree(nodes, parentElement, path) {
        nodes.forEach((node, index) => {
            const li = document.createElement('li');
            const currentPath = [...path, index];
            
            const nodeElement = document.createElement('div');
            nodeElement.className = `tree-node ${node.type === 'technology' ? 'technology' : 'category'}`;
            
            const completedTasks = node.checklist ? node.checklist.filter(item => item.completed).length : 0;
            const totalTasks = node.checklist ? node.checklist.length : 0;
            const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
            
            let statusText = '';
            let statusClass = '';
            
            if (node.type === 'technology') {
                if (totalTasks === 0) {
                    statusText = '📝 В планах';
                    statusClass = 'status-planned';
                } else if (completedTasks === totalTasks) {
                    statusText = '✅ Изучено';
                    statusClass = 'status-completed';
                } else {
                    statusText = '🚧 В процессе';
                    statusClass = 'status-in-progress';
                }
            }

            const nodeContent = document.createElement('div');
            nodeContent.className = 'node-content';
            
            const nameElement = document.createElement('div');
            nameElement.className = 'node-name';
            nameElement.textContent = node.name;
            nodeContent.appendChild(nameElement);

            if (node.type === 'technology') {
                const statusElement = document.createElement('div');
                statusElement.className = statusClass;
                statusElement.textContent = statusText;
                nodeContent.appendChild(statusElement);

                const progressBar = document.createElement('div');
                progressBar.className = 'progress-bar';
                const progressFill = document.createElement('div');
                progressFill.className = 'progress-fill';
                progressFill.style.width = `${progress}%`;
                progressBar.appendChild(progressFill);
                nodeContent.appendChild(progressBar);

                const progressText = document.createElement('div');
                progressText.textContent = `${Math.round(progress)}% (${completedTasks}/${totalTasks})`;
                progressText.style.fontSize = '0.8em';
                progressText.style.color = '#6c757d';
                nodeContent.appendChild(progressText);

                if (node.checklist && node.checklist.length > 0) {
                    const checklistIndicator = document.createElement('div');
                    checklistIndicator.className = 'checklist-indicator';
                    checklistIndicator.textContent = `📋 ${node.checklist.length} задач`;
                    nodeContent.appendChild(checklistIndicator);
                }
            }

            const actionsElement = document.createElement('div');
            actionsElement.className = 'node-actions';
            
            if (node.type === 'technology') {
                actionsElement.innerHTML = `
                    <button onclick="checklistManager.manageChecklist(${JSON.stringify(path)}, ${index})" class="warning">📋</button>
                    <button onclick="dataManager.editTechnology(${JSON.stringify(path)}, ${index})">✏️</button>
                    <button class="delete" onclick="dataManager.deleteTechnology(${JSON.stringify(path)}, ${index})">🗑️</button>
                `;
            } else {
                actionsElement.innerHTML = `
                    <button onclick="uiManager.showAddNodeModal(${JSON.stringify(currentPath)})">+ 📁</button>
                    <button onclick="uiManager.showAddTechModal(${JSON.stringify(currentPath)})">+ ⚙️</button>
                    <button onclick="dataManager.editNode(${JSON.stringify(path)}, ${index})">✏️</button>
                    <button class="delete" onclick="dataManager.deleteNode(${JSON.stringify(path)}, ${index})">🗑️</button>
                `;
            }
            
            nodeContent.appendChild(actionsElement);
            nodeElement.appendChild(nodeContent);
            li.appendChild(nodeElement);

            if (node.children && node.children.length > 0) {
                const childUl = document.createElement('ul');
                this.buildTree(node.children, childUl, currentPath);
                li.appendChild(childUl);
            }

            parentElement.appendChild(li);
        });
    }
};

// UI Manager для модальных окон
const uiManager = {
    showModal(modalId) {
        document.getElementById(modalId).style.display = 'block';
    },

    showAddNodeModal(path = []) {
        currentModalPath = path;
        this.updateParentSelect('nodeModal', path);
        this.showModal('nodeModal');
    },

    showAddTechModal(path = []) {
        currentModalPath = path;
        this.updateParentSelect('techModal', path);
        this.showModal('techModal');
    },

    hideModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
    },

    hideJSON() {
        document.getElementById('jsonSection').classList.add('hidden');
    },

    updateParentSelect(modalId, currentPath) {
        const container = document.getElementById(modalId === 'nodeModal' ? 'nodeParentSelect' : 'techParentSelect');
        container.innerHTML = '';
        
        const title = document.createElement('div');
        title.innerHTML = `<strong>Родительская категория:</strong> ${this.getPathDisplay(currentPath) || 'Корень'}`;
        container.appendChild(title);
    },

    getPathDisplay(path) {
        if (path.length === 0) return '';
        let currentNode = techData.categories;
        let pathNames = [];
        
        for (const index of path) {
            if (currentNode[index]) {
                pathNames.push(currentNode[index].name);
                currentNode = currentNode[index].children || [];
            }
        }
        
        return pathNames.join(' → ');
    },

    showNotification(message, type) {
        const oldNotifications = document.querySelectorAll('.notification');
        oldNotifications.forEach(notif => notif.remove());
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
};

// Закрытие модальных окон при клике вне их
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        uiManager.hideModals();
    }
};
