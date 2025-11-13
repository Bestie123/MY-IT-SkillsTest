const uiManager = {
    // === ОТОБРАЖЕНИЕ ТАБЛИЦЫ ===
    renderTable() {
        const tbody = document.getElementById('tableBody');
        tbody.innerHTML = '';

        if (techData.categories.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Нет данных. Добавьте первую категорию!</td></tr>';
            return;
        }

        // Рендерим все категории и их содержимое
        techData.categories.forEach((category, categoryIndex) => {
            this.renderCategory(category, [categoryIndex], tbody);
        });
    },

    renderCategory(category, path, tbody) {
        // Рендерим строку категории
        const categoryRow = document.createElement('tr');
        categoryRow.className = 'category-row';
        categoryRow.innerHTML = `
            <td class="category-column">
                <strong>${category.name}</strong>
            </td>
            <td class="empty-cell">—</td>
            <td class="empty-cell">—</td>
            <td class="empty-cell">—</td>
            <td class="empty-cell">—</td>
            <td class="empty-cell">—</td>
            <td class="row-actions">
                <button onclick="uiManager.showAddNodeModal(${JSON.stringify(path)})">+ Подкатегория</button>
                <button onclick="uiManager.showAddTechModal(${JSON.stringify(path)})">+ Технология</button>
                <button onclick="dataManager.editCategory(${categoryIndex})">✏️</button>
                <button class="delete" onclick="dataManager.deleteCategory(${categoryIndex})">🗑️</button>
            </td>
        `;
        tbody.appendChild(categoryRow);

        // Рендерим содержимое категории
        if (category.children && category.children.length > 0) {
            category.children.forEach((child, childIndex) => {
                const childPath = [...path, childIndex];
                this.renderNodeOrTech(child, childPath, tbody, category.name);
            });
        }
    },

    renderNodeOrTech(node, path, tbody, categoryName) {
        if (node.type === 'node') {
            this.renderNode(node, path, tbody, categoryName);
        } else if (node.type === 'technology') {
            this.renderTechnology(node, path, tbody, categoryName, '');
        }
    },

    renderNode(node, path, tbody, categoryName) {
        // Рендерим строку подкатегории
        const nodeRow = document.createElement('tr');
        nodeRow.className = 'subcategory-row';
        nodeRow.innerHTML = `
            <td class="category-column">${categoryName}</td>
            <td class="subcategory-column">
                <strong>${node.name}</strong>
            </td>
            <td class="empty-cell">—</td>
            <td class="empty-cell">—</td>
            <td class="empty-cell">—</td>
            <td class="empty-cell">—</td>
            <td class="row-actions">
                <button onclick="uiManager.showAddNodeModal(${JSON.stringify(path)})">+ Подкатегория</button>
                <button onclick="uiManager.showAddTechModal(${JSON.stringify(path)})">+ Технология</button>
                <button onclick="dataManager.editNode(${JSON.stringify(path.slice(0, -1))}, ${path[path.length - 1]})">✏️</button>
                <button class="delete" onclick="dataManager.deleteNode(${JSON.stringify(path.slice(0, -1))}, ${path[path.length - 1]})">🗑️</button>
            </td>
        `;
        tbody.appendChild(nodeRow);

        // Рендерим содержимое подкатегории
        if (node.children && node.children.length > 0) {
            node.children.forEach((child, childIndex) => {
                const childPath = [...path, childIndex];
                if (child.type === 'node') {
                    this.renderNode(child, childPath, tbody, categoryName);
                } else if (child.type === 'technology') {
                    this.renderTechnology(child, childPath, tbody, categoryName, node.name);
                }
            });
        }
    },

    renderTechnology(tech, path, tbody, categoryName, subcategoryName) {
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

        const techRow = document.createElement('tr');
        techRow.className = 'tech-row';
        techRow.innerHTML = `
            <td class="category-column">${categoryName}</td>
            <td class="subcategory-column">${subcategoryName || '—'}</td>
            <td class="technology-column"><strong>${tech.name}</strong></td>
            <td class="${statusClass}">${statusText}</td>
            <td>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progress}%"></div>
                </div>
                ${Math.round(progress)}%
            </td>
            <td>${completedTasks}/${totalTasks}</td>
            <td class="row-actions">
                <button onclick="checklistManager.manageChecklist(${JSON.stringify(path.slice(0, -1))}, ${path[path.length - 1]})" class="warning">📋 Чек-лист</button>
                <button onclick="dataManager.editTechnology(${JSON.stringify(path.slice(0, -1))}, ${path[path.length - 1]})">✏️</button>
                <button class="delete" onclick="dataManager.deleteTechnology(${JSON.stringify(path.slice(0, -1))}, ${path[path.length - 1]})">🗑️</button>
            </td>
        `;
        tbody.appendChild(techRow);
    },

    // === УПРАВЛЕНИЕ МОДАЛЬНЫМИ ОКНАМИ ===
    showAddCategoryModal() {
        this.showModal('categoryModal');
    },

    showAddNodeModal(parentPath = []) {
        currentModalPath = parentPath;
        this.renderParentSelect('nodeParentSelect', parentPath);
        this.showModal('nodeModal');
    },

    showAddTechModal(parentPath = []) {
        currentModalPath = parentPath;
        this.renderParentSelect('techParentSelect', parentPath);
        this.showModal('techModal');
    },

    showModal(modalId) {
        document.getElementById(modalId).style.display = 'block';
    },

    hideModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
        // Сбрасываем выбранный путь
        currentModalPath = [];
    },

    hideJSON() {
        document.getElementById('jsonSection').classList.add('hidden');
    },

    // === ВЫБОР РОДИТЕЛЯ ===
    renderParentSelect(containerId, currentPath) {
        const container = document.getElementById(containerId);
        container.innerHTML = '<h4>Выберите родительскую категорию:</h4>';
        
        // Добавляем корневую категорию
        const rootItem = document.createElement('div');
        rootItem.className = `parent-select-item ${currentPath.length === 0 ? 'selected' : ''}`;
        rootItem.innerHTML = `
            <strong>Корневая категория</strong>
            <div class="parent-path">Добавить на верхний уровень</div>
        `;
        rootItem.onclick = () => this.selectParent([], containerId);
        container.appendChild(rootItem);

        // Рекурсивно добавляем все категории и подкатегории
        this.addParentOptions(techData.categories, [], containerId, currentPath);
    },

    addParentOptions(nodes, currentPath, containerId, selectedPath) {
        nodes.forEach((node, index) => {
            if (node.type !== 'technology') {
                const path = [...currentPath, index];
                const isSelected = JSON.stringify(path) === JSON.stringify(selectedPath);
                
                const item = document.createElement('div');
                item.className = `parent-select-item ${isSelected ? 'selected' : ''}`;
                item.innerHTML = `
                    <strong>${node.name}</strong>
                    <div class="parent-path">${this.getPathDisplay(path)}</div>
                `;
                item.onclick = () => {
                    this.selectParent(path, containerId);
                };
                document.getElementById(containerId).appendChild(item);

                // Рекурсивно добавляем дочерние элементы
                if (node.children) {
                    this.addParentOptions(node.children, path, containerId, selectedPath);
                }
            }
        });
    },

    selectParent(path, containerId) {
        currentModalPath = path;
        
        // Обновляем выделение
        document.querySelectorAll(`#${containerId} .parent-select-item`).forEach(item => {
            item.classList.remove('selected');
        });
        
        event.target.closest('.parent-select-item').classList.add('selected');
    },

    getPathDisplay(path) {
        if (path.length === 0) return 'Корневой уровень';
        
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