const uiManager = {
    // === ОТОБРАЖЕНИЕ ДЕРЕВА ===
    renderTree() {
        const container = document.getElementById('treeContent');
        container.innerHTML = '';

        if (techData.categories.length === 0) {
            container.innerHTML = '<div style="text-align: center; padding: 40px; color: #6c757d;">Нет данных. Добавьте первую категорию!</div>';
            return;
        }

        const tree = document.createElement('ul');
        tree.className = 'tree';
        techData.categories.forEach((category, index) => {
            tree.appendChild(this.createTreeNode(category, 0, [], index));
        });
        container.appendChild(tree);
    },

    createTreeNode(node, level, path, index) {
        const li = document.createElement('li');
        li.className = 'tree-node';

        const nodeContent = document.createElement('div');
        nodeContent.className = `node-content ${node.type}`;
        nodeContent.style.paddingLeft = (level * 20) + 'px';

        // Кнопка раскрытия/сворачивания для категорий
        if (node.type === 'category' || node.type === 'node') {
            const toggleBtn = document.createElement('button');
            toggleBtn.className = 'toggle-btn';
            toggleBtn.innerHTML = node.expanded ? '−' : '+';
            toggleBtn.onclick = (e) => {
                e.stopPropagation();
                node.expanded = !node.expanded;
                this.renderTree();
            };
            nodeContent.appendChild(toggleBtn);
        } else {
            const spacer = document.createElement('span');
            spacer.className = 'toggle-btn';
            spacer.innerHTML = '•';
            nodeContent.appendChild(spacer);
        }

        // Иконка и название
        const icon = document.createElement('span');
        icon.className = 'node-icon';
        icon.innerHTML = node.type === 'technology' ? '⚙️' : (node.type === 'category' ? '📁' : '📂');
        nodeContent.appendChild(icon);

        const name = document.createElement('span');
        name.className = 'node-name';
        name.textContent = node.name;
        nodeContent.appendChild(name);

        // Прогресс для технологий
        if (node.type === 'technology') {
            const completed = node.checklist ? node.checklist.filter(item => item.completed).length : 0;
            const total = node.checklist ? node.checklist.length : 0;
            const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

            const progressInfo = document.createElement('div');
            progressInfo.className = 'progress-info';

            if (total > 0) {
                progressInfo.innerHTML = `
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                    <span>${completed}/${total}</span>
                    <span class="status-badge ${progress === 100 ? 'status-completed' : progress > 0 ? 'status-in-progress' : 'status-planned'}">
                        ${progress === 100 ? '✅' : progress > 0 ? '🚧' : '📝'}
                    </span>
                `;
            } else {
                progressInfo.innerHTML = '<span class="status-badge status-planned">📝 В планах</span>';
            }

            nodeContent.appendChild(progressInfo);
        }

        // Кнопки действий
        const actions = document.createElement('div');
        actions.className = 'node-actions';

        if (node.type === 'category' || node.type === 'node') {
            const addNodeBtn = document.createElement('button');
            addNodeBtn.innerHTML = '📂';
            addNodeBtn.title = 'Добавить подкатегорию';
            addNodeBtn.onclick = (e) => {
                e.stopPropagation();
                currentModalPath = [...path, index];
                this.showModal('nodeModal');
            };
            actions.appendChild(addNodeBtn);

            const addTechBtn = document.createElement('button');
            addTechBtn.innerHTML = '⚙️';
            addTechBtn.title = 'Добавить технологию';
            addTechBtn.onclick = (e) => {
                e.stopPropagation();
                currentModalPath = [...path, index];
                this.showModal('techModal');
            };
            actions.appendChild(addTechBtn);
        }

        if (node.type === 'technology') {
            const checklistBtn = document.createElement('button');
            checklistBtn.innerHTML = '📋';
            checklistBtn.title = 'Управление чек-листом';
            checklistBtn.onclick = (e) => {
                e.stopPropagation();
                checklistManager.manageChecklist(path, index);
            };
            actions.appendChild(checklistBtn);
        }

        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = '🗑️';
        deleteBtn.title = 'Удалить';
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            if (node.type === 'technology') {
                dataManager.deleteTechnology(path, index);
            } else {
                dataManager.deleteNode(path, index);
            }
        };
        actions.appendChild(deleteBtn);

        nodeContent.appendChild(actions);
        li.appendChild(nodeContent);

        // Рекурсивно рендерим детей
        if ((node.type === 'category' || node.type === 'node') && node.expanded && node.children && node.children.length > 0) {
            const childrenContainer = document.createElement('div');
            childrenContainer.className = 'children';
            node.children.forEach((child, childIndex) => {
                childrenContainer.appendChild(this.createTreeNode(child, level + 1, [...path, index], childIndex));
            });
            li.appendChild(childrenContainer);
        }

        return li;
    },

    // === УПРАВЛЕНИЕ МОДАЛЬНЫМИ ОКНАМИ ===
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

    // === ОБНОВЛЕНИЕ SELECT В МОДАЛЬНЫХ ОКНАХ ===
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

    // === УТИЛИТЫ ===
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