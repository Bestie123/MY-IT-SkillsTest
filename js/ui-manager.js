const uiManager = {
    // === ОТОБРАЖЕНИЕ СТРУКТУРЫ ===
    renderStructure() {
        console.log('Rendering structure...');
        const container = document.getElementById('structureContent');
        if (!container) {
            console.error('Structure container not found!');
            return;
        }

        container.innerHTML = '';

        if (!techData.categories || techData.categories.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 60px 20px; color: #666;">
                    <h3 style="margin-bottom: 10px;">Нет данных</h3>
                    <p style="margin-bottom: 20px; opacity: 0.7;">Добавьте первую категорию чтобы начать</p>
                    <button class="btn primary" onclick="uiManager.showModal('categoryModal')" style="padding: 10px 20px;">
                        Создать категорию
                    </button>
                </div>
            `;
            return;
        }

        console.log('Rendering categories:', techData.categories);
        
        techData.categories.forEach((category, index) => {
            const nodeElement = this.createStructureNode(category, 0, [], index);
            if (nodeElement) {
                container.appendChild(nodeElement);
            }
        });
    },

    createStructureNode(node, level, path, index) {
        if (!node) {
            console.warn('Invalid node at path:', path, 'index:', index);
            return null;
        }

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
        title.textContent = node.name || 'Без названия';
        
        const actions = document.createElement('div');
        actions.className = 'item-actions';

        // Кнопки действий в зависимости от типа
        if (node.type === 'category' || node.type === 'node') {
            // Кнопка расширения/свертывания
            if (node.children && node.children.length > 0) {
                const expandBtn = document.createElement('button');
                expandBtn.className = 'action-btn';
                expandBtn.innerHTML = node.expanded ? '−' : '+';
                expandBtn.title = node.expanded ? 'Свернуть' : 'Развернуть';
                expandBtn.onclick = (e) => {
                    e.stopPropagation();
                    this.toggleNode(fullPath);
                };
                actions.appendChild(expandBtn);
            } else {
                // Заполнитель для выравнивания
                const spacer = document.createElement('span');
                spacer.className = 'action-btn';
                spacer.style.visibility = 'hidden';
                spacer.innerHTML = '•';
                actions.appendChild(spacer);
            }

            const addNodeBtn = document.createElement('button');
            addNodeBtn.className = 'action-btn';
            addNodeBtn.innerHTML = '📂';
            addNodeBtn.title = 'Добавить подкатегорию';
            addNodeBtn.onclick = (e) => {
                e.stopPropagation();
                currentModalPath = fullPath;
                this.showAddNodeModal(fullPath);
            };
            actions.appendChild(addNodeBtn);

            const addTechBtn = document.createElement('button');
            addTechBtn.className = 'action-btn';
            addTechBtn.innerHTML = '⚙️';
            addTechBtn.title = 'Добавить технологию';
            addTechBtn.onclick = (e) => {
                e.stopPropagation();
                currentModalPath = fullPath;
                this.showAddTechModal(fullPath);
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

        const editBtn = document.createElement('button');
        editBtn.className = 'action-btn';
        editBtn.innerHTML = '✏️';
        editBtn.title = 'Редактировать';
        editBtn.onclick = (e) => {
            e.stopPropagation();
            if (node.type === 'technology') {
                dataManager.editTechnology(path, index);
            } else {
                dataManager.editNode(path, index);
            }
        };
        actions.appendChild(editBtn);

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
                    <span>${item.text || 'Пустой пункт'}</span>
                `;
                checklist.appendChild(checklistItem);
            });

            // Если есть еще пункты, показываем кнопку
            if (node.checklist.length > 3) {
                const moreBtn = document.createElement('button');
                moreBtn.className = 'checklist-toggle';
                moreBtn.textContent = `+ ещё ${node.checklist.length - 3} пунктов...`;
                moreBtn.onclick = (e) => {
                    e.stopPropagation();
                    checklistManager.manageChecklist(path, index);
                };
                checklist.appendChild(moreBtn);
            }

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
                const childElement = this.createStructureNode(child, level + 1, fullPath, childIndex);
                if (childElement) {
                    childrenContainer.appendChild(childElement);
                }
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
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'block';
        } else {
            console.error('Modal not found:', modalId);
        }
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
        document.getElementById('jsonSection').style.display = 'none';
    },

    // === ОБНОВЛЕНИЕ ВЫБОРА РОДИТЕЛЯ ===
    updateParentSelect(modalId, currentPath) {
        const container = document.getElementById(modalId === 'nodeModal' ? 'nodeParentSelect' : 'techParentSelect');
        if (!container) {
            console.error('Parent select container not found for:', modalId);
            return;
        }
        
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
        // Удаляем старые уведомления
        const oldNotifications = document.querySelectorAll('.notification');
        oldNotifications.forEach(notif => notif.remove());
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
    }
};

// Закрытие модальных окон при клике вне их
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        uiManager.hideModals();
    }
};