const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

const categories = JSON.parse(fs.readFileSync('categories.json', 'utf8'));

app.get('/', (req, res) => {
  const homePage = fs.readFileSync('templates/home.html', 'utf8');
  res.send(homePage);
});

app.get('/kategoriat', (req, res) => {
  res.json(categories);
});

app.get('/tuotteet', (req, res) => {
  const category = req.query.category;
  let products = [];

  if (category) {
    const productsData = JSON.parse(fs.readFileSync('products.json', 'utf8'));
    products = productsData.filter(product => product.category === category);
  } else {
    products = JSON.parse(fs.readFileSync('products.json', 'utf8'));
  }

  res.json(products);
});

app.get('/tuote/:id', (req, res) => {
  const productId = req.params.id;
  const products = JSON.parse(fs.readFileSync('products.json', 'utf8'));
  const product = products.find(product => product.id === productId);

  if (!product) {
    res.status(404).send('Tuotetta ei löytynyt');
  } else {
    res.json(product);
  }
});

app.get('/lisaa', (req, res) => {
  const addProductForm = fs.readFileSync('templates/lisaa.html', 'utf8');
  res.send(addProductForm);
});

app.post('/lisaa', (req, res) => {
  const newProduct = req.body;
  const products = JSON.parse(fs.readFileSync('products.json', 'utf8'));
  products.push(newProduct);
  fs.writeFileSync('products.json', JSON.stringify(products, null, 2));
  res.redirect('/');
});

app.get('/poista', (req, res) => {
  const deleteProductForm = fs.readFileSync('templates/poista.html', 'utf8');
  res.send(deleteProductForm);
});

app.post('/poista', (req, res) => {
  const productId = req.body.id;
  let products = JSON.parse(fs.readFileSync('products.json', 'utf8'));
  products = products.filter(product => product.id !== productId);
  fs.writeFileSync('products.json', JSON.stringify(products, null, 2));
  res.redirect('/');
});

app.listen(PORT, () => {
  console.log(`Palvelin löytyy kirjoittamalla localhost:${PORT}`);
});
