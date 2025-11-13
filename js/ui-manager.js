const uiManager = {
    // === ОТОБРАЖЕНИЕ СТРУКТУРЫ ===
    renderStructure() {
        const container = document.getElementById('structureContent');
        container.innerHTML = '';

        if (techData.categories.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>Нет данных</h3>
                    <p>Добавьте первую категорию чтобы начать</p>
                    <button class="btn primary" onclick="uiManager.showModal('categoryModal')">Создать категорию</button>
                </div>
            `;
            return;
        }

        techData.categories.forEach((category, index) => {
            container.appendChild(this.createStructureNode(category, 0, [], index));
        });
    },

    createStructureNode(node, level, path, index) {
        const fullPath = [...path, index];
        const item = document.createElement('div');
        item.className = 'structure-item';

        const content = document.createElement('div');
        content.className = 'item-content';

        // Заголовок элемента
        const header = document.createElement('div');
        header.className = `item-header ${node.type}`;
        
        const icon = document.createElement('div');
        icon.className = 'item-icon';
        icon.innerHTML = this.getNodeIcon(node.type);
        
        const title = document.createElement('div');
        title.className = 'item-title';
        title.textContent = node.name;
        
        const actions = document.createElement('div');
        actions.className = 'item-actions';

        // Кнопки действий в зависимости от типа
        if (node.type === 'category' || node.type === 'node') {
            const expandBtn = document.createElement('button');
            expandBtn.className = 'action-btn';
            expandBtn.innerHTML = node.expanded ? '−' : '+';
            expandBtn.title = node.expanded ? 'Свернуть' : 'Развернуть';
            expandBtn.onclick = (e) => {
                e.stopPropagation();
                this.toggleNode(fullPath);
            };
            actions.appendChild(expandBtn);

            const addNodeBtn = document.createElement('button');
            addNodeBtn.className = 'action-btn';
            addNodeBtn.innerHTML = '📂';
            addNodeBtn.title = 'Добавить подкатегорию';
            addNodeBtn.onclick = (e) => {
                e.stopPropagation();
                currentModalPath = fullPath;
                this.showModal('nodeModal');
            };
            actions.appendChild(addNodeBtn);

            const addTechBtn = document.createElement('button');
            addTechBtn.className = 'action-btn';
            addTechBtn.innerHTML = '⚙️';
            addTechBtn.title = 'Добавить технологию';
            addTechBtn.onclick = (e) => {
                e.stopPropagation();
                currentModalPath = fullPath;
                this.showModal('techModal');
            };
            actions.appendChild(addTechBtn);
        }

        if (node.type === 'technology') {
            const checklistBtn = document.createElement('button');
            checklistBtn.className = 'action-btn';
            checklistBtn.innerHTML = '📋';
            checklistBtn.title = 'Управление чек-листом';
            checklistBtn.onclick = (e) => {
                e.stopPropagation();
                checklistManager.manageChecklist(path, index);
            };
            actions.appendChild(checklistBtn);
        }

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'action-btn';
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

        header.appendChild(icon);
        header.appendChild(title);
        header.appendChild(actions);
        content.appendChild(header);

        // Контент для технологий (чеклист)
        if (node.type === 'technology' && node.checklist && node.checklist.length > 0) {
            const checklist = document.createElement('div');
            checklist.className = 'item-checklist';
            
            const completed = node.checklist.filter(item => item.completed).length;
            const total = node.checklist.length;
            const progress = total > 0 ? (completed / total) * 100 : 0;

            // Превью чеклиста (первые 3 пункта)
            const previewItems = node.checklist.slice(0, 3);
            previewItems.forEach((item, itemIndex) => {
                const checklistItem = document.createElement('div');
                checklistItem.className = `checklist-item-preview ${item.completed ? 'completed' : ''}`;
                checklistItem.innerHTML = `
                    <input type="checkbox" ${item.completed ? 'checked' : ''} 
                           onchange="checklistManager.toggleChecklistItem(${JSON.stringify(path)}, ${index}, ${itemIndex})">
                    <span>${item.text}</span>
                `;
                checklist.appendChild(checklistItem);
            });

            // Прогресс
            const progressInfo = document.createElement('div');
            progressInfo.className = 'checklist-progress';
            progressInfo.innerHTML = `
                <div>Прогресс: ${completed}/${total} (${Math.round(progress)}%)</div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progress}%"></div>
                </div>
            `;
            checklist.appendChild(progressInfo);

            content.appendChild(checklist);
        }

        item.appendChild(content);

        // Вложенные элементы
        if ((node.type === 'category' || node.type === 'node') && node.expanded && node.children && node.children.length > 0) {
            const childrenContainer = document.createElement('div');
            childrenContainer.className = 'item-children';
            
            node.children.forEach((child, childIndex) => {
                childrenContainer.appendChild(this.createStructureNode(child, level + 1, fullPath, childIndex));
            });
            
            item.appendChild(childrenContainer);
        }

        return item;
    },

    getNodeIcon(type) {
        const icons = {
            'category': '📁',
            'node': '📂',
            'technology': '⚙️'
        };
        return icons[type] || '📄';
    },

    toggleNode(path) {
        const node = dataManager.getNodeByPath(path.slice(0, -1))[path[path.length - 1]];
        if (node) {
            node.expanded = !node.expanded;
            this.renderStructure();
            dataManager.saveToLocalStorage();
        }
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

    // === ОБНОВЛЕНИЕ ВЫБОРА РОДИТЕЛЯ ===
    updateParentSelect(modalId, currentPath) {
        const container = document.getElementById(modalId === 'nodeModal' ? 'nodeParentSelect' : 'techParentSelect');
        container.innerHTML = '';
        
        const title = document.createElement('div');
        title.innerHTML = `<strong>Родитель:</strong> ${this.getPathDisplay(currentPath) || 'Корневой уровень'}`;
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

// Закрытие модальных окон
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        uiManager.hideModals();
    }
};