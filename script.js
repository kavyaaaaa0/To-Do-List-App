let todos = JSON.parse(localStorage.getItem('todos')) || [];
let todoIdCounter = parseInt(localStorage.getItem('todoIdCounter')) || 0;
let currentView = 'today';

document.addEventListener('DOMContentLoaded', function() {
    renderTodos();
    updateStats();
    setupEventListeners();
    updateEmptyState();
});

function setupEventListeners() {
    const todoInput = document.getElementById('todoInput');
    
    todoInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addTodo();
        }
    });
    
    todoInput.addEventListener('focus', function() {
        this.parentElement.style.transform = 'translateY(-2px)';
        this.parentElement.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.4)';
    });
    
    todoInput.addEventListener('blur', function() {
        this.parentElement.style.transform = '';
        this.parentElement.style.boxShadow = '';
    });
    
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function() {
            switchView(this.dataset.view);
        });
    });
}

function switchView(view) {
    currentView = view;
    
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    document.querySelector(`[data-view="${view}"]`).classList.add('active');
    document.getElementById('viewTitle').textContent = view;
    
    renderTodos();
}

function addTodo() {
    const input = document.getElementById('todoInput');
    const todoText = input.value.trim();
    
    if (todoText === '') {
        input.style.borderColor = 'rgba(239, 68, 68, 0.5)';
        input.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
        
        setTimeout(() => {
            input.style.borderColor = '';
            input.style.boxShadow = '';
        }, 2000);
        return;
    }
    
    const newTodo = {
        id: todoIdCounter++,
        text: todoText,
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    todos.push(newTodo);
    input.value = '';
    
    saveTodos();
    renderTodos();
    updateStats();
    updateEmptyState();
    
    const newItem = document.querySelector('.task-item:last-child');
    if (newItem) {
        newItem.classList.add('adding');
        setTimeout(() => {
            newItem.classList.remove('adding');
        }, 400);
    }
}

function toggleTodo(id) {
    const todoElement = document.querySelector(`[data-todo-id="${id}"]`);
    const checkbox = todoElement.querySelector('.task-checkbox');
    
    checkbox.classList.add('animating');
    
    setTimeout(() => {
        todos = todos.map(todo => 
            todo.id === id ? { ...todo, completed: !todo.completed } : todo
        );
        
        saveTodos();
        renderTodos();
        updateStats();
        updateEmptyState();
        
        checkbox.classList.remove('animating');
    }, 150);
}

function deleteTodo(id) {
    const todoElement = document.querySelector(`[data-todo-id="${id}"]`);
    todoElement.classList.add('removing');
    
    setTimeout(() => {
        todos = todos.filter(todo => todo.id !== id);
        saveTodos();
        renderTodos();
        updateStats();
        updateEmptyState();
    }, 300);
}

function clearCompleted() {
    const completedCount = todos.filter(todo => todo.completed).length;
    
    if (completedCount === 0) {
        return;
    }
    
    const completedTasks = document.querySelectorAll('.task-item.completed');
    
    completedTasks.forEach((task, index) => {
        setTimeout(() => {
            task.classList.add('removing');
        }, index * 100);
    });
    
    setTimeout(() => {
        todos = todos.filter(todo => !todo.completed);
        saveTodos();
        renderTodos();
        updateStats();
        updateEmptyState();
    }, completedTasks.length * 100 + 300);
}

function renderTodos() {
    const todoList = document.getElementById('todoList');
    todoList.innerHTML = '';
    
    const sortedTodos = [...todos].sort((a, b) => {
        if (a.completed && !b.completed) return 1;
        if (!a.completed && b.completed) return -1;
        return new Date(b.createdAt) - new Date(a.createdAt);
    });
    
    sortedTodos.forEach(todo => {
        const div = document.createElement('div');
        div.className = `task-item ${todo.completed ? 'completed' : ''}`;
        div.setAttribute('data-todo-id', todo.id);
        
        div.innerHTML = `
            <div class="task-checkbox ${todo.completed ? 'checked' : ''}" onclick="toggleTodo(${todo.id})">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                    <polyline points="20,6 9,17 4,12"></polyline>
                </svg>
            </div>
            <span class="task-text">${escapeHtml(todo.text)}</span>
            <div class="task-actions">
                <button class="task-btn delete-btn" onclick="deleteTodo(${todo.id})">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3,6 5,6 21,6"></polyline>
                        <path d="m19,6v14a2,2 0 0 1 -2,2H7a2,2 0 0 1 -2,-2V6m3,0V4a2,2 0 0 1 2,-2h4a2,2 0 0 1 2,2v2"></path>
                    </svg>
                </button>
            </div>
        `;
        
        todoList.appendChild(div);
    });
}

function updateStats() {
    const totalTasks = todos.length;
    const completedTasks = todos.filter(todo => todo.completed).length;
    
    document.getElementById('totalTasks').textContent = totalTasks;
    document.getElementById('completedTasks').textContent = completedTasks;
}

function updateEmptyState() {
    const emptyState = document.getElementById('emptyState');
    const taskList = document.getElementById('todoList');
    
    if (todos.length === 0) {
        emptyState.style.display = 'flex';
        taskList.style.display = 'none';
    } else {
        emptyState.style.display = 'none';
        taskList.style.display = 'flex';
    }
}

function focusInput() {
    document.getElementById('todoInput').focus();
}

function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
    localStorage.setItem('todoIdCounter', todoIdCounter.toString());
}

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        addTodo();
    }
    
    if (e.key === 'Escape') {
        const input = document.getElementById('todoInput');
        input.value = '';
        input.blur();
    }
    
    if (e.key === '/' && !document.activeElement.matches('input')) {
        e.preventDefault();
        document.getElementById('todoInput').focus();
    }
});
