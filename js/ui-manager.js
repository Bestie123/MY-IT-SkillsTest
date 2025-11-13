const uiManager = {
    selectedParentPath: [],

    // === ОТОБРАЖЕНИЕ ТАБЛИЦЫ ===
    renderTable() {
        const tbody = document.getElementById('tableBody');
        tbody.innerHTML = '';

        if (techData.categories.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Нет данных. Добавьте первую категорию!</td></tr>';
            return;
        }

        // Рендерим категории и их содержимое
        techData.categories.forEach((category, categoryIndex) => {
            this.renderCategory(category, [categoryIndex], tbody);
        });
    },

    renderCategory(category, path, tbody) {
        // Рендерим саму категорию
        const categoryRow = document.createElement('tr');
        categoryRow.className = 'category-row';
        categoryRow.innerHTML = `
            <td class="category-column">
                <strong>${category.name}</strong>
                <div class="parent-path">${this.getPathDisplay(path)}</div>
            </td>
            <td class="empty-cell">—</td>
            <td class="empty-cell">—</td>
            <td class="empty-cell">—</td>
            <td class="empty-cell">—</td>
            <td class="empty-cell">—</td>
            <td class="row-actions">
                <button onclick="uiManager.showAddNodeModal(${JSON.stringify(path)})">+ Подкатегория</button>
                <button onclick="uiManager.showAddTechModal(${JSON.stringify(path)})">+ Технология</button>
                <button onclick="dataManager.editNode(${JSON.stringify(path)})">✏️</button>
                <button class="delete" onclick="dataManager.deleteNode(${JSON.stringify(path)})">🗑️</button>
            </td>
        `;
        tbody.appendChild(categoryRow);

        // Рендерим подкатегории и технологии
        if (category.children && category.children.length > 0) {
            category.children.forEach((child, childIndex) => {
                const childPath = [...path, childIndex];
                if (child.type === 'node') {
                    this.renderSubcategory(child, childPath, tbody);
                } else if (child.type === 'technology') {
                    this.renderTechnology(child, childPath, tbody, category.name, '');
                }
            });
        }
    },

    renderSubcategory(subcategory, path, tbody) {
        // Рендерим подкатегорию
        const subcategoryRow = document.createElement('tr');
        subcategoryRow.className = 'subcategory-row';
        subcategoryRow.innerHTML = `
            <td class="category-column"></td>
            <td class="subcategory-column">
                <strong>${subcategory.name}</strong>
                <div class="parent-path">${this.getPathDisplay(path)}</div>
            </td>
            <td class="empty-cell">—</td>
            <td class="empty-cell">—</td>
            <td class="empty-cell">—</td>
            <td class="empty-cell">—</td>
            <td class="row-actions">
                <button onclick="uiManager.showAddNodeModal(${JSON.stringify(path)})">+ Подкатегория</button>
                <button onclick="uiManager.showAddTechModal(${JSON.stringify(path)})">+ Технология</button>
                <button onclick="dataManager.editNode(${JSON.stringify(path)})">✏️</button>
                <button class="delete" onclick="dataManager.deleteNode(${JSON.stringify(path)})">🗑️</button>
            </td>
        `;
        tbody.appendChild(subcategoryRow);

        // Рендерим содержимое подкатегории
        if (subcategory.children && subcategory.children.length > 0) {
            subcategory.children.forEach((child, childIndex) => {
                const childPath = [...path, childIndex];
                if (child.type === 'node') {
                    this.renderSubcategory(child, childPath, tbody);
                } else if (child.type === 'technology') {
                    // Находим названия родительских категорий для отображения
                    const categoryName = this.getCategoryName(path);
                    const subcategoryName = subcategory.name;
                    this.renderTechnology(child, childPath, tbody, categoryName, subcategoryName);
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
            <td class="category-column">${categoryName || '—'}</td>
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
                <button onclick="checklistManager.manageChecklist(${JSON.stringify(path)})" class="warning">📋 Чек-лист</button>
                <button onclick="dataManager.editTechnology(${JSON.stringify(path)})">✏️</button>
                <button class="delete" onclick="dataManager.deleteTechnology(${JSON.stringify(path)})">🗑️</button>
            </td>
        `;
        tbody.appendChild(techRow);
    },

    getCategoryName(path) {
        if (path.length === 0) return '';
        const category = dataManager.getNodeByPath([path[0]]);
        return category ? category.name : '';
    },

    getPathDisplay(path) {
        if (path.length === 0) return '';
        let currentNode = techData;
        let pathNames = [];
        
        for (const index of path) {
            if (currentNode.children && currentNode.children[index]) {
                currentNode = currentNode.children[index];
                pathNames.push(currentNode.name);
            }
        }
        
        return pathNames.join(' → ');
    },

    // === УПРАВЛЕНИЕ МОДАЛЬНЫМИ ОКНАМИ ===
    showAddCategoryModal() {
        this.showModal('categoryModal');
    },

    showAddNodeModal(parentPath = []) {
        this.selectedParentPath = parentPath;
        this.renderParentSelect('nodeParentSelect', parentPath);
        this.showModal('nodeModal');
    },

    showAddTechModal(parentPath = []) {
        this.selectedParentPath = parentPath;
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
    },

    hideJSON() {
        document.getElementById('jsonSection').classList.add('hidden');
    },

    // === ВЫБОР РОДИТЕЛЯ ===
    renderParentSelect(containerId, currentPath) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';
        
        // Добавляем возможность выбора корня
        const rootItem = document.createElement('div');
        rootItem.className = `parent-select-item ${currentPath.length === 0 ? 'selected' : ''}`;
        rootItem.innerHTML = `
            <strong>Корень</strong>
            <div class="parent-path">Путь: корневая категория</div>
        `;
        rootItem.onclick = () => {
            this.selectParent([], containerId);
        };
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
                    <div class="parent-path">Путь: ${this.getPathDisplay(path)}</div>
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
        this.selectedParentPath = path;
        currentModalPath = path;
        
        // Обновляем выделение
        document.querySelectorAll(`#${containerId} .parent-select-item`).forEach(item => {
            item.classList.remove('selected');
        });
        
        event.target.closest('.parent-select-item').classList.add('selected');
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