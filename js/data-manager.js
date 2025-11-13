// Глобальная структура данных
const techData = {
    categories: []
};

let currentModalPath = [];

const dataManager = {
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
            try {
                const parsedData = JSON.parse(saved);
                techData.categories = parsedData.categories || [];
                this.initializeExpanded(techData.categories);
                uiManager.renderStructure();
            } catch (error) {
                console.error('Error loading data:', error);
                uiManager.showNotification('Ошибка загрузки данных', 'error');
            }
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
        const name = document.getElementById('newCategoryName').value.trim();
        if (!name) {
            uiManager.showNotification('Введите название категории', 'warning');
            return;
        }

        techData.categories.push({
            name: name,
            type: 'category',
            children: [],
            expanded: true
        });
        
        uiManager.renderStructure();
        this.saveToLocalStorage();
        uiManager.hideModals();
        document.getElementById('newCategoryName').value = '';
        uiManager.showNotification('Категория добавлена', 'success');
        authManager.scheduleAutoSave();
    },

    addNode() {
        const name = document.getElementById('newNodeName').value.trim();
        
        if (!name) {
            uiManager.showNotification('Введите название подкатегории', 'warning');
            return;
        }

        if (currentModalPath.length >= 0) {
            const parent = this.getNodeByPath(currentModalPath);
            if (!parent) {
                uiManager.showNotification('Родительская категория не найдена', 'error');
                return;
            }

            parent.push({
                name: name,
                type: 'node',
                children: [],
                expanded: true
            });

            uiManager.renderStructure();
            this.saveToLocalStorage();
            uiManager.hideModals();
            document.getElementById('newNodeName').value = '';
            uiManager.showNotification('Подкатегория добавлена', 'success');
            authManager.scheduleAutoSave();
        }
    },

    addTechnology() {
        const name = document.getElementById('newTechName').value.trim();
        
        if (!name) {
            uiManager.showNotification('Введите название технологии', 'warning');
            return;
        }

        if (currentModalPath.length >= 0) {
            const parent = this.getNodeByPath(currentModalPath);
            if (!parent) {
                uiManager.showNotification('Родительская категория не найдена', 'error');
                return;
            }

            parent.push({
                name: name,
                type: 'technology',
                checklist: []
            });

            uiManager.renderStructure();
            this.saveToLocalStorage();
            uiManager.hideModals();
            document.getElementById('newTechName').value = '';
            uiManager.showNotification('Технология добавлена', 'success');
            authManager.scheduleAutoSave();
        }
    },

    // ... остальные методы (edit, delete, JSON) остаются аналогичными предыдущей версии
    // но адаптированы под новую структуру
};