[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/MPD2KS2G)
# API Building Practice Dataset

This dataset contains realistic university data for practicing API development. The data includes students, instructors, courses, enrollments, assignments, and grades with relationships between entities.

### Entities

1. **Students** (8 records)
   - id, firstName, lastName, email, enrollmentDate, major, gpa, year, active

2. **Instructors** (5 records)
   - id, firstName, lastName, email, department, hireDate, officeLocation, specialty

3. **Courses** (7 records)
   - id, code, name, credits, department, instructorId, capacity, schedule, prerequisites

4. **Enrollments** (14 records)
   - id, studentId, courseId, enrollmentDate, grade, status, semester

5. **Assignments** (6 records)
   - id, courseId, title, description, dueDate, maxPoints, type

6. **Grades** (6 records)
   - id, enrollmentId, assignmentId, score, submittedDate, feedback

## Practice Exercises

### Level 1: Basic CRUD Operations

Build RESTful endpoints for each entity:

**Students**
- `GET /api/students` - Get all students
- `GET /api/students/:id` - Get student by ID

Repeat for: instructors, courses, enrollments, assignments, grades


### Level 2: Nested Resources & Relationships

Create endpoints that fetch related data:

- `GET /api/students/:id/enrollments` - Get student's enrollments
- `GET /api/students/:id/courses` - Get student's courses
- `GET /api/courses/:id/students` - Get students in a course
- `GET /api/instructors/:id/courses` - Get instructor's courses
- `GET /api/courses/:id/assignments` - Get course assignments
- `GET /api/enrollments/:id/grades` - Get grades for enrollment

### Level 3: Advanced Queries

Build complex query endpoints: 

- `GET /api/students/:id/gpa` - Calculate and return student's GPA
- `GET /api/courses/:id/average` - Calculate course average grade
- `GET /api/instructors/:id/students` - Get all students taught by instructor
- `GET /api/students/:id/schedule` - Get student's current schedule

