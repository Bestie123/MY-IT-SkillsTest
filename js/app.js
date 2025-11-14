// Инициализация приложения
document.addEventListener('DOMContentLoaded', function() {
    authManager.loadAuth();
    dataManager.loadFromLocalStorage();
    
    // Включить автосохранение по умолчанию, если настроен GitHub
    const token = localStorage.getItem('githubToken');
    const owner = localStorage.getItem('repoOwner');
    const repo = localStorage.getItem('repoName');
    
    if (token && owner && repo) {
        console.log('GitHub настроен, автосохранение доступно');
    }
    
    // Инициализация дерева
    treeManager.init();
});
