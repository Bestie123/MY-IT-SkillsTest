const uiManager = {
    // === ОТОБРАЖЕНИЕ ТАБЛИЦЫ В ФОРМАТЕ СТОЛБЦОВ ===
    renderTable() {
        const tbody = document.getElementById('tableBody');
        tbody.innerHTML = '';

        if (techData.categories.length === 0) {
            tbody.innerHTML = '<tr><td colspan="10" style="text-align: center;">Нет данных. Добавьте первую категорию!</td></tr>';
            return;
        }

        // Сначала собираем все возможные пути для построения столбцов
        const allPaths = this.collectAllPaths();
        
        // Создаем заголовки столбцов на основе путей
        this.createColumnHeaders(allPaths);
        
        // Рендерим строки с технологиями
        this.renderTechnologyRows(allPaths);
    },

    collectAllPaths() {
        const paths = [];
        
        const traverse = (node, currentPath) => {
            if (node.type === 'technology') {
                paths.push([...currentPath]);
            }
            
            if (node.children && node.children.length > 0) {
                node.children.forEach((child, index) => {
                    traverse(child, [...currentPath, {name: child.name, index}]);
                });
            }
        };

        techData.categories.forEach((category, index) => {
            traverse(category, [{name: category.name, index}]);
        });
        
        return paths;
    },

    createColumnHeaders(allPaths) {
        const thead = document.querySelector('#techTable thead');
        thead.innerHTML = '';
        
        // Находим максимальную глубину для определения количества столбцов
        const maxDepth = Math.max(...allPaths.map(path => path.length));
        
        let headerHTML = '<tr>';
        
        // Столбцы для категорий и подкатегорий
        for (let i = 0; i < maxDepth; i++) {
            headerHTML += `<th>${i === 0 ? 'Категория' : `Подкатегория ${i}`}</th>`;
        }
        
        // Остальные столбцы
        headerHTML += `
            <th class="technology-column">Технология</th>
            <th class="status-column">Статус</th>
            <th class="progress-column">Прогресс</th>
            <th class="tasks-column">Задачи</th>
            <th class="actions-column">Действия</th>
        </tr>`;
        
        thead.innerHTML = headerHTML;
    },

    renderTechnologyRows(allPaths) {
        const tbody = document.getElementById('tableBody');
        
        const renderTechRow = (tech, path) => {
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

            let rowHTML = '<tr>';
            
            // Заполняем столбцы категорий и подкатегорий
            const maxDepth = Math.max(...allPaths.map(p => p.length));
            for (let i = 0; i < maxDepth; i++) {
                if (i < path.length) {
                    const pathItem = path[i];
                    const cellClass = i === 0 ? 'category-column' : 'subcategory-column';
                    rowHTML += `<td class="${cellClass}">${pathItem.name}</td>`;
                } else {
                    rowHTML += '<td class="empty-cell">—</td>';
                }
            }
            
            // Столбец технологии
            rowHTML += `<td class="technology-column"><strong>${tech.name}</strong></td>`;
            
            // Остальные столбцы
            rowHTML += `
                <td class="${statusClass}">${statusText}</td>
                <td>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                    ${Math.round(progress)}%
                </td>
                <td>${completedTasks}/${totalTasks}</td>
                <td>
                    <button onclick="checklistManager.manageChecklist(${JSON.stringify(this.getIndexPath(path))}, ${this.findTechIndex(path, tech)})" class="warning">📋 Чек-лист</button>
                    <button onclick="dataManager.editTechnology(${JSON.stringify(this.getIndexPath(path))}, ${this.findTechIndex(path, tech)})">✏️</button>
                    <button class="delete" onclick="dataManager.deleteTechnology(${JSON.stringify(this.getIndexPath(path))}, ${this.findTechIndex(path, tech)})">🗑️</button>
                </td>
            </tr>`;
            
            tbody.innerHTML += rowHTML;
        };

        // Обходим все технологии и рендерим строки
        const traverseAndRender = (node, currentPath) => {
            if (node.type === 'technology') {
                renderTechRow(node, currentPath);
            }
            
            if (node.children && node.children.length > 0) {
                node.children.forEach((child, index) => {
                    traverseAndRender(child, [...currentPath, {name: child.name, index, node: child}]);
                });
            }
        };

        techData.categories.forEach((category, index) => {
            traverseAndRender(category, [{name: category.name, index, node: category}]);
        });
    },

    getIndexPath(path) {
        return path.map(item => item.index);
    },

    findTechIndex(path, tech) {
        const lastPathItem = path[path.length - 1];
        const parentNode = path.length > 1 ? path[path.length - 2].node : techData.categories[path[0].index];
        
        if (parentNode.children) {
            return parentNode.children.findIndex(child => child === tech);
        }
        return -1;
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
        return path.map(item => item.name).join(' → ');
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