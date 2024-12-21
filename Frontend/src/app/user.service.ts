// Angular Frontend (user.service.ts)
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/login`, { username, password });
  }
  
  getUsers(): Observable<any> {
    return this.http.get(`${this.baseUrl}/users`);
  }

  getUserById(userId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/users/${userId}`);
  }
  
  addUser(user: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/users`, user);
  }

  updateUser(id: string, user: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/users/${id}`, user);
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/users/${id}`);
  }

  searchUsers(query: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/users/search`, { params: { query } });
  }

  filterUsers(filters: any): Observable<any> {
    return this.http.get(`${this.baseUrl}/users/filter`, { params: filters });
  }

// Project-related methods
addProject(project: any): Observable<any> {
  return this.http.post(`${this.baseUrl}/projects`, project);
}

getProjects(): Observable<any> {
  return this.http.get(`${this.baseUrl}/projects`);
}

getProjectById(projectId: string): Observable<any> {
  return this.http.get(`${this.baseUrl}/projects/${projectId}`);
}
getProjectByUserId(userId: string): Observable<any> {
  return this.http.get(`${this.baseUrl}/projects/user/${userId}/`);
}

  // Edit an existing project
  updateProject(projectId: string, project: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/projects/${projectId}`, project);
  }

deleteProject(id: string): Observable<any> {
  return this.http.delete(`${this.baseUrl}/projects/${id}`);
}

/*assignUser ToProject(projectId: string, userId: string): Observable<any> {
  return this.http.put(`${this.baseUrl}/${projectId}/users`, { userId });
}*/
  // Edit an existing project
  addTaskToProject(projectId: string, taskData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/projects/${projectId}/tasks`, taskData);
}
getProjectTasks(projectId: string): Observable<any> {
  return this.http.get<any[]>(`${this.baseUrl}/projects/${projectId}/tasks`);
}
addUserToProject(projectId: string, userId: string): Observable<any> {
  return this.http.put(`${this.baseUrl}/projects/${projectId}/users/${userId}`, {});
}
addTimeLog(userId: string, timeLog: any): Observable<any> {
  return this.http.post(`${this.baseUrl}/timelogs`, {
      userId: userId,
      projectName: timeLog.projectName,
      task: timeLog.task,
      hoursSpent: timeLog.hoursToSpend,
      taskStatus: timeLog.taskStatus,
      date: timeLog.date // Include the date if needed
  });
}
getTimeLogsByUserId(userId: string): Observable<any> {
  return this.http.get(`${this.baseUrl}/timelogs/user/${userId}`);
}
getTimeLogs():Observable<any>{
  return this.http.get(`${this.baseUrl}/timelogs/`);
}

getGraphData(timeframe: string): Observable<any[]> {
  return this.http.get<any[]>(`${this.baseUrl}/graph-data/${timeframe}`);
}
}