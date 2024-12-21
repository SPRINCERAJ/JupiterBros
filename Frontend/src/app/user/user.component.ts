import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../user.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css'],
})
export class UserComponent implements OnInit {
  username: string | null = null;
  userId: string = '';
  currentDate: string;
  projects: any[] = [];
  tasks: any[] = [];
  timeLog = {
    date: '',
    projectId: '', // Ensure this is set correctly
    projectName: '', // This will be set based on the selected project
    task: '',
    hoursToSpend: 0,
    taskStatus: '' // Ensure this is set correctly
};
  timeLogs: any[] = []; 
    filter = {
    day: null,
    month: null,
    year: null
  };
  filteredTimeLogs: any[] = []; 
  constructor(private userService: UserService, private route: ActivatedRoute) {
    const today = new Date();
    this.currentDate = today.toISOString().split('T')[0]; // Format: YYYY-MM-DD
  }

  user: any = {};

  ngOnInit(): void {
    this.filteredTimeLogs = this.timeLogs;
    this.route.queryParams.subscribe((params) => {
      this.userId = params['userId']; // Retrieve the user ID
      console.log('User  ID:', this.userId);
    });
    this.userService.getUserById(this.userId).subscribe(
      (response) => {
        this.user = response; // Assign the fetched user data
        this.username = this.user.username;
      },
      (error) => {
        console.error('Error fetching user:', error);
      }
    );
    this.loadProjects();
    this.loadTimeLogs();
  }

  loadProjects(): void {
    this.userService.getProjectByUserId(this.userId).subscribe(
      (projects) => {
        this.projects = projects;
      },
      (error) => {
        console.error('Error fetching projects', error);
      }
    );
  }
  loadTimeLogs(): void {
    this.userService.getUserById(this.userId).subscribe(
        (response) => {
            console.log('Fetched User Response:', response); // Log the entire response

            // Access the user object directly from the response
            const user = response; // No need for response.user
            console.log('Fetched User:', user); // Log the fetched user

            if (user.role === "ADMIN") {
                this.userService.getTimeLogs().subscribe(
                    (timeLogs) => {
                        console.log('Fetched Time Logs for ADMIN:', timeLogs); // Log fetched time logs
                        this.timeLogs = timeLogs; // Store the fetched time logs
                        this.filteredTimeLogs = this.timeLogs; // Initialize filtered logs
                    },
                    (error) => {
                        console.error('Error fetching time logs for ADMIN:', error);
                    }
                ); 
            } else {
                this.userService.getTimeLogsByUserId(this.userId).subscribe(
                    (timeLogs) => {
                        console.log('Fetched Time Logs for User:', timeLogs); // Log fetched time logs
                        this.timeLogs = timeLogs; // Store the fetched time logs
                        this.filteredTimeLogs = this.timeLogs; // Initialize filtered logs
                    },
                    (error) => {
                        console.error('Error fetching time logs for User:', error);
                    }
                );
            }
        },
        (error) => {
            console.error('Error fetching user:', error);
        }
    );
}
  filterTimeLogs(): void {
    this.filteredTimeLogs = this.timeLogs.filter(log => {
      const logDate = new Date(log.date);
      const dayMatch = this.filter.day ? logDate.getDate() === this.filter.day : true;
      const monthMatch = this.filter.month ? logDate.getMonth() + 1 === this.filter.month : true; // Months are 0-indexed
      const yearMatch = this.filter.year ? logDate.getFullYear() === this.filter.year : true;

      return dayMatch && monthMatch && yearMatch;
    });
  }

  onProjectChange(selectedProjectId: string): void {
    // Clear the tasks when the project changes
    this.tasks = [];
    
    // Find the selected project from the projects array
    const selectedProject = this.projects.find(project => project._id === selectedProjectId);
    
    // If the project is found, set the tasks
    if (selectedProject) {
        this.tasks = selectedProject.tasks; // Assign tasks from the selected project
    }
}

isSubmitting: boolean = false; // Add a flag to track submission state

addTimeLog(): void {
    if (this.isSubmitting) return; // Prevent further submissions if already submitting
    this.isSubmitting = true; // Set the flag to true

    // Set the date to the current date if not already set
    if (!this.timeLog.date) {
        this.timeLog.date = this.currentDate; // Use the current date if not provided
    }

    // Ensure projectId and taskStatus are set
    if (!this.timeLog.projectId || !this.timeLog.taskStatus) {
        alert("Please select a project and set the task status.");
        this.isSubmitting = false; // Reset the flag
        return;
    }

    // Find the selected project to get the project name
    const selectedProject = this.projects.find(project => project._id === this.timeLog.projectId);
    if (selectedProject) {
        this.timeLog.projectName = selectedProject.projectName; // Set the project name
    }

    console.log('Time Log Entry:', this.timeLog); // Log the time log entry

    this.userService.addTimeLog(this.userId, this.timeLog).subscribe(
        (response) => {
            alert('Successfully Added!');
            console.log('Time log added successfully:', response);
            this.resetTimeLog();
            this.loadTimeLogs(); // Reload time logs after adding a new one
        },
        (error) => {
            alert('Unable to add the Timelog');
            console.error('Error adding time log:', error);
        },
        () => {
            this.isSubmitting = false; // Reset the flag after the request completes
        }
    );
}

// Reset the time log form
resetTimeLog(): void {
  this.timeLog = {
      date: '',
      projectId:'',
      projectName: '',
      task: '',
      hoursToSpend: 0,
      taskStatus: ''
  };
}
}