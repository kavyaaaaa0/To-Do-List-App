let todos = JSON.parse(localStorage.getItem('todos')) || [];
let todoIdCounter = parseInt(localStorage.getItem('todoIdCounter')) || 0;

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    renderTodos();
    updateStats();
    
    // Add event listener for Enter key in input field
    document.getElementById('todoInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addTodo();
        }
    });
});

function addTodo() {
    const input = document.getElementById('todoInput');
    const todoText = input.value.trim();
    
    if (todoText === '') {
        alert('Please enter a task!');
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
    
    // Add a small animation effect
    const todoList = document.getElementById('todoList');
    const lastItem = todoList.lastElementChild;
    if (lastItem) {
        lastItem.style.opacity = '0';
        lastItem.style.transform = 'translateY(-20px)';
        setTimeout(() => {
            lastItem.style.opacity = '1';
            lastItem.style.transform = 'translateY(0)';
        }, 100);
    }
}

function toggleTodo(id) {
    todos = todos.map(todo => 
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    
    saveTodos();
    renderTodos();
    updateStats();
}

function deleteTodo(id) {
    if (confirm('Are you sure you want to delete this task?')) {
        todos = todos.filter(todo => todo.id !== id);
        saveTodos();
        renderTodos();
        updateStats();
    }
}

function clearCompleted() {
    const completedCount = todos.filter(todo => todo.completed).length;
    
    if (completedCount === 0) {
        alert('No completed tasks to clear!');
        return;
    }
    
    if (confirm(`Are you sure you want to clear ${completedCount} completed task(s)?`)) {
        todos = todos.filter(todo => !todo.completed);
        saveTodos();
        renderTodos();
        updateStats();
    }
}

function renderTodos() {
    const todoList = document.getElementById('todoList');
    todoList.innerHTML = '';
    
    if (todos.length === 0) {
        todoList.innerHTML = '<li style="text-align: center; color: #666; font-style: italic; padding: 20px;">No tasks yet. Add one above!</li>';
        return;
    }
    
    // Sort todos: incomplete first, then completed
    const sortedTodos = [...todos].sort((a, b) => {
        if (a.completed && !b.completed) return 1;
        if (!a.completed && b.completed) return -1;
        return 0;
    });
    
    sortedTodos.forEach(todo => {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        
        li.innerHTML = `
            <span class="todo-text">${escapeHtml(todo.text)}</span>
            <div class="todo-actions">
                <button class="complete-btn" onclick="toggleTodo(${todo.id})">
                    ${todo.completed ? 'Undo' : 'Complete'}
                </button>
                <button class="delete-btn" onclick="deleteTodo(${todo.id})">
                    Delete
                </button>
            </div>
        `;
        
        todoList.appendChild(li);
    });
}

function updateStats() {
    const totalTasks = todos.length;
    const completedTasks = todos.filter(todo => todo.completed).length;
    
    document.getElementById('totalTasks').textContent = `Total: ${totalTasks}`;
    document.getElementById('completedTasks').textContent = `Completed: ${completedTasks}`;
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

// Add some keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + Enter to add todo
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        addTodo();
    }
    
    // Escape to clear input
    if (e.key === 'Escape') {
        document.getElementById('todoInput').value = '';
        document.getElementById('todoInput').blur();
    }
});

// Welcome message for first-time users
if (todos.length === 0 && !localStorage.getItem('hasVisited')) {
    setTimeout(() => {
        alert('Welcome to your To-Do List! 🎉\n\nTips:\n• Press Enter to quickly add tasks\n• Tasks are automatically saved\n• Use Complete/Undo to mark progress\n• Clear completed tasks when done');
        localStorage.setItem('hasVisited', 'true');
    }, 1000);
}
