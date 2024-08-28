import { Sequelize } from "sequelize-typescript";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config();

class Database {
  public sequelize: Sequelize | undefined;

  private POSTGRES_DB = process.env.POSTGRES_DB as string;
  private POSTGRES_HOST = process.env.POSTGRES_HOST as string;
  private POSTGRES_PORT = process.env.POSTGRES_PORT as unknown as number;
  private POSTGRES_USER = process.env.POSTGRES_USER as unknown as string;
  private POSTGRES_PASSWORD = process.env
    .POSTGRES_PASSWORD as unknown as string;

  constructor() {
    this.connectToPostgreSQL();
  }

  private async connectToPostgreSQL() {
    const modelsPath = path.join(__dirname, "../models");
    // const modelsPath2 = path.join(__dirname, "../models/usuario");
    this.sequelize = new Sequelize({
      database: this.POSTGRES_DB,
      username: this.POSTGRES_USER,
      password: this.POSTGRES_PASSWORD,
      host: this.POSTGRES_HOST,
      port: this.POSTGRES_PORT,
      dialect: "postgres",
      models: [modelsPath],
      //   logging: false
    });

    await this.sequelize
      .authenticate()
      .then(async () => {
        console.log("✅ Conectado ao banco com sucesso.");
      })
      .catch((err: any) => {
        console.error(
          "❌ Não foi possível realizar a conexão com o banco",
          err
        );
      });
  }
}

export default Database;
