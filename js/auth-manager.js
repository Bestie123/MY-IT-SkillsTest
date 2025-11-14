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
                    'Authorization': `token ${token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'User-Agent': 'TechDocs-App'
                }
            });

            const responseData = await response.json();

            if (response.status === 200) {
                const permissions = responseData.permissions;
                if (permissions && permissions.push) {
                    this.showAuthStatus('✅ Подключение успешно! Репозиторий доступен для записи.', 'success');
                    this.enableAutoSave();
                } else {
                    this.showAuthStatus('⚠️ Репозиторий доступен, но нет прав на запись.', 'warning');
                }
            } else if (response.status === 404) {
                this.showAuthStatus('❌ Репозиторий не найден. Проверьте имя и владельца.', 'error');
            } else if (response.status === 401) {
                this.showAuthStatus('❌ Ошибка аутентификации. Проверьте токен.', 'error');
            } else if (response.status === 403) {
                this.showAuthStatus('🚫 Доступ запрещен. Убедитесь, что токен имеет права repo.', 'error');
            } else {
                this.showAuthStatus(`❌ Ошибка: ${response.status} - ${responseData.message || response.statusText}`, 'error');
            }
        } catch (error) {
            console.error('Auth test error:', error);
            this.showAuthStatus('❌ Ошибка сети: ' + error.message, 'error');
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
            button.innerHTML = '✅ Автосохранение';
            button.className = 'auto-save-enabled';
        } else {
            button.innerHTML = '🚫 Автосохранение';
            button.className = 'auto-save-disabled';
        }
    },
    
    async autoSaveToGitHub() {
        const token = localStorage.getItem('githubToken');
        const owner = localStorage.getItem('repoOwner');
        const repo = localStorage.getItem('repoName');
        
        if (!token || !owner || !repo || !this.autoSaveEnabled) {
            return;
        }

        const now = Date.now();
        if (this.lastSaveTime && (now - this.lastSaveTime) < 30000) {
            return;
        }

        try {
            console.log('🔄 Автосохранение на GitHub...');
            
            let sha = null;
            
            try {
                const getResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/tech-data.json`, {
                    headers: {
                        'Authorization': `token ${token}`,
                        'Accept': 'application/vnd.github.v3+json',
                        'User-Agent': 'TechDocs-App'
                    }
                });
                
                if (getResponse.status === 200) {
                    const data = await getResponse.json();
                    sha = data.sha;
                }
            } catch (e) {
                console.error('Ошибка при проверке файла для автосохранения:', e);
                return;
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
                    'Authorization': `token ${token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json',
                    'User-Agent': 'TechDocs-App'
                },
                body: JSON.stringify(requestBody)
            });

            if (response.status === 200 || response.status === 201) {
                this.lastSaveTime = Date.now();
                console.log('✅ Автосохранение выполнено успешно');
                
                if (!document.hidden) {
                    this.showAutoSaveNotification();
                }
            } else {
                console.warn('⚠️ Автосохранение не удалось:', response.status);
            }
        } catch (error) {
            console.error('❌ Ошибка автосохранения:', error);
        }
    },
    
    showAutoSaveNotification() {
        const notification = document.createElement('div');
        notification.innerHTML = '💾 Автосохранено';
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 12px;
            z-index: 1002;
            opacity: 0.9;
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 2000);
    },
    
    scheduleAutoSave() {
        if (!this.autoSaveEnabled) return;
        
        if (this.autoSaveTimeout) {
            clearTimeout(this.autoSaveTimeout);
        }
        
        this.autoSaveTimeout = setTimeout(() => {
            this.autoSaveToGitHub();
        }, 10000);
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
                    'Authorization': `token ${token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'User-Agent': 'TechDocs-App'
                }
            });

            if (response.status === 200) {
                const data = await response.json();
                const content = decodeURIComponent(escape(atob(data.content)));
                const parsedData = JSON.parse(content);
                
                techData.categories = parsedData.categories || [];
                treeManager.renderTree();
                dataManager.saveToLocalStorage();
                uiManager.showNotification('✅ Данные загружены с GitHub!', 'success');
            } else if (response.status === 404) {
                uiManager.showNotification('📝 Файл не найден. Создан новый пустой файл.', 'warning');
                techData.categories = [];
                treeManager.renderTree();
                dataManager.saveToLocalStorage();
            } else {
                const errorData = await response.json();
                throw new Error(`GitHub API error: ${response.status} - ${errorData.message || response.statusText}`);
            }
        } catch (error) {
            console.error('GitHub load error:', error);
            uiManager.showNotification('❌ Ошибка загрузки: ' + error.message, 'error');
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
            
            if (!techData || techData.categories.length === 0) {
                uiManager.showNotification('Нет данных для сохранения!', 'error');
                return;
            }

            let sha = null;
            
            try {
                const getResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/tech-data.json`, {
                    headers: {
                        'Authorization': `token ${token}`,
                        'Accept': 'application/vnd.github.v3+json',
                        'User-Agent': 'TechDocs-App'
                    }
                });
                
                if (getResponse.status === 200) {
                    const data = await getResponse.json();
                    sha = data.sha;
                }
            } catch (e) {
                console.error('Ошибка при проверке файла:', e);
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
                    'Authorization': `token ${token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json',
                    'User-Agent': 'TechDocs-App'
                },
                body: JSON.stringify(requestBody)
            });

            const responseData = await response.json();

            if (response.status === 200 || response.status === 201) {
                uiManager.showNotification('✅ Данные успешно сохранены на GitHub!', 'success');
            } else {
                let errorMessage = `Ошибка сохранения: ${response.status}`;
                if (responseData && responseData.message) {
                    errorMessage += ` - ${responseData.message}`;
                    
                    if (responseData.message.includes('bad credentials')) {
                        errorMessage += '\nПроверьте правильность токена';
                    } else if (responseData.message.includes('not found')) {
                        errorMessage += '\nПроверьте имя репозитория и владельца';
                    } else if (responseData.message.includes('sha')) {
                        errorMessage += '\nПопробуйте загрузить данные сначала, затем сохранить';
                    }
                }
                throw new Error(errorMessage);
            }
        } catch (error) {
            console.error('GitHub save error:', error);
            uiManager.showNotification('❌ Ошибка сохранения: ' + error.message, 'error');
        }
    }
};
