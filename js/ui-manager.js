const uiManager = {
    // === ОТОБРАЖЕНИЕ ТАБЛИЦЫ ===
    renderTable() {
        const tbody = document.getElementById('tableBody');
        tbody.innerHTML = '';

        if (techData.categories.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Нет данных. Добавьте первую категорию!</td></tr>';
            return;
        }

        const renderNode = (node, level, path, index) => {
            const fullPath = [...path, index];
            
            // Рендерим саму категорию
            const row = document.createElement('tr');
            row.className = `node-level-${level % 6}`;
            row.innerHTML = `
                <td class="indent-${level}">
                    <strong>${node.name}</strong>
                    <span class="path-display">${this.getPathDisplay(fullPath)}</span>
                </td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td>
                    <button onclick="navigation.viewNode(${JSON.stringify(fullPath)})">👁️ Просмотр</button>
                    <button onclick="uiManager.showModal('nodeModal', ${JSON.stringify(fullPath)})">+ Подкатегория</button>
                    <button onclick="uiManager.showModal('techModal', ${JSON.stringify(fullPath)})">+ Технология</button>
                    <button onclick="dataManager.editNode(${JSON.stringify(path)}, ${index})">✏️</button>
                    <button class="delete" onclick="dataManager.deleteNode(${JSON.stringify(path)}, ${index})">🗑️</button>
                </td>
            `;
            tbody.appendChild(row);

            // Рендерим технологии этой категории
            if (node.technologies && node.technologies.length > 0) {
                node.technologies.forEach((tech, techIndex) => {
                    this.renderTechnologyRow(tech, level + 1, fullPath, techIndex);
                });
            }

            // Рекурсивно рендерим дочерние категории
            if (node.children && node.children.length > 0) {
                node.children.forEach((child, childIndex) => {
                    renderNode(child, level + 1, fullPath, childIndex);
                });
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
            statusText = '📝 В планах';
            statusClass = 'status-planned';
        } else if (completedTasks === totalTasks) {
            statusText = '✅ Изучено';
            statusClass = 'status-completed';
        } else {
            statusText = '🚧 В процессе';
            statusClass = 'status-in-progress';
        }

        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="indent-${level}"></td>
            <td><strong>${tech.name}</strong></td>
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
        checklistRow.innerHTML = `
            <td class="indent-${level}"></td>
            <td colspan="5">
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
    showModal(modalId, path = []) {
        if (modalId === 'nodeModal' || modalId === 'techModal') {
            this.updateParentSelect(modalId, path);
        }
        document.getElementById(modalId).style.display = 'block';
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
        
        const hiddenInput = document.createElement('input');
        hiddenInput.type = 'hidden';
        hiddenInput.id = modalId === 'nodeModal' ? 'nodeParentPath' : 'techParentPath';
        hiddenInput.dataset.path = JSON.stringify(currentPath);
        container.appendChild(hiddenInput);
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