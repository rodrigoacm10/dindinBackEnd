//https://blog.logrocket.com/how-to-set-up-node-typescript-express/
import express, { Application, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import Database from "./config/database";
import * as routes from "./routers/Routes";

class App {
  public app: Application;

  constructor() {
    this.app = express();
    this.databaseSync();
    this.plugins();
    this.routes();
  }

  protected plugins(): void {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    //helmet -> utilizado para segurança da aplicação, protege contra a maioria das vulnerabilidades mais comuns
    this.app.use(
      helmet({
        crossOriginEmbedderPolicy: false,
      })
    );
    this.app.use(cors());
  }

  protected databaseSync(): void {
    const db = new Database();
    db.sequelize?.sync();
  }

  protected routes(): void {
    this.app.route("/").get((req: Request, res: Response) => {
      res.send("I'm watching you!");
    });

    this.app.use((req, res, next) => {
      res.removeHeader("Cross-Origin-Resource-Policy");
      res.removeHeader("Cross-Origin-Embedder-Policy");
      next();
    });

    //Rotas existentes na aplicação que podem ser consumidas
    this.app.use("/usuario", routes.UsuarioRoutes);
    this.app.use("/login", routes.AutenticacaoRoutes);
    this.app.use("/receita", routes.ReceitaRoutes);
    this.app.use("/despesa", routes.DespesaRoutes);
    this.app.use("/categoria/despesa", routes.CategoriaDespesaRoutes);
    this.app.use("/categoria/receita", routes.CategoriaReceitaRoutes);
    this.app.use("/faq", routes.FaqRoutes);
    this.app.use("/produto", routes.ProdutoRoutes);
    this.app.use("/servico", routes.ServicoRoutes);
    this.app.use("/cliente", routes.ClienteRoutes);
    this.app.use("/receitaedespesa", routes.ReceitaEDespesaRoutes);
    this.app.use("/files", routes.FileRoutes);
    this.app.use("/export", routes.ExportRoutes);
    this.app.use("/resetarsenha", routes.ResetarSenhaRoutes);
    this.app.use("/categoria/produto", routes.CategoriaProdutoRoutes);
    this.app.use("/fornecedor/endereco", routes.EnderecoRoutes);
    this.app.use("/fornecedor", routes.FornecedorRoutes);
    this.app.use("/marca", routes.MarcaRoutes);
    this.app.use("/estoque", routes.EstoqueRoutes);
    this.app.use("/vendas", routes.VendasRoutes);
  }
}

const port: number = 3000;
const app = new App().app;

app.listen(port, () => {
  console.log("✅ Servidor iniciado com sucesso!");
});
