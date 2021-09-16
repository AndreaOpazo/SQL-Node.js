import data from './data';
import { Product, Message } from './types';
import fs from 'fs/promises';

class Utils {
  static getAllProducts() {
    return data;
  };

  static getProductByID(id: number) {
    return data.find((product: Product) => product.id === id)
  };

  static saveProduct(product: Product) {
    let id = 1;
    if (data.length) {
      const productIds = data.map(product => product.id);
      id = Math.max(...productIds) + 1;
    }
    product['id'] = id;
    data.push(product);
  };

  static updateProduct(product: Product, id: number) {
    const productIndexToUpdate = data.findIndex((product: Product) => product.id === id);
    if (productIndexToUpdate !== -1) {
      data[productIndexToUpdate] = {...product, id};
      return product;
    } else {
      return { error: 'Producto no encontrado.' };
    };
  };

  static deleteProduct(id: number) {
    const productIndexToDelete = data.findIndex((product: Product) => product.id === id);
    if (productIndexToDelete !== -1) {
      const productToDelete = data[productIndexToDelete];
      data.splice(productIndexToDelete, 1);
      return productToDelete;
    } else {
      return { error: 'Producto no encontrado.' };
    };
  };
};

export const getMessages = async () => {
  try {
    const messageListFileContent = await fs.readFile('./messages.txt', 'utf-8');
    return JSON.parse(messageListFileContent);
  } catch (error) {
    return [];
  };
};

export const updateMessagesTxt = async (messages: Message[]) => {
  try {
    await fs.writeFile('./messages.txt', JSON.stringify(messages))
  } catch (error) {
    console.error("Se produjo un error al guardar el archivo.", error);
  }
};

export default Utils;