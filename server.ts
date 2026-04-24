import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, 'data.json');
const JWT_SECRET = 'adustech_secret_key_2024';

// Simple "Database" Layer
const db = {
  read() {
    try {
      const data = fs.readFileSync(DB_PATH, 'utf8');
      return JSON.parse(data);
    } catch (e) {
      return { users: [], courses: [] };
    }
  },
  write(data: any) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
  }
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- MVC Controllers (implemented as directly defined routes for simplicity) ---

  // Auth: Register
  app.post('/api/register', async (req, res) => {
    try {
      const { fullName, ugNumber, password } = req.body;
      const data = db.read();
      
      const normalizedUG = ugNumber.toUpperCase().trim();

      if (data.users.find((u: any) => u.ugNumber === normalizedUG)) {
        return res.status(400).json({ error: 'User already exists with this UG number' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = {
        id: Date.now().toString(),
        fullName,
        ugNumber: normalizedUG,
        password: hashedPassword
      };

      data.users.push(newUser);
      db.write(data);

      res.status(201).json({ message: 'Registration successful' });
    } catch (error) {
      res.status(500).json({ error: 'Registration failed' });
    }
  });

  // Auth: Login
  app.post('/api/login', async (req, res) => {
    try {
      const { ugNumber, password } = req.body;
      const data = db.read();
      const normalizedUG = ugNumber.toUpperCase().trim();

      const user = data.users.find((u: any) => u.ugNumber === normalizedUG);
      if (!user) {
        return res.status(401).json({ error: 'Invalid UG number or password' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid UG number or password' });
      }

      const token = jwt.sign({ id: user.id, ugNumber: user.ugNumber, fullName: user.fullName }, JWT_SECRET, { expiresIn: '7d' });
      res.json({ token, user: { id: user.id, ugNumber: user.ugNumber, fullName: user.fullName } });
    } catch (error) {
      res.status(500).json({ error: 'Login failed' });
    }
  });

  // Course Management
  app.get('/api/courses/:userId', (req, res) => {
    const { userId } = req.params;
    const data = db.read();
    const userCourses = data.courses.filter((c: any) => c.userId === userId);
    res.json(userCourses);
  });

  app.post('/api/courses', (req, res) => {
    const course = req.body;
    const data = db.read();
    
    const clashingCourse = data.courses
      .filter((c: any) => c.userId === course.userId && c.day === course.day)
      .find((existing: any) => course.startTime < existing.endTime && course.endTime > existing.startTime);

    if (clashingCourse) {
      return res.status(409).json({ error: `Time clash with "${clashingCourse.name}" (${clashingCourse.startTime} - ${clashingCourse.endTime})` });
    }

    const newCourse = { ...course, id: Date.now().toString() };
    data.courses.push(newCourse);
    db.write(data);
    res.status(201).json(newCourse);
  });

  app.put('/api/courses/:id', (req, res) => {
    const { id } = req.params;
    const updatedData = req.body;
    const data = db.read();
    
    const index = data.courses.findIndex((c: any) => c.id === id);
    if (index !== -1) {
      const clashingCourse = data.courses
        .filter((c: any) => c.userId === updatedData.userId && c.day === updatedData.day && c.id !== id)
        .find((existing: any) => updatedData.startTime < existing.endTime && updatedData.endTime > existing.startTime);

      if (clashingCourse) {
        return res.status(409).json({ error: `Time clash with "${clashingCourse.name}" (${clashingCourse.startTime} - ${clashingCourse.endTime})` });
      }

      data.courses[index] = { ...data.courses[index], ...updatedData };
      db.write(data);
      res.json(data.courses[index]);
    } else {
      res.status(404).json({ error: 'Course not found' });
    }
  });

  app.delete('/api/courses/:id', (req, res) => {
    const { id } = req.params;
    const data = db.read();
    data.courses = data.courses.filter((c: any) => c.id !== id);
    db.write(data);
    res.status(204).send();
  });

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'TIMETABLE PLANNER API (Local MVC) is running' });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
