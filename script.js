// Global variables
let habits = JSON.parse(localStorage.getItem('habits')) || [];
let currentTheme = localStorage.getItem('theme') || 'light';
let currentLanguage = localStorage.getItem('language') || 'ru';
let lastCheckDate = localStorage.getItem('lastCheckDate') || new Date().toDateString();

// Translations
const translations = {
    ru: {
        'app-title': 'Habit Tracker',
        'settings': 'Настройки',
        'motivation-text': 'Не сдавайтесь! Каждый день - это новая возможность!',
        'add-habit': 'Добавить привычку',
        'habit-placeholder': 'Введите название привычки...',
        'add': 'Добавить',
        'my-habits': 'Мои привычки',
        'progress-calendar': 'Календарь прогресса',
        'theme-settings': 'Настройки темы',
        'light-theme': 'Светлая тема',
        'dark-theme': 'Темная тема',
        'language-settings': 'Язык',
        'data-management': 'Управление данными',
        'export': 'Экспорт данных',
        'import': 'Импорт данных',
        'back': 'Назад к привычкам',
        'completed': 'Выполнено',
        'delete': 'Удалить',
        'days': 'дней',
        'streak': 'серия'
    },
    en: {
        'app-title': 'Habit Tracker',
        'settings': 'Settings',
        'motivation-text': "Don't give up! Every day is a new opportunity!",
        'add-habit': 'Add Habit',
        'habit-placeholder': 'Enter habit name...',
        'add': 'Add',
        'my-habits': 'My Habits',
        'progress-calendar': 'Progress Calendar',
        'theme-settings': 'Theme Settings',
        'light-theme': 'Light Theme',
        'dark-theme': 'Dark Theme',
        'language-settings': 'Language',
        'data-management': 'Data Management',
        'export': 'Export Data',
        'import': 'Import Data',
        'back': 'Back to Habits',
        'completed': 'Completed',
        'delete': 'Delete',
        'days': 'days',
        'streak': 'streak'
    }
};

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setup3DEffects();
    setupEventListeners();
    loadHabits();
    generateCalendar();
    checkMotivation();
});

function initializeApp() {
    // Set theme
    document.documentElement.setAttribute('data-theme', currentTheme);
    
    // Set language
    updateLanguage();
    
    // Update theme toggle button
    updateThemeToggle();
}

function setup3DEffects() {
    const shapes = document.querySelectorAll('.abstract-shape');
    let mouseX = 0;
    let mouseY = 0;
    let scrollY = 0;

    // Mouse movement effect
    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth) * 360;
        mouseY = (e.clientY / window.innerHeight) * 360;
        
        shapes.forEach((shape, index) => {
            const intensity = (index + 1) * 0.1;
            const rotateX = (mouseY - 180) * intensity;
            const rotateY = (mouseX - 180) * intensity;
            
            shape.style.transform = `translateY(0px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });
    });

    // Scroll effect
    document.addEventListener('scroll', () => {
        scrollY = window.scrollY;
        
        shapes.forEach((shape, index) => {
            const intensity = (index + 1) * 0.5;
            const rotation = scrollY * intensity;
            
            shape.style.transform += ` rotateZ(${rotation}deg)`;
        });
    });

    // Wheel effect for flipping
    document.addEventListener('wheel', (e) => {
        e.preventDefault();
        
        shapes.forEach((shape, index) => {
            const flipIntensity = (index + 1) * 0.1;
            const flipRotation = e.deltaY * flipIntensity;
            
            shape.style.transform += ` rotateX(${flipRotation}deg)`;
        });
    });
}

function setupEventListeners() {
    // Navigation
    document.getElementById('settingsBtn').addEventListener('click', showSettings);
    document.getElementById('backToMain').addEventListener('click', showMain);
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    
    // Habit management
    document.getElementById('addHabitBtn').addEventListener('click', addHabit);
    document.getElementById('habitInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addHabit();
    });
    
    // Settings
    document.querySelectorAll('input[name="theme"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            currentTheme = e.target.value;
            document.documentElement.setAttribute('data-theme', currentTheme);
            localStorage.setItem('theme', currentTheme);
            updateThemeToggle();
        });
    });
    
    document.getElementById('languageSelect').addEventListener('change', (e) => {
        currentLanguage = e.target.value;
        localStorage.setItem('language', currentLanguage);
        updateLanguage();
    });
    
    // Data management
    document.getElementById('exportBtn').addEventListener('click', exportData);
    document.getElementById('importBtn').addEventListener('click', () => {
        document.getElementById('importFile').click();
    });
    document.getElementById('importFile').addEventListener('change', importData);
    
    // Motivation message
    document.getElementById('closeMotivation').addEventListener('click', () => {
        document.getElementById('motivationMessage').classList.add('hidden');
    });
}

function showSettings() {
    document.getElementById('mainPage').classList.remove('active');
    document.getElementById('settingsPage').classList.add('active');
    
    // Set current theme radio
    document.querySelector(`input[name="theme"][value="${currentTheme}"]`).checked = true;
    document.getElementById('languageSelect').value = currentLanguage;
}

function showMain() {
    document.getElementById('settingsPage').classList.remove('active');
    document.getElementById('mainPage').classList.add('active');
}

function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('theme', currentTheme);
    updateThemeToggle();
}

function updateThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    themeToggle.textContent = currentTheme === 'light' ? '🌙' : '☀️';
}

function updateLanguage() {
    const elements = document.querySelectorAll('[data-key]');
    elements.forEach(element => {
        const key = element.getAttribute('data-key');
        if (translations[currentLanguage][key]) {
            element.textContent = translations[currentLanguage][key];
        }
    });
}

function addHabit() {
    const input = document.getElementById('habitInput');
    const name = input.value.trim();
    
    if (name) {
        const habit = {
            id: Date.now(),
            name: name,
            createdAt: new Date().toISOString(),
            completedDays: [],
            streak: 0,
            lastCompleted: null
        };
        
        habits.push(habit);
        saveHabits();
        loadHabits();
        input.value = '';
    }
}

function loadHabits() {
    const habitsList = document.getElementById('habitsList');
    habitsList.innerHTML = '';
    
    habits.forEach(habit => {
        const habitElement = createHabitElement(habit);
        habitsList.appendChild(habitElement);
    });
}

function createHabitElement(habit) {
    const div = document.createElement('div');
    div.className = 'habit-item';
    div.innerHTML = `
        <div class="habit-info">
            <div class="habit-name">${habit.name}</div>
            <div class="habit-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${calculateProgress(habit)}%"></div>
                </div>
                <div class="progress-text">${habit.streak} ${translations[currentLanguage]['days']}</div>
            </div>
        </div>
        <div class="habit-actions">
            <button class="habit-btn complete-btn" onclick="toggleHabitCompletion(${habit.id})">
                ${translations[currentLanguage]['completed']}
            </button>
            <button class="habit-btn delete-btn" onclick="deleteHabit(${habit.id})">
                ${translations[currentLanguage]['delete']}
            </button>
        </div>
    `;
    return div;
}

function toggleHabitCompletion(habitId) {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;
    
    const today = new Date().toDateString();
    const todayIndex = habit.completedDays.indexOf(today);
    
    if (todayIndex === -1) {
        // Mark as completed
        habit.completedDays.push(today);
        habit.lastCompleted = today;
        updateStreak(habit);
    } else {
        // Mark as not completed
        habit.completedDays.splice(todayIndex, 1);
        updateStreak(habit);
    }
    
    saveHabits();
    loadHabits();
    generateCalendar();
    checkMotivation();
}

function deleteHabit(habitId) {
    if (confirm('Вы уверены, что хотите удалить эту привычку?')) {
        habits = habits.filter(h => h.id !== habitId);
        saveHabits();
        loadHabits();
        generateCalendar();
    }
}

function updateStreak(habit) {
    const sortedDays = habit.completedDays.sort();
    let streak = 0;
    let currentDate = new Date();
    
    for (let i = sortedDays.length - 1; i >= 0; i--) {
        const completedDate = new Date(sortedDays[i]);
        const daysDiff = Math.floor((currentDate - completedDate) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === streak) {
            streak++;
            currentDate = new Date(completedDate);
        } else {
            break;
        }
    }
    
    habit.streak = streak;
}

function calculateProgress(habit) {
    const daysSinceStart = Math.floor((new Date() - new Date(habit.createdAt)) / (1000 * 60 * 60 * 24)) + 1;
    const completedDays = habit.completedDays.length;
    return Math.min((completedDays / daysSinceStart) * 100, 100);
}

function generateCalendar() {
    const calendar = document.getElementById('calendar');
    calendar.innerHTML = '';
    
    // Calendar headers
    const daysOfWeek = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    if (currentLanguage === 'en') {
        daysOfWeek.splice(0, 7, 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun');
    }
    
    daysOfWeek.forEach(day => {
        const header = document.createElement('div');
        header.className = 'calendar-header';
        header.textContent = day;
        calendar.appendChild(header);
    });
    
    // Get current month
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    
    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = (firstDay.getDay() + 6) % 7; // Convert Sunday=0 to Monday=0
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day other-month';
        calendar.appendChild(emptyDay);
    }
    
    // Add days of month
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.textContent = day;
        
        const dateString = new Date(year, month, day).toDateString();
        
        // Check if any habit was completed on this day
        const completedHabits = habits.filter(habit => 
            habit.completedDays.includes(dateString)
        );
        
        if (completedHabits.length > 0) {
            if (completedHabits.length === habits.length) {
                dayElement.classList.add('completed');
            } else {
                dayElement.classList.add('partial');
            }
        }
        
        // Check if this is a missed day (no habits completed for 2+ days)
        const daysSinceLastCompletion = getDaysSinceLastCompletion();
        if (daysSinceLastCompletion >= 2 && day === now.getDate()) {
            dayElement.classList.add('missed');
        }
        
        calendar.appendChild(dayElement);
    }
}

function getDaysSinceLastCompletion() {
    const today = new Date();
    let maxDaysSince = 0;
    
    habits.forEach(habit => {
        if (habit.lastCompleted) {
            const lastCompleted = new Date(habit.lastCompleted);
            const daysDiff = Math.floor((today - lastCompleted) / (1000 * 60 * 60 * 24));
            maxDaysSince = Math.max(maxDaysSince, daysDiff);
        } else {
            maxDaysSince = Math.max(maxDaysSince, 999); // Very large number if never completed
        }
    });
    
    return maxDaysSince;
}

function checkMotivation() {
    const daysSinceLastCompletion = getDaysSinceLastCompletion();
    const motivationMessage = document.getElementById('motivationMessage');
    
    if (daysSinceLastCompletion >= 2) {
        motivationMessage.classList.remove('hidden');
    } else {
        motivationMessage.classList.add('hidden');
    }
}

function saveHabits() {
    localStorage.setItem('habits', JSON.stringify(habits));
}

function exportData() {
    const data = {
        habits: habits,
        exportDate: new Date().toISOString(),
        version: '1.0'
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `habits-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            if (data.habits && Array.isArray(data.habits)) {
                habits = data.habits;
                saveHabits();
                loadHabits();
                generateCalendar();
                alert('Данные успешно импортированы!');
            } else {
                alert('Неверный формат файла!');
            }
        } catch (error) {
            alert('Ошибка при чтении файла!');
        }
    };
    reader.readAsText(file);
    
    // Reset file input
    event.target.value = '';
}

// Initialize theme on page load
document.documentElement.setAttribute('data-theme', currentTheme);
