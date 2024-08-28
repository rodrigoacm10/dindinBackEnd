import BaseRoutes from "./BaseRouter";
import DespesaController from "../controllers/DespesaController";
import { logado } from "../middleware/Autenticacao";

class DespesaRoutes extends BaseRoutes {
  public routes(): void {
    this.router
      .route("/")
      .post(logado, DespesaController.adicionar)
      .get(logado, DespesaController.listarTodos);

    // this.router
    //   .route("/efetuado")
    //   .get(logado, DespesaController.listarDespesaEfetuada);
    this.router
      .route("/parcelasValores")
      .get(logado, DespesaController.parcelasValores);

    this.router
      .route("/relatoriomes")
      .get(logado, DespesaController.relatoriosPorMes);

    this.router
      .route("/relatoriodia")
      .get(logado, DespesaController.relatoriosPorDia);

    this.router
      .route("/relatorio7dias")
      .get(logado, DespesaController.relatorios7Dias);

    this.router
      .route("/relatoriocategoria")
      .get(logado, DespesaController.relatoriosCategoria);

    this.router
      .route("/:id")
      .get(logado, DespesaController.obterPorId)
      .put(logado, DespesaController.atualizar)
      .delete(logado, DespesaController.excluir);

    this.router
      .route("/:quantidade/:pagina")
      .get(logado, DespesaController.paginacao);
  }
}

export default new DespesaRoutes().router;
