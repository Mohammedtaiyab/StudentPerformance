const sqlite3 = require('sqlite3').verbose();
const dbName = 'StudentsDB.db';
createTables = function createTable() {
    // Open SQLite database connection
    const db = new sqlite3.Database(dbName, (err) => {
        if (err) {
            console.error('Error opening database:', err.message);
        } else {
            console.log('Connected to the SQLite database.');
        }
    });    
        const createStudentsTableQuery = `
            CREATE TABLE IF NOT EXISTS students (
                id INTEGER PRIMARY KEY,
                sex TEXT,
                age INTEGER,
                address TEXT,
                guardian TEXT,
                health INTEGER
            )
        `;
        const createFamilyTableQuery = `
            CREATE TABLE IF NOT EXISTS family (
                id INTEGER PRIMARY KEY,
                student_id,
                famrel INTEGER,
                famsize TEXT,
                Pstatus TEXT,
                Medu INTEGER,
                Fedu INTEGER,
                Mjob TEXT,
                Fjob TEXT,
                famsup TEXT
            )
        `;
            
        const createSchoolTableQuery = `
        CREATE TABLE IF NOT EXISTS school (
            id INTEGER PRIMARY KEY,
            student_id INTEGER,
            school TEXT,
            reason TEXT,
            schoolsup TEXT,
            paid TEXT,
            nursery TEXT,
            higher TEXT,
            absences INTEGER,
            failures INTEGER
        )
    `;
        const createActivityTableQuery = `
        CREATE TABLE IF NOT EXISTS activity (
            id INTEGER PRIMARY KEY,
            student_id INTEGER,
            activities TEXT,
            internet TEXT,
            romantic TEXT,
            freetime INTEGER,
            goout INTEGER,
            Dalc TEXT,
            Walc INTEGER,
            traveltime INTEGER,
            studytime INTEGER
        )
    `;
        const createGradesTableQuery = `
            CREATE TABLE IF NOT EXISTS grades (
                id INTEGER PRIMARY KEY,
                student_id INTEGER,
                G1 INTEGER,
                G2 INTEGER,
                G3 INTEGER
            )
        `;
    
        // Execute the CREATE TABLE queries
        db.serialize(() => {
            db.run(createStudentsTableQuery);
            db.run(createFamilyTableQuery);
            db.run(createSchoolTableQuery);
            db.run(createActivityTableQuery);
            db.run(createGradesTableQuery);
    
            console.log('Tables created successfully');
    
            // Close database connection
            db.close();
        });
    }
    
module.exports = createTables;
