const navigation = {
    currentView: {
        type: 'all',
        categoryIndex: -1,
        subcategoryIndex: -1,
        subsubcategoryIndex: -1
    },

    updateBreadcrumb() {
        const breadcrumb = document.getElementById('breadcrumb');
        breadcrumb.innerHTML = '<div class="breadcrumb-item"><a href="#" onclick="navigation.resetView()">Все технологии</a></div>';
        
        if (this.currentView.type === 'category' && this.currentView.categoryIndex !== -1) {
            const category = techData.categories[this.currentView.categoryIndex];
            breadcrumb.innerHTML += `<div class="breadcrumb-item">${category.name}</div>`;
        } else if (this.currentView.type === 'subcategory' && this.currentView.categoryIndex !== -1 && this.currentView.subcategoryIndex !== -1) {
            const category = techData.categories[this.currentView.categoryIndex];
            const subcategory = category.subcategories[this.currentView.subcategoryIndex];
            breadcrumb.innerHTML += `
                <div class="breadcrumb-item"><a href="#" onclick="navigation.viewCategory(${this.currentView.categoryIndex})">${category.name}</a></div>
                <div class="breadcrumb-item">${subcategory.name}</div>
            `;
        } else if (this.currentView.type === 'subsubcategory' && this.currentView.categoryIndex !== -1 && 
                  this.currentView.subcategoryIndex !== -1 && this.currentView.subsubcategoryIndex !== -1) {
            const category = techData.categories[this.currentView.categoryIndex];
            const subcategory = category.subcategories[this.currentView.subcategoryIndex];
            const subsubcategory = subcategory.subsubcategories[this.currentView.subsubcategoryIndex];
            breadcrumb.innerHTML += `
                <div class="breadcrumb-item"><a href="#" onclick="navigation.viewCategory(${this.currentView.categoryIndex})">${category.name}</a></div>
                <div class="breadcrumb-item"><a href="#" onclick="navigation.viewSubcategory(${this.currentView.categoryIndex}, ${this.currentView.subcategoryIndex})">${subcategory.name}</a></div>
                <div class="breadcrumb-item">${subsubcategory.name}</div>
            `;
        }
    },

    resetView() {
        this.currentView = { type: 'all', categoryIndex: -1, subcategoryIndex: -1, subsubcategoryIndex: -1 };
        this.updateBreadcrumb();
        uiManager.renderTable();
    },

    viewCategory(categoryIndex) {
        this.currentView = { 
            type: 'category', 
            categoryIndex: categoryIndex, 
            subcategoryIndex: -1, 
            subsubcategoryIndex: -1 
        };
        this.updateBreadcrumb();
        uiManager.renderTable();
    },

    viewSubcategory(categoryIndex, subcategoryIndex) {
        this.currentView = { 
            type: 'subcategory', 
            categoryIndex: categoryIndex, 
            subcategoryIndex: subcategoryIndex, 
            subsubcategoryIndex: -1 
        };
        this.updateBreadcrumb();
        uiManager.renderTable();
    },

    viewSubsubcategory(categoryIndex, subcategoryIndex, subsubcategoryIndex) {
        this.currentView = { 
            type: 'subsubcategory', 
            categoryIndex: categoryIndex, 
            subcategoryIndex: subcategoryIndex, 
            subsubcategoryIndex: subsubcategoryIndex 
        };
        this.updateBreadcrumb();
        uiManager.renderTable();
    }
};
