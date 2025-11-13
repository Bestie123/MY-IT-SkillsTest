const checklistManager = {
    currentChecklist: {
        path: [],
        techIndex: -1
    },

    // === УПРАВЛЕНИЕ ЧЕК-ЛИСТАМИ ===
    manageChecklist(path, techIndex) {
        console.log('Managing checklist for path:', path, 'techIndex:', techIndex);
        this.currentChecklist = { path, techIndex };
        const tech = this.getTechnology();
        
        if (!tech) {
            uiManager.showNotification('Технология не найдена', 'error');
            return;
        }

        document.getElementById('checklistTitle').textContent = `Чек-лист: ${tech.name}`;
        
        if (!tech.checklist) {
            tech.checklist = [];
        }
        
        this.renderChecklist();
        uiManager.showModal('checklistModal');
    },
    
    renderChecklist() {
        const tech = this.getTechnology();
        if (!tech) {
            console.error('Technology not found for checklist');
            return;
        }

        const checklistItems = document.getElementById('checklistItems');
        const checklistStats = document.getElementById('checklistStats');
        
        if (!checklistItems || !checklistStats) {
            console.error('Checklist elements not found');
            return;
        }
        
        checklistItems.innerHTML = '';
        
        if (tech.checklist && tech.checklist.length > 0) {
            tech.checklist.forEach((item, index) => {
                const itemElement = document.createElement('div');
                itemElement.className = `checklist-item ${item.completed ? 'completed' : ''}`;
                itemElement.innerHTML = `
                    <input type="checkbox" ${item.completed ? 'checked' : ''} 
                           onchange="checklistManager.toggleChecklistItem(${index})">
                    <span class="checklist-item-text">${item.text || 'Пустой пункт'}</span>
                    <div class="checklist-item-actions">
                        <button class="action-btn" onclick="checklistManager.editChecklistItem(${index})" title="Редактировать">✏️</button>
                        <button class="action-btn" onclick="checklistManager.removeChecklistItem(${index})" title="Удалить">🗑️</button>
                    </div>
                `;
                checklistItems.appendChild(itemElement);
            });
        } else {
            checklistItems.innerHTML = '<div style="padding: 40px; text-align: center; color: #666;">Чек-лист пуст. Добавьте первый пункт!</div>';
        }
        
        const completed = tech.checklist ? tech.checklist.filter(item => item.completed).length : 0;
        const total = tech.checklist ? tech.checklist.length : 0;
        const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
        
        checklistStats.innerHTML = `
            <div>Прогресс: ${completed}/${total} задач выполнено (${progress}%)</div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${progress}%"></div>
            </div>
        `;
    },
    
    addChecklistItem() {
        const input = document.getElementById('newChecklistItem');
        if (!input) {
            console.error('Checklist input not found');
            return;
        }

        const text = input.value.trim();
        
        if (!text) {
            uiManager.showNotification('Введите текст пункта', 'warning');
            return;
        }

        const tech = this.getTechnology();
        if (!tech) {
            uiManager.showNotification('Технология не найдена', 'error');
            return;
        }

        if (!tech.checklist) {
            tech.checklist = [];
        }
        
        tech.checklist.push({
            text: text,
            completed: false
        });
        
        input.value = '';
        this.renderChecklist();
        dataManager.saveToLocalStorage();
        uiManager.renderStructure();
        
        if (authManager.autoSaveEnabled) {
            authManager.scheduleAutoSave();
        }
    },
    
    removeChecklistItem(index) {
        const tech = this.getTechnology();
        if (!tech || !tech.checklist) {
            uiManager.showNotification('Пункт не найден', 'error');
            return;
        }

        if (index >= tech.checklist.length) {
            uiManager.showNotification('Неверный индекс пункта', 'error');
            return;
        }

        if (confirm('Удалить этот пункт?')) {
            tech.checklist.splice(index, 1);
            this.renderChecklist();
            dataManager.saveToLocalStorage();
            uiManager.renderStructure();
            
            if (authManager.autoSaveEnabled) {
                authManager.scheduleAutoSave();
            }
        }
    },
    
    editChecklistItem(index) {
        const tech = this.getTechnology();
        if (!tech || !tech.checklist || index >= tech.checklist.length) {
            uiManager.showNotification('Пункт не найден', 'error');
            return;
        }

        const newText = prompt('Редактировать пункт:', tech.checklist[index].text);
        if (newText !== null && newText.trim() !== '') {
            tech.checklist[index].text = newText.trim();
            this.renderChecklist();
            dataManager.saveToLocalStorage();
            
            if (authManager.autoSaveEnabled) {
                authManager.scheduleAutoSave();
            }
        }
    },
    
    toggleChecklistItem(index) {
        const tech = this.getTechnology();
        if (!tech || !tech.checklist || index >= tech.checklist.length) {
            console.error('Checklist item not found at index:', index);
            return;
        }

        tech.checklist[index].completed = !tech.checklist[index].completed;
        this.renderChecklist();
        dataManager.saveToLocalStorage();
        uiManager.renderStructure();
        
        if (authManager.autoSaveEnabled) {
            authManager.scheduleAutoSave();
        }
    },
    
    getTechnology() {
        const parent = dataManager.getNodeByPath(this.currentChecklist.path);
        if (!parent || !parent[this.currentChecklist.techIndex]) {
            console.error('Technology not found at path:', this.currentChecklist.path, 'index:', this.currentChecklist.techIndex);
            return null;
        }
        return parent[this.currentChecklist.techIndex];
    }
};