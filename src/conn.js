const express = require('express')
const pool = require('./db')
const app = express()
const path = require('path')
const bodyparser = require('body-parser')
const port = 5000;
const { body, validationResult } = require('express-validator')

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "DELETE,GET,HEAD,OPTIONS,POST,PUT");
    res.header("Access-Control-Allow-Headers", "Origin,X-Requested-With,Content-Type");
    next();
})

// For the send the param into the format of the body
app.use(bodyparser.json())

app.get('/', async (req, res) => {
    res.send("Student Attendance Management System")
})

// API FOR THE GET THE STUDENT DATA FROM THE DATABASE

app.get('/stud_data', [], async (req, res) => {
    try {
        const result = await pool.query('select * from register_student')
        let count = result.rows.length ;
        res.json({ stutas: '200', message: 'success', studData: result.rows, cnt : count })
        // console.log(result)
    } catch (err) {
        console.error(err.message)
        res.status(500).withMessage('Server Error')
    }
})

// APIS FOR THE REGISTER THE STUDENT 

app.post('/registerStudent', [
    body('name').notEmpty().withMessage("NAME is required"),
    body('prn').notEmpty().withMessage("PRN is required"),
    body('addr').notEmpty().withMessage("ADDRESS is required"),
    body('dob').notEmpty().withMessage("DOB is required"),
    body('class_id').notEmpty().withMessage("CLASS_ID is required"),
    body('gender').notEmpty().withMessage("GENDER is required"),
    body('pass').notEmpty().withMessage('PASSWORD is required')
], async (req, res) => {
    try {
        const { name, prn, addr, dob, class_id, gender, pass } = req.body

        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        } else {

            const regPrn = await pool.query('select prn from register_student where prn = $1', [prn])
            if (regPrn.rows.length == 0) {
                await pool.query('insert into register_student (name,prn,addr,dob,class_id,gender,pass) values ($1, $2, $3 , $4, $5 , $6,$7)', [name, prn, addr, dob, class_id, gender, pass])

                res.json({ stutas: '200', message: 'Insert success' })
            } else {
                res.json({ stutas: '400', message: 'PRN already exist' })
            }
        }

    } catch (err) {
        console.error(err.message)
        res.status(500).withMessage('Server Error')
    }
})


// API FOR THE LOGIN THE STUDENT  onload var vaparayala have ha api cha function

app.post('/loginStudent', [
    body('prn').notEmpty().withMessage("PRN no. is required"),
    body('pass').notEmpty().withMessage('PASSWORD is required')
], async (req, res) => {
    try {
        const { prn, pass } = req.body

        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        } else {

            const r = await pool.query('select * from register_student where prn = $1 and pass = $2', [prn, pass])

            if (r.rows.length > 0) {
                const result = await pool.query('select prn,class_id,name from register_student where prn = $1 and pass = $2', [prn, pass])

                res.json({ status: '200', message: 'Login Success', data :  result.rows })
            } else {
                res.json({ status: '400', message: 'Invalid Credintials' })
            }
        }

    } catch (err) {
        console.error(err.message)
        res.status(500).withMessage('Server Error')
    }
})

//  API FOR NAME AND PRN NO. SELECTED OF THE STUDENT
app.post('/allStudInfo',[
    body('prn').notEmpty().withMessage("PRN no. is required.")
], async (req, res) => {
    try {
        const { prn } = req.body

        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        } else {
            const r = await pool.query('select * from register_student where prn = $1',[prn]);

            if(r.rows.length > 0){
                const result = await pool.query("select * from register_student where prn = $1",[prn])
                res.json({status : '200', message : result.rows})
            }else{
                res.json({status : '400', message : 'PRN no. is not found'})
            }
            
        }

    } catch (err) {
        console.error(err.message)
        res.status(500).withMessage('Server Error')
    }
})

app.get('/markAttallStudInfo', async (req, res) => {
    try {

        const result = await pool.query('select name,prn,dob,pass from register_student order by name')
        res.json({ stutas: '200', message: 'success', studData: result.rows })
    } catch (err) {
        console.error(err.message)
        res.status(500).withMessage('Server Error')
    }
})

// API for the topology select only name by prn

app.post('/nameByPRN', [
    body('prn').notEmpty().withMessage('PRN no. is required')
], async (req, res) => {
    try {
        const { prn } = req.body

        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        } else {

            const r = await pool.query('select * from register_student where prn = $1', [prn])

            if (r.rows.length > 0) {
                const result = await pool.query('select name from register_student where prn = $1', [prn])

                res.json({ status: '200', message: 'Success', name: result.rows })
            } else {
                res.json({ status: '400', message: 'PRN no. is not found' })
            }
        }
    } catch (err) {
        console.error(err.message)
        res.status(500).withMessage('Server Error')
    }
})


//  Informatino by id

app.post('/infoByPRN', [
    body('prn').notEmpty().withMessage('PRN no. is required')
], async (req, res) => {
    try {

        const { prn } = req.body

        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        } else {
            const r = await pool.query('select prn,name,dob,pass from register_student where prn = $1', [prn])
            // console.log(r.rows.length)
            if (r.rows.length > 0) {
                const result = await pool.query('select prn,name,dob,pass,gender,addr,class_id from register_student where prn = $1', [prn])
                res.json({ stutas: '200', message: 'success', report: result.rows })
            } else {
                res.json({ stutas: '400', message: 'PRN is not availible' })
            }
        }

    } catch (err) {
        console.error(err.message)
        res.status(500).withMessage('Server Error')
    }
})


// API FOR THE GENARATE STUDET REPORT IN ADMIN PAGE FOR DISPALY THE STUDENT DATA IN SPAN TAG

app.post('/getBasicInfo', [
    body('prn').notEmpty().withMessage('PRN no. is required')
], async (req, res) => {
    try {
        const { prn } = req.body

        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        } else {
            const r = await pool.query('select prn,name,class_id from register_student where prn = $1', [prn])
            // console.log(r.rows.length)
            if (r.rows.length > 0) {
                const result = await pool.query('select prn,name,class_id from register_student where prn = $1', [prn])
                res.json({ stutas: '200', message: 'success', report: result.rows })
            } else {
                res.json({ stutas: '200', message: 'PRN is not availible' })
            }
        }
    } catch (err) {
        console.error(err.message)
        res.status(500).withMessage('Server Error')
    }
})



// API FOR THE GENARATE STUDENT REPORT IN ADMIN PAGE FOR DISPALY THE STUDENT ATTENDACE DATA BASED ON DATE
app.post('/gen_report_att', [
    body('prn').notEmpty().withMessage('PRN is required')
], async (req, res) => {
    try {
        const { prn } = req.body

        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        } else {

            const r = await pool.query('select * from stud_attendance where prn = $1', [prn])
            // console.log(r.rows.length)
            if (r.rows.length > 0) {
                const result = await pool.query('select att_date,stutas from stud_attendance where prn = $1',[prn])
                res.json({ stutas: '200', message: 'success', report: result.rows })
            } else {
                res.json({ stutas: '400', message: 'PRN NO. DOSE NOT EXIST OR ATTENDACE IS DOES NOT EXIST' })
            }
        }

    } catch (err) {
        console.error(err.message)
        res.status(500).withMessage('Server Error')
    }
})

app.post('/selAttDate',[
    body('prn').notEmpty().withMessage('PRN no. is required')
], async (req,res) =>{
    try{
        const {prn} = req.body

        const result = await pool.query('select att_date from stud_attendance where prn = $1',[prn])
        res.json({data : result.rows})
    }catch(err){
        console.error(err.message)
        res.status(500).withMessage('Server Error')
    }
})

// Mark student attendace into the table

app.post('/markAttendance', [
    body('prn').notEmpty().withMessage('PRN no. is required'),
    body('status').notEmpty().withMessage('Status is required'),
    body('att_date').notEmpty().withMessage('Attendace Date is required')
], async (req, res) => {
    try {

        const { prn, status, att_date } = req.body

        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        } else {
            const r = await pool.query('select prn from register_student where prn = $1', [prn]);
            // console.log(r.rows.length)

            if (r.rows.length > 0) {
                const dateAthontication = await pool.query('select att_date from stud_attendance where att_date = $1 and prn = $2', [att_date, prn]);

                if (dateAthontication.rows.length > 0) {
                    res.json({ status: '400', message: 'Attendance already marked' })
                } else {
                    await pool.query('insert into stud_attendance(prn,stutas,att_date) values ($1,$2,$3)', [prn, status, att_date])
                    res.json({ status: '200', message: 'Make attendace Successfully' })
                }
            } else {
                res.json({ status: '400', message: 'Mark Attendance Unsuccess And PRN no. is not found' })
            }

        }
    } catch (err) {
        console.error(err.message)
        res.status(500).withMessage('Server Error')
    }
})

// API for the update the attendance if the student is the present

app.put('/uptAttIfP', [
    body('status').notEmpty().withMessage('Status is required'),
    body('prn').notEmpty().withMessage('PRN no. is required')
], async (req, res) => {
    try {
        const { status, prn } = req.body

        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        } else {

            const r = await pool.query('select * from stud_attendance where prn = $1', [prn])

            if (r.rows.length > 0) {
                await pool.query('update stud_attendance set stutas = $1 where prn = $2', [status, prn])
                res.json({ status: '200', message: 'Update Success' })
            } else {
                res.json({ status: '400', message: 'Update Unsuccess' })
            }
        }
    } catch (err) {
        console.error(err.message)
        res.status(500).withMessage('Server Error')
    }
})

//  API for the if the student is absent 

app.put('/uptAttIfA', [
    body('status').notEmpty().withMessage('Status is required'),
    body('prn').notEmpty().withMessage('PRN no. is required')
], async (req, res) => {
    try {
        const { status, prn } = req.body

        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        } else {

            const r = await pool.query('select * from stud_attendance where prn = $1', [prn])

            if (r.rows.length > 0) {
                await pool.query('update stud_attendance set stutas = $1 where prn = $2', [status, prn])
                res.json({ status: '200', message: 'Update Success' })
            } else {
                res.json({ status: '400', message: 'Update Unsuccess' })
            }
        }
    } catch (err) {
        console.error(err.message)
        res.status(500).withMessage('Server Error')
    }
})

// API for the get only the aatendance status

app.post('/getAttStatus', [
    body('prn').notEmpty().withMessage('PRN no. is required')
], async (req, res) => {
    try {
        const { prn } = req.body

        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        } else {
            const r = await pool.query('select prn from register_student where prn = $1', [prn]);

            if (r.rows.length > 0) {
                const result = await pool.query('select stutas from stud_attendance where prn = $1', [prn])
                res.json({ status: '200', message: 'status', Status: result.rows })
            }else{
                res.json({status : '400', message : 'PRN No. is not found'})
            }
            
        }
    } catch (err) {
        console.error(err.message)
        res.status(500).withMessage('Server Error')
    }
})

// API for the update the student information

app.put('/upt_stu_data',[
    body('name').notEmpty().withMessage('Name is required'),
    body('gender').notEmpty().withMessage('gender is required'),
    body('addr').notEmpty().withMessage('addr is required'),
    body('dob').notEmpty().withMessage('dob is required'),
    body('class_id').notEmpty().withMessage('class_id is required'),
    body('prn').notEmpty().withMessage('prn is required')

],async (req,res)=>{
    try{

        const errors = validationResult(req)

        const {name,gender,addr,dob,class_id,prn} = req.body

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        } else {
            await pool.query('update register_student set name = $1, gender = $2, addr = $3, dob = $4, class_id = $5 where prn = $6',[name,gender,addr,dob,class_id,prn])
            res.json({status : '200', message : 'Update Success'})
        }
    }catch(err){
        console.error(err.message)
        res.status(500).send('Internal Server Error')
    }
})

app.listen(port, () => {
    console.log(`Server starts on http://localhost:${port}`)
})


// APIs end              Thank You Vikash Sir, Suresh Sir, Ramesh Sir