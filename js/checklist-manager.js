const checklistManager = {
    currentChecklist: {
        path: [],
        techIndex: -1
    },

    // === УПРАВЛЕНИЕ ЧЕК-ЛИСТАМИ ===
    manageChecklist(path, techIndex) {
        this.currentChecklist = {
            path,
            techIndex
        };
        
        const tech = this.getTechnology();
        document.getElementById('checklistTitle').textContent = `Чек-лист: ${tech.name}`;
        
        if (!tech.checklist) {
            tech.checklist = [];
        }
        
        this.renderChecklist();
        uiManager.showModal('checklistModal');
    },
    
    renderChecklist() {
        const tech = this.getTechnology();
        const checklistItems = document.getElementById('checklistItems');
        const checklistStats = document.getElementById('checklistStats');
        
        checklistItems.innerHTML = '';
        
        if (tech.checklist && tech.checklist.length > 0) {
            tech.checklist.forEach((item, index) => {
                const itemElement = document.createElement('div');
                itemElement.className = `checklist-item ${item.completed ? 'completed' : ''}`;
                itemElement.innerHTML = `
                    <input type="checkbox" ${item.completed ? 'checked' : ''} 
                           onchange="checklistManager.toggleChecklistItem(${JSON.stringify(this.currentChecklist.path)}, ${this.currentChecklist.techIndex}, ${index})">
                    <span class="checklist-item-text">${item.text}</span>
                    <button onclick="checklistManager.removeChecklistItem(${index})" class="delete" style="margin-left: 10px;">🗑️</button>
                    <button onclick="checklistManager.editChecklistItem(${index})" style="margin-left: 5px;">✏️</button>
                `;
                checklistItems.appendChild(itemElement);
            });
        } else {
            checklistItems.innerHTML = '<p style="text-align: center; color: #6c757d;">Чек-лист пуст. Добавьте первый пункт!</p>';
        }
        
        const completed = tech.checklist ? tech.checklist.filter(item => item.completed).length : 0;
        const total = tech.checklist ? tech.checklist.length : 0;
        const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
        
        checklistStats.innerHTML = `
            Прогресс: ${completed}/${total} (${progress}%)
            <div class="progress-bar" style="width: 100%; margin-top: 5px;">
                <div class="progress-fill" style="width: ${progress}%"></div>
            </div>
        `;
    },
    
    addChecklistItem() {
        const input = document.getElementById('newChecklistItem');
        const text = input.value.trim();
        
        if (text) {
            const tech = this.getTechnology();
            
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
            authManager.scheduleAutoSave();
        }
    },
    
    removeChecklistItem(index) {
        const tech = this.getTechnology();
        
        if (tech.checklist && tech.checklist.length > index) {
            tech.checklist.splice(index, 1);
            this.renderChecklist();
            dataManager.saveToLocalStorage();
            authManager.scheduleAutoSave();
        }
    },
    
    editChecklistItem(index) {
        const tech = this.getTechnology();
        
        if (tech.checklist && tech.checklist.length > index) {
            const newText = prompt('Редактировать пункт:', tech.checklist[index].text);
            if (newText !== null) {
                tech.checklist[index].text = newText.trim();
                this.renderChecklist();
                dataManager.saveToLocalStorage();
                authManager.scheduleAutoSave();
            }
        }
    },
    
    toggleChecklistItem(path, techIndex, itemIndex) {
        this.currentChecklist = { path, techIndex };
        const tech = this.getTechnology();
        
        if (tech.checklist && tech.checklist.length > itemIndex) {
            tech.checklist[itemIndex].completed = !tech.checklist[itemIndex].completed;
            this.renderChecklist();
            uiManager.renderTable();
            dataManager.saveToLocalStorage();
            authManager.scheduleAutoSave();
        }
    },
    
    saveChecklist() {
        uiManager.hideModals();
        uiManager.renderTable();
        dataManager.saveToLocalStorage();
        uiManager.showNotification('Чек-лист сохранен!', 'success');
        authManager.scheduleAutoSave();
    },
    
    getTechnology() {
        const parent = dataManager.getNodeByPath(this.currentChecklist.path);
        return parent ? parent[this.currentChecklist.techIndex] : null;
    }
};