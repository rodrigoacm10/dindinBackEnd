import BaseRoutes from "./BaseRouter";
import { login } from "../middleware/Autenticacao";

class AutenticacaoRoutes extends BaseRoutes {
  public routes(): void {
    this.router.route("/").post(login);
  }
}

export default new AutenticacaoRoutes().router;
