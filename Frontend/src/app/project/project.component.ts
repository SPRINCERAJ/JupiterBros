import { Component, OnInit } from '@angular/core';
import { UserService } from '../user.service';

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.css']
})
export class ProjectComponent implements OnInit {
  project = {
    projectName: '',
    clientName: '',
    address: '',
    department: '',
    businessUnit: '',
    projectType: '',
  };
  editproject_flag:boolean=false;
  adduser_flag:boolean=false;
  addtask_flag:boolean=false;
  showtask_flag:boolean=false;
  tasks: any[] = []; // Tasks of the selected project
  currentProjectName: string = ''; // Name of the project for the modal
  isTaskOpen: boolean = false;
  newTask: string = ''; // Hold new task name
  plannedHours: number = 0; // Hold planned hours
  searchTerm: string = '';
  selectedDepartment: string = '';
  selectedBusinessUnit: string = '';
  projects: any[] = []; // Array to hold the list of projects
  originalProjects: any[] = []; // Array to hold the original list of projects
  users: any[] = []; // Array to hold the list of users
  selectedProjectId: string = ''; // To hold the selected project ID
  selectedUserId: string = '';

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.loadProjects(); // Load projects on initialization
    this.loadUsers(); // Load users on initialization
  }

  loadProjects(): void {
    this.userService.getProjects().subscribe(data => {
      this.projects = data; // Populate the projects array
      this.originalProjects = [...this.projects]; // Store a copy of the original projects
    });
  }
  loadUsers(): void {
    this.userService.getUsers().subscribe(data => {
      this.users = data; // Populate the users array
    });
  }

  add_Project() {
    this.userService.addProject(this.project).subscribe(
      (response: any) => {
        alert("Project added successfully");
        this.loadProjects(); // Reload the projects after adding a new one
        this.resetForm(); // Reset the form
      },
      (error: any) => {
        alert("Project Not Added");
        console.error('Error adding project', error);
      }
    );
  }

  addtask() {
    this.isTaskOpen = !this.isTaskOpen;
    this.showtask_flag=false;
    this.adduser_flag=false;
    this.addtask_flag=true;
    this.editproject_flag=false;
  }
  showtask() {
    this.isTaskOpen = !this.isTaskOpen;
    this.showtask_flag=true;
    this.adduser_flag=false;
    this.addtask_flag=false;
    this.editproject_flag=false;
    this.fetchTasks(this.selectedProjectId); 
  }
  addusertask(){
    this.isTaskOpen = !this.isTaskOpen;
    this.showtask_flag=false;
    this.adduser_flag=true;
    this.addtask_flag=false;
    this.editproject_flag=false;
    this.addUserToProject(); 
  }
  edit_Project():void{
    this.isTaskOpen = !this.isTaskOpen;
    this.showtask_flag = false;
    this.adduser_flag = false;
    this.addtask_flag = false;
    this.editproject_flag = true;
  
    // Find the selected project by ID and populate the project object
    const selectedProject = this.projects.find(proj => proj._id === this.selectedProjectId);
    if (selectedProject) {
      this.project = { ...selectedProject }; // Spread operator to create a copy of the selected project
    }
  }
  editProject():void{
    this.userService.updateProject(this.selectedProjectId, this.project).subscribe(
      (response: any) => {
        alert("Project updated successfully");
        setTimeout(() => {
          this.loadProjects(); // Reload the projects list after editing
          this.editproject_flag = false; // Close the edit modal
          this.resetForm(); // Reset the form
        }, 100); // Delay in milliseconds (100ms in this case)
      },
      (error: any) => {
        alert("Error updating project");
        console.error('Error updating project', error);
      }
    );
    location.reload();
  }
  addUserToProject(): void {
    if (!this.selectedProjectId || !this.selectedUserId) {
        return;
    }

    this.userService.addUserToProject(this.selectedProjectId, this.selectedUserId).subscribe(
        (response: any) => {
            alert("User added to project successfully");
            this.loadProjects(); // Reload the project list after adding the user
        },
        (error: any) => {
            alert("Error adding user to project");
            console.error('Error adding user to project', error);
        }
    );
    this.selectedProjectId=''
    this.selectedUserId=''
}

  fetchTasks(projectId: string) {
    this.userService.getProjectTasks(projectId).subscribe((response) => {
      this.tasks = response.tasks;
      this.currentProjectName = response.projectName;
    });
  }


  addTask(projectId: string): void {
    if (!projectId) {
        alert("No project selected.");
        return;
    }

    const taskData = { taskName: this.newTask, plannedHours: this.plannedHours };

    if (!taskData.taskName || taskData.plannedHours <= 0) {
        alert(taskData.taskName + " " + taskData.plannedHours);
        alert("Please enter both task name and planned hours.");
        return;
    }

    // Use JSON.stringify to display the taskData object properly

    this.userService.addTaskToProject(projectId, taskData).subscribe(
        (response: any) => {
            alert("Task added successfully");
            this.loadProjects(); // Reload the projects to reflect the new task
            this.newTask = ''; // Reset the task input
            this.plannedHours = 0; // Reset the planned hours input
            this.isTaskOpen = false; // Close the modal
        },
        (error: any) => {
            alert("Task Not Added");
            console.error('Error adding task', error);
        }
    );
}


  resetForm() {
    this.project = {
      projectName: '',
      clientName: '',
      address: '',
      department: '',
      businessUnit: '',
      projectType: '',
    };
  }

  filterProjects(): void {
    this.projects = this.originalProjects.filter(proj => {
      const matchesSearchTerm = proj.projectName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                                proj.clientName.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesDepartment = this.selectedDepartment ? proj.department === this.selectedDepartment : true;
      const matchesBusinessUnit = this.selectedBusinessUnit ? proj.businessUnit === this.selectedBusinessUnit : true;
  
      return matchesSearchTerm && matchesDepartment && matchesBusinessUnit;
    });
  }
}
