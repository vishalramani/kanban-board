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

        this.modalStatus = true;
        this.deleteStatus = false;
        this.priorityColor = 'black';
        this.tasksArr = [];
        this.colors = ['red', 'blue', 'green', 'black'];

        this.renderTicketsFromLocalStorage();

        this.toolBoxContainer.addEventListener('click', this.handleToolBox.bind(this));
        this.toolBoxContainer.addEventListener('dblclick', this.handleResetFilter.bind(this));
        this.addCardBtn.addEventListener('click', this.handleAddBtnAction.bind(this));
        this.modalCloseBtn.addEventListener('click', this.toggleModal.bind(this));

        for(const colorElm of this.priorityColorElms){
            colorElm.addEventListener('click', this.handleColorSelection.bind(this, colorElm));
        }
    }

    handleToolBox(e){
        const targetClasses = e.target.classList;
        if(targetClasses.contains('fa-plus')){
            this.toggleModal();
        } else if(targetClasses.contains('fa-trash')){
            this.handleDeleteStatus(e);
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
        if(e.target.classList.contains('color')){
            const allTasks = document.querySelectorAll('.taskColor');
            allTasks.forEach(task => {
                task.parentElement.style.display = 'block';
            });
        }
    }

    handleDeleteStatus(e){
        e.target.classList.toggle('activate');
        this.deleteStatus = !this.deleteStatus;
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
        const taskElm = this.createTaskElm(id, content, this.priorityColor);
        this.mainContainer.appendChild(taskElm);
        this.tasksArr.push({
            id,
            task: content,
            color: this.priorityColor
        });
        this.clearModal();
        this.updateLocalStorage();
        this.handleTaskEdit(id, taskElm);
        this.handleDeleteTask(id, taskElm);
        this.handleTaskColorEdit(id, taskElm);
    }

    clearModal(){
        this.textArea.value = '';
        this.toggleModal();
    }

    createTaskElm(id, content, color){
        const taskContainer = document.createElement('div');
        taskContainer.className = 'taskContainer';
        taskContainer.innerHTML = `
            <div class="taskColor ${color}"></div>
            <div class="taskId">${id}</div>
            <div class="taskArea">${content}</div>
            <div class="lock-btn">
                <i class="fa-solid fa-lock"></i>
            </div>
        `;
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
            let colorIdx = this.colors.indexOf(currentColor);
            let nextColorIdx = colorIdx + 1;
            let len = this.colors.length;
            if(nextColorIdx === len){
                nextColorIdx = 0;
            }
            
            colorElm.classList.remove(currentColor);
            const nextColor = this.colors[nextColorIdx];
            colorElm.classList.add(nextColor);

            const idx = this.tasksArr.findIndex((obj) => obj.id === id);
            this.tasksArr[idx].color = nextColor;
            this.updateLocalStorage();
        });
    }

    updateLocalStorage(){
        const arr = JSON.stringify(this.tasksArr);
        localStorage.setItem('tasks', arr);
    }

    renderTicketsFromLocalStorage(){
        const storedTasks = JSON.parse(localStorage.getItem('tasks'));
        if(storedTasks){
            this.tasksArr = storedTasks;
            this.renderTasksOnLoad();
        }
    }

    renderTasksOnLoad(){
        for(const task of this.tasksArr){
            this.appendTask(task.id, task.task, task.color);
        }
    }

    appendTask(id, content, color){
        const taskElm = this.createTaskElm(id, content, color);
        this.handleTaskEdit(id, taskElm);
        this.handleDeleteTask(id, taskElm);
        this.handleTaskColorEdit(id, taskElm);
        this.mainContainer.appendChild(taskElm);
    }
}

new kanBanBoard();