const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const insertStudent = require('./crud');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const PORT = 3000;
app.use(cors());
// Multer configuration for handling file uploads
const upload = multer({ dest: 'uploads/' });
const db = new sqlite3.Database('StudentsDB.db');

app.get('/students', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 10;
    const offset = (page - 1) * perPage;
    
    // Query to fetch paginated student data from the database
    const query = `
      SELECT s.*,g.*,g.id as gradeID
      FROM students s
      INNER JOIN grades g ON s.id = g.student_id
      ORDER BY id
      LIMIT ${perPage} OFFSET ${offset}
    `;
  
    // Query to fetch the total count of records in the database
    const countQuery = `SELECT COUNT(*) AS total FROM students`;
  
    // Execute both queries in parallel using Promise.all
    Promise.all([
      new Promise((resolve, reject) => {
        db.all(query, (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        });
      }),
      new Promise((resolve, reject) => {
        db.get(countQuery, (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row.total);
          }
        });
      })
    ])
    .then(([rows, total]) => {
      // Return paginated student data and total count as JSON response
      res.json({ students: rows, total });
    })
    .catch(error => {
      console.error('Error fetching students:', error);
      res.status(500).json({ error: 'Internal server error' });
    });
  });
  

app.get('/average-scores', (req, res) => {
    // Query the database to retrieve scores in math, reading, and writing
    db.all('SELECT AVG(G1) AS avg_math, AVG(G2) AS avg_reading, AVG(G3) AS avg_writing FROM grades', (err, rows) => {
        if (err) {
            console.error('Error calculating average scores:', err);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            // Extract average scores from the result
            const { avg_math, avg_reading, avg_writing } = rows[0];
            
            // Send the calculated average scores as JSON response
            res.json({
                average_math: avg_math.toFixed(2), // Round to 2 decimal places
                average_reading: avg_reading.toFixed(2),
                average_writing: avg_writing.toFixed(2)
            });
        }
    });
});

app.get('/performance-comparison-by-gender', (req, res) => {
    // Query the database to retrieve scores of male and female students
    db.all(`
        SELECT s.sex AS gender,
            AVG(g.G1) AS avg_math_score,
            AVG(g.G2) AS avg_reading_score,
            AVG(g.G3) AS avg_writing_score
        FROM students s
        INNER JOIN grades g ON s.id = g.student_id
        GROUP BY s.sex
    `, (err, rows) => {
        if (err) {
            console.error('Error fetching performance data:', err);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            // Return the comparison results
            res.json(rows);
        }
    });
});
app.get('/performance-analysis', (req, res) => {
    // Query the database to retrieve scores of students along with lunch type and parental education level
    db.all(`
        SELECT lunch, Medu, Fedu,
            AVG(G1) AS avg_math_score,
            AVG(G2) AS avg_reading_score,
            AVG(G3) AS avg_writing_score
        FROM students s
        INNER JOIN grades g ON s.id = g.student_id
        GROUP BY lunch, Medu, Fedu
    `, (err, rows) => {
        if (err) {
            console.error('Error fetching performance data:', err);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            // Return the analysis results
            res.json(rows);
        }
    });
});
// Endpoint for uploading CSV file and inserting data into tables
app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded');
    }

    const results = [];
    fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (data) => {
            results.push(data);
        })
        .on('end', () => {
            // Process the CSV data and insert into tables
            results.forEach(row => {
                // Extract student, family, and grades data from the row
                const studentData = extractStudentData(row);
                const familyData = extractFamilyData(row);
                const gradesData = extractGradesData(row);
                const schoolData = extractSchoolData(row);
                const activityData = extractActivityData(row);

                // Insert data into tables
                insertStudent(studentData, familyData, gradesData,schoolData, activityData);
            });

            // Send response
            res.status(200).send('Data inserted successfully');
        });
});



function extractStudentData(row) {
    return {
        sex: row.sex,
        age: parseInt(row.age),
        address: row.address,
        guardian: row.guardian,
        health: parseInt(row.health)
    };
}

function extractFamilyData(row) {
    return {
        famrel: parseInt(row.famrel),
        famsize: row.famsize,
        Pstatus: row.Pstatus,
        Medu: parseInt(row.Medu),
        Fedu: parseInt(row.Fedu),
        Mjob: row.Mjob,
        Fjob: row.Fjob,    
        famsup: row.famsup
    };
}

function extractSchoolData(row) {
    return {
        school: row.school,
        reason: row.reason,
        failures: parseInt(row.failures),
        schoolsup: row.schoolsup,
        paid: row.paid,
        nursery: row.nursery,
        higher: row.higher,
        absences: parseInt(row.absences)
    };
}

function extractActivityData(row) {
    return {
        Dalc: row.Dalc,
        Walc: parseInt(row.Walc),
        traveltime: parseInt(row.traveltime),
        studytime: parseInt(row.studytime),
        freetime: parseInt(row.freetime),
        goout: parseInt(row.goout),
        activities: row.activities,
        internet: row.internet,
        romantic: row.romantic
    };
}


function extractGradesData(row) {
    return {
        G1: parseInt(row.G1),
        G2: parseInt(row.G2),
        G3: parseInt(row.G3)
    };
}

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
