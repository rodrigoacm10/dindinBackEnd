import { enviarEmail } from "../middleware/EnviarEmail";
import BaseRoutes from "./BaseRouter";
import UsuarioController from "../controllers/UsuarioController";

class ResetarSenhaRoutes extends BaseRoutes {
  public routes(): void {
    this.router.route("/").post(enviarEmail);

    this.router.route("/alterarsenha").post(UsuarioController.recuperarSenha);
  }
}

export default new ResetarSenhaRoutes().router;
