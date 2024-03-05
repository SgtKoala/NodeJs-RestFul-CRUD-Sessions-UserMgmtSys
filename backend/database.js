import mysql from 'mysql2';
import dotenv from 'dotenv';
dotenv.config();

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
}).promise();




export async function getAllUsers() {
    const [users] = await pool.query(`SELECT * FROM tbl_users WHERE delStatus = ? `, 0);
    return users;
}

export async function getUserById(id) {
    const [rows] = await pool.query(`
    SELECT * 
    FROM tbl_users
    WHERE id = ?
    `, [id]);
    return rows[0];
}
export async function login(username, password, delStatus){
    const [users] = await pool.query('SELECT * FROM tbl_users WHERE username = ? AND password = ? AND delStatus = ?', [username, password, 0]);
    if (users.length > 0) {
        // Return the user data if login is successful
        return users[0];
      } else {
        // Return null if login fails
        return null;


      }

    
}




export async function createUser(username, password, fname, mname, lname, urole = 2, delStatus) {
    const [result] = await pool.query(`
    INSERT INTO tbl_users (username, password, fname, mname, lname, urole, delStatus)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [username, password, fname, mname, lname, urole, 0]);
    const id = result.insertId;
    return getUserById(id);
}


export async function editUser( id, {username, password, fname, mname, lname, urole, delStatus}){
    try{

    
    const [result] = await pool.query(`
    UPDATE tbl_users SET username = ?, password = ?, fname = ?, mname = ?, lname =?, urole = ?, delStatus= ? WHERE id = ?`, [username, password, fname, mname, lname, urole, delStatus, id]);
    if(result.affectedRows > 0){
        const updatedData = await getUserById(id);
        
        return updatedData;
    }else{
        console.log(result);
        return null;
        
    }
    }catch(error){
        throw error;
    }
}

export async function delUser(id,{delStatus}){
    try{
        const [result] = await pool.query(`UPDATE tbl_users SET delStatus = ? WHERE id = ? `,[delStatus, id] )
        if(result.affectedRows >0 ){
            const updatedData = await getUserById(id);
            return updatedData;
        }
        else{
            console.log(result);
            return null;
        }

    }catch(error){
        throw error;
    }
}