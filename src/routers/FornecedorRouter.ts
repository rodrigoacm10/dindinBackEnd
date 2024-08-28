import BaseRoutes from "./BaseRouter";
import FornecedorController from "../controllers/FornecedorController";
import { logado } from "../middleware/Autenticacao";

class FornecedorRoutes extends BaseRoutes {
  public routes(): void {
    this.router
      .route("/")
      .post(logado, FornecedorController.adicionar)
      .get(logado, FornecedorController.listarTodos);

    this.router
      .route("/:id")
      .get(logado, FornecedorController.obterPorId)
      .put(logado, FornecedorController.atualizar)
      .delete(logado, FornecedorController.excluir);

  }
}

export default new FornecedorRoutes().router;
