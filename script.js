// ToDo List Application
class TodoApp {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('todoTasks')) || [];
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.bindEvents();
        this.renderTasks();
        this.updateStats();
    }

    bindEvents() {
        // Добавление задачи
        const addBtn = document.getElementById('addBtn');
        const taskInput = document.getElementById('taskInput');
        
        addBtn.addEventListener('click', () => this.addTask());
        taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addTask();
            }
        });

        // Фильтры
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });
    }

    addTask() {
        const taskInput = document.getElementById('taskInput');
        const text = taskInput.value.trim();
        
        if (text === '') {
            this.showNotification('Пожалуйста, введите текст задачи', 'error');
            return;
        }

        const task = {
            id: Date.now(),
            text: text,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.tasks.unshift(task);
        this.saveTasks();
        this.renderTasks();
        this.updateStats();
        
        taskInput.value = '';
        this.showNotification('Задача добавлена!', 'success');
    }

    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.renderTasks();
            this.updateStats();
        }
    }

    editTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (!task) return;

        const newText = prompt('Редактировать задачу:', task.text);
        if (newText !== null && newText.trim() !== '') {
            task.text = newText.trim();
            this.saveTasks();
            this.renderTasks();
            this.showNotification('Задача обновлена!', 'success');
        }
    }

    deleteTask(id) {
        if (confirm('Вы уверены, что хотите удалить эту задачу?')) {
            this.tasks = this.tasks.filter(t => t.id !== id);
            this.saveTasks();
            this.renderTasks();
            this.updateStats();
            this.showNotification('Задача удалена!', 'info');
        }
    }

    setFilter(filter) {
        this.currentFilter = filter;
        
        // Обновляем активную кнопку фильтра
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
        
        this.renderTasks();
    }

    getFilteredTasks() {
        switch (this.currentFilter) {
            case 'active':
                return this.tasks.filter(task => !task.completed);
            case 'completed':
                return this.tasks.filter(task => task.completed);
            default:
                return this.tasks;
        }
    }

    renderTasks() {
        const tasksList = document.getElementById('tasksList');
        const filteredTasks = this.getFilteredTasks();

        if (filteredTasks.length === 0) {
            tasksList.innerHTML = this.getEmptyStateHTML();
            return;
        }

        tasksList.innerHTML = filteredTasks.map(task => this.createTaskHTML(task)).join('');
        
        // Привязываем события к новым элементам
        this.bindTaskEvents();
    }

    createTaskHTML(task) {
        return `
            <li class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
                <div class="task-checkbox ${task.completed ? 'checked' : ''}" data-action="toggle"></div>
                <span class="task-text">${this.escapeHtml(task.text)}</span>
                <div class="task-actions">
                    <button class="edit-btn" data-action="edit" title="Редактировать">✏️</button>
                    <button class="delete-btn" data-action="delete" title="Удалить">🗑️</button>
                </div>
            </li>
        `;
    }

    getEmptyStateHTML() {
        const messages = {
            all: 'У вас пока нет задач. Добавьте первую!',
            active: 'Нет активных задач. Отлично!',
            completed: 'Нет завершенных задач.'
        };

        return `
            <li class="empty-state">
                <div style="text-align: center; padding: 40px 20px; color: #999;">
                    <div style="font-size: 3rem; margin-bottom: 20px;">📝</div>
                    <p>${messages[this.currentFilter]}</p>
                </div>
            </li>
        `;
    }

    bindTaskEvents() {
        document.querySelectorAll('.task-item').forEach(item => {
            const taskId = parseInt(item.dataset.id);
            
            // Переключение статуса задачи
            item.querySelector('[data-action="toggle"]').addEventListener('click', () => {
                this.toggleTask(taskId);
            });

            // Редактирование задачи
            item.querySelector('[data-action="edit"]').addEventListener('click', () => {
                this.editTask(taskId);
            });

            // Удаление задачи
            item.querySelector('[data-action="delete"]').addEventListener('click', () => {
                this.deleteTask(taskId);
            });
        });
    }

    updateStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(task => task.completed).length;
        const active = total - completed;

        document.getElementById('totalTasks').textContent = `Всего задач: ${total}`;
        document.getElementById('activeTasks').textContent = `Активных: ${active}`;
        document.getElementById('completedTasks').textContent = `Завершенных: ${completed}`;
    }

    saveTasks() {
        localStorage.setItem('todoTasks', JSON.stringify(this.tasks));
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showNotification(message, type = 'info') {
        // Создаем уведомление
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Стили для уведомления
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '15px 20px',
            borderRadius: '10px',
            color: 'white',
            fontWeight: '500',
            zIndex: '1000',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease',
            maxWidth: '300px',
            wordWrap: 'break-word'
        });

        // Цвета для разных типов уведомлений
        const colors = {
            success: '#657D8D',
            error: '#DAAD86',
            info: '#659DBD'
        };
        notification.style.background = colors[type] || colors.info;

        document.body.appendChild(notification);

        // Анимация появления
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Удаление через 3 секунды
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Дополнительные методы для расширения функциональности
    clearCompleted() {
        const completedCount = this.tasks.filter(task => task.completed).length;
        if (completedCount === 0) {
            this.showNotification('Нет завершенных задач для удаления', 'info');
            return;
        }

        if (confirm(`Удалить ${completedCount} завершенных задач?`)) {
            this.tasks = this.tasks.filter(task => !task.completed);
            this.saveTasks();
            this.renderTasks();
            this.updateStats();
            this.showNotification(`Удалено ${completedCount} задач`, 'success');
        }
    }

    exportTasks() {
        const dataStr = JSON.stringify(this.tasks, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `todo-tasks-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
        this.showNotification('Задачи экспортированы!', 'success');
    }
}

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    window.todoApp = new TodoApp();
    
    // Добавляем дополнительные кнопки управления
    const statsSection = document.querySelector('.stats-section');
    const controlsDiv = document.createElement('div');
    controlsDiv.style.cssText = 'margin-top: 15px; text-align: center;';
    controlsDiv.innerHTML = `
        <button onclick="todoApp.clearCompleted()" style="
            background: linear-gradient(135deg, #657D8D 0%, #659DBD 100%); 
            color: white; 
            border: 2px solid #657D8D; 
            padding: 8px 16px; 
            border-radius: 15px; 
            margin: 0 5px; 
            cursor: pointer;
            font-size: 0.9rem;
            box-shadow: 0 2px 8px rgba(101, 125, 141, 0.3);
            user-select: none;
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
        ">Очистить завершенные</button>
        <button onclick="todoApp.exportTasks()" style="
            background: linear-gradient(135deg, #DAAD86 0%, #c49a6b 100%); 
            color: #333; 
            border: 2px solid #c49a6b; 
            padding: 8px 16px; 
            border-radius: 15px; 
            margin: 0 5px; 
            cursor: pointer;
            font-size: 0.9rem;
            box-shadow: 0 2px 8px rgba(218, 173, 134, 0.3);
            user-select: none;
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
        ">Экспорт</button>
    `;
    statsSection.appendChild(controlsDiv);
});

// Добавляем поддержку drag & drop для задач (опционально)
document.addEventListener('DOMContentLoaded', () => {
    let draggedElement = null;
    
    document.addEventListener('dragstart', (e) => {
        if (e.target.classList.contains('task-item')) {
            draggedElement = e.target;
            e.target.style.opacity = '0.5';
        }
    });
    
    document.addEventListener('dragend', (e) => {
        if (e.target.classList.contains('task-item')) {
            e.target.style.opacity = '1';
            draggedElement = null;
        }
    });
    
    document.addEventListener('dragover', (e) => {
        e.preventDefault();
    });
    
    document.addEventListener('drop', (e) => {
        e.preventDefault();
        if (draggedElement && e.target.classList.contains('task-item')) {
            const tasksList = document.getElementById('tasksList');
            const afterElement = getDragAfterElement(tasksList, e.clientY);
            
            if (afterElement == null) {
                tasksList.appendChild(draggedElement);
            } else {
                tasksList.insertBefore(draggedElement, afterElement);
            }
        }
    });
    
    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.task-item:not(.dragging)')];
        
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }
});
