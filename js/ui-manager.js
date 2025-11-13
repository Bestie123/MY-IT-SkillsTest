const uiManager = {
    // === ОТОБРАЖЕНИЕ ТАБЛИЦЫ ===
    renderTable() {
        const tbody = document.getElementById('tableBody');
        tbody.innerHTML = '';

        if (techData.categories.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 40px; color: #6c757d;">Нет данных. Добавьте первую категорию!</td></tr>';
            return;
        }

        const renderNode = (node, level, path, index) => {
            const fullPath = [...path, index];
            
            if (node.type === 'technology') {
                this.renderTechnologyRow(node, level, fullPath, index);
            } else {
                // Рендерим категорию или подкатегорию
                const row = document.createElement('tr');
                row.className = `${node.type === 'category' ? 'category-row' : 'node-row'} level-${level}`;
                
                const hasChildren = node.children && node.children.length > 0;
                const indentStyle = `padding-left: ${10 + level * 20}px`;
                
                row.innerHTML = `
                    <td style="${indentStyle}">
                        <div style="display: flex; align-items: center;">
                            ${hasChildren ? 
                                `<button class="expand-btn" onclick="uiManager.toggleExpand(${JSON.stringify(fullPath)})">
                                    ${node.expanded ? '−' : '+'}
                                </button>` : 
                                '<span class="expand-btn" style="visibility: hidden;">•</span>'
                            }
                            <span class="node-icon">${node.type === 'category' ? '📁' : '📂'}</span>
                            <strong>${node.name}</strong>
                        </div>
                    </td>
                    <td>${node.type === 'category' ? 'Категория' : 'Подкатегория'}</td>
                    <td>-</td>
                    <td>-</td>
                    <td>
                        <div class="actions">
                            <button class="edit" onclick="dataManager.editNode(${JSON.stringify(path)}, ${index})" title="Редактировать">✏️</button>
                            ${node.type === 'category' || node.type === 'node' ? `
                                <button onclick="uiManager.showAddNodeModal(${JSON.stringify(fullPath)})" title="Добавить подкатегорию">📂</button>
                                <button onclick="uiManager.showAddTechModal(${JSON.stringify(fullPath)})" title="Добавить технологию">⚙️</button>
                            ` : ''}
                            <button class="delete" onclick="dataManager.deleteNode(${JSON.stringify(path)}, ${index})" title="Удалить">🗑️</button>
                        </div>
                    </td>
                `;
                tbody.appendChild(row);

                // Рекурсивно рендерим дочерние элементы если развернуто
                if (node.expanded && node.children && node.children.length > 0) {
                    node.children.forEach((child, childIndex) => {
                        renderNode(child, level + 1, fullPath, childIndex);
                    });
                }
            }
        };

        // Рендерим корневые категории
        techData.categories.forEach((category, index) => {
            renderNode(category, 0, [], index);
        });
    },

    renderTechnologyRow(tech, level, path, techIndex) {
        const tbody = document.getElementById('tableBody');
        const completedTasks = tech.checklist ? tech.checklist.filter(item => item.completed).length : 0;
        const totalTasks = tech.checklist ? tech.checklist.length : 0;
        const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
        
        let statusText = '';
        let statusClass = '';
        
        if (totalTasks === 0) {
            statusText = 'В планах';
            statusClass = 'status-planned';
        } else if (completedTasks === totalTasks) {
            statusText = 'Изучено';
            statusClass = 'status-completed';
        } else {
            statusText = 'В процессе';
            statusClass = 'status-in-progress';
        }

        const indentStyle = `padding-left: ${10 + level * 20}px`;
        
        // Строка технологии
        const row = document.createElement('tr');
        row.className = `tech-row level-${level}`;
        row.innerHTML = `
            <td style="${indentStyle}">
                <div style="display: flex; align-items: center;">
                    <span class="node-icon">⚙️</span>
                    <strong>${tech.name}</strong>
                </div>
            </td>
            <td>Технология</td>
            <td>
                <div class="progress-info">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                    <span>${Math.round(progress)}%</span>
                </div>
            </td>
            <td>
                <span class="status-badge ${statusClass}">${statusText}</span>
            </td>
            <td>
                <div class="actions">
                    <button class="checklist" onclick="checklistManager.manageChecklist(${JSON.stringify(path)}, ${techIndex})" title="Управление чек-листом">📋</button>
                    <button class="edit" onclick="dataManager.editTechnology(${JSON.stringify(path)}, ${techIndex})" title="Редактировать">✏️</button>
                    <button class="delete" onclick="dataManager.deleteTechnology(${JSON.stringify(path)}, ${techIndex})" title="Удалить">🗑️</button>
                </div>
            </td>
        `;
        tbody.appendChild(row);

        // Строка с превью чеклиста
        if (tech.checklist && tech.checklist.length > 0) {
            const checklistRow = document.createElement('tr');
            checklistRow.className = `checklist-preview-row level-${level}`;
            
            const visibleItems = tech.checklist.slice(0, 3); // Показываем первые 3 пункта
            const hasMore = tech.checklist.length > 3;
            
            checklistRow.innerHTML = `
                <td colspan="5" style="${indentStyle}">
                    <div class="checklist-preview">
                        ${visibleItems.map((item, index) => `
                            <div class="checklist-item-preview ${item.completed ? 'completed' : ''}">
                                <input type="checkbox" ${item.completed ? 'checked' : ''} 
                                       onchange="checklistManager.toggleChecklistItem(${JSON.stringify(path)}, ${techIndex}, ${index})">
                                <span class="checklist-item-text">${item.text}</span>
                            </div>
                        `).join('')}
                        ${hasMore ? `
                            <button class="checklist-toggle" onclick="checklistManager.manageChecklist(${JSON.stringify(path)}, ${techIndex})">
                                + ещё ${tech.checklist.length - 3} пунктов...
                            </button>
                        ` : ''}
                        <div style="margin-top: 5px; font-size: 0.8em; color: #6c757d;">
                            Прогресс: ${completedTasks}/${totalTasks} (${Math.round(progress)}%)
                        </div>
                    </div>
                </td>
            `;
            tbody.appendChild(checklistRow);
        }
    },

    // === РАСШИРЕНИЕ/СВЕРТЫВАНИЕ ===
    toggleExpand(path) {
        const node = dataManager.getNodeByPath(path.slice(0, -1))[path[path.length - 1]];
        if (node) {
            node.expanded = !node.expanded;
            this.renderTable();
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