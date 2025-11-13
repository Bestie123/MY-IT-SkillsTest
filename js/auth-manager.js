const authManager = {
    autoSaveEnabled: false,
    autoSaveInterval: null,
    lastSaveTime: null,
    autoSaveTimeout: null,

    // === АУТЕНТИФИКАЦИЯ С ПРОВЕРКОЙ ===
    async testAuth() {
        const token = document.getElementById('githubToken').value;
        const owner = document.getElementById('repoOwner').value;
        const repo = document.getElementById('repoName').value;
        
        if (!token || !owner || !repo) {
            this.showAuthStatus('Заполните все поля!', 'error');
            return;
        }

        try {
            this.showAuthStatus('Проверка подключения...', 'warning');
            
            const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'X-GitHub-Api-Version': '2022-11-28'
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP ${response.status}`);
            }

            const responseData = await response.json();
            const permissions = responseData.permissions;

            if (permissions && permissions.push) {
                this.showAuthStatus('✅ Подключение успешно! Репозиторий доступен для записи.', 'success');
                this.enableAutoSave();
            } else {
                this.showAuthStatus('⚠️ Репозиторий доступен, но нет прав на запись.', 'warning');
            }
        } catch (error) {
            console.error('Auth test error:', error);
            let errorMessage = '❌ Ошибка подключения: ';
            
            if (error.message.includes('401')) {
                errorMessage += 'Неверный токен доступа';
            } else if (error.message.includes('404')) {
                errorMessage += 'Репозиторий не найден';
            } else if (error.message.includes('403')) {
                errorMessage += 'Доступ запрещен';
            } else {
                errorMessage += error.message;
            }
            
            this.showAuthStatus(errorMessage, 'error');
        }
    },

    saveAuth() {
        const token = document.getElementById('githubToken').value;
        const owner = document.getElementById('repoOwner').value;
        const repo = document.getElementById('repoName').value;
        
        if (token && owner && repo) {
            localStorage.setItem('githubToken', token);
            localStorage.setItem('repoOwner', owner);
            localStorage.setItem('repoName', repo);
            uiManager.showNotification('Настройки сохранены!', 'success');
            setTimeout(() => this.testAuth(), 500);
        } else {
            uiManager.showNotification('Заполните все поля!', 'error');
        }
    },

    loadAuth() {
        const token = localStorage.getItem('githubToken');
        const owner = localStorage.getItem('repoOwner');
        const repo = localStorage.getItem('repoName');
        
        if (token) document.getElementById('githubToken').value = token;
        if (owner) document.getElementById('repoOwner').value = owner;
        if (repo) document.getElementById('repoName').value = repo;
        
        if (token && owner && repo) {
            setTimeout(() => this.testAuth(), 1000);
        }
    },

    showAuthStatus(message, type) {
        const authStatus = document.getElementById('authStatus');
        authStatus.textContent = message;
        authStatus.className = 'auth-status';
        authStatus.classList.add(type === 'success' ? 'auth-success' : 
                               type === 'warning' ? 'auth-warning' : 'auth-error');
        authStatus.style.display = 'block';
    },

    // === АВТОСОХРАНЕНИЕ ===
    enableAutoSave() {
        if (this.autoSaveEnabled) return;
        
        this.autoSaveEnabled = true;
        this.updateAutoSaveButton();
        
        this.autoSaveInterval = setInterval(() => {
            this.autoSaveToGitHub();
        }, 2 * 60 * 1000);
        
        window.addEventListener('beforeunload', this.autoSaveToGitHub.bind(this));
        
        uiManager.showNotification('🔄 Автосохранение включено (каждые 2 минуты)', 'success');
    },
    
    disableAutoSave() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
            this.autoSaveInterval = null;
        }
        this.autoSaveEnabled = false;
        this.updateAutoSaveButton();
        window.removeEventListener('beforeunload', this.autoSaveToGitHub.bind(this));
        uiManager.showNotification('⏸️ Автосохранение отключено', 'warning');
    },
    
    toggleAutoSave() {
        if (this.autoSaveEnabled) {
            this.disableAutoSave();
        } else {
            this.enableAutoSave();
        }
    },
    
    updateAutoSaveButton() {
        const button = document.getElementById('autoSaveBtn');
        if (this.autoSaveEnabled) {
            button.innerHTML = '<span class="icon">✅</span> Автосохранение';
            button.classList.add('success');
        } else {
            button.innerHTML = '<span class="icon">⭕</span> Автосохранение';
            button.classList.remove('success');
        }
    },

    // === РАБОТА С GITHUB API ===
    async loadFromGitHub() {
        const token = localStorage.getItem('githubToken');
        const owner = localStorage.getItem('repoOwner');
        const repo = localStorage.getItem('repoName');
        
        if (!token || !owner || !repo) {
            uiManager.showNotification('Сначала настройте доступ к GitHub!', 'error');
            return;
        }

        try {
            uiManager.showNotification('Загрузка данных с GitHub...', 'warning');
            
            const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/tech-data.json`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'X-GitHub-Api-Version': '2022-11-28'
                }
            });

            if (response.status === 200) {
                const data = await response.json();
                
                // Декодируем содержимое файла
                let content;
                if (data.encoding === 'base64') {
                    content = atob(data.content);
                } else {
                    content = decodeURIComponent(escape(atob(data.content)));
                }
                
                const parsedData = JSON.parse(content);
                techData.categories = parsedData.categories || [];
                
                // Инициализируем expanded свойства
                dataManager.initializeExpanded(techData.categories);
                
                dataManager.saveToLocalStorage();
                uiManager.renderStructure();
                uiManager.showNotification('✅ Данные загружены с GitHub!', 'success');
            } else if (response.status === 404) {
                uiManager.showNotification('📝 Файл не найден. Создан новый.', 'warning');
                techData.categories = [];
                dataManager.saveToLocalStorage();
                uiManager.renderStructure();
            } else {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP ${response.status}`);
            }
        } catch (error) {
            console.error('GitHub load error:', error);
            let errorMessage = 'Ошибка загрузки: ';
            
            if (error.message.includes('401')) {
                errorMessage += 'Неверный токен доступа';
            } else if (error.message.includes('404')) {
                errorMessage += 'Файл не найден в репозитории';
            } else if (error.message.includes('403')) {
                errorMessage += 'Доступ запрещен или превышен лимит запросов';
            } else {
                errorMessage += error.message;
            }
            
            uiManager.showNotification(errorMessage, 'error');
        }
    },

    async saveToGitHub() {
        const token = localStorage.getItem('githubToken');
        const owner = localStorage.getItem('repoOwner');
        const repo = localStorage.getItem('repoName');
        
        if (!token || !owner || !repo) {
            uiManager.showNotification('Сначала настройте доступ к GitHub!', 'error');
            return;
        }

        try {
            uiManager.showNotification('Сохранение на GitHub...', 'warning');
            
            // Получаем текущий SHA файла (если существует)
            let sha = null;
            try {
                const getResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/tech-data.json`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/vnd.github.v3+json',
                        'X-GitHub-Api-Version': '2022-11-28'
                    }
                });
                
                if (getResponse.ok) {
                    const data = await getResponse.json();
                    sha = data.sha;
                }
            } catch (e) {
                // Файл может не существовать, это нормально
            }

            const content = JSON.stringify(techData, null, 2);
            const contentBase64 = btoa(unescape(encodeURIComponent(content)));
            const message = `Update tech data: ${new Date().toLocaleString()}`;
            
            const requestBody = {
                message: message,
                content: contentBase64
            };

            if (sha) {
                requestBody.sha = sha;
            }

            const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/tech-data.json`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json',
                    'X-GitHub-Api-Version': '2022-11-28'
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP ${response.status}`);
            }

            uiManager.showNotification('✅ Данные успешно сохранены на GitHub!', 'success');
        } catch (error) {
            console.error('GitHub save error:', error);
            let errorMessage = 'Ошибка сохранения: ';
            
            if (error.message.includes('409')) {
                errorMessage += 'Конфликт версий. Обновите данные и попробуйте снова';
            } else if (error.message.includes('403')) {
                errorMessage += 'Нет прав на запись в репозиторий';
            } else {
                errorMessage += error.message;
            }
            
            uiManager.showNotification(errorMessage, 'error');
        }
    },

    async autoSaveToGitHub() {
        if (!this.autoSaveEnabled) return;

        const token = localStorage.getItem('githubToken');
        const owner = localStorage.getItem('repoOwner');
        const repo = localStorage.getItem('repoName');
        
        if (!token || !owner || !repo) {
            return;
        }

        // Проверяем, что прошло достаточно времени с последнего сохранения
        const now = Date.now();
        if (this.lastSaveTime && (now - this.lastSaveTime) < 30000) {
            return;
        }

        try {
            // Получаем текущий SHA файла
            let sha = null;
            try {
                const getResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/tech-data.json`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/vnd.github.v3+json',
                        'X-GitHub-Api-Version': '2022-11-28'
                    }
                });
                
                if (getResponse.ok) {
                    const data = await getResponse.json();
                    sha = data.sha;
                }
            } catch (e) {
                return; // Пропускаем автосохранение при ошибке
            }

            const content = JSON.stringify(techData, null, 2);
            const contentBase64 = btoa(unescape(encodeURIComponent(content)));
            const message = `Auto-save: ${new Date().toLocaleString()}`;
            
            const requestBody = {
                message: message,
                content: contentBase64
            };

            if (sha) {
                requestBody.sha = sha;
            }

            const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/tech-data.json`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json',
                    'X-GitHub-Api-Version': '2022-11-28'
                },
                body: JSON.stringify(requestBody)
            });

            if (response.ok) {
                this.lastSaveTime = Date.now();
                console.log('✅ Автосохранение выполнено');
            }
        } catch (error) {
            console.error('❌ Ошибка автосохранения:', error);
        }
    },
    
    scheduleAutoSave() {
        if (!this.autoSaveEnabled) return;
        
        if (this.autoSaveTimeout) {
            clearTimeout(this.autoSaveTimeout);
        }
        
        this.autoSaveTimeout = setTimeout(() => {
            this.autoSaveToGitHub();
        }, 10000);
    }
};