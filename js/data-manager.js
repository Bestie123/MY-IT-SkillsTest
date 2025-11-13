// Глобальная структура данных
const techData = {
    categories: []
};

const dataManager = {
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
                technologies: [],
                subcategories: []
            });
            uiManager.renderTable();
            this.saveToLocalStorage();
            uiManager.hideModals();
            document.getElementById('newCategoryName').value = '';
            uiManager.showNotification('Категория добавлена!', 'success');
            
            // Запуск автосохранения
            authManager.scheduleAutoSave();
        }
    },

    addSubcategory() {
        const categoryIndex = document.getElementById('subcategoryParentSelect').value;
        const name = document.getElementById('newSubcategoryName').value;
        
        if (name && categoryIndex >= 0) {
            if (!techData.categories[categoryIndex].subcategories) {
                techData.categories[categoryIndex].subcategories = [];
            }
            
            techData.categories[categoryIndex].subcategories.push({
                name: name,
                technologies: [],
                subsubcategories: []
            });
            uiManager.renderTable();
            this.saveToLocalStorage();
            uiManager.hideModals();
            document.getElementById('newSubcategoryName').value = '';
            uiManager.showNotification('Подкатегория добавлена!', 'success');
            
            // Запуск автосохранения
            authManager.scheduleAutoSave();
        }
    },

    addSubsubcategory() {
        const categoryIndex = document.getElementById('subsubcategoryParentSelect').value;
        const name = document.getElementById('newSubsubcategoryName').value;
        
        if (name && categoryIndex >= 0) {
            const subcategoryIndex = document.getElementById('subsubcategoryParentSelect').value;
            
            if (!techData.categories[categoryIndex].subcategories[subcategoryIndex].subsubcategories) {
                techData.categories[categoryIndex].subcategories[subcategoryIndex].subsubcategories = [];
            }
            
            techData.categories[categoryIndex].subcategories[subcategoryIndex].subsubcategories.push({
                name: name,
                technologies: []
            });
            uiManager.renderTable();
            this.saveToLocalStorage();
            uiManager.hideModals();
            document.getElementById('newSubsubcategoryName').value = '';
            uiManager.showNotification('Под-подкатегория добавлена!', 'success');
            
            // Запуск автосохранения
            authManager.scheduleAutoSave();
        }
    },

    addTechnology() {
        const categoryIndex = document.getElementById('techCategorySelect').value;
        const subcategoryIndex = document.getElementById('techSubcategorySelect').value;
        const subsubcategoryIndex = document.getElementById('techSubsubcategorySelect').value;
        const name = document.getElementById('newTechName').value;
        
        if (name && categoryIndex >= 0) {
            const tech = {
                name: name,
                checklist: []
            };
            
            if (subsubcategoryIndex >= 0) {
                techData.categories[categoryIndex].subcategories[subcategoryIndex].subsubcategories[subsubcategoryIndex].technologies.push(tech);
            } else if (subcategoryIndex >= 0) {
                techData.categories[categoryIndex].subcategories[subcategoryIndex].technologies.push(tech);
            } else {
                techData.categories[categoryIndex].technologies.push(tech);
            }
            
            uiManager.renderTable();
            this.saveToLocalStorage();
            uiManager.hideModals();
            document.getElementById('newTechName').value = '';
            uiManager.showNotification('Технология добавлена!', 'success');
            
            // Запуск автосохранения
            authManager.scheduleAutoSave();
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
                    navigation.resetView();
                    uiManager.showNotification('Данные импортированы!', 'success');
                    
                    // Запуск автосохранения
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
            navigation.resetView();
            uiManager.showNotification('Данные импортированы из JSON!', 'success');
            
            // Запуск автосохранения
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