// Глобальная структура данных
const techData = {
    categories: []
};

let currentModalPath = [];

const dataManager = {
    // Вспомогательные функции для работы с путями
    getNodeByPath(path) {
        console.log('Getting node by path:', path);
        if (path.length === 0) return techData.categories;
        
        let currentNode = techData.categories;
        for (const index of path) {
            if (currentNode[index] && currentNode[index].children) {
                currentNode = currentNode[index].children;
            } else {
                console.warn('Node not found at path:', path);
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
        try {
            localStorage.setItem('techData', JSON.stringify(techData));
            console.log('Data saved to localStorage');
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    },

    loadFromLocalStorage() {
        try {
            const saved = localStorage.getItem('techData');
            if (saved) {
                const parsedData = JSON.parse(saved);
                techData.categories = parsedData.categories || [];
                this.initializeExpanded(techData.categories);
                console.log('Data loaded from localStorage:', techData);
                uiManager.renderStructure();
            } else {
                console.log('No saved data found');
                techData.categories = [];
                uiManager.renderStructure();
            }
        } catch (error) {
            console.error('Error loading from localStorage:', error);
            techData.categories = [];
            uiManager.renderStructure();
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
        
        this.saveToLocalStorage();
        uiManager.renderStructure();
        uiManager.hideModals();
        document.getElementById('newCategoryName').value = '';
        uiManager.showNotification('Категория добавлена', 'success');
        
        if (authManager.autoSaveEnabled) {
            authManager.scheduleAutoSave();
        }
    },

    addNode() {
        const name = document.getElementById('newNodeName').value.trim();
        
        if (!name) {
            uiManager.showNotification('Введите название подкатегории', 'warning');
            return;
        }

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

        this.saveToLocalStorage();
        uiManager.renderStructure();
        uiManager.hideModals();
        document.getElementById('newNodeName').value = '';
        uiManager.showNotification('Подкатегория добавлена', 'success');
        
        if (authManager.autoSaveEnabled) {
            authManager.scheduleAutoSave();
        }
    },

    addTechnology() {
        const name = document.getElementById('newTechName').value.trim();
        
        if (!name) {
            uiManager.showNotification('Введите название технологии', 'warning');
            return;
        }

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

        this.saveToLocalStorage();
        uiManager.renderStructure();
        uiManager.hideModals();
        document.getElementById('newTechName').value = '';
        uiManager.showNotification('Технология добавлена', 'success');
        
        if (authManager.autoSaveEnabled) {
            authManager.scheduleAutoSave();
        }
    },

    // Функции редактирования
    editNode(path, index) {
        const node = this.getNodeAtIndex(path, index);
        if (!node) return;

        const newName = prompt('Введите новое название:', node.name);
        if (newName && newName.trim()) {
            node.name = newName.trim();
            this.saveToLocalStorage();
            uiManager.renderStructure();
            uiManager.showNotification('Категория обновлена', 'success');
            
            if (authManager.autoSaveEnabled) {
                authManager.scheduleAutoSave();
            }
        }
    },

    editTechnology(path, index) {
        const node = this.getNodeAtIndex(path, index);
        if (!node) return;

        const newName = prompt('Введите новое название технологии:', node.name);
        if (newName && newName.trim()) {
            node.name = newName.trim();
            this.saveToLocalStorage();
            uiManager.renderStructure();
            uiManager.showNotification('Технология обновлена', 'success');
            
            if (authManager.autoSaveEnabled) {
                authManager.scheduleAutoSave();
            }
        }
    },

    // Функции удаления
    deleteNode(path, index) {
        if (!confirm('Удалить эту категорию и все её содержимое?')) return;

        const parent = this.getNodeByPath(path);
        if (parent && parent[index]) {
            parent.splice(index, 1);
            this.saveToLocalStorage();
            uiManager.renderStructure();
            navigation.updateBreadcrumb();
            uiManager.showNotification('Категория удалена', 'success');
            
            if (authManager.autoSaveEnabled) {
                authManager.scheduleAutoSave();
            }
        }
    },

    deleteTechnology(path, index) {
        if (!confirm('Удалить эту технологию и все её задачи?')) return;

        const parent = this.getNodeByPath(path);
        if (parent && parent[index]) {
            parent.splice(index, 1);
            this.saveToLocalStorage();
            uiManager.renderStructure();
            uiManager.showNotification('Технология удалена', 'success');
            
            if (authManager.autoSaveEnabled) {
                authManager.scheduleAutoSave();
            }
        }
    },

    // === РАБОТА С JSON ===
    exportToJSON() {
        const jsonOutput = document.getElementById('jsonOutput');
        const jsonSection = document.getElementById('jsonSection');
        
        jsonOutput.value = JSON.stringify(techData, null, 2);
        jsonSection.style.display = 'block';
        uiManager.showNotification('Данные экспортированы в JSON', 'success');
    },

    importFromJSON() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = function(e) {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const parsedData = JSON.parse(e.target.result);
                    techData.categories = parsedData.categories || [];
                    dataManager.saveToLocalStorage();
                    uiManager.renderStructure();
                    navigation.resetView();
                    uiManager.showNotification('Данные импортированы из файла', 'success');
                    
                    if (authManager.autoSaveEnabled) {
                        authManager.scheduleAutoSave();
                    }
                } catch (error) {
                    uiManager.showNotification('Ошибка при чтении JSON файла', 'error');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    },

    importFromJSONText() {
        const jsonText = document.getElementById('jsonOutput').value;
        if (!jsonText.trim()) {
            uiManager.showNotification('Введите JSON данные', 'warning');
            return;
        }

        try {
            const parsedData = JSON.parse(jsonText);
            techData.categories = parsedData.categories || [];
            this.saveToLocalStorage();
            uiManager.renderStructure();
            navigation.resetView();
            uiManager.showNotification('Данные импортированы из JSON', 'success');
            
            if (authManager.autoSaveEnabled) {
                authManager.scheduleAutoSave();
            }
        } catch (error) {
            uiManager.showNotification('Ошибка при разборе JSON: ' + error.message, 'error');
        }
    },

    copyToClipboard() {
        const jsonOutput = document.getElementById('jsonOutput');
        jsonOutput.select();
        document.execCommand('copy');
        uiManager.showNotification('JSON скопирован в буфер обмена', 'success');
    }
};