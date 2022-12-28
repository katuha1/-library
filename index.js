const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser')
const urlencodedParser = bodyParser.urlencoded({ extended: false })

const app = express();
const server = http.createServer(app);
const port = 3000;
module.exports = app

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.disable('x-powered-by');

let data = require('./data.json');

app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).send('Вы сломали сервер!');
});

app.use((err, req, res, next) => {
  if (error instanceof ForbiddenError) {
    return res.status(403).send({
      status: 'forbidden',
      message: error.message,
    });
  }
});


let jsonfile = require('jsonfile');

let file = jsonfile.readFileSync('data.json');

app.get('/book', (req, res) => {
  res.status(200).type('text/plain')
  res.send(JSON.stringify(data, null, '\t'))
});

app.get('/book/:id', (req, res) => {
  res.status(200).type('text/plain')
  let id = req.params.id;
  res.send(JSON.stringify(data[id], null, '\t'));

});

app.put('/book/:id', function (req, res) {
  let id = req.params.id;
  let {name, data1, data2, author, year} = req.body;

  jsonfile.readFile('data.json', function (err, obj) {
    let fileObj = obj;
    fileObj[id].name = name;
    fileObj[id].data1 = data1;
    fileObj[id].data2 = data2;
    fileObj[id].author = author;
    fileObj[id].year = year;
    jsonfile.writeFile('data.json', fileObj, function (err) {
      if (err) throw err;
    });
    res.send(JSON.stringify(data[id], null, '\t'));
  });
});

app.post('/book', (req, res) => {
  if (!req.body) return res.sendStatus(400);
  const user = {
    id: file.length + 1,
    name: req.body.name,
    data1: req.body.data1,
    data2: req.body.data2,
    author: req.body.author,
    year: req.body.year,
  };
  jsonfile.readFile('data.json', (err, obj) => {
    if (err) throw err;
    let fileObj = obj;
    fileObj.push(user);
    jsonfile.writeFile('data.json', fileObj, (err) => {
      if (err) throw err;
    });
    res.send(JSON.stringify(data, null, '\t'));
  });
});

app.delete('/book/:id', (req, res) => {
  jsonfile.readFile('data.json', (err, obj) => {
    if (err) throw err;
    let fileObj = obj;
    for (let i = 0; i < fileObj.length; i++) {
      if (fileObj[i].id == req.params.id) {
        fileObj.splice(i, 1);
      }
    }
    jsonfile.writeFile('data.json', fileObj, { spaces: 2 }, (err) => {
      if (err) throw err;
    });
    res.send(JSON.stringify(data, null, '\t'));
  });
});

app.put('/book/:id', urlencodedParser, (req, res) => {
  const book = jsonfile.readFileSync(path);
  const bookIndex = book.findIndex(({ id }) => id == req.params.id);


  if(bookIndex === -1) {
      res.send('book not found');
      return;
  }

  const targetBook = book[bookIndex];

  book[bookIndex] = {
      id: targetBook.id,
      name: req.body.name ?? targetBook.name,
      giveDate: req.body.giveDate ?? targetBook.data1,
      backDate: req.body.backDate ?? targetBook.data2,
      author: req.body.author ?? targetBook.author,
      year: req.body.year ?? targetBook.year
  }

  jsonfile.writeFileSync(path, book, { spaces: 2 });
  return res.status(200).json({
      status: "success",
      message: "book has been edited"
  })

})
//Go the SERVERs
server.listen(port, () => {
  console.log('\x1b[35m%s\x1b[0m', `The server is running on the port ${port}`);
  console.log('\x1b[32m%s\x1b[0m', `http://localhost:${port}/`);
  // console.log(`Worker ${cluster.worker.id} launched`);
});

