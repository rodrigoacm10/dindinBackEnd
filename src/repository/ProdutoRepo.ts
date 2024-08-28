import {
  QueryTypes,
  Sequelize,
  Op,
  Transaction,
  ValidationError,
  literal,
} from "sequelize";
import { Produto } from "../models/Produto";

import HttpStatusCode from "../utils/HttpStatusCodes";
import { objetoDeComunicacao } from "../utils/ObjetoDeComunicacao";

interface IProdutoRepo {
  adicionar(produto: Produto): Promise<objetoDeComunicacao>;
  atualizar(
    produto: Produto,
    transaction: Transaction | null
  ): Promise<objetoDeComunicacao>;
  excluir(produtoId: number): Promise<objetoDeComunicacao>;
  obterPorId(
    produtoId: number,
    transaction: Transaction | null
  ): Promise<objetoDeComunicacao>;
  listarTodos(usuarioId: string): Promise<objetoDeComunicacao>;
}

export class ProdutoRepo implements IProdutoRepo {
  async adicionar(produto: Produto): Promise<objetoDeComunicacao> {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {
      await Produto.create({
        nome: produto.nome,
        condicao: produto.condicao,
        codigo_referencia: produto.codigo_referencia,
        estoque_maximo: produto.estoque_maximo,
        estoque_minimo: produto.estoque_minimo,
        estoque_atual: produto.estoque_atual,
        preco: produto.preco,
        observacao: produto.observacao,
        usuario_id: produto.usuario_id,
        categoria_produto_id: produto.categoria_produto_id,
        marca_id: produto.marca_id,
        fornecedor_id: produto.fornecedor_id,
        valor_custo: produto.valor_custo,
        margem_lucro: produto.margem_lucro,
      });
      resultado.HttpConstruirRetorno(HttpStatusCode.SuccessCreated);
      return resultado;
    } catch (error: unknown) {
      console.log(error);
      if (error instanceof objetoDeComunicacao) resultado = error;
      else if (error instanceof ValidationError) {
        resultado.HttpConstruirRetorno(HttpStatusCode.ClientErrorBadRequest);
      } else
        resultado = new objetoDeComunicacao(HttpStatusCode.ServerErrorInternal);
      throw resultado;
    }
  }

  async atualizar(
    produto: Produto,
    transaction: Transaction | null = null
  ): Promise<objetoDeComunicacao> {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    const options = transaction ? { transaction } : {};
    try {
      const produtoExistente = await Produto.findByPk(produto.id);
      if (!produtoExistente) {
        throw new objetoDeComunicacao(HttpStatusCode.ClientErrorNotFound);
      }

      produtoExistente.nome =
        produto.nome !== undefined ? produto.nome : produtoExistente.nome;

      produtoExistente.condicao =
        produto.condicao !== undefined
          ? produto.condicao
          : produtoExistente.condicao;

      produtoExistente.codigo_referencia =
        produto.codigo_referencia !== undefined
          ? produto.codigo_referencia
          : produtoExistente.codigo_referencia;

      produtoExistente.estoque_atual =
        produto.estoque_atual !== undefined
          ? produto.estoque_atual
          : produtoExistente.estoque_atual;

      produtoExistente.estoque_maximo =
        produto.estoque_maximo !== undefined
          ? produto.estoque_maximo
          : produtoExistente.estoque_maximo;

      produtoExistente.estoque_minimo =
        produto.estoque_minimo !== undefined
          ? produto.estoque_minimo
          : produtoExistente.estoque_minimo;

      produtoExistente.preco =
        produto.preco !== undefined ? produto.preco : produtoExistente.preco;

      produtoExistente.observacao =
        produto.observacao !== undefined
          ? produto.observacao
          : produtoExistente.observacao;

      produtoExistente.categoria_produto_id =
        produto.categoria_produto_id !== undefined
          ? produto.categoria_produto_id
          : produtoExistente.categoria_produto_id;

      produtoExistente.marca_id =
        produto.marca_id !== undefined
          ? produto.marca_id
          : produtoExistente.marca_id;

      produtoExistente.fornecedor_id =
        produto.fornecedor_id !== undefined
          ? produto.fornecedor_id
          : produtoExistente.fornecedor_id;

      await produtoExistente.save(options);
      resultado.HttpConstruirRetorno(HttpStatusCode.SuccessOK);
      return resultado;
    } catch (error: unknown) {
      console.log(error);
      //if (transaction) await transaction.rollback();
      if (error instanceof objetoDeComunicacao) resultado = error;
      else if (error instanceof ValidationError) {
        resultado.HttpConstruirRetorno(HttpStatusCode.ClientErrorBadRequest);
      } else
        resultado = new objetoDeComunicacao(HttpStatusCode.ServerErrorInternal);
      throw resultado;
    }
  }

  async excluir(produtoId: number): Promise<objetoDeComunicacao> {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {
      const produtoExistente = await Produto.findByPk(produtoId);
      if (!produtoExistente) {
        throw new objetoDeComunicacao(HttpStatusCode.ClientErrorNotFound);
      }
      await produtoExistente.destroy();
      resultado.HttpConstruirRetorno(HttpStatusCode.SuccessOK);
      return resultado;
    } catch (error: unknown) {
      console.log(error);
      if (error instanceof objetoDeComunicacao) resultado = error;
      else if (error instanceof ValidationError) {
        resultado.HttpConstruirRetorno(HttpStatusCode.ClientErrorBadRequest);
      } else
        resultado = new objetoDeComunicacao(HttpStatusCode.ServerErrorInternal);
      throw resultado;
    }
  }

  async obterPorId(
    produtoId: number,
    transaction: Transaction | null = null
  ): Promise<objetoDeComunicacao> {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    const options = transaction ? { transaction } : {};
    try {
      const produto = await Produto.findByPk(produtoId, options);

      // {
      //   attributes: { exclude: ["createdAt", "updatedAt"] },
      //   ...options,
      // }
      if (!produto)
        throw new objetoDeComunicacao(HttpStatusCode.ClientErrorNotFound);

      resultado.HttpConstruirRetorno(
        HttpStatusCode.SuccessOK,
        produto.dataValues
      );
      return resultado;
    } catch (error: unknown) {
      console.log(error);
      //if (transaction) await transaction.rollback();
      if (error instanceof objetoDeComunicacao) resultado = error;
      else if (error instanceof ValidationError) {
        resultado.HttpConstruirRetorno(HttpStatusCode.ClientErrorBadRequest);
      } else
        resultado = new objetoDeComunicacao(HttpStatusCode.ServerErrorInternal);
      throw resultado;
    }
  }

  async listarTodos(usuarioId: string): Promise<objetoDeComunicacao> {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {
      let produto: Produto[] = await Produto.findAll({
        where: {
          usuario_id: usuarioId,
        },
        attributes: { exclude: ["usuario_id", "createdAt", "updatedAt"] },
      });
      resultado.HttpConstruirRetorno(
        HttpStatusCode.SuccessOK,
        produto.map((data) => {
          return data.dataValues;
        })
      );

      return resultado;
    } catch (error: unknown) {
      console.log(error);
      if (error instanceof objetoDeComunicacao) resultado = error;
      else if (error instanceof ValidationError) {
        resultado.HttpConstruirRetorno(HttpStatusCode.ClientErrorBadRequest);
      } else
        resultado = new objetoDeComunicacao(HttpStatusCode.ServerErrorInternal);
      throw resultado;
    }
  }

  async abaixoDoEstoque(usuarioId: string): Promise<objetoDeComunicacao> {
    let resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );

    try {
      // Contando produtos cujo estoque atual é menor que o estoque mínimo
      const abaixoDoEstoque: number = await Produto.count({
        where: {
          usuario_id: usuarioId,
          estoque_atual: {
            [Op.lt]: Sequelize.col("estoque_minimo"),
          },
        },
      });

      // Construindo a resposta com a quantidade encontrada
      resultado.HttpConstruirRetorno(HttpStatusCode.SuccessOK, {
        abaixoDoEstoque,
      });

      return resultado;
    } catch (error: unknown) {
      console.log(error);

      if (error instanceof objetoDeComunicacao) {
        resultado = error;
      } else if (error instanceof ValidationError) {
        resultado.HttpConstruirRetorno(HttpStatusCode.ClientErrorBadRequest);
      } else {
        resultado = new objetoDeComunicacao(HttpStatusCode.ServerErrorInternal);
      }

      throw resultado;
    }
  }

  async valorTotalEmEstoque(usuarioId: string): Promise<objetoDeComunicacao> {
    let resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );

    try {
      if (!Produto.sequelize) {
        throw new Error("Sequelize não está definido em Produto");
      }

      // Consulta SQL para calcular a soma do produto de preço pelo estoque atual de todos os produtos
      const query = `
        SELECT SUM(preco * estoque_atual) AS valortotal
        FROM produto
        WHERE usuario_id = :usuarioId
    `;
      const valores = { usuarioId };

      // Executando a consulta SQL
      const [resultadoConsulta] = await Produto.sequelize.query<{
        valortotal: number;
      }>(query, {
        type: QueryTypes.SELECT,
        replacements: valores,
      });

      const valorTotal: number = resultadoConsulta?.valortotal || 0;

      // Construindo a resposta com o valor total encontrado
      resultado.HttpConstruirRetorno(HttpStatusCode.SuccessOK, { valorTotal });

      return resultado;
    } catch (error: unknown) {
      console.log(error);

      if (error instanceof objetoDeComunicacao) {
        resultado = error;
      } else if (error instanceof ValidationError) {
        resultado.HttpConstruirRetorno(HttpStatusCode.ClientErrorBadRequest);
      } else {
        resultado = new objetoDeComunicacao(HttpStatusCode.ServerErrorInternal);
      }

      throw resultado;
    }
  }
}
