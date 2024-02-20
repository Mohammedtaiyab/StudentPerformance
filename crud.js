// insert-data.js

const sqlite3 = require('sqlite3').verbose();
const createTables = require('./database'); // Import the module responsible for creating tables

// Establish a database connection
const db = new sqlite3.Database('StudentsDB.db');

// Create the tables if they don't already exist
createTables();

// Function to insert data into the students table
function insertStudent(studentData, familyData, gradesData,schoolData, activityData) {
    // Begin transaction
    db.serialize(() => {
        db.run('BEGIN TRANSACTION');
        // Insert student data
        const stmtStudent = db.prepare(`INSERT INTO students (sex, age, address, guardian, health)
                                     VALUES (?, ?, ?, ?, ?)`);
        stmtStudent.run(studentData.sex, studentData.age, studentData.address,studentData.guardian, studentData.health, function (err) {
            if (err) {
                console.error('Error inserting student data:', err.message);
            } else {
                const studentId = this.lastID;
                const stmtFamily = db.prepare(`INSERT INTO family (student_id, famrel, famsize, Pstatus, Medu, Fedu, Mjob, Fjob, famsup )
                                             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
                stmtFamily.run(studentId, familyData.famrel, familyData.famsize, familyData.Pstatus, familyData.Medu, familyData.Fedu, familyData.Mjob, familyData.Fjob,familyData.famsup);
                stmtFamily.finalize();

                const stmtSchool = db.prepare(`INSERT INTO school (student_id, school, reason, schoolsup, paid, nursery, higher, absences, failures) 
                                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
                stmtSchool.run(studentId, schoolData.school, schoolData.reason, schoolData.schoolsup, schoolData.paid, schoolData.nursery, schoolData.higher, schoolData.absences, schoolData.failures);
                stmtSchool.finalize();

                const stmtActivity = db.prepare(`INSERT INTO activity (student_id, activities, internet, romantic, freetime, goout, Dalc,Walc,traveltime,studytime) 
                                            VALUES (?, ?, ?, ?, ?, ?, ?,? ,? ,?)`);
                stmtActivity.run(studentId, activityData.activities, activityData.internet, activityData.romantic, activityData.freetime, activityData.goout, activityData.Dalc , activityData.Walc, activityData.traveltime, activityData.studytime);
                stmtActivity.finalize();

                const stmtGrades = db.prepare(`INSERT INTO grades (student_id, G1, G2, G3)
                                     VALUES (?, ?, ?, ?)`);
                stmtGrades.run(studentId, gradesData.G1, gradesData.G2, gradesData.G3);
                stmtGrades.finalize();
            }
        }); 
        stmtStudent.finalize();
        db.run('COMMIT');
    });
    //db.close();
}

module.exports = insertStudent;
