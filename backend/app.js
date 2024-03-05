import express from 'express';
import session from 'express-session';
import cors from 'cors';
import { getAllUsers, getUserById, createUser, editUser, delUser, login} from './database.js';
import bodyParser from 'body-parser';
import crypto from 'crypto';
const app = express();
app.use(cors());
app.use(bodyParser.json());



const generateSessionKey = () => {
    return crypto.randomBytes(32).toString('hex');
  };
  
  // Use the generated key in your express-session configuration
  

app.use(session({
    secret: generateSessionKey(), // Change this to a secure secret key
    resave: false,
    saveUninitialized: true,
  }));

app.get('/check-session', (req, res) => {
    if (!req.session.views) {
        req.session.views = 1;
    } else {
        req.session.views += 1;
    }


  if (req.session.views) {
    console.log(generateSessionKey()); //display cookie 
    res.json({ message: 'Session is active', views: req.session.views });
  } else {
    res.json({ message: 'Session not found' });
    
  }
});  

app.post("/login", async (req, res)=>{
    const {username, password} = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Invalid username or password' });
      }
    try {
    const user = await login(username, password);

    if (user) {
      // Successful login
      req.session.user = user;
      res.json({ message: 'Login successful', user });
    } else {
      // Invalid credentials
      res.status(401).json({ message: 'Invalid username or password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }

})
app.post('/logout', (req, res) => {
    // Clear the session
    req.session.destroy((err) => {
      if (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
      } else {
        res.json({ message: 'Logout successful' });
      }
    });
  });

//read route
app.get("/users", async (req, res) => {
    if (!req.session || !req.session.user) {
        return res.status(401).send("Unauthorized");
    }
    const users = await getAllUsers();
    res.send(users);
});
//create routes
app.post("/users", async (req, res) => {
    const { username, password, fname, mname, lname, urole, delStatus } = req.body;
    console.log("Received POST request at /users");
    console.log("Request Body:", req.body);
    
    if (!username || !password || !fname || !mname || !lname || !urole  ) {
        return res.status(400).send("Contents not supported");
        console.log("Request Parameters:", username, password, fname, mname, lname, urole, );
    }
    if (!req.session || !req.session.user) {
        return res.status(401).send("Unauthorized");
    }

    try {
        console.log("Request Parameters:", username, password, fname, mname, lname, urole);
        const user = await createUser(username, password, fname, mname, lname, urole, delStatus);
        res.status(201).send({ user });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal server error");
    }
});

//update routes
app.put("/users/:id", async (req, res) => {
    const { id } = req.params;
    const { username, password, fname, mname, lname, urole, delStatus} = req.body;

    if (!username || !password || !fname && !mname && !lname && !urole) {
        return res.status(400).send("At least one field (title or content) is required for update");
    }
    if (!req.session || !req.session.user) {
        return res.status(401).send("Unauthorized");
    }

    try {
        
        const updatedData = await editUser(id, { username, password, fname, mname, lname, urole ,delStatus});
        res.status(200).send({ updatedData });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});
// soft delete route
app.put("/users/delete/:id", async (req, res)=>{
    const {id} = req.params;
    const {delStatus} = req.body;

    if(!delStatus){
        return res.status(400).send("error deleting data");
        
    }
    if (!req.session || !req.session.user) {
        return res.status(401).send("Unauthorized");
    }
    try{
        const updatedData = await delUser(id, {delStatus});
        res.status(200).send({updatedData});

    }catch(error){
        console.error(error);
        res.status(500).send("internal server error")
    }
})

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(8080, () => {
    console.log('Running on 8080');
});