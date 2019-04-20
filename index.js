const express = require("express");
const mysql = require("mysql");
const multer = require("multer");
const sharp = require("sharp");

const app = express();
const port = 2010;

app.use(express.json());

const conn = mysql.createConnection({
  user: "faizun",
  password: "empatdan1",
  host: "localhost",
  database: "jc8expressmysql",
  port: "3306"
});

const upload = multer({
  limits: {
    fileSize: 1000000
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error("unable to upload"));
    }
    cb(undefined, cb);
  }
});

//register
app.post("/users", (req, res) => {
  const { nama, age, email, password } = req.body;
  var sql = `INSERT INTO users (nama, age, email, password) VALUES ('${nama}', ${age}, '${email}', '${password}');`;
  showUsers = `SELECT * FROM users;`;

  conn.query(sql, (err, result) => {
    if (err) {
      throw err;
    }

    conn.query(sql2, (err, result) => {
      if (err) {
        throw err;
      }

      res.send(result);
    });
  });
});

//login
app.get("/users/login", (req, res) => {
  const { email, password } = req.body;
  var selectUser = `SELECT * FROM users WHERE email = '${email}' && password = '${password}';`;

  conn.query(selectUser, (err, result) => {
    if (err) {
      throw err;
    }
    res.send(result[0]);
  });
});

//addTask
app.post("/tasks/:userId", (req, res) => {
  const { description } = req.body;
  const { userId } = req.params;
  var addTask = `INSERT INTO tasks (description, user_id) VALUES ('${description}',${userId});`;
  var showTasks = `SELECT * FROM tasks;`;

  conn.query(addTask, (err, result) => {
    if (err) {
      throw new Error(err);
    }
    conn.query(showTasks, (err, result) => {
      if (err) {
        throw new Error(err);
      }
      res.send(result);
    });
  });
});

//showTask
app.get("/tasks/:userId", (req, res) => {
  const { userId } = req.params;
  //   getUserTask = `SELECT completed, description, user_id FROM tasks t
  //     JOIN users u ON u.id = t.user_id
  //     WHERE t.user_id = ${userId};`;
  var getUserTask = `SELECT id, completed, description, user_id FROM tasks
    WHERE user_id IN (SELECT id FROM users WHERE id = ${userId})`;

  conn.query(getUserTask, (err, result) => {
    if (err) {
      throw new Error(err);
    }
    res.send(result);
  });
});

//deleteTask
app.delete("/delete/tasks/:taskId/:userId", (req, res) => {
  const { taskId, userId } = req.params;
  var deleteTask = `DELETE FROM tasks WHERE id = ${taskId}`;
  var showTasks = `SELECT id, completed, description, user_id FROM tasks 
    WHERE user_id IN(SELECT id FROM users WHERE id = ${userId})`;

  conn.query(deleteTask, (err, result) => {
    if (err) {
      throw new Error(err);
    }

    conn.query(showTasks, (err, result) => {
      if (err) {
        throw new Error(err);
      }
      res.send(result);
    });
  });
});

//updateTask
app.get("/update/tasks/:taskId/:userId", (req, res) => {
  const { taskId, userId } = req.params;
  var updateTask = `UPDATE tasks SET completed = NOT completed WHERE id = ${taskId}`;
  var showTasks = `SELECT id, completed, description, user_id FROM tasks
    WHERE user_id IN(SELECT id FROM users WHERE id = ${userId})
    ORDER BY completed asc`;

  conn.query(updateTask, (err, result) => {
    if (err) {
      throw new Error(err);
    }

    conn.query(showTasks, (err, result) => {
      if (err) {
        throw new Error(err);
      }

      res.send(result);
    });
  });
});

//uploadAvatar
app.post(
  "/upload/avatar/:userId",
  upload.single("avatar"),
  async (req, res) => {
    const { userId } = req.params;
    const buffer = await sharp(req.file.buffer)
      .resize({ width: 250 })
      .png()
      .toBuffer();
    const img = { avatar: buffer };
    var uploadAvatar = `UPDATE users SET ? WHERE id = ${userId}`;

    conn.query(uploadAvatar, img, (err, result) => {
      if (err) {
        throw new Error(err);
      }
      res.send(result);
    });
  }
);

//showAvatar
app.get("/show/avatar/:userId", (req, res) => {
  const { userId } = req.params;
  var getUser = `SELECT * FROM users WHERE id = ${userId}`;

  conn.query(getUser, (err, result) => {
    if (err) {
      throw new Error(err);
    }

    res.send(result[0].avatar);
  });
});

//deleteAvatar
app.delete("/delete/avatar/:userId", (req, res) => {
  const { userId } = req.params;
  var deleteAvatar = `UPDATE users SET avatar = null WHERE id = ${userId}`;

  conn.query(deleteAvatar, (err, result) => {
    if (err) {
      throw new Error(err);
    }

    res.send(result);
  });
});

//editUser
app.post("/edit/users/:userId", (req, res) => {
  const { userId } = req.params;
  Object.keys(req.body).forEach(key => {
    if (!req.body[key]) {
      delete req.body[key];
    }
  });
  const edit = req.body;
  var editUser = `UPDATE users SET ? WHERE id = ${userId}`;
  var getUser = `SELECT * FROM users WHERE id = ${userId}`;

  conn.query(editUser, edit, (err, result) => {
    if (err) {
      throw new Error(err);
    }
    conn.query(getUser, (err, result) => {
      if (err) {
        throw new Error(err);
      }
      res.send(result);
    });
  });
});

app.listen(port, () => {
  console.log("Running at ", port);
});
