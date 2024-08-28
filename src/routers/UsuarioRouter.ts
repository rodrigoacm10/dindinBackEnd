import BaseRoutes from "./BaseRouter";
import UsuarioController from "../controllers/UsuarioController";
import { logado } from "../middleware/Autenticacao";

class UsuarioRoutes extends BaseRoutes {
  public routes(): void {
    this.router
      .route("/")
      .post(UsuarioController.adicionar)
      .put(logado, UsuarioController.atualizar)
      //.get(UsuarioController.listarTodos)
      .get(logado, UsuarioController.obterPorId)
      .delete(logado, UsuarioController.excluir);

    this.router.route("/:id");
    //.get(UsuarioController.obterPorId)
    //.put(logado, UsuarioController.atualizar)
    //.delete(UsuarioController.excluir);

    //this.router.route("/login").post(login);
  }
}

export default new UsuarioRoutes().router;
