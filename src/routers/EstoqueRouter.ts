import BaseRoutes from "./BaseRouter";
import EstoqueController from "../controllers/EstoqueController";
import { logado } from "../middleware/Autenticacao";
import { Estoque } from "../models/Estoque";

class EstoqueRoutes extends BaseRoutes {
  public routes(): void {
    this.router
      .route("/")
      .post(logado, EstoqueController.adicionar)
      .get(logado, EstoqueController.listarTodos);

    this.router
      .route('/entradaUltimosSeteDias')
      .get(logado, EstoqueController.entradaUltimosSeteDias);
    
    this.router
      .route('/totalNaoRecebido')
      .get(logado, EstoqueController.totalNaoRecebido);

    this.router
      .route('/indicadores')
      .get(logado, EstoqueController.indicadoresEstoque);

    this.router
      .route('/estoquePeriodo')
      .get(logado, EstoqueController.entradaEstoquePeriodo)

    this.router
      .route('/compraFornecedorPeriodo')
      .get(logado, EstoqueController.comprasFornecedorPeriodo)

    this.router
      .route('/marcaProdutoPeriodo')
      .get(logado, EstoqueController.marcaProdutoPeriodo)
      
    this.router
      .route('/entradaProdutoPeriodo')
      .get(logado, EstoqueController.entradaProdutoPeriodo)
    
    this.router
      .route('/entradaCategoriaProdutoPeriodo')
      .get(logado, EstoqueController.entradaCategoriaProdutoPeriodo)

    this.router
      .route('/entradaSaidaProdutoPeriodo')
      .get(logado, EstoqueController.entradaSaidaProdutosPeriodo)
      
    this.router
      .route('/estoquePorFornecedorPeriodo')
      .get(logado, EstoqueController.estoquePorFornecedorPeriodo)
       
    this.router
      .route("/:id")
      .put(logado, EstoqueController.atualizar)
      .get(logado, EstoqueController.obterPorId)
      .delete(logado, EstoqueController.excluir);
  }
}

export default new EstoqueRoutes().router;
