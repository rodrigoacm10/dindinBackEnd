import BaseRoutes from "./BaseRouter";
import ExportController from "../controllers/ExportController";
import { logado } from "../middleware/Autenticacao";

class ExportRoutes extends BaseRoutes {
  public routes(): void {
    this.router
      .route("/")
      .get(ExportController.ExportarTransacoes.bind(ExportController));
    //.get(logado, ExportController.ExportarTransacoes.bind(ExportController)); // <- rota correta na versao final. Verificar se o usuario ta logado
  }
}

export default new ExportRoutes().router;
