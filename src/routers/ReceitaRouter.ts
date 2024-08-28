import BaseRoutes from "./BaseRouter";
import ReceitaController from "../controllers/ReceitaController";
import { logado } from "../middleware/Autenticacao";

class ReceitaRoutes extends BaseRoutes {
  public routes(): void {
    this.router
      .route("/")
      .post(logado, ReceitaController.adicionar)
      .get(logado, ReceitaController.listarTodos);

    // this.router
    //   .route("/efetuado")
    //   .get(logado, ReceitaController.listarReceitaEfetuada);

    this.router
      .route("/relatoriomes")
      .get(logado, ReceitaController.relatoriosPorMes);

    this.router
      .route("/relatoriodia")
      .get(logado, ReceitaController.relatoriosPorDia);

    this.router
      .route("/relatorio7dias")
      .get(logado, ReceitaController.relatorios7Dias);

    this.router
      .route("/relatoriocategoria")
      .get(logado, ReceitaController.relatoriosCategoria);

    this.router
      .route("/:id")
      //.route("/:id(/^[0-9]{1,}$/)")
      .put(logado, ReceitaController.atualizar)
      .get(logado, ReceitaController.obterPorId)
      //.put(ReceitaController.atualizar)
      .delete(logado, ReceitaController.excluir);

    this.router
      .route("/:quantidade/:pagina")
      .get(logado, ReceitaController.paginacao);
  }
}

export default new ReceitaRoutes().router;
