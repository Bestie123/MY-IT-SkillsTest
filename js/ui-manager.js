const uiManager = {
    // ... остальные методы остаются без изменений ...

    createStructureNode(node, level, path, index) {
        if (!node) {
            console.warn('Invalid node at path:', path, 'index:', index);
            return null;
        }

        const fullPath = [...path, index];
        const item = document.createElement('div');
        item.className = 'structure-item';

        const content = document.createElement('div');
        content.className = 'item-content';

        // Заголовок элемента
        const header = document.createElement('div');
        header.className = `item-header ${node.type}`;
        
        // ... остальная часть заголовка без изменений ...

        // Контент для технологий (чеклист)
        if (node.type === 'technology' && node.checklist && node.checklist.length > 0) {
            const checklist = document.createElement('div');
            checklist.className = 'item-checklist';
            
            const completed = node.checklist.filter(item => item.completed).length;
            const total = node.checklist.length;
            const progress = total > 0 ? (completed / total) * 100 : 0;

            // Превью чеклиста (первые 3 пункта)
            const previewItems = node.checklist.slice(0, 3);
            previewItems.forEach((item, itemIndex) => {
                const checklistItem = document.createElement('div');
                checklistItem.className = `checklist-item-preview ${item.completed ? 'completed' : ''}`;
                checklistItem.innerHTML = `
                    <input type="checkbox" ${item.completed ? 'checked' : ''} 
                           onchange="checklistManager.toggleChecklistItemFromTree(${JSON.stringify(path)}, ${index}, ${itemIndex})">
                    <span>${item.text}</span>
                `;
                checklist.appendChild(checklistItem);
            });

            // Если есть еще пункты, показываем кнопку
            if (node.checklist.length > 3) {
                const moreBtn = document.createElement('button');
                moreBtn.className = 'checklist-toggle';
                moreBtn.textContent = `+ ещё ${node.checklist.length - 3} пунктов...`;
                moreBtn.onclick = (e) => {
                    e.stopPropagation();
                    checklistManager.manageChecklist(path, index);
                };
                checklist.appendChild(moreBtn);
            }

            // Прогресс
            const progressInfo = document.createElement('div');
            progressInfo.className = 'checklist-progress';
            progressInfo.innerHTML = `
                <div>Прогресс: ${completed}/${total} (${Math.round(progress)}%)</div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progress}%"></div>
                </div>
            `;
            checklist.appendChild(progressInfo);

            content.appendChild(checklist);
        }

        item.appendChild(content);

        // ... остальная часть метода без изменений ...
    },

    // ... остальные методы без изменений ...
};