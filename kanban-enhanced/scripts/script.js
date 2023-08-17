class kanBanBoard{
    constructor(){
        this.toolBoxContainer = document.querySelector('.toolBoxContainer');
        this.modalContainer = document.querySelector('.modal-overlay');
        this.modalCloseBtn = document.querySelector('.modal-close-btn');
        this.addCardBtn = document.querySelector('.add-card');
        this.textArea = document.querySelector('.textarea-cont');
        this.priorityColorElms = document.querySelectorAll('.priority-color');
        this.mainContainer = document.querySelector('.mainContainer');
        this.allTasks = document.querySelectorAll('.taskContainer');
        this.deleteBtn = document.querySelector('.fa-trash');
        this.todoContainer = document.querySelector('#todo');
        this.progressContainer = document.querySelector('#inProgress');
        this.completedContainer = document.querySelector('#completed');
        this.resetFilterBtn = document.querySelector('.resetFilter');
        this.tooltipContainers = document.querySelectorAll('[data-tooltip]');

        this.modalStatus = true;
        this.deleteStatus = false;
        this.priorityColor = 'black';
        this.tasksArr = [];
        this.status = 'todo';
        this.colors = ['red', 'blue', 'green', 'black'];

        this.init();
    }

    init(){
        this.renderTasksFromLocalStorage();

        this.toolBoxContainer.addEventListener('click', this.handleToolBox.bind(this));
        this.toolBoxContainer.addEventListener('dblclick', this.handleResetFilter.bind(this));
        this.addCardBtn.addEventListener('click', this.handleAddBtnAction.bind(this));
        this.modalCloseBtn.addEventListener('click', this.toggleModal.bind(this));
        this.deleteBtn.addEventListener('click', this.handleDeleteStatus.bind(this));
        this.textArea.addEventListener('keydown', this.handleTextareaKeyDown.bind(this));
        this.resetFilterBtn.addEventListener('click', this.handleResetFilter.bind(this));

        this.todoContainer.addEventListener('dragstart', this.handleDragStart.bind(this));
        this.todoContainer.addEventListener('dragend', this.handleDragEnd.bind(this));
        
        this.mainContainer.addEventListener('dragover', this.handleDragOver.bind(this));
        this.mainContainer.addEventListener('drop', this.handleDrop.bind(this));

        for(const colorElm of this.priorityColorElms){
            colorElm.addEventListener('click', this.handleColorSelection.bind(this, colorElm));
        }

        for (const elm of this.tooltipContainers) {
            // console.log('elm', elm);
            this.buildToolTip(elm);
        }
    }

    buildToolTip(elm){
        elm.classList.add('tooltip');
        const data = elm.dataset.tooltip;
        const position = elm.dataset.tooltipPosition;
        const tooltipContainer = document.createElement('div');
        tooltipContainer.className = 'tooltipText';
        tooltipContainer.classList.add(position);
        tooltipContainer.innerHTML = `
            ${data}
        `;
        // console.log('elm', elm, 'tooltipContainer', tooltipContainer, 'position', position);
        
        elm.appendChild(tooltipContainer);
    }

    handleTextareaKeyDown(e){
        if(e.key === 'Enter'){
            const task = this.textArea.value;
            this.createTask(task);
        }
        // if(e.key === 'Shift'){
        //     console.log('shift is clicked');
        // }
    }

    handleToolBox(e){
        const targetClasses = e.target.classList;
        if(targetClasses.contains('fa-plus')){
            this.toggleModal();
        } else if(targetClasses.contains('color')){
            this.handleFilterTaskView(targetClasses[1]);
        }
    }

    handleFilterTaskView(selectedColor){
        const allTasks = document.querySelectorAll('.taskColor');
        allTasks.forEach((task) => {
            const currentColor = task.classList[1];
            const display = currentColor === selectedColor ? 'block' : 'none';
            task.parentElement.style.display = display;
        });
    }

    handleResetFilter(e){
        if(e.target.classList.contains('color') || e.target.classList.contains('resetFilter')){
            const allTasks = document.querySelectorAll('.taskColor');
            allTasks.forEach(task => {
                task.parentElement.style.display = 'block';
            });
        }
    }

    handleDeleteStatus(){
        // e.target.classList.toggle('activate');
        this.deleteStatus = !this.deleteStatus;
        this.deleteBtn.style.color = this.deleteStatus ? 'red' : 'inherit';
    }

    handleDeleteTask(id, taskElm){
        taskElm.addEventListener('click', () => {
            if(this.deleteStatus){
                const idx = this.tasksArr.findIndex((obj) => obj.id === id);
                this.tasksArr.splice(idx, 1);
                taskElm.remove();
                this.updateLocalStorage();
            }
        });
    }

    toggleModal(){
        this.modalContainer.style.display = this.modalStatus ? 'flex' : 'none';
        if(this.modalStatus) this.textArea.focus();
        this.modalStatus = !this.modalStatus;
    }

    modalClose(){
        this.toggleModal();
    }

    deactivateSelectedColor(){
        for(const elm of this.priorityColorElms){
            elm.classList.remove('active');
        }
    }

    activateSelectedColor(elm){
        elm.classList.add('active');
        this.priorityColor = elm.classList[1];
    }

    handleColorSelection(selectedColorElm){
        this.deactivateSelectedColor();
        this.activateSelectedColor(selectedColorElm);
    }

    handleAddBtnAction(e){
        const text = this.textArea.value.trim();
        if(text.length){
            this.createTask(text);
        }
    }

    createTask(content){
        if(content.trim().length <= 0) return;
        const id = new ShortUniqueId().randomUUID();
        const taskElm = this.createTaskElm(id, content, this.priorityColor, this.status);
        // this.mainContainer.appendChild(taskElm);
        this.todoContainer.appendChild(taskElm);
        this.tasksArr.push({
            id,
            task: content,
            color: this.priorityColor,
            status: this.status
        });
        this.clearModal();
        this.updateLocalStorage();
        this.handleTaskEdit(id, taskElm);
        this.handleDeleteTask(id, taskElm);
        this.handleTaskColorEdit(id, taskElm);

        // Drag and Drop event
        taskElm.addEventListener('dragstart', this.handleDragStart);
        taskElm.addEventListener('dragend', this.handleDragEnd);
    }

    handleDragStart(e){
        e.dataTransfer.setData('taskId', e.target.id);
        e.target.classList.add('dragging');
    }

    handleDragEnd(e){
        e.target.classList.remove('dragging');
    }

    handleDragOver(e){
        e.preventDefault();
    }

    handleDrop(e){
        e.preventDefault();
        const taskId = e.dataTransfer.getData('taskId');
        const droppedTask = document.getElementById(taskId);
        if(droppedTask){
            const targetContainer = e.target.closest('.task-container');
            if(targetContainer){
                const newStatus = targetContainer.id;
                const sourceContainer = droppedTask.closest('.task-container');

                sourceContainer.removeChild(droppedTask);
                targetContainer.appendChild(droppedTask);

                const idx = this.tasksArr.findIndex((obj) => obj.id === taskId);
                if(idx !== -1){
                    this.tasksArr[idx].status = newStatus;
                    this.updateLocalStorage();
                }
            }
        }
    }

    clearModal(){
        this.textArea.value = '';
        this.toggleModal();
    }

    createTaskElm(id, content, color){
        const taskContainer = document.createElement('div');
        taskContainer.className = 'taskContainer';
        taskContainer.draggable = true;
        taskContainer.id = id;
        taskContainer.innerHTML = `
            <div class="taskColor ${color}"></div>
            <div class="taskId">${id}</div>
            <div class="taskArea">${content}</div>
            <div class="lock-btn">
                <i class="fa-solid fa-lock"></i>
            </div>
        `;

        // attach drag and drop events
        taskContainer.addEventListener('dragstart', this.handleDragStart.bind(this));
        taskContainer.addEventListener('dragend', this.handleDragEnd.bind(this));
        return taskContainer;
    }

    handleTaskEdit(id, taskElm){
        const editBtn = taskElm.querySelector('.lock-btn i');
        const taskArea = taskElm.querySelector('.taskArea');
        
        editBtn.addEventListener('click', () => {
            editBtn.classList.toggle('fa-lock');
            editBtn.classList.toggle('fa-lock-open');

            const contentEditable = editBtn.classList.contains('fa-lock-open');
            taskArea.contentEditable = contentEditable;
            if(contentEditable){
                taskArea.focus();   
            }

            const idx = this.tasksArr.findIndex((obj) => obj.id === id);
            this.tasksArr[idx].task = taskArea.innerText;

            this.updateLocalStorage();
        });

    }

    handleTaskColorEdit(id, taskElm){
        const colorElm = taskElm.querySelector('.taskColor');

        colorElm.addEventListener('click', () => {
            let currentColor = colorElm.classList[1];
            let colorIdx = this.colors.findIndex((color) => color === currentColor);
            let nextColorIdx = (colorIdx + 1) % this.colors.length;
            
            colorElm.classList.remove(currentColor);
            const nextColor = this.colors[nextColorIdx];
            colorElm.classList.add(nextColor);

            const idx = this.tasksArr.findIndex((obj) => obj.id === id);
            this.tasksArr[idx].color = nextColor;
            this.updateLocalStorage();
        });
    }

    updateLocalStorage(){
        localStorage.setItem('tasks', JSON.stringify(this.tasksArr));
        localStorage.setItem('taskBoardColors', JSON.stringify(this.colors));
    }

    renderTasksFromLocalStorage(){
        const storedTasks = JSON.parse(localStorage.getItem('tasks'));
        if(storedTasks){
            this.tasksArr = storedTasks;
            this.renderTasksOnLoad();
        }
    }

    renderTasksOnLoad(){
        for(const task of this.tasksArr){
            this.appendTask(task.id, task.task, task.color, task.status);
        }
    }

    appendTask(id, content, color, status){
        const taskElm = this.createTaskElm(id, content, color);
        taskElm.id = id;

        this.appendTaskElms(taskElm, status);

        this.handleTaskEdit(id, taskElm);
        this.handleDeleteTask(id, taskElm);
        this.handleTaskColorEdit(id, taskElm);
    }

    appendTaskElms(taskElm, status){
        if(status === 'todo'){
            this.todoContainer.appendChild(taskElm);
        } else if(status === 'inProgress'){
            this.progressContainer.appendChild(taskElm);
        } else if(status === 'completed'){
            this.completedContainer.appendChild(taskElm);
        }
    }
}

new kanBanBoard();