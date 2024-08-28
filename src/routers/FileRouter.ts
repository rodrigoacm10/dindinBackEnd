import BaseRoutes from "./BaseRouter";
import FileController from "../controllers/FilesController";
import { logado } from "../middleware/Autenticacao";

class FileRoutes extends BaseRoutes {
  public routes(): void {
    this.router.route("/upload").post(logado, FileController.upload);

    this.router
      .route("/:filename")
      .get(logado, FileController.getFile)
      .delete(logado, FileController.removeFileByRoute);
  }
}

export default new FileRoutes().router;
