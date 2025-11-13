// Глобальная структура данных с рекурсивной вложенностью
const techData = {
    categories: []
};

// Текущий выбранный путь для модальных окон
let currentModalPath = [];

const dataManager = {
    // Вспомогательные функции для работы с путями
    getNodeByPath(path) {
        let currentNode = techData.categories;
        for (const index of path) {
            if (currentNode[index] && currentNode[index].children) {
                currentNode = currentNode[index].children;
            } else {
                return null;
            }
        }
        return currentNode;
    },

    getNodeAtIndex(path, index) {
        const parent = this.getNodeByPath(path);
        return parent ? parent[index] : null;
    },

    // === ЛОКАЛЬНОЕ ХРАНИЛИЩЕ ===
    saveToLocalStorage() {
        localStorage.setItem('techData', JSON.stringify(techData));
    },

    loadFromLocalStorage() {
        const saved = localStorage.getItem('techData');
        if (saved) {
            const parsedData = JSON.parse(saved);
            techData.categories = parsedData.categories || [];
            
            // Инициализируем expanded если его нет
            this.initializeExpanded(techData.categories);
            uiManager.renderTable();
        }
    },

    initializeExpanded(nodes) {
        nodes.forEach(node => {
            if (node.expanded === undefined) {
                node.expanded = true;
            }
            if (node.children && node.children.length > 0) {
                this.initializeExpanded(node.children);
            }
        });
    },

    // === УПРАВЛЕНИЕ ДАННЫМИ ===
    addCategory() {
        const name = document.getElementById('newCategoryName').value;
        if (name) {
            techData.categories.push({
                name: name,
                type: 'category',
                children: [],
                expanded: true
            });
            uiManager.renderTable();
            this.saveToLocalStorage();
            uiManager.hideModals();
            document.getElementById('newCategoryName').value = '';
            uiManager.showNotification('Категория добавлена!', 'success');
            
            authManager.scheduleAutoSave();
        }
    },

    addNode() {
        const name = document.getElementById('newNodeName').value;
        
        if (name && currentModalPath.length >= 0) {
            const parent = this.getNodeByPath(currentModalPath);
            if (!parent) {
                uiManager.showNotification('Ошибка: родительская категория не найдена', 'error');
                return;
            }

            parent.push({
                name: name,
                type: 'node',
                children: [],
                expanded: true
            });

            uiManager.renderTable();
            this.saveToLocalStorage();
            uiManager.hideModals();
            document.getElementById('newNodeName').value = '';
            uiManager.showNotification('Подкатегория добавлена!', 'success');
            
            authManager.scheduleAutoSave();
        }
    },

    addTechnology() {
        const name = document.getElementById('newTechName').value;
        
        if (name && currentModalPath.length >= 0) {
            const parent = this.getNodeByPath(currentModalPath);
            if (!parent) {
                uiManager.showNotification('Ошибка: родительская категория не найдена', 'error');
                return;
            }

            const tech = {
                name: name,
                type: 'technology',
                checklist: []
            };

            parent.push(tech);

            uiManager.renderTable();
            this.saveToLocalStorage();
            uiManager.hideModals();
            document.getElementById('newTechName').value = '';
            uiManager.showNotification('Технология добавлена!', 'success');
            
            authManager.scheduleAutoSave();
        }
    },

    // ... остальные методы остаются без изменений ...
    // (editNode, editTechnology, deleteNode, deleteTechnology, JSON методы)
};