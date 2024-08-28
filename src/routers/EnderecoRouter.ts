import BaseRoutes from "./BaseRouter";
import EnderecoController from "../controllers/EnderecoController";
import { logado } from "../middleware/Autenticacao";

class EnderecoRoutes extends BaseRoutes {
  public routes(): void {
    this.router
      .route("/")
      .post(logado, EnderecoController.adicionar)

    this.router
      .route("/:id")
      .get(logado, EnderecoController.obterPorFornecedor)
      .put(logado, EnderecoController.atualizar)
      .delete(logado, EnderecoController.excluir);

  }
}

export default new EnderecoRoutes().router;
