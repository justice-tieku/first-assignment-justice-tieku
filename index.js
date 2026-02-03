import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// Load data
const filepath = path.join(__dirname, "data.json");
let data = JSON.parse(fs.readFileSync(filepath, "utf-8"));

// Helper functions
const getById = (arr, id) => arr.find(item => item.id === parseInt(id) || item.id === id);

// Grade point calculation
const gradePoints = {
  "A": 4.0, "A-": 3.7,
  "B+": 3.3, "B": 3.0, "B-": 2.7,
  "C+": 2.3, "C": 2.0, "C-": 1.7,
  "D+": 1.3, "D": 1.0, "F": 0.0
};

// ============= LEVEL 1: BASIC CRUD =============

// STUDENTS
app.get("/api/students", (req, res) => {
  res.json(data.students);
});

app.get("/api/students/:id", (req, res) => {
  const student = getById(data.students, req.params.id);
  if (!student) {
    return res.status(404).json({ error: "Student not found" });
  }
  res.json(student);
});

// INSTRUCTORS
app.get("/api/instructors", (req, res) => {
  res.json(data.instructors);
});

app.get("/api/instructors/:id", (req, res) => {
  const instructor = getById(data.instructors, req.params.id);
  if (!instructor) {
    return res.status(404).json({ error: "Instructor not found" });
  }
  res.json(instructor);
});

// COURSES
app.get("/api/courses", (req, res) => {
  res.json(data.courses);
});

app.get("/api/courses/:id", (req, res) => {
  const course = getById(data.courses, req.params.id);
  if (!course) {
    return res.status(404).json({ error: "Course not found" });
  }
  res.json(course);
});

// ENROLLMENTS
app.get("/api/enrollments", (req, res) => {
  res.json(data.enrollments);
});

app.get("/api/enrollments/:id", (req, res) => {
  const enrollment = getById(data.enrollments, req.params.id);
  if (!enrollment) {
    return res.status(404).json({ error: "Enrollment not found" });
  }
  res.json(enrollment);
});

// ASSIGNMENTS
app.get("/api/assignments", (req, res) => {
  res.json(data.assignments);
});

app.get("/api/assignments/:id", (req, res) => {
  const assignment = getById(data.assignments, req.params.id);
  if (!assignment) {
    return res.status(404).json({ error: "Assignment not found" });
  }
  res.json(assignment);
});

// GRADES
app.get("/api/grades", (req, res) => {
  res.json(data.grades);
});

app.get("/api/grades/:id", (req, res) => {
  const grade = getById(data.grades, req.params.id);
  if (!grade) {
    return res.status(404).json({ error: "Grade not found" });
  }
  res.json(grade);
});

// ============= LEVEL 2: NESTED RESOURCES =============

// Student -> Enrollments
app.get("/api/students/:id/enrollments", (req, res) => {
  const student = getById(data.students, req.params.id);
  if (!student) {
    return res.status(404).json({ error: "Student not found" });
  }
  const enrollments = data.enrollments.filter(e => e.studentId === student.id);
  res.json(enrollments);
});

// Student -> Courses (via enrollments)
app.get("/api/students/:id/courses", (req, res) => {
  const student = getById(data.students, req.params.id);
  if (!student) {
    return res.status(404).json({ error: "Student not found" });
  }
  const enrollments = data.enrollments.filter(e => e.studentId === student.id);
  const courses = enrollments.map(e => {
    const course = getById(data.courses, e.courseId);
    return course ? { ...course, enrollmentStatus: e.status, grade: e.grade } : null;
  }).filter(c => c !== null);
  res.json(courses);
});

// Course -> Students (via enrollments)
app.get("/api/courses/:id/students", (req, res) => {
  const course = getById(data.courses, req.params.id);
  if (!course) {
    return res.status(404).json({ error: "Course not found" });
  }
  const enrollments = data.enrollments.filter(e => e.courseId === course.id);
  const students = enrollments.map(e => {
    const student = getById(data.students, e.studentId);
    return student ? { ...student, enrollmentStatus: e.status, grade: e.grade } : null;
  }).filter(s => s !== null);
  res.json(students);
});

// Instructor -> Courses
app.get("/api/instructors/:id/courses", (req, res) => {
  const instructor = getById(data.instructors, req.params.id);
  if (!instructor) {
    return res.status(404).json({ error: "Instructor not found" });
  }
  const courses = data.courses.filter(c => c.instructorId === instructor.id);
  res.json(courses);
});

// Course -> Assignments
app.get("/api/courses/:id/assignments", (req, res) => {
  const course = getById(data.courses, req.params.id);
  if (!course) {
    return res.status(404).json({ error: "Course not found" });
  }
  const assignments = data.assignments.filter(a => a.courseId === course.id);
  res.json(assignments);
});

// Enrollment -> Grades
app.get("/api/enrollments/:id/grades", (req, res) => {
  const enrollment = getById(data.enrollments, req.params.id);
  if (!enrollment) {
    return res.status(404).json({ error: "Enrollment not found" });
  }
  const grades = data.grades.filter(g => g.enrollmentId === enrollment.id);
  res.json(grades);
});

// ============= LEVEL 3: ADVANCED QUERIES =============

// Student GPA
app.get("/api/students/:id/gpa", (req, res) => {
  const student = getById(data.students, req.params.id);
  if (!student) {
    return res.status(404).json({ error: "Student not found" });
  }
  const enrollments = data.enrollments.filter(e => e.studentId === student.id && e.grade !== null);
  if (enrollments.length === 0) {
    return res.json({ studentId: student.id, gpa: null, message: "No completed courses" });
  }
  let totalPoints = 0;
  let totalCredits = 0;
  enrollments.forEach(e => {
    const course = getById(data.courses, e.courseId);
    if (course && gradePoints[e.grade]) {
      totalPoints += gradePoints[e.grade] * course.credits;
      totalCredits += course.credits;
    }
  });
  const gpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : null;
  res.json({ studentId: student.id, studentName: `${student.firstName} ${student.lastName}`, gpa });
});

// Course Average Grade
app.get("/api/courses/:id/average", (req, res) => {
  const course = getById(data.courses, req.params.id);
  if (!course) {
    return res.status(404).json({ error: "Course not found" });
  }
  const enrollments = data.enrollments.filter(e => e.courseId === course.id && e.grade !== null);
  if (enrollments.length === 0) {
    return res.json({ courseId: course.id, average: null, message: "No completed enrollments" });
  }
  let totalPoints = 0;
  enrollments.forEach(e => {
    if (gradePoints[e.grade]) {
      totalPoints += gradePoints[e.grade];
    }
  });
  const average = (totalPoints / enrollments.length).toFixed(2);
  res.json({ courseId: course.id, courseName: course.name, averageGrade: average, completedStudents: enrollments.length });
});

// Instructor -> All Students (via courses)
app.get("/api/instructors/:id/students", (req, res) => {
  const instructor = getById(data.instructors, req.params.id);
  if (!instructor) {
    return res.status(404).json({ error: "Instructor not found" });
  }
  const courses = data.courses.filter(c => c.instructorId === instructor.id);
  const courseIds = courses.map(c => c.id);
  const enrollments = data.enrollments.filter(e => courseIds.includes(e.courseId));
  const studentIds = [...new Set(enrollments.map(e => e.studentId))];
  const students = studentIds.map(id => getById(data.students, id)).filter(s => s !== null);
  res.json({ instructorId: instructor.id, instructorName: `${instructor.firstName} ${instructor.lastName}`, students });
});

// Student Schedule (current enrollments)
app.get("/api/students/:id/schedule", (req, res) => {
  const student = getById(data.students, req.params.id);
  if (!student) {
    return res.status(404).json({ error: "Student not found" });
  }
  const enrollments = data.enrollments.filter(e => e.studentId === student.id && e.status === "enrolled");
  const schedule = enrollments.map(e => {
    const course = getById(data.courses, e.courseId);
    const instructor = course ? getById(data.instructors, course.instructorId) : null;
    return course ? {
      course: { id: course.id, code: course.code, name: course.name, credits: course.credits },
      schedule: course.schedule,
      instructor: instructor ? `${instructor.firstName} ${instructor.lastName}` : null,
      enrollmentStatus: e.status,
      semester: e.semester
    } : null;
  }).filter(s => s !== null);
  res.json({ studentId: student.id, studentName: `${student.firstName} ${student.lastName}`, schedule });
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "APIs are working correctly" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log("\n=== LEVEL 1: BASIC CRUD ===");
  console.log("  GET /api/students");
  console.log("  GET /api/students/:id");
  console.log("  GET /api/instructors");
  console.log("  GET /api/instructors/:id");
  console.log("  GET /api/courses");
  console.log("  GET /api/courses/:id");
  console.log("  GET /api/enrollments");
  console.log("  GET /api/enrollments/:id");
  console.log("  GET /api/assignments");
  console.log("  GET /api/assignments/:id");
  console.log("  GET /api/grades");
  console.log("  GET /api/grades/:id");
  console.log("\n=== LEVEL 2: NESTED RESOURCES ===");
  console.log("  GET /api/students/:id/enrollments");
  console.log("  GET /api/students/:id/courses");
  console.log("  GET /api/courses/:id/students");
  console.log("  GET /api/instructors/:id/courses");
  console.log("  GET /api/courses/:id/assignments");
  console.log("  GET /api/enrollments/:id/grades");
  console.log("\n=== LEVEL 3: ADVANCED QUERIES ===");
  console.log("  GET /api/students/:id/gpa");
  console.log("  GET /api/courses/:id/average");
  console.log("  GET /api/instructors/:id/students");
  console.log("  GET /api/students/:id/schedule");
  console.log("\n  GET /api/health");
});
