const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// MongoDB Connection   sudo mongod --dbpath=/Users/prince/data/db 
mongoose.connect('mongodb://localhost:27017/userManagement', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Create a transporter
const transporter = nodemailer.createTransport({
    service: 'gmail', // Use your email service
    auth: {
        user: 'princerajs007@gmail.com', // Your email address
        pass: 'CXT5kF' // Your email password or app password
    }
});
const sendWelcomeEmail = (email, username) => {
    const mailOptions = {
        from: 'princerajs007@gmail.com',
        to: email,
        subject: 'Welcome to Our Service',
        text: `Hello ${username},\n\nWelcome to our service! We are glad to have you on board.\n\nBest regards,\nYour Company`
    };

    return transporter.sendMail(mailOptions);
};
// Time Log Schema
const TimeLogSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User ', required: true },
    projectName: { type: String, required: true },
    task: { type: String, required: true },
    hoursSpent: { type: Number, required: true },
    taskStatus: { type: String, required: true }, // e.g., "Completed", "In Progress", etc.
    date: { type: Date, default: Date.now } // Automatically set to the current date
}, { timestamps: true });

const TimeLog = mongoose.model('TimeLog', TimeLogSchema);
// User Schema
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    department: { type: String, required: true },
    businessUnit: { type: String, required: true },
    role: { type: String, required: true },
    password: { type: String, required: true }
}, { collection: 'users' }); 

const User = mongoose.model('User ', UserSchema);

// Project Schema
const projectSchema = new mongoose.Schema({
    projectName: { type: String, required: true },
    clientName: { type: String, required: true },
    address: { type: String, required: true },
    department: { type: String, required: true },
    businessUnit: { type: String, required: true },
    projectType: { type: String, required: true },
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User ' }],
    tasks: [{ taskName: String, plannedHours: Number }],
}, { timestamps: true });

const Project = mongoose.model('Project', projectSchema);



app.get('/graph-data/:timeframe', async (req, res) => {
    const { timeframe } = req.params; // daily, weekly, monthly, yearly

    try {
        const groupBy = {};

        // Define the group-by keys for aggregation based on the timeframe
        switch (timeframe) {
            case 'daily':
                groupBy.date = { $dateToString: { format: '%Y-%m-%d', date: '$date' } };
                break;
            case 'weekly':
                groupBy.date = { $isoWeek: '$date' };
                break;
            case 'monthly':
                groupBy.date = { $dateToString: { format: '%Y-%m', date: '$date' } };
                break;
            case 'yearly':
                groupBy.date = { $year: '$date' };
                break;
            default:
                return res.status(400).json({ message: 'Invalid timeframe specified' });
        }

        // Aggregation pipeline
        const projects = await Project.aggregate([
            {
                $unwind: '$tasks', // Flatten the tasks array for individual tasks
            },
            {
                $lookup: {
                    from: 'timelogs',
                    localField: 'tasks.taskName',
                    foreignField: 'task',
                    as: 'taskLogs',
                },
            },
            {
                $unwind: '$taskLogs', // Flatten the task logs array
            },
            {
                $group: {
                    _id: groupBy,
                    plannedHours: { $sum: '$tasks.plannedHours' },
                    actualHours: { $sum: '$taskLogs.hoursSpent' },
                },
            },
            {
                $project: {
                    _id: 0,
                    date: '$_id.date',
                    plannedHours: 1,
                    actualHours: 1,
                },
            },
            {
                $sort: { date: 1 }, // Sort by date
            },
        ]);

        res.status(200).json(projects);
    } catch (error) {
        console.error('Error fetching graph data:', error);
        res.status(500).json({ message: 'Internal server error', error });
    }
});
// Login User
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (user) {
        res.status(200).send({ message: 'Login successful', user });
    } else {
        res.status(401).send({ message: 'Invalid credentials' });
    }
});

// List All Users
app.get('/users', async (req, res) => {
    const users = await User.find();
    res.status(200).json(users);
});

// Get User by ID
app.get('/users/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User  not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Add New User
// Add New User
app.post('/users', async (req, res) => {
    const { username, email, phone, department, businessUnit, role, password } = req.body;
    const newUser  = new User({ username, email, phone, department, businessUnit, role, password });

    try {
        await newUser .save();
        
        // Send welcome email
        await sendWelcomeEmail(email, username);

        res.status(201).send({ message: 'User  added successfully', newUser  });
    } catch (error) {
        console.error('Error adding user:', error);
        res.status(500).send({ message: 'Internal server error', error });
    }
});

// Modify/Remove User Details
app.put('/users/:id', async (req, res) => {
    const { id } = req.params;
    const updatedData = req.body;
    const user = await User.findByIdAndUpdate(id, updatedData, { new: true });
    res.status(200).send({ message: 'User  updated successfully', user });
});

// Delete User
app.delete('/users/:id', async (req, res) => {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    res.status(200).send({ message: 'User  deleted successfully' });
});

// Search User Details
app.get('/users/search', async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) {
            return res.status(400).json({ message: 'Query parameter is required' });
        }

        const users = await User.find({
            $or: [
                { username: { $regex: query, $options: 'i' } },
                { email: { $regex: query, $options: 'i' } },
                { department: { $regex: query, $options: 'i' } },
            ],
        });

        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users:', error); // Log the error for debugging
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

// Filter User Details
app.get('/users/filter', async (req, res) => {
    const { department, businessUnit } = req.query;
    const filter = {};
    if (department) filter.department = department;
    if (businessUnit) filter.businessUnit = businessUnit;
    const users = await User.find(filter);
    res.status(200).json(users);
});

// Add New Project
app.post('/projects', async (req, res) => {
    const { projectName, clientName, address, department, businessUnit, projectType, users, tasks } = req.body;
    const newProject = new Project({ projectName, clientName, address, department, businessUnit, projectType, users, tasks });
    await newProject.save();
    res.status(201).send({ message: 'Project added successfully', newProject });
});

// Get All Projects
app.get('/projects', async (req, res) => {
    const projects = await Project.find().populate('users');
    res.status(200).json(projects);
});

// Assign Users to Project
app.put('/projects/:id/users', async (req, res) => {
    const { id } = req.params;
    const { userIds } = req.body; // Expecting an array of user IDs
    const project = await Project.findByIdAndUpdate(id, { $addToSet: { users: { $each: userIds } } }, { new: true });
    res.status(200).send({ message: 'Users assigned to project successfully', project });
});

// Assign Task to Project
app.put('/projects/:id/tasks', async (req, res) => {
    const { id } = req.params;
    const { taskName, plannedHours } = req.body;
    const project = await Project.findByIdAndUpdate(id, { $push: { tasks: { taskName, plannedHours } } }, { new: true });
    res.status(200).send({ message: 'Task assigned to project successfully', project });
});

// Edit Project Details
app.put('/projects/:id', async (req, res) => {
    const { id } = req.params;
    const updatedData = req.body;
    const project = await Project.findByIdAndUpdate(id, updatedData, { new: true });
    res.status(200).send({ message: 'Project updated successfully', project });
});

app.post('/projects/:id/tasks', async (req, res) => {
    const { id } = req.params; // Get project ID from the URL
    const { taskName, plannedHours } = req.body; // Get task data from the request body

    try {
        // Find the project by ID and add the new task to the tasks array
        const project = await Project.findByIdAndUpdate(
            id,
            { $push: { tasks: { taskName, plannedHours } } },
            { new: true } // Return the updated project
        );

        if (!project) {
            return res.status(404).send({ message: 'Project not found' });
        }

        res.status(200).send({ message: 'Task added to project successfully', project });
    } catch (error) {
        console.error('Error adding task to project:', error);
        res.status(500).send({ message: 'Internal server error', error });
    }
});
app.get('/projects/:id/tasks', async (req, res) => {
    const { id } = req.params; // Project ID from the URL

    try {
        // Find the project by ID
        const project = await Project.findById(id);

        if (!project) {
            return res.status(404).send({ message: 'Project not found' });
        }

        // Respond with the project name and tasks
        res.status(200).json({
            projectName: project.projectName,
            tasks: project.tasks,
        });
    } catch (error) {
        console.error('Error fetching tasks for project:', error);
        res.status(500).send({ message: 'Internal server error', error });
    }
});
app.put('/projects/:projectId/users/:userId', async (req, res) => {
    const { projectId, userId } = req.params;
    try {
        // Validate userId before proceeding
        if (!userId || userId === 'null') {
            return res.status(400).json({ message: 'Invalid user ID' });
        }

        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Make sure userId is not null or invalid before adding to the project
        if (!userId) {
            return res.status(400).json({ message: 'User ID cannot be null' });
        }

        // Add user to the project's users array
        project.users.push(user._id);  // Directly push the user to the array
        await project.save();

        res.status(200).json({ message: 'User added to project successfully', project });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error', error });
    }
});
app.get('/projects/user/:userId', async (req, res) => {
    const { userId } = req.params; // Get user ID from the URL

    try {
        // Find projects where the user ID is in the users array
        const projects = await Project.find({ users: userId }).populate('users');

        if (projects.length === 0) {
            return res.status(404).json({ message: 'No projects found for this user' });
        }

        res.status(200).json(projects);
    } catch (error) {
        console.error('Error fetching projects for user:', error);
        res.status(500).send({ message: 'Internal server error', error });
    }
});
app.get('/projects', async (req, res) => {
    const projects = await Project.find();
    res.status(200).json(projects);
  });
  
  // Get all tasks (if applicable)
  app.get('/tasks', async (req, res) => {
    const tasks = await Task.find(); // Assuming you have a Task model
    res.status(200).json(tasks);
  });

  app.get('/timelogs', async (req, res) => {
    const tasks = await TimeLog.find(); // Assuming you have a Task model
    res.status(200).json(tasks);
  });
  // Add a new time log
// Add a new time log
app.post('/timelogs', async (req, res) => {
    const { userId, projectName, task, hoursSpent, taskStatus } = req.body;

    // Log the incoming request body for debugging
    console.log('Request Body:', req.body);

    try {
        // Ensure that projectName and taskStatus are provided
        if (!projectName || !taskStatus) {
            return res.status(400).send({ message: 'projectName and taskStatus are required.' });
        }

        // Create a new time log entry
        const newTimeLog = new TimeLog({
            userId,
            projectName, // Use projectName instead of projectId
            task,
            hoursSpent,
            taskStatus
        });

        // Save the new time log to the database
        await newTimeLog.save();

        // Send a success response
        res.status(201).send({ message: 'Time log added successfully', newTimeLog });
    } catch (error) {
        console.error('Error adding time log:', error);
        res.status(500).send({ message: 'Internal server error', error });
    }
});

// Get all time logs for a specific user
// Get all time logs for a specific user
app.get('/timelogs/user/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const timeLogs = await TimeLog.find({ userId }).populate('userId'); // You can also populate projectId if needed
        res.status(200).json(timeLogs);
    } catch (error) {
        console.error('Error fetching time logs:', error);
        res.status(500).send({ message: 'Internal server error', error });
    }
});

// Get all time logs for a specific project
app.get('/timelogs/project/:projectName', async (req, res) => {
    const { projectName } = req.params;

    try {
        const timeLogs = await TimeLog.find({ projectName });
        res.status(200).json(timeLogs);
    } catch (error) {
        console.error('Error fetching time logs:', error);
        res.status(500).send({ message: 'Internal server error', error });
    }
});

// Start Server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
}); 