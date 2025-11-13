const dataManager = {
    // ... остальные методы без изменений ...

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

    // ... остальные методы без изменений ...
};