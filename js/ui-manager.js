
const uiManager = {
    // === ОТОБРАЖЕНИЕ ТАБЛИЦЫ ===
    renderTable() {
        const tbody = document.getElementById('tableBody');
        tbody.innerHTML = '';

        if (techData.categories.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Нет данных. Добавьте первую категорию!</td></tr>';
            return;
        }

        // Рендерим корневые категории как строки
        techData.categories.forEach((category, index) => {
            this.renderCategoryRow(category, 0, [], index);
        });
    },

    renderCategoryRow(category, level, path, index) {
        const tbody = document.getElementById('tableBody');
        const fullPath = [...path, index];
        
        // Создаем строку для категории
        const row = document.createElement('tr');
        row.className = `node-level-${level % 6}`;
        
        // Создаем ячейки для всех уровней вложенности
        let categoryCells = '';
        for (let i = 0; i < level; i++) {
            categoryCells += '<td></td>';
        }
        
        categoryCells += `
            <td>
                <strong>${category.name}</strong>
                <span class="path-display">${this.getPathDisplay(fullPath)}</span>
            </td>
        `;
        
        // Заполняем оставшиеся ячейки пустыми
        const remainingColumns = 5 - level; // 5 - максимальное количество столбцов категорий
        for (let i = 0; i < remainingColumns; i++) {
            categoryCells += '<td></td>';
        }
        
        row.innerHTML = `
            ${categoryCells}
            <td>
                <button onclick="navigation.viewNode(${JSON.stringify(fullPath)})">👁️ Просмотр</button>
                <button onclick="uiManager.showAddNodeModal(${JSON.stringify(fullPath)})">+ Подкатегория</button>
                <button onclick="uiManager.showAddTechModal(${JSON.stringify(fullPath)})">+ Технология</button>
                <button onclick="dataManager.editNode(${JSON.stringify(path)}, ${index})">✏️</button>
                <button class="delete" onclick="dataManager.deleteNode(${JSON.stringify(path)}, ${index})">🗑️</button>
            </td>
        `;
        tbody.appendChild(row);

        // Рендерим технологии этой категории
        if (category.technologies && category.technologies.length > 0) {
            category.technologies.forEach((tech, techIndex) => {
                this.renderTechnologyRow(tech, level + 1, fullPath, techIndex);
            });
        }

        // Рекурсивно рендерим подкатегории как новые строки
        if (category.children && category.children.length > 0) {
            category.children.forEach((child, childIndex) => {
                this.renderCategoryRow(child, level + 1, fullPath, childIndex);
            });
        }
    },

    renderTechnologyRow(tech, level, path, techIndex) {
        const tbody = document.getElementById('tableBody');
        const completedTasks = tech.checklist ? tech.checklist.filter(item => item.completed).length : 0;
        const totalTasks = tech.checklist ? tech.checklist.length : 0;
        const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
        
        let statusText = '';
        let statusClass = '';
        
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

        // Создаем ячейки для всех уровней вложенности
        let categoryCells = '';
        for (let i = 0; i < level; i++) {
            categoryCells += '<td></td>';
        }
        
        const row = document.createElement('tr');
        row.innerHTML = `
            ${categoryCells}
            <td><strong>${tech.name}</strong></td>
            ${this.generateEmptyCells(4 - level)}
            <td class="${statusClass}">${statusText}</td>
            <td>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progress}%"></div>
                </div>
                ${Math.round(progress)}%
            </td>
            <td>${completedTasks}/${totalTasks}</td>
            <td>
                <button onclick="checklistManager.manageChecklist(${JSON.stringify(path)}, ${techIndex})" class="warning">📋 Чек-лист</button>
                <button onclick="dataManager.editTechnology(${JSON.stringify(path)}, ${techIndex})">✏️</button>
                <button class="delete" onclick="dataManager.deleteTechnology(${JSON.stringify(path)}, ${techIndex})">🗑️</button>
            </td>
        `;
        tbody.appendChild(row);

        // Отображаем чек-лист под технологией, если он есть
        if (tech.checklist && tech.checklist.length > 0) {
            this.renderChecklistSection(tech, level, path, techIndex, completedTasks, totalTasks, progress);
        }
    },

    renderChecklistSection(tech, level, path, techIndex, completedTasks, totalTasks, progress) {
        const tbody = document.getElementById('tableBody');
        const checklistRow = document.createElement('tr');
        
        // Создаем ячейки для всех уровней вложенности
        let categoryCells = '';
        for (let i = 0; i <= level; i++) {
            categoryCells += '<td></td>';
        }
        
        checklistRow.innerHTML = `
            ${categoryCells}
            <td colspan="${5 - level}">
                <div class="checklist-section">
                    <div class="checklist-stats">
                        Прогресс: ${completedTasks}/${totalTasks} (${Math.round(progress)}%)
                    </div>
                    ${tech.checklist.map((checkItem, idx) => `
                        <div class="checklist-item ${checkItem.completed ? 'completed' : ''}">
                            <input type="checkbox" ${checkItem.completed ? 'checked' : ''} 
                                   onchange="checklistManager.toggleChecklistItem(${JSON.stringify(path)}, ${techIndex}, ${idx})">
                            <span class="checklist-item-text">${checkItem.text}</span>
                        </div>
                    `).join('')}
                </div>
            </td>
        `;
        tbody.appendChild(checklistRow);
    },

    generateEmptyCells(count) {
        let cells = '';
        for (let i = 0; i < count; i++) {
            cells += '<td></td>';
        }
        return cells;
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