import BaseRoutes from "./BaseRouter";
import ReceitaEDespesaController from "../controllers/ReceitaEDespesaController";
import { logado } from "../middleware/Autenticacao";

class ReceitaEDespesaRoutes extends BaseRoutes {
  public routes(): void {
    this.router.route("/").get(logado, ReceitaEDespesaController.listarTodos);

    this.router
      .route("/valores")
      .get(logado, ReceitaEDespesaController.listarTodosComValores);

    this.router
      .route("/relatoriomes")
      .get(logado, ReceitaEDespesaController.relatoriosPorMes);

    this.router
      .route("/relatoriodia")
      .get(logado, ReceitaEDespesaController.relatoriosPorDia);

    this.router
      .route("/relatorio7dias")
      .get(logado, ReceitaEDespesaController.relatorios7Dias);

    // this.router
    //   .route("/efetuado")
    //   .get(logado, ReceitaController.listarReceitaEfetuada);

    // this.router
    //   .route("/:id")
    //   //.route("/:id(/^[0-9]{1,}$/)")
    //   .put(logado, ReceitaController.atualizar)
    //   .get(logado, ReceitaController.obterPorId)
    //   //.put(ReceitaController.atualizar)
    //   .delete(logado, ReceitaController.excluir);

    // this.router
    //   .route("/:quantidade/:pagina")
    //   .get(logado, ReceitaController.paginacao);
  }
}

export default new ReceitaEDespesaRoutes().router;
