import BaseRoutes from "./BaseRouter";
import ServicoController from "../controllers/ServicoController";
import { logado } from "../middleware/Autenticacao";

class ServicoRoutes extends BaseRoutes {
  public routes(): void {
    this.router
      .route("/")
      .post(logado, ServicoController.adicionar)
      .get(logado, ServicoController.listarTodos);

    this.router
      .route("/:id")
      .put(logado, ServicoController.atualizar)
      .delete(logado, ServicoController.excluir)
      .get(logado, ServicoController.obterPorId);
  }
}

export default new ServicoRoutes().router;
