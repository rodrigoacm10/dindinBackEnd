import BaseRoutes from "./BaseRouter";
import CategoriaDespesaController from "../controllers/CategoriaDespesaController";
import { logado } from "../middleware/Autenticacao";

class CategoriaDespesaRoutes extends BaseRoutes {
  public routes(): void {
    this.router
      .route("/")
      .post(logado, CategoriaDespesaController.adicionar)
      .get(logado, CategoriaDespesaController.listarTodos);

    this.router
      .route("/:id")
      .get(logado, CategoriaDespesaController.obterPorId)
      .put(logado, CategoriaDespesaController.atualizar)
      .delete(logado, CategoriaDespesaController.excluir);
  }
}

export default new CategoriaDespesaRoutes().router;
