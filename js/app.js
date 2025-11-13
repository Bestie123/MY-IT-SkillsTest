// Инициализация приложения
document.addEventListener('DOMContentLoaded', function() {
    // Загружаем настройки аутентификации
    authManager.loadAuth();
    
    // Загружаем данные из localStorage
    dataManager.loadFromLocalStorage();
    
    // Включаем автосохранение если настроен GitHub
    const token = localStorage.getItem('githubToken');
    const owner = localStorage.getItem('repoOwner');
    const repo = localStorage.getItem('repoName');
    
    if (token && owner && repo) {
        console.log('GitHub настроен, автосохранение доступно');
    }
});