import express, { Request, Response } from "express";
import handlebars from "express-handlebars";
import http from "http";
import path from "path";
import { Server }from "socket.io";
import { Message } from "./types";
import Utils, { getMessages, updateMessagesTxt } from './utils';

const app = express();
const router = express.Router();
const server = http.createServer(app);
const ioServer = new Server(server);

server.listen(8080, () => {
  console.log("Server ON");
});

server.on("error", () => {
  console.log("Error iniciando el server");
});

const ENGINE_NAME = "hbs";

app.engine(
  ENGINE_NAME,
  handlebars({
    extname: `.${ENGINE_NAME}`, // extension de la plantilla
    layoutsDir: `${__dirname}/views/layouts`, // ruta de plantilla principal
    defaultLayout: "index.hbs", // plantilla principal
  })
);

app.set("view engine", ENGINE_NAME);
app.set("views", "./views"); 

// se indica la ruta que tendra los archivos estaticos. 
// en public tenemos esos archivos
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api', router);

app.get("/", (_req: Request, res: Response) => {
  res.sendFile("index.html", { root: path.join(__dirname, './public') });
});

let messages: Message[] = [];
ioServer.on("connection", async (socket) => {
  socket.emit("productList", Utils.getAllProducts());
  socket.emit("messageList", await getMessages());
  messages = await getMessages();
  socket.on("new-message", async (data) => {
    messages.push(data);
    await updateMessagesTxt(messages);
    ioServer.sockets.emit("messageList", await getMessages());
  });
});

app.get("/productos/vista", (_: Request, res: Response) => {
  const data = Utils.getAllProducts();
  res.render("main.hbs", { data });
});

router.get('/productos/listar', (_: Request, res: Response) => {
  const products = Utils.getAllProducts();
  res.json(products.length ? products : { error: 'No hay productos cargados.' });
});

router.get('/productos/listar/:id', (req: Request, res: Response) => {
  const product = Utils.getProductByID(Number(req.params.id));
  res.json(product ?? { error: 'Producto no encontrado.' });
});

router.post('/productos/guardar', (req: Request, res: Response) => {
  Utils.saveProduct(req.body);
  const products = Utils.getAllProducts();
  ioServer.sockets.emit("productList", products);
  res.redirect('/');
});

router.put('/productos/actualizar/:id',(req: Request, res: Response) => {
  const updatedProduct = Utils.updateProduct(req.body, Number(req.params.id));
  res.send(updatedProduct);
});

router.delete('/productos/borrar/:id', (req: Request, res: Response) => {
  const deletedProduct = Utils.deleteProduct(Number(req.params.id));
  res.send(deletedProduct);
});