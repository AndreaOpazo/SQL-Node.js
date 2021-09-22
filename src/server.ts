import express, { Request, Response } from "express";
import handlebars from "express-handlebars";
import http from "http";
import path from "path";
import { Server }from "socket.io";
import Utils, { getMessages, updateMessages } from './utils';

const app = express();
const router = express.Router();
const server = http.createServer(app);
const ioServer = new Server(server);
const port = 8080;

server.listen(port, () => {
  console.log(`Server escuchando en port ${port}`);
});

server.on("error", () => {
  console.log("Error iniciando el server");
});

const ENGINE_NAME = "hbs";

app.engine(
  ENGINE_NAME,
  handlebars({
    extname: `.${ENGINE_NAME}`,
    layoutsDir: path.join(__dirname, './views/layouts'),
    defaultLayout: path.join(__dirname, './views/layouts/index.hbs'), 
  })
);

app.set("view engine", ENGINE_NAME);
app.set("views", path.join(__dirname, './views')); 

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api', router);

app.get("/", (_req: Request, res: Response) => {
  res.sendFile("index.html", { root: path.join(__dirname, './public') });
});

ioServer.on("connection", async (socket) => {
  socket.emit("productList", await Utils.getAllProducts());
  socket.emit("messageList", await getMessages());
  socket.on("new-message", async (data) => {
    await updateMessages(data);
    ioServer.sockets.emit("messageList", await getMessages());
  });
});

app.get("/productos/vista", async (_: Request, res: Response) => {
  const data = await Utils.getAllProducts();
  res.render("main.hbs", { data });
});

router.get('/productos/listar', async (_: Request, res: Response) => {
  const products = await Utils.getAllProducts();
  res.json(products.length > 0 ? products : { error: 'No hay productos cargados.' });
});

router.get('/productos/listar/:id', async (req: Request, res: Response) => {
  const product = await Utils.getProductByID(Number(req.params.id));
  res.json(product ? product : { error: 'Producto no encontrado.' } );
});

router.post('/productos/guardar', async (req: Request, res: Response) => {
  Utils.saveProduct(req.body);
  const products = await Utils.getAllProducts();
  ioServer.sockets.emit("productList", products);
  res.redirect('/');
});

router.put('/productos/actualizar/:id', async (req: Request, res: Response) => {
  const updatedProduct = await Utils.updateProduct(req.body, Number(req.params.id));
  if (updatedProduct.id) {
    const products = await Utils.getAllProducts();
    ioServer.sockets.emit("productList", products);
  }
  res.send(updatedProduct);
});

router.delete('/productos/borrar/:id', async (req: Request, res: Response) => {
  const deletedProduct = await Utils.deleteProduct(Number(req.params.id));
  if (deletedProduct.id) {
    const products = await Utils.getAllProducts();
    ioServer.sockets.emit("productList", products);
  }
  res.send(deletedProduct);
});