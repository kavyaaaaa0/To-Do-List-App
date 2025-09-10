let todos = JSON.parse(localStorage.getItem('todos')) || [];
let todoIdCounter = parseInt(localStorage.getItem('todoIdCounter')) || 0;

document.addEventListener('DOMContentLoaded', function() {
    renderTodos();
    updateStats();
    
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
        alert('please enter a task');
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
    if (confirm('delete this task?')) {
        todos = todos.filter(todo => todo.id !== id);
        saveTodos();
        renderTodos();
        updateStats();
    }
}

function clearCompleted() {
    const completedCount = todos.filter(todo => todo.completed).length;
    
    if (completedCount === 0) {
        alert('no completed tasks to clear');
        return;
    }
    
    if (confirm(`clear ${completedCount} completed tasks?`)) {
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
        todoList.innerHTML = '<li style="text-align: center; color: #666; font-style: italic; padding: 20px;">no tasks yet, add one above</li>';
        return;
    }
    
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
                    ${todo.completed ? 'undo' : 'done'}
                </button>
                <button class="delete-btn" onclick="deleteTodo(${todo.id})">
                    delete
                </button>
            </div>
        `;
        
        todoList.appendChild(li);
    });
}

function updateStats() {
    const totalTasks = todos.length;
    const completedTasks = todos.filter(todo => todo.completed).length;
    
    document.getElementById('totalTasks').textContent = `total: ${totalTasks}`;
    document.getElementById('completedTasks').textContent = `done: ${completedTasks}`;
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
        document.getElementById('todoInput').value = '';
        document.getElementById('todoInput').blur();
    }
});
