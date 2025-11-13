const uiManager = {
    // === ОТОБРАЖЕНИЕ ТАБЛИЦЫ ===
    renderTable() {
        const tbody = document.getElementById('tableBody');
        tbody.innerHTML = '';

        if (techData.categories.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Нет данных. Добавьте первую категорию!</td></tr>';
            return;
        }

        const itemsToRender = this.getItemsToRender();
        
        itemsToRender.forEach(item => {
            switch(item.type) {
                case 'category':
                    this.renderCategoryRow(item);
                    break;
                case 'subcategory':
                    this.renderSubcategoryRow(item);
                    break;
                case 'subsubcategory':
                    this.renderSubsubcategoryRow(item);
                    break;
                case 'technology':
                    this.renderTechnologyRow(item);
                    break;
            }
        });
    },

    getItemsToRender() {
        const items = [];
        const view = navigation.currentView;

        if (view.type === 'all') {
            techData.categories.forEach((category, categoryIndex) => {
                items.push({ type: 'category', categoryIndex, data: category });
                this.addSubcategoriesToItems(items, categoryIndex, category);
            });
        } else if (view.type === 'category') {
            const category = techData.categories[view.categoryIndex];
            items.push({ type: 'category', categoryIndex: view.categoryIndex, data: category });
            this.addSubcategoriesToItems(items, view.categoryIndex, category);
        } else if (view.type === 'subcategory') {
            const subcategory = techData.categories[view.categoryIndex].subcategories[view.subcategoryIndex];
            items.push({ type: 'subcategory', categoryIndex: view.categoryIndex, subcategoryIndex: view.subcategoryIndex, data: subcategory });
            this.addSubsubcategoriesToItems(items, view.categoryIndex, view.subcategoryIndex, subcategory);
        } else if (view.type === 'subsubcategory') {
            const subsubcategory = techData.categories[view.categoryIndex].subcategories[view.subcategoryIndex].subsubcategories[view.subsubcategoryIndex];
            items.push({ type: 'subsubcategory', categoryIndex: view.categoryIndex, subcategoryIndex: view.subcategoryIndex, subsubcategoryIndex: view.subsubcategoryIndex, data: subsubcategory });
            this.addTechnologiesToItems(items, view.categoryIndex, view.subcategoryIndex, view.subsubcategoryIndex, subsubcategory);
        }

        return items;
    },

    addSubcategoriesToItems(items, categoryIndex, category) {
        if (category.subcategories) {
            category.subcategories.forEach((subcategory, subcategoryIndex) => {
                items.push({ type: 'subcategory', categoryIndex, subcategoryIndex, data: subcategory });
                this.addSubsubcategoriesToItems(items, categoryIndex, subcategoryIndex, subcategory);
            });
        }
        this.addTechnologiesToItems(items, categoryIndex, -1, -1, category);
    },

    addSubsubcategoriesToItems(items, categoryIndex, subcategoryIndex, subcategory) {
        if (subcategory.subsubcategories) {
            subcategory.subsubcategories.forEach((subsubcategory, subsubcategoryIndex) => {
                items.push({ type: 'subsubcategory', categoryIndex, subcategoryIndex, subsubcategoryIndex, data: subsubcategory });
                this.addTechnologiesToItems(items, categoryIndex, subcategoryIndex, subsubcategoryIndex, subsubcategory);
            });
        }
        this.addTechnologiesToItems(items, categoryIndex, subcategoryIndex, -1, subcategory);
    },

    addTechnologiesToItems(items, categoryIndex, subcategoryIndex, subsubcategoryIndex, parent) {
        if (parent.technologies) {
            parent.technologies.forEach((tech, techIndex) => {
                items.push({ type: 'technology', categoryIndex, subcategoryIndex, subsubcategoryIndex, techIndex, data: tech });
            });
        }
    },

    renderCategoryRow(item) {
        const tbody = document.getElementById('tableBody');
        const row = document.createElement('tr');
        row.className = 'category-header';
        row.innerHTML = `
            <td colspan="6">
                <strong>${item.data.name}</strong>
                <button onclick="navigation.viewCategory(${item.categoryIndex})">👁️ Просмотр</button>
                <button onclick="this.editCategory(${item.categoryIndex})">✏️</button>
                <button class="delete" onclick="this.deleteCategory(${item.categoryIndex})">🗑️</button>
            </td>
        `;
        tbody.appendChild(row);
    },

    renderSubcategoryRow(item) {
        const tbody = document.getElementById('tableBody');
        const row = document.createElement('tr');
        row.className = 'subcategory-header';
        row.innerHTML = `
            <td class="indent-1"></td>
            <td colspan="5">
                <strong>${item.data.name}</strong>
                <button onclick="navigation.viewSubcategory(${item.categoryIndex}, ${item.subcategoryIndex})">👁️ Просмотр</button>
                <button onclick="this.editSubcategory(${item.categoryIndex}, ${item.subcategoryIndex})">✏️</button>
                <button class="delete" onclick="this.deleteSubcategory(${item.categoryIndex}, ${item.subcategoryIndex})">🗑️</button>
            </td>
        `;
        tbody.appendChild(row);
    },

    renderSubsubcategoryRow(item) {
        const tbody = document.getElementById('tableBody');
        const row = document.createElement('tr');
        row.className = 'subsubcategory-header';
        row.innerHTML = `
            <td class="indent-2"></td>
            <td colspan="5">
                <strong>${item.data.name}</strong>
                <button onclick="navigation.viewSubsubcategory(${item.categoryIndex}, ${item.subcategoryIndex}, ${item.subsubcategoryIndex})">👁️ Просмотр</button>
                <button onclick="this.editSubsubcategory(${item.categoryIndex}, ${item.subcategoryIndex}, ${item.subsubcategoryIndex})">✏️</button>
                <button class="delete" onclick="this.deleteSubsubcategory(${item.categoryIndex}, ${item.subcategoryIndex}, ${item.subsubcategoryIndex})">🗑️</button>
            </td>
        `;
        tbody.appendChild(row);
    },

    renderTechnologyRow(item) {
        const tbody = document.getElementById('tableBody');
        const completedTasks = item.data.checklist ? item.data.checklist.filter(item => item.completed).length : 0;
        const totalTasks = item.data.checklist ? item.data.checklist.length : 0;
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
        let indentClass = '';
        if (item.subsubcategoryIndex !== -1) {
            indentClass = 'indent-3';
        } else if (item.subcategoryIndex !== -1) {
            indentClass = 'indent-2';
        } else {
            indentClass = 'indent-1';
        }
        
        row.innerHTML = `
            <td class="${indentClass}"></td>
            <td><strong>${item.data.name}</strong></td>
            <td class="${statusClass}">${statusText}</td>
            <td>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progress}%"></div>
                </div>
                ${Math.round(progress)}%
            </td>
            <td>${completedTasks}/${totalTasks}</td>
            <td>
                <button onclick="checklistManager.manageChecklist(${item.categoryIndex}, ${item.subcategoryIndex}, ${item.subsubcategoryIndex}, ${item.techIndex})" class="warning">📋 Чек-лист</button>
                <button onclick="this.editTechnology(${item.categoryIndex}, ${item.subcategoryIndex}, ${item.subsubcategoryIndex}, ${item.techIndex})">✏️</button>
                <button class="delete" onclick="this.deleteTechnology(${item.categoryIndex}, ${item.subcategoryIndex}, ${item.subsubcategoryIndex}, ${item.techIndex})">🗑️</button>
            </td>
        `;
        tbody.appendChild(row);

        if (item.data.checklist && item.data.checklist.length > 0) {
            this.renderChecklistSection(item, indentClass, completedTasks, totalTasks, progress);
        }
    },

    renderChecklistSection(item, indentClass, completedTasks, totalTasks, progress) {
        const tbody = document.getElementById('tableBody');
        const checklistRow = document.createElement('tr');
        checklistRow.innerHTML = `
            <td class="${indentClass}"></td>
            <td colspan="5">
                <div class="checklist-section">
                    <div class="checklist-stats">
                        Прогресс: ${completedTasks}/${totalTasks} (${Math.round(progress)}%)
                    </div>
                    ${item.data.checklist.map((checkItem, idx) => `
                        <div class="checklist-item ${checkItem.completed ? 'completed' : ''}">
                            <input type="checkbox" ${checkItem.completed ? 'checked' : ''} 
                                   onchange="checklistManager.toggleChecklistItem(${item.categoryIndex}, ${item.subcategoryIndex}, ${item.subsubcategoryIndex}, ${item.techIndex}, ${idx})">
                            <span class="checklist-item-text">${checkItem.text}</span>
                        </div>
                    `).join('')}
                </div>
            </td>
        `;
        tbody.appendChild(checklistRow);
    },

    // === УПРАВЛЕНИЕ МОДАЛЬНЫМИ ОКНАМИ ===
    showModal(modalId) {
        if (modalId === 'techModal' || modalId === 'subcategoryModal' || modalId === 'subsubcategoryModal') {
            this.updateCategorySelect();
            if (modalId === 'techModal') {
                this.updateSubcategorySelect();
                this.updateSubsubcategorySelect();
            }
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
    updateCategorySelect() {
        const select = document.getElementById('techCategorySelect');
        const subcategorySelect = document.getElementById('subcategoryParentSelect');
        select.innerHTML = '';
        subcategorySelect.innerHTML = '';
        
        techData.categories.forEach((category, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = category.name;
            select.appendChild(option);
            
            const subOption = document.createElement('option');
            subOption.value = index;
            subOption.textContent = category.name;
            subcategorySelect.appendChild(subOption);
        });
    },

    updateSubcategorySelect() {
        const categoryIndex = document.getElementById('techCategorySelect').value;
        const subcategorySelect = document.getElementById('techSubcategorySelect');
        const subsubcategoryParentSelect = document.getElementById('subsubcategoryParentSelect');
        
        subcategorySelect.innerHTML = '<option value="-1">-- Без подкатегории --</option>';
        subsubcategoryParentSelect.innerHTML = '<option value="-1">-- Без подкатегории --</option>';
        
        if (categoryIndex >= 0 && techData.categories[categoryIndex].subcategories) {
            techData.categories[categoryIndex].subcategories.forEach((subcategory, index) => {
                const option = document.createElement('option');
                option.value = index;
                option.textContent = subcategory.name;
                subcategorySelect.appendChild(option);
                
                const subOption = document.createElement('option');
                subOption.value = index;
                subOption.textContent = `${techData.categories[categoryIndex].name} → ${subcategory.name}`;
                subsubcategoryParentSelect.appendChild(subOption);
            });
        }
    },

    updateSubsubcategorySelect() {
        const categoryIndex = document.getElementById('techCategorySelect').value;
        const subcategoryIndex = document.getElementById('techSubcategorySelect').value;
        const subsubcategorySelect = document.getElementById('techSubsubcategorySelect');
        
        subsubcategorySelect.innerHTML = '<option value="-1">-- Без под-подкатегории --</option>';
        
        if (categoryIndex >= 0 && subcategoryIndex >= 0 && 
            techData.categories[categoryIndex].subcategories &&
            techData.categories[categoryIndex].subcategories[subcategoryIndex].subsubcategories) {
            
            techData.categories[categoryIndex].subcategories[subcategoryIndex].subsubcategories.forEach((subsubcategory, index) => {
                const option = document.createElement('option');
                option.value = index;
                option.textContent = subsubcategory.name;
                subsubcategorySelect.appendChild(option);
            });
        }
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
    },

    // Функции редактирования (упрощенные версии)
    editCategory(index) {
        const newName = prompt('Введите новое название категории:', techData.categories[index].name);
        if (newName) {
            techData.categories[index].name = newName;
            this.renderTable();
            dataManager.saveToLocalStorage();
            this.showNotification('Категория обновлена!', 'success');
        }
    },

    editSubcategory(categoryIndex, subcategoryIndex) {
        const newName = prompt('Введите новое название подкатегории:', 
            techData.categories[categoryIndex].subcategories[subcategoryIndex].name);
        if (newName) {
            techData.categories[categoryIndex].subcategories[subcategoryIndex].name = newName;
            this.renderTable();
            dataManager.saveToLocalStorage();
            this.showNotification('Подкатегория обновлена!', 'success');
        }
    },

    editSubsubcategory(categoryIndex, subcategoryIndex, subsubcategoryIndex) {
        const newName = prompt('Введите новое название под-подкатегории:', 
            techData.categories[categoryIndex].subcategories[subcategoryIndex].subsubcategories[subsubcategoryIndex].name);
        if (newName) {
            techData.categories[categoryIndex].subcategories[subcategoryIndex].subsubcategories[subsubcategoryIndex].name = newName;
            this.renderTable();
            dataManager.saveToLocalStorage();
            this.showNotification('Под-подкатегория обновлена!', 'success');
        }
    },

    editTechnology(categoryIndex, subcategoryIndex, subsubcategoryIndex, techIndex) {
        const tech = this.getTechnology(categoryIndex, subcategoryIndex, subsubcategoryIndex, techIndex);
        const newName = prompt('Введите новое название технологии:', tech.name);
        if (newName) {
            tech.name = newName;
            this.renderTable();
            dataManager.saveToLocalStorage();
            this.showNotification('Технология обновлена!', 'success');
        }
    },

    deleteCategory(index) {
        if (confirm('Удалить эту категорию и все её содержимое?')) {
            techData.categories.splice(index, 1);
            this.renderTable();
            dataManager.saveToLocalStorage();
            navigation.resetView();
            this.showNotification('Категория удалена!', 'success');
        }
    },

    deleteSubcategory(categoryIndex, subcategoryIndex) {
        if (confirm('Удалить эту подкатегорию и все её содержимое?')) {
            techData.categories[categoryIndex].subcategories.splice(subcategoryIndex, 1);
            this.renderTable();
            dataManager.saveToLocalStorage();
            navigation.resetView();
            this.showNotification('Подкатегория удалена!', 'success');
        }
    },

    deleteSubsubcategory(categoryIndex, subcategoryIndex, subsubcategoryIndex) {
        if (confirm('Удалить эту под-подкатегорию и все её содержимое?')) {
            techData.categories[categoryIndex].subcategories[subcategoryIndex].subsubcategories.splice(subsubcategoryIndex, 1);
            this.renderTable();
            dataManager.saveToLocalStorage();
            navigation.resetView();
            this.showNotification('Под-подкатегория удалена!', 'success');
        }
    },

    deleteTechnology(categoryIndex, subcategoryIndex, subsubcategoryIndex, techIndex) {
        if (confirm('Удалить эту технологию и все её задачи?')) {
            if (subsubcategoryIndex >= 0) {
                techData.categories[categoryIndex].subcategories[subcategoryIndex].subsubcategories[subsubcategoryIndex].technologies.splice(techIndex, 1);
            } else if (subcategoryIndex >= 0) {
                techData.categories[categoryIndex].subcategories[subcategoryIndex].technologies.splice(techIndex, 1);
            } else {
                techData.categories[categoryIndex].technologies.splice(techIndex, 1);
            }
            this.renderTable();
            dataManager.saveToLocalStorage();
            this.showNotification('Технология удалена!', 'success');
        }
    },

    getTechnology(categoryIndex, subcategoryIndex, subsubcategoryIndex, techIndex) {
        if (subsubcategoryIndex >= 0) {
            return techData.categories[categoryIndex].subcategories[subcategoryIndex].subsubcategories[subsubcategoryIndex].technologies[techIndex];
        } else if (subcategoryIndex >= 0) {
            return techData.categories[categoryIndex].subcategories[subcategoryIndex].technologies[techIndex];
        } else {
            return techData.categories[categoryIndex].technologies[techIndex];
        }
    }
};

// Закрытие модальных окон при клике вне их
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        uiManager.hideModals();
    }
};
