package com.example.Vocabia.service;

import com.example.Vocabia.entity.Classroom;
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

}
