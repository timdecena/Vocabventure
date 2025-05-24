package com.example.Vocabia.service;

import com.example.Vocabia.entity.Classroom;
<<<<<<< HEAD
import com.example.Vocabia.entity.User;
import com.example.Vocabia.repository.ClassroomRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ClassroomService {
    private final ClassroomRepository classroomRepository;

    public ClassroomService(ClassroomRepository classroomRepository) {
        this.classroomRepository = classroomRepository;
    }

    public String generateJoinCode() {
        return UUID.randomUUID().toString().replace("-", "").substring(0, 8);
    }

    public Classroom createClassroom(String name, String description, User teacher) {
        Classroom classroom = new Classroom();
        classroom.setName(name);
        classroom.setDescription(description);
        classroom.setJoinCode(generateJoinCode());
        classroom.setTeacher(teacher);
        return classroomRepository.save(classroom);
    }

    public Classroom updateClassroom(Long id, String name, String description, User teacher) {
        Classroom classroom = classroomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Classroom not found"));
        if (!classroom.getTeacher().getId().equals(teacher.getId()))
            throw new RuntimeException("Forbidden");
        classroom.setName(name);
        classroom.setDescription(description);
        return classroomRepository.save(classroom);
    }

    public void deleteClassroom(Long id, User teacher) {
        Classroom classroom = classroomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Classroom not found"));
        if (!classroom.getTeacher().getId().equals(teacher.getId()))
            throw new RuntimeException("Forbidden");
        classroomRepository.delete(classroom);
    }

    public Optional<Classroom> findByJoinCode(String joinCode) {
        return classroomRepository.findByJoinCode(joinCode);
    }

    public Optional<Classroom> findById(Long id) {
        return classroomRepository.findById(id);
    }

    public List<Classroom> getTeacherClasses(User teacher) {
        return classroomRepository.findByTeacher(teacher);
    }
=======
import com.example.Vocabia.entity.UserEntity;
import com.example.Vocabia.repository.ClassroomRepository;
import com.example.Vocabia.repository.UserRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Set;

import java.util.Optional;

@Service
public class ClassroomService {

    private final ClassroomRepository classRepo;
    private final UserRepository userRepo;

    public ClassroomService(ClassroomRepository cr, UserRepository ur) {
        this.classRepo = cr;
        this.userRepo = ur;
    }

    public Classroom createClass(String className, String teacherEmail) {
        UserEntity teacher = userRepo.findByEmail(teacherEmail).orElseThrow();
        if (!teacher.getRole().equals("TEACHER")) throw new RuntimeException("Not a teacher");
        Classroom c = new Classroom();
        c.setClassName(className);
        c.setTeacher(teacher);
        return classRepo.save(c);
    }

    public Classroom requestToJoin(Long classId, String studentEmail) {
        Classroom c = classRepo.findById(classId).orElseThrow();
        UserEntity student = userRepo.findByEmail(studentEmail).orElseThrow();
        if (!student.getRole().equals("STUDENT")) throw new RuntimeException("Not a student");
        c.getPendingRequests().add(student);
        return classRepo.save(c);
    }

    public Classroom acceptStudent(Long classId, Long studentId, String teacherEmail) {
        Classroom c = classRepo.findById(classId).orElseThrow();
        if (!c.getTeacher().getEmail().equals(teacherEmail)) throw new RuntimeException("Unauthorized");

        UserEntity student = userRepo.findById(studentId).orElseThrow();
        c.getPendingRequests().remove(student);
        c.getAcceptedStudents().add(student);
        return classRepo.save(c);
    }

    public Classroom rejectStudent(Long classId, Long studentId, String teacherEmail) {
        Classroom c = classRepo.findById(classId).orElseThrow();
        if (!c.getTeacher().getEmail().equals(teacherEmail)) throw new RuntimeException("Unauthorized");

        UserEntity student = userRepo.findById(studentId).orElseThrow();
        c.getPendingRequests().remove(student);
        return classRepo.save(c);
    }

    public List<Classroom> getAllClasses() {
    return classRepo.findAll();
}

public List<Classroom> getClassesByTeacher(String email) {
    UserEntity teacher = userRepo.findByEmail(email).orElseThrow();
    return classRepo.findByTeacher(teacher);
}

>>>>>>> 9c235d03163cc3f9d8a9c7738f6667321e880070
}
