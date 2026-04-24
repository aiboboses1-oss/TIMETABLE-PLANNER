export interface Course {
  id?: string;
  name: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  userId: string;
}

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const courseApi = {
  async getAllCourses(userId: string): Promise<Course[]> {
    const response = await fetch(`/api/courses/${userId}`, {
      headers: getHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch courses');
    return response.json();
  },

  async addCourse(course: Course): Promise<Course> {
    const response = await fetch('/api/courses', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(course),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to add course');
    }

    return response.json();
  },

  async updateCourse(id: string, course: Course): Promise<Course> {
    const response = await fetch(`/api/courses/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(course),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to update course');
    }

    return response.json();
  },

  async deleteCourse(id: string): Promise<void> {
    const response = await fetch(`/api/courses/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to delete course');
    }
  }
};

export const authApi = {
  async register(fullName: string, ugNumber: string, password: string) {
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName: fullName.trim(), ugNumber: ugNumber.trim(), password })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Registration failed');
    return data;
  },

  async login(ugNumber: string, password: string) {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ugNumber: ugNumber.trim(), password })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Login failed');
    return data;
  }
};
