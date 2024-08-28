import BaseRoutes from "./BaseRouter";
import ClienteController from "../controllers/ClienteController";
import { logado } from "../middleware/Autenticacao";

//Rotas da opção CLIENTE que o usuario pode adicionar dentro da aplicação
class ClienteRoutes extends BaseRoutes {
  public routes(): void {
    this.router
      .route("/")
      .post(logado, ClienteController.adicionar)
      .get(logado, ClienteController.listarTodos);

    this.router
      .route("/:id")
      .put(logado, ClienteController.atualizar)
      .get(logado, ClienteController.obterPorId)
      .delete(logado, ClienteController.excluir);
  }
}

export default new ClienteRoutes().router;
