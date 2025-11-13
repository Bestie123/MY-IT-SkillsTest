const navigation = {
    currentView: {
        type: 'all',
        path: []
    },

    updateBreadcrumb() {
        const breadcrumb = document.getElementById('breadcrumb');
        if (!breadcrumb) {
            console.error('Breadcrumb element not found');
            return;
        }

        breadcrumb.innerHTML = '<span class="breadcrumb-item" onclick="navigation.resetView()">Все технологии</span>';
        
        if (this.currentView.path.length > 0) {
            let currentPath = [];
            let currentNode = techData.categories;
            
            for (const index of this.currentView.path) {
                if (currentNode && currentNode[index]) {
                    currentPath.push(index);
                    const pathCopy = [...currentPath];
                    breadcrumb.innerHTML += `
                        <span class="breadcrumb-item" onclick="navigation.viewNode(${JSON.stringify(pathCopy)})">
                            ${currentNode[index].name}
                        </span>
                    `;
                    currentNode = currentNode[index].children || [];
                }
            }
        }
    },

    resetView() {
        this.currentView = { type: 'all', path: [] };
        this.updateBreadcrumb();
        uiManager.renderStructure();
    },

    viewNode(path) {
        this.currentView = { type: 'node', path: path };
        this.updateBreadcrumb();
        uiManager.renderStructure();
    }
};