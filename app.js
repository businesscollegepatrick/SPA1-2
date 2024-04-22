// app.js (Node.js)

const http = require('http');
const fs = require('fs');
const path = require('path');
const { parse } = require('querystring');

// Function to serve HTML file
function serveHTML(filePath, res) {
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500);
      res.end('Internal Server Error');
    } else {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(content, 'utf-8');
    }
  });
}

// Function to serve JSON data
function serveJSON(filePath, res) {
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500);
      res.end('Internal Server Error');
    } else {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(content, 'utf-8');
    }
  });
}

// Function to handle requests
function handleRequest(req, res) {
  const { url, method } = req;
  let filePath = '';

  if (url === '/') {
    filePath = 'index.html';
    serveHTML(filePath, res);
  } else if (url === '/kategoriat') {
    filePath = 'categories.json';
    serveJSON(filePath, res);
  } else if (url === '/tuotteet') {
    filePath = 'products.json';
    serveJSON(filePath, res);
  } else if (url === '/poista') {
    filePath = 'delete.html';
    serveHTML(filePath, res);
  } else if (url === '/poista' && method === 'POST') {
    collectRequestData(req, (data) => {
      const productId = data.productId;
  
      // Lue tuotteet JSON-tiedostosta
      fs.readFile('products.json', 'utf8', (err, content) => {
        if (err) {
          console.error('Virhe luettaessa tiedostoa: ', err);
          res.writeHead(500);
          res.end('Internal Server Error');
          return;
        }
  
        let products = JSON.parse(content);
  
        // Etsi ja poista tuote annetulla productId:llä
        const updatedProducts = products.filter(product => product.id !== productId);
  
        // Kirjoita päivitetyt tuotteet takaisin JSON-tiedostoon
        fs.writeFile('products.json', JSON.stringify(updatedProducts, null, 2), (err) => {
          if (err) {
            console.error('Virhe kirjoitettaessa tiedostoa: ', err);
            res.writeHead(500);
            res.end('Internal Server Error');
            return;
          }
  
          console.log('Tuote poistettu onnistuneesti!');
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Product deleted successfully' }));
        });
      });
    });
  } else if (url === '/poista') {
    // Käsittele täällä GET-pyynnöt, jotka pyytävät poisto-sivua
    filePath = 'delete.html';
    serveHTML(filePath, res);  
  } else if (url === '/lisaa') { // Updated route to handle both GET and POST requests
    if (method === 'GET') {
      filePath = 'lisaa.html'; // Serve the add product form
      serveHTML(filePath, res);
    } else if (method === 'POST') {
      collectRequestData(req, (data) => {
        // Assuming products.json contains an array of products
        fs.readFile('products.json', 'utf8', (err, content) => {
          if (err) {
            res.writeHead(500);
            res.end('Internal Server Error');
            return;
          }

          const products = JSON.parse(content);
          products.push(data); // Assuming data is an object representing the new product

          // Write the updated products array back to the file
          fs.writeFile('products.json', JSON.stringify(products), (err) => {
            if (err) {
              res.writeHead(500);
              res.end('Internal Server Error');
              return;
            }

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Product added successfully' }));
          });
        });
      });
    }
  } else {
    res.writeHead(404);
    res.end('File Not Found');
  }
}

// Function to collect request data
function collectRequestData(req, callback) {
  let body = '';
  req.on('data', (chunk) => {
    body += chunk.toString();
  });
  req.on('end', () => {
    callback(parse(body));
  });
}

// Create a server and listen on port 3000
const server = http.createServer(handleRequest);
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});