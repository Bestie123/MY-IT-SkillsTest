const navigation = {
    currentView: {
        type: 'all',
        path: []
    },

    updateBreadcrumb() {
        const breadcrumb = document.getElementById('breadcrumb');
        breadcrumb.innerHTML = '<div class="breadcrumb-item"><a href="#" onclick="navigation.resetView()">Все технологии</a></div>';
        
        if (this.currentView.path.length > 0) {
            let currentPath = [];
            let currentNode = techData.categories;
            
            for (const index of this.currentView.path) {
                if (currentNode[index]) {
                    currentPath.push(index);
                    const pathCopy = [...currentPath];
                    breadcrumb.innerHTML += `
                        <div class="breadcrumb-item">
                            <a href="#" onclick="navigation.viewNode(${JSON.stringify(pathCopy)})">
                                ${currentNode[index].name}
                            </a>
                        </div>
                    `;
                    currentNode = currentNode[index].children || [];
                }
            }
        }
    },

    resetView() {
        this.currentView = { type: 'all', path: [] };
        this.updateBreadcrumb();
        uiManager.renderTable();
    },

    viewNode(path) {
        this.currentView = { type: 'node', path: path };
        this.updateBreadcrumb();
        uiManager.renderTable();
    }
};
