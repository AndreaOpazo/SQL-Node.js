import { Product, Message } from './types';
import { Knex } from "knex";
import { options } from "./options/SQLite3";
import { optionsMaria } from './DB/mariaDB';

const knex = require('knex')(options); //SQLite3
const knexMaria = require('knex')(optionsMaria); //mariaDB


class Utils {
  static async createTableProducts() {
    const tableName = "products";
    const exists = await knexMaria.schema.hasTable(tableName);
    if (!exists) {
      await knexMaria.schema.createTable(tableName, (table: Knex.TableBuilder) => {
        table.string("title", 20).notNullable();
        table.float("price");
        table.string("thumbnail");
        table.increments("id", { primaryKey: true }).notNullable();
      });
    }
  };

  static async getAllProducts() {
    const tableName = "products";
    try {
      await this.createTableProducts();
      return await knexMaria.from(tableName).select("*");
    } catch (error) {
      console.error(error);
    };
  };

  static async getProductByID(id: number) {
    try {
      return await knexMaria.from("products").where("id", id).first();
    } catch (error) {
      console.error(error);
    };
  };

  static async saveProduct(product: Product) {
    try {
      await knexMaria("products").insert(product);
    } catch (error) {
      console.error(error);
    };
  };

  static async updateProduct(product: Product, id: number) {
    const tableName = "products";
    try {
      await knexMaria(tableName).where("id", id).update(product);
      return await knexMaria.from(tableName).where("id", id).first();
    } catch (error) {
      return { error: 'Producto no encontrado.' };
    };
  };

  static async deleteProduct(id: number) {
    const tableName = "products";
    try {
      const productToDelete = await knexMaria.from(tableName).where("id", id).first();
      await knexMaria.from(tableName).where("id", id).del();
      if (productToDelete.length === 0) throw new Error();
      return productToDelete;
    } catch (error) {
      return { error: 'Producto no encontrado.' };
    };
  };
};

//Las funciones a continuacion, son para los messages
export const createTable = async () => {
  const tableName = "messages";
  const exists = await knex.schema.hasTable(tableName);
  if (!exists) {
    await knex.schema.createTable(tableName, (table: Knex.TableBuilder) => {
      table.string("emailUser").notNullable();
      table.string("text").notNullable();
      table.timestamp("date").defaultTo(knex.fn.now());
    });
  }
}

export const getMessages = async () => {
  const tableName = "messages";
  try {
    await createTable();
    return await knex.from(tableName).select("*");
  } catch (error) {
    console.error(error);
  }
};

export const updateMessages = async (message: Message[]) => {
  try {
    await knex("messages").insert(message);
  } catch (error) {
    console.error(error);
  }
};

export default Utils;