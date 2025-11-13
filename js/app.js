// Инициализация приложения
document.addEventListener('DOMContentLoaded', function() {
    console.log('App initializing...');
    
    // Загружаем настройки аутентификации
    authManager.loadAuth();
    
    // Загружаем данные
    dataManager.loadFromLocalStorage();
    
    // Обновляем навигацию
    navigation.updateBreadcrumb();
    
    console.log('App initialized');
});