import BaseRoutes from "./BaseRouter";
import { logado } from "../middleware/Autenticacao";
import VendasController from "../controllers/VendasController";

class VendasRoutes extends BaseRoutes {
  public routes(): void {
    this.router
      .route("/")
      .post(logado, VendasController.adicionar)
      .get(logado, VendasController.listarTodos);

    this.router.route("/indicadores").get(logado, VendasController.indicadores);

    this.router
      .route("/vendasPeriodoComPaginacao")
      .get(logado, VendasController.vendasNoPeriodoComPaginacao);

    this.router
      .route("/vendasPeriodoSemPaginacao")
      .get(logado, VendasController.vendasNoPeriodoSemPaginacao);

    this.router
      .route("/produtoPorCliente")
      .get(logado, VendasController.ranqueamentoDeProdutoPorCliente);

    this.router
      .route("/clientePorProduto")
      .get(logado, VendasController.ranqueamentoDeClientePorProduto);

    this.router
      .route("/totalComprasCliente")
      .get(logado, VendasController.totalComprasCliente);

    this.router
      .route("/totalDeClientesPorProduto")
      .get(logado, VendasController.totalDeClientesPorProduto);

    this.router
      .route("/unidadesVendidasPorPeriodo")
      .get(logado, VendasController.unidadesVendidasPeriodo);

    this.router
      .route("/:id")
      .put(logado, VendasController.atualizar)
      .delete(logado, VendasController.excluir)
      .get(logado, VendasController.obterPorId);
  }
}

export default new VendasRoutes().router;
