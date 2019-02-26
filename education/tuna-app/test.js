const mariadb = require('mariadb');

const pool = mariadb.createPool({host: 'localhost', user:'test',password:'password',database:'testDB',connectionLimit: 1});
pool.getConnection()
    .then(conn => {
      console.log(">>>>>>>>>>>>> #1");

      conn.query("SELECT * FROM hello")
        .then((rows) => {
          console.log(">>>>>>>>>>>>> #2");          
          console.log(rows); //[ {val: 1}, meta: ... ]
          return conn.query("INSERT INTO hello value (3, 'amariadb')");
        })
        .then((res) => {
          console.log(">>>>>>>>>>>>> #3");
          console.log(res); // { affectedRows: 1, insertId: 1, warningStatus: 0 }
          conn.end();
          pool.end();
        })
        .catch(err => {
          //handle error
          conn.end();
        })
        
    }).catch(err => {
      //not connected
    });