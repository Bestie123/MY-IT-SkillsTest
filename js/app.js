// Инициализация приложения
document.addEventListener('DOMContentLoaded', function() {
    authManager.loadAuth();
    dataManager.loadFromLocalStorage();
    navigation.updateBreadcrumb();
});
