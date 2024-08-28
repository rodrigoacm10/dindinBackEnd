import BaseRoutes from "./BaseRouter";
import CategoriaProdutoController from "../controllers/CategoriaProdutoController";
import { logado } from "../middleware/Autenticacao";

class CategoriaProdutoRoutes extends BaseRoutes {
  public routes(): void {
    this.router
      .route("/")
      .post(logado, CategoriaProdutoController.adicionar)
      .get(logado, CategoriaProdutoController.listarTodos);

    this.router
      .route("/:id")
      .get(logado, CategoriaProdutoController.obterPorId)
      .put(logado, CategoriaProdutoController.atualizar)
      .delete(logado, CategoriaProdutoController.excluir);
  }
}

export default new CategoriaProdutoRoutes().router;
