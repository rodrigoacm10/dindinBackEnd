import BaseRoutes from "./BaseRouter";
import CategoriaReceitaController from "../controllers/CategoriaReceitaController";
import { logado } from "../middleware/Autenticacao";

class CategoriaReceitaRoutes extends BaseRoutes {
  public routes(): void {
    this.router
      .route("/")
      .post(logado, CategoriaReceitaController.adicionar)
      .get(logado, CategoriaReceitaController.listarTodos);

    this.router
      .route("/:id")
      .get(logado, CategoriaReceitaController.obterPorId)
      .put(logado, CategoriaReceitaController.atualizar)
      .delete(logado, CategoriaReceitaController.excluir);
  }
}

export default new CategoriaReceitaRoutes().router;
