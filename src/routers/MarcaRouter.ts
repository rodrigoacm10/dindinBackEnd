import BaseRoutes from "./BaseRouter";
import MarcaController from "../controllers/MarcaController";
import { logado } from "../middleware/Autenticacao";

class MarcaRoutes extends BaseRoutes {
  public routes(): void {
    this.router
      .route("/")
      .post(logado, MarcaController.adicionar)
      .get(logado, MarcaController.listarTodos);

    this.router
      .route("/:id")
      .get(logado, MarcaController.obterPorId)
      .put(logado, MarcaController.atualizar)
      .delete(logado, MarcaController.excluir);
  }
}

export default new MarcaRoutes().router;
