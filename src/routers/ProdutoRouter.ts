import BaseRoutes from "./BaseRouter";
import ProdutoController from "../controllers/ProdutoController";
import { logado } from "../middleware/Autenticacao";

class ProdutoRoutes extends BaseRoutes {
  public routes(): void {
    this.router
      .route("/")
      .post(logado, ProdutoController.adicionar)
      .get(logado, ProdutoController.listarTodos);

    this.router
      .route("/abaixoDoEstoque")
      .get(logado, ProdutoController.abaixoDoEstoque)

    this.router
      .route("/totalEmEstoque")
      .get(logado, ProdutoController.totalEmEstoque)

    this.router
      .route("/:id")
      .put(logado, ProdutoController.atualizar)
      .get(logado, ProdutoController.obterPorId)
      .delete(logado, ProdutoController.excluir);
  }
}

export default new ProdutoRoutes().router;
