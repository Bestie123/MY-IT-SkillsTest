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
            uiManager.renderTable();
        }
    },

    // === УПРАВЛЕНИЕ ДАННЫМИ ===
    addCategory() {
        const name = document.getElementById('newCategoryName').value;
        if (name) {
            techData.categories.push({
                name: name,
                type: 'category',
                technologies: [],
                children: []
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
                technologies: [],
                children: []
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

    // Функции редактирования
    editNode(path, index) {
        const node = this.getNodeAtIndex(path, index);
        if (!node) return;

        const newName = prompt('Введите новое название:', node.name);
        if (newName) {
            node.name = newName;
            uiManager.renderTable();
            this.saveToLocalStorage();
            uiManager.showNotification('Категория обновлена!', 'success');
            authManager.scheduleAutoSave();
        }
    },

    editTechnology(path, index) {
        const node = this.getNodeAtIndex(path, index);
        if (!node) return;

        const newName = prompt('Введите новое название технологии:', node.name);
        if (newName) {
            node.name = newName;
            uiManager.renderTable();
            this.saveToLocalStorage();
            uiManager.showNotification('Технология обновлена!', 'success');
            authManager.scheduleAutoSave();
        }
    },

    // Функции удаления
    deleteNode(path, index) {
        if (confirm('Удалить эту категорию и все её содержимое?')) {
            const parent = this.getNodeByPath(path);
            if (parent) {
                parent.splice(index, 1);
                uiManager.renderTable();
                this.saveToLocalStorage();
                uiManager.showNotification('Категория удалена!', 'success');
                authManager.scheduleAutoSave();
            }
        }
    },

    deleteTechnology(path, index) {
        if (confirm('Удалить эту технологию и все её задачи?')) {
            const parent = this.getNodeByPath(path);
            if (parent) {
                parent.splice(index, 1);
                uiManager.renderTable();
                this.saveToLocalStorage();
                uiManager.showNotification('Технология удалена!', 'success');
                authManager.scheduleAutoSave();
            }
        }
    },

    // === РАБОТА С JSON ===
    exportToJSON() {
        const jsonOutput = document.getElementById('jsonOutput');
        const jsonSection = document.getElementById('jsonSection');
        
        jsonOutput.value = JSON.stringify(techData, null, 2);
        jsonSection.classList.remove('hidden');
    },

    importFromJSON() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = function(e) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const parsedData = JSON.parse(e.target.result);
                    techData.categories = parsedData.categories || [];
                    uiManager.renderTable();
                    dataManager.saveToLocalStorage();
                    uiManager.showNotification('Данные импортированы!', 'success');
                    authManager.scheduleAutoSave();
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
        try {
            const parsedData = JSON.parse(jsonText);
            techData.categories = parsedData.categories || [];
            uiManager.renderTable();
            this.saveToLocalStorage();
            uiManager.showNotification('Данные импортированы из JSON!', 'success');
            authManager.scheduleAutoSave();
        } catch (error) {
            uiManager.showNotification('Ошибка при разборе JSON', 'error');
        }
    },

    copyToClipboard() {
        const jsonOutput = document.getElementById('jsonOutput');
        jsonOutput.select();
        document.execCommand('copy');
        uiManager.showNotification('JSON скопирован в буфер обмена!', 'success');
    }
};