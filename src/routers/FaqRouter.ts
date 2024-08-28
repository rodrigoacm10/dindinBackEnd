import BaseRoutes from "./BaseRouter";
import FaqController from "../controllers/FaqController";
import { autorizado, logado } from "../middleware/Autenticacao";

class FaqRoutes extends BaseRoutes {
  public routes(): void {
    this.router
      .route("/")
      .post(logado, autorizado, FaqController.adicionar)
      .get(logado, FaqController.listarTodos);

    this.router
      .route("/:id")
      .put(logado, autorizado, FaqController.atualizar)
      .delete(logado, autorizado, FaqController.excluir)
      .get(logado, FaqController.listarUm);
  }
}

export default new FaqRoutes().router;
