import {
  Transaction,
  ValidationError,
  Op,
  Sequelize,
  QueryTypes,
} from "sequelize";
import { Estoque } from "../models/Estoque";
import { Produto } from "../models/Produto";
import { getFirstDayOfMonth, getTodayDate, formatDate } from "../utils/Date";
import HttpStatusCode from "../utils/HttpStatusCodes";
import { objetoDeComunicacao } from "../utils/ObjetoDeComunicacao";
import sequelize from "sequelize/types/sequelize";
import { start } from "repl";

interface IEstoqueRepo {
  adicionar(
    estoque: Estoque,
    transaction: Transaction | null
  ): Promise<objetoDeComunicacao>;
  atualizar(estoque: Estoque): Promise<objetoDeComunicacao>;
  excluir(
    estoqueId: number,
    transaction: Transaction | null
  ): Promise<objetoDeComunicacao>;
  obterPorId(estoqueId: number): Promise<objetoDeComunicacao>;
  listarTodosPorProduto(produtoId: number): Promise<objetoDeComunicacao>;
  listarTodosPorUsuario(usuarioId: string): Promise<objetoDeComunicacao>;
}

export class EstoqueRepo implements IEstoqueRepo {
  async adicionar(
    estoque: Estoque,
    transaction: Transaction | null = null
  ): Promise<objetoDeComunicacao> {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    const options = transaction ? { transaction } : {};
    try {
      let estoqueCriado = await Estoque.create(
        {
          data: estoque.data,
          quantidade: estoque.quantidade,
          tipo_pagamento: estoque.tipo_pagamento,
          valor_entrada: estoque.valor_entrada,
          parcelas: estoque.parcelas,
          valor_parcelas: estoque.valor_parcelas,
          preco_total: estoque.preco_total,
          entrada: estoque.entrada,
          anexo: estoque.anexo,
          descricao: estoque.descricao,
          nota_fiscal: estoque.nota_fiscal,
          produto_id: estoque.produto_id,
          fornecedor_id: estoque.fornecedor_id,
          recebido: estoque.recebido,
        },
        options
      );
      resultado.HttpConstruirRetorno(
        HttpStatusCode.SuccessCreated,
        estoqueCriado.dataValues
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

  async atualizar(
    estoque: Estoque,
    transaction: Transaction | null = null
  ): Promise<objetoDeComunicacao> {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    const options = transaction ? { transaction } : {};
    try {
      const estoqueExistente = await Estoque.findByPk(estoque.id);
      if (!estoqueExistente) {
        throw new objetoDeComunicacao(HttpStatusCode.ClientErrorNotFound);
      }

      estoqueExistente.recebido =
        estoque.recebido !== undefined
          ? estoque.recebido
          : estoqueExistente.recebido;

      await estoqueExistente.save(options);

      // estoqueExistente.data =
      //   estoque.data !== undefined ? estoque.data : estoqueExistente.data;

      // estoqueExistente.quantidade =
      //   estoque.quantidade !== undefined
      //     ? estoque.quantidade
      //     : estoqueExistente.quantidade;

      // estoqueExistente.preco_total =
      //   estoque.preco_total !== undefined
      //     ? estoque.preco_total
      //     : estoqueExistente.preco_total;

      // estoqueExistente.entrada =
      //   estoque.entrada !== undefined
      //     ? estoque.entrada
      //     : estoqueExistente.entrada;

      // estoqueExistente.anexo =
      //   estoque.anexo !== undefined ? estoque.anexo : estoqueExistente.anexo;

      // estoqueExistente.produto_id =
      //   estoque.produto_id !== undefined
      //     ? estoque.produto_id
      //     : estoqueExistente.produto_id;

      // estoqueExistente.recebido =
      //   estoque.recebido !== undefined
      //     ? estoque.recebido
      //     : estoqueExistente.recebido;

      // await estoqueExistente.save();
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

  async excluir(
    estoqueId: number,
    transaction: Transaction | null = null
  ): Promise<objetoDeComunicacao> {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    const options = transaction ? { transaction } : {};
    try {
      const estoqueExistente = await Estoque.findByPk(estoqueId);
      if (!estoqueExistente) {
        throw new objetoDeComunicacao(HttpStatusCode.ClientErrorNotFound);
      }

      // Todos os campos seguem a mesma ideia. Se o usuario não especificou o valor (undefined), ele atribui
      // o valor salvo no banco, caso contrario ele atribui o valor que o usuario enviou.
      estoqueExistente.cancelado = true;

      await estoqueExistente.save(options);

      //Realmente excluir a informação
      //await estoqueExistente.destroy();

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

  async obterPorId(estoqueId: number): Promise<objetoDeComunicacao> {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {
      const estoque = await Estoque.findByPk(estoqueId, {
        attributes: { exclude: ["createdAt", "updatedAt"] },
      });

      if (!estoque)
        throw new objetoDeComunicacao(HttpStatusCode.ClientErrorNotFound);

      resultado.HttpConstruirRetorno(
        HttpStatusCode.SuccessOK,
        estoque.dataValues
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

  async listarTodosPorProduto(produtoId: number): Promise<objetoDeComunicacao> {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {
      const estoque = await Estoque.findAll({
        where: {
          produto_id: produtoId,
          // cancelado: false,
        },
        attributes: { exclude: ["createdAt", "updatedAt"] },
      });

      if (!estoque)
        throw new objetoDeComunicacao(HttpStatusCode.ClientErrorNotFound);

      resultado.HttpConstruirRetorno(
        HttpStatusCode.SuccessOK,
        estoque.map((data) => {
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

  async listarTodosPorUsuario(usuarioId: string): Promise<objetoDeComunicacao> {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {
      let estoque: Estoque[] = await Estoque.findAll({
        // where: {
        //   cancelado: false,
        // },
        include: [
          {
            model: Produto,
            attributes: [],
            where: { usuario_id: usuarioId },
          },
        ],
        attributes: { exclude: ["createdAt", "updatedAt"] },
      });
      resultado.HttpConstruirRetorno(
        HttpStatusCode.SuccessOK,
        estoque.map((data) => {
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

  async entradaUltimosSeteDias(
    usuarioId: string
  ): Promise<objetoDeComunicacao> {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {
      if (!Estoque.sequelize) {
        throw new Error("Sequelize não está definido em Estoque");
      }

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      sevenDaysAgo.setHours(0, 0, 0, 0); // Define a hora para meia-noite (00:00:00)

      // const today = new Date();
      const startDate = formatDate(sevenDaysAgo);
      const endDate = getTodayDate();

      const query = `
        SELECT SUM(quantidade) AS totalquantidade
        FROM estoque
        JOIN produto ON estoque.produto_id = produto.id
        WHERE produto.usuario_id = :usuarioId AND estoque.cancelado = false AND estoque.recebido = true AND estoque.data BETWEEN :sevenDaysAgo AND :today
      `;

      const valores = {
        usuarioId: usuarioId,
        sevenDaysAgo: startDate,
        today: endDate,
      };

      // Executando a consulta SQL
      const [resultadoQuery] = await Estoque.sequelize.query<{
        totalquantidade: number;
      }>(query, {
        replacements: valores,
        type: QueryTypes.SELECT,
      });

      const quantidadeTotal: number = resultadoQuery?.totalquantidade || 0;

      resultado.HttpConstruirRetorno(HttpStatusCode.SuccessOK, {
        quantidadeTotal,
      });

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
  async totalNaoRecebido(usuarioId: string): Promise<objetoDeComunicacao> {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {
      if (!Estoque.sequelize) {
        throw new Error("Sequelize não está definido em Estoque");
      }
      const query = `
        SELECT SUM(quantidade) AS totalnaorecebido
        FROM estoque
        JOIN produto ON estoque.produto_id = produto.id
        WHERE produto.usuario_id = :usuarioId AND estoque.recebido = false AND estoque.cancelado = false
      `;

      const valores = {
        usuarioId: usuarioId,
      };

      const [resultadoQuery] = await Estoque.sequelize.query<{
        totalnaorecebido: number;
      }>(query, {
        replacements: valores,
        type: QueryTypes.SELECT,
      });

      const totalNaoRecebido: number = resultadoQuery?.totalnaorecebido || 0;

      resultado.HttpConstruirRetorno(HttpStatusCode.SuccessOK, {
        totalNaoRecebido,
      });

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

  async totalEntradaPeriodo(
    startDate: any,
    endDate: any,
    usuarioId: string
  ): Promise<objetoDeComunicacao> {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {
      if (!Estoque.sequelize) {
        throw new Error("Sequelize não está definido em Estoque");
      }
      const query = `
        SELECT SUM(quantidade) AS "totalEntrada"
        FROM estoque
        JOIN produto ON estoque.produto_id = produto.id
        WHERE produto.usuario_id = :usuarioId 
        AND estoque.entrada = true 
        AND estoque.cancelado = false
        AND estoque.data BETWEEN :startDate AND :endDate
      `;

      const valores = {
        usuarioId: usuarioId,
        startDate: startDate,
        endDate: endDate,
      };

      const totalEntradaPeriodo = await Estoque.sequelize.query(query, {
        replacements: valores,
        type: QueryTypes.SELECT,
      });

      resultado.HttpConstruirRetorno(
        HttpStatusCode.SuccessOK,
        totalEntradaPeriodo
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

  async totalSaidaPeriodo(
    startDate: any,
    endDate: any,
    usuarioId: string
  ): Promise<objetoDeComunicacao> {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {
      if (!Estoque.sequelize) {
        throw new Error("Sequelize não está definido em Estoque");
      }
      const query = `
        SELECT SUM(quantidade) AS "totalSaida"
        FROM estoque
        JOIN produto ON estoque.produto_id = produto.id
        WHERE produto.usuario_id = :usuarioId 
        AND estoque.entrada = false 
        AND estoque.cancelado = false
        AND estoque.data BETWEEN :startDate AND :endDate
      `;

      const valores = {
        usuarioId: usuarioId,
        startDate: startDate,
        endDate: endDate,
      };

      const totalSaidaPeriodo = await Estoque.sequelize.query(query, {
        replacements: valores,
        type: QueryTypes.SELECT,
      });

      resultado.HttpConstruirRetorno(
        HttpStatusCode.SuccessOK,
        totalSaidaPeriodo
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

  async custoEstoquePeriodo(
    startDate: any,
    endDate: any,
    usuarioId: string
  ): Promise<objetoDeComunicacao> {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {
      if (!Estoque.sequelize) {
        throw new Error("Sequelize não está definido em Estoque");
      }
      const query = `
        SELECT SUM(preco_total) AS "custoTotal"
        FROM estoque
        JOIN produto ON estoque.produto_id = produto.id
        WHERE produto.usuario_id = :usuarioId 
        AND estoque.entrada = true 
        AND estoque.cancelado = false
        AND estoque.data BETWEEN :startDate AND :endDate
      `;

      const valores = {
        usuarioId: usuarioId,
        startDate: startDate,
        endDate: endDate,
      };

      const custoEstoquePeriodo = await Estoque.sequelize.query(query, {
        replacements: valores,
        type: QueryTypes.SELECT,
      });

      resultado.HttpConstruirRetorno(
        HttpStatusCode.SuccessOK,
        custoEstoquePeriodo
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

  async valorVendaPeriodo(
    startDate: any,
    endDate: any,
    usuarioId: string
  ): Promise<objetoDeComunicacao> {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {
      if (!Estoque.sequelize) {
        throw new Error("Sequelize não está definido em Estoque");
      }
      const query = `
        SELECT SUM(estoque_atual * p.preco) AS "valorVenda"
        FROM ESTOQUE
        JOIN estoque ON estoque.produto_id = produto.id
        WHERE produto.usuario_id = :usuarioId 
        AND estoque.entrada = true 
        AND estoque.cancelado = false
        AND estoque.data BETWEEN :startDate AND :endDate
      `;

      const valores = {
        usuarioId: usuarioId,
        startDate: startDate,
        endDate: endDate,
      };

      const custoEstoquePeriodo = await Estoque.sequelize.query(query, {
        replacements: valores,
        type: QueryTypes.SELECT,
      });

      resultado.HttpConstruirRetorno(
        HttpStatusCode.SuccessOK,
        custoEstoquePeriodo
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

  async entradasEstoquePeriodo(
    startDate: any,
    endDate: any,
    usuarioId: string
  ): Promise<objetoDeComunicacao> {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {
      if (!Estoque.sequelize) {
        throw new Error("Sequelize não está definido em Estoque");
      }

      let estoque: Estoque[] = await Estoque.findAll({
        include: [
          {
            model: Produto,
            attributes: [],
            where: { usuario_id: usuarioId },
          },
        ],
        where: {
          data: {
            [Op.between]: [startDate, endDate],
          },
          entrada: true,
          cancelado: false,
        },

        attributes: { exclude: ["createdAt", "updatedAt"] },
      });
      resultado.HttpConstruirRetorno(
        HttpStatusCode.SuccessOK,
        estoque.map((data) => {
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

  async compraFornecedorPeriodo(
    startDate: any,
    endDate: any,
    usuarioId: string
  ): Promise<objetoDeComunicacao> {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {
      if (!Estoque.sequelize) {
        throw new Error("Sequelize não está definido em Estoque");
      }
      const query = `
        SELECT 
          f.id, 
          COALESCE(f.nome_fantasia , 'Sem Fornecedor') AS "fornecedor",  
          SUM(es.quantidade) as "quantidade", 
          SUM(es.preco_total) as "custo_total"
        FROM 
          estoque es
        INNER JOIN
          produto p on p.id = es.produto_id
        LEFT JOIN 
          fornecedor f on f.id = es.fornecedor_id
        WHERE 
          es.entrada = true AND
          es.cancelado = false AND
          es.data BETWEEN :startDate AND :endDate
          AND (:usuarioId IN (f.usuario_id, p.usuario_id))
        GROUP BY 
          f.id, COALESCE(f.nome_fantasia , 'Sem Fornecedor')
      `;

      const valores = {
        usuarioId: usuarioId,
        startDate: startDate,
        endDate: endDate,
      };

      const compraFornecedor = await Estoque.sequelize.query(query, {
        replacements: valores,
        type: QueryTypes.SELECT,
      });

      resultado.HttpConstruirRetorno(
        HttpStatusCode.SuccessOK,
        compraFornecedor
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

  async marcaProdutoPeriodo(
    startDate: any,
    endDate: any,
    usuarioId: string
  ): Promise<objetoDeComunicacao> {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {
      if (!Estoque.sequelize) {
        throw new Error("Sequelize não está definido em Estoque");
      }
      const query = `
        SELECT 
            m.id,
            COALESCE(m.nome, 'Sem Marca') AS "marca", 
            SUM(es.quantidade) AS "quantidade", 
            SUM(es.preco_total) AS "custo_total"
        FROM 
            estoque es
        INNER JOIN
            produto p on p.id = es.produto_id
        LEFT JOIN 
            marca m ON m.id = p.marca_id
        WHERE 
            es.entrada = true AND 
            es.cancelado = false AND 
            es.data BETWEEN :startDate AND :endDate
            AND p.usuario_id = :usuarioId
        GROUP BY 
            m.id, COALESCE(m.nome, 'Sem Marca')
      `;

      const valores = {
        usuarioId: usuarioId,
        startDate: startDate,
        endDate: endDate,
      };

      const compraFornecedor = await Estoque.sequelize.query(query, {
        replacements: valores,
        type: QueryTypes.SELECT,
      });

      resultado.HttpConstruirRetorno(
        HttpStatusCode.SuccessOK,
        compraFornecedor
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

  async entradaProdutoPeriodo(
    startDate: any,
    endDate: any,
    usuarioId: string
  ): Promise<objetoDeComunicacao> {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {
      if (!Estoque.sequelize) {
        throw new Error("Sequelize não está definido em Estoque");
      }
      const query = `
        SELECT 
            p.id,
            p.nome as "produto",
            SUM(es.quantidade) AS "quantidade", 
            SUM(es.preco_total) AS "custo_total"
        FROM 
            estoque es
        INNER JOIN
            produto p on p.id = es.produto_id
        WHERE 
            es.entrada = true AND
            es.cancelado = false AND
            es.data BETWEEN :startDate AND :endDate
            AND p.usuario_id = :usuarioId
        GROUP BY 
            p.id, p.nome
      `;

      const valores = {
        usuarioId: usuarioId,
        startDate: startDate,
        endDate: endDate,
      };

      const compraFornecedor = await Estoque.sequelize.query(query, {
        replacements: valores,
        type: QueryTypes.SELECT,
      });

      resultado.HttpConstruirRetorno(
        HttpStatusCode.SuccessOK,
        compraFornecedor
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

  async entradaCategoriaProdutoPeriodo(
    startDate: any,
    endDate: any,
    usuarioId: string
  ): Promise<objetoDeComunicacao> {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {
      if (!Estoque.sequelize) {
        throw new Error("Sequelize não está definido em Estoque");
      }
      const query = `
        SELECT 
            cp.id,
            COALESCE(cp.nome, 'Sem Categoria') AS "categoria_produto",
            SUM(es.quantidade) AS "quantidade", 
            SUM(es.preco_total) AS "custo_total"
        FROM 
            estoque es
        INNER JOIN
            produto p on p.id = es.produto_id
        LEFT JOIN 
            categoria_produto cp on cp.id = p.categoria_produto_id
        WHERE 
            es.entrada = true AND
            es.cancelado = false AND
            es.data BETWEEN :startDate AND :endDate
            AND p.usuario_id = :usuarioId
        GROUP BY 
            cp.id, COALESCE(cp.nome, 'Sem Categoria')
      `;

      const valores = {
        usuarioId: usuarioId,
        startDate: startDate,
        endDate: endDate,
      };

      const compraFornecedor = await Estoque.sequelize.query(query, {
        replacements: valores,
        type: QueryTypes.SELECT,
      });

      resultado.HttpConstruirRetorno(
        HttpStatusCode.SuccessOK,
        compraFornecedor
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

  async entradaSaidaProdutoPeriodo(
    startDate: any,
    endDate: any,
    usuarioId: string,
    condicao: boolean,
    produtoId: number
  ): Promise<objetoDeComunicacao> {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {
      if (!Estoque.sequelize) {
        throw new Error("Sequelize não está definido em Estoque");
      }
      const query = `
        SELECT 
            p.id,
            p.nome as "produto",
            COALESCE(f.nome_fantasia , 'Sem Fornecedor') as "fornecedor",
            SUM(es.quantidade) AS "quantidade"
        FROM 
            estoque es
        INNER JOIN
            produto p on p.id = es.produto_id
        INNER JOIN
            fornecedor f on f.id = es.fornecedor_id
        WHERE 
            es.entrada = :condicao 
            AND es.produto_id = :produtoId
            AND es.data BETWEEN :startDate AND :endDate
            AND p.usuario_id = :usuarioId
        GROUP BY 
            p.id, p.nome, COALESCE(f.nome_fantasia , 'Sem Fornecedor')
      `;

      const valores = {
        usuarioId: usuarioId,
        startDate: startDate,
        endDate: endDate,
        condicao: condicao,
        produtoId: produtoId,
      };

      const compraFornecedor = await Estoque.sequelize.query(query, {
        replacements: valores,
        type: QueryTypes.SELECT,
      });

      resultado.HttpConstruirRetorno(
        HttpStatusCode.SuccessOK,
        compraFornecedor
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

  async estoquePorFornecedorPeriodo(
    startDate: any,
    endDate: any,
    usuarioId: string,
    fornecedorId: number
  ): Promise<objetoDeComunicacao> {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {
      if (!Estoque.sequelize) {
        throw new Error("Sequelize não está definido em Estoque");
      }
      const query = `
    SELECT 
      f.id, 
      p.nome as "produto",
      SUM(es.quantidade) as "quantidade", 
      SUM(es.preco_total) as "custo_total",
      COALESCE(cp.nome , 'Sem Categoria') AS "categoria",
      COALESCE(m.nome , 'Sem Marca') AS "marca",
      COALESCE(f.nome_fantasia , 'Sem Fornecedor') AS "fornecedor"
    FROM 
      estoque es
    INNER JOIN
      produto p on p.id = es.produto_id
    INNER JOIN 
      fornecedor f on f.id = es.fornecedor_id
    LEFT JOIN 
      marca m on m.id = p.marca_id
    LEFT JOIN
      categoria_produto cp on cp.id = p.categoria_produto_id
    WHERE 
      es.entrada = true AND
      es.cancelado = false AND
      es.data BETWEEN :startDate AND :endDate
      AND (:usuarioId IN (f.usuario_id, p.usuario_id))
      AND p.fornecedor_id = :fornecedorId
    GROUP BY 
      f.id, p.nome, COALESCE(cp.nome , 'Sem Categoria'),COALESCE(m.nome , 'Sem Marca'), COALESCE(f.nome_fantasia , 'Sem Fornecedor')
  `;

      const valores = {
        usuarioId: usuarioId,
        startDate: startDate,
        endDate: endDate,
        fornecedorId: fornecedorId,
      };

      const compraFornecedor = await Estoque.sequelize.query(query, {
        replacements: valores,
        type: QueryTypes.SELECT,
      });

      resultado.HttpConstruirRetorno(
        HttpStatusCode.SuccessOK,
        compraFornecedor
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

  async estoquePorFornecedorPeriodoSemFornecedor(
    startDate: any,
    endDate: any,
    usuarioId: string
  ): Promise<objetoDeComunicacao> {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {
      if (!Estoque.sequelize) {
        throw new Error("Sequelize não está definido em Estoque");
      }
      const query = `
    SELECT 
      f.id, 
      p.nome as "produto",
      SUM(es.quantidade) as "quantidade", 
      SUM(es.preco_total) as "custo_total",
      COALESCE(cp.nome , 'Sem Categoria') AS "categoria",
      COALESCE(m.nome , 'Sem Marca') AS "marca",
      COALESCE(f.nome_fantasia , 'Sem Fornecedor') AS "fornecedor"
    FROM 
      estoque es
    INNER JOIN
      produto p on p.id = es.produto_id
    LEFT JOIN 
      fornecedor f on f.id = es.fornecedor_id
    LEFT JOIN 
      marca m on m.id = p.marca_id
    LEFT JOIN
      categoria_produto cp on cp.id = p.categoria_produto_id
    WHERE 
      es.entrada = true AND
      es.cancelado = false AND
      es.data BETWEEN :startDate AND :endDate
      AND (:usuarioId IN (f.usuario_id, p.usuario_id))
      AND f.id IS NULL
    GROUP BY 
      f.id, p.nome, COALESCE(cp.nome , 'Sem Categoria'),COALESCE(m.nome , 'Sem Marca'), COALESCE(f.nome_fantasia , 'Sem Fornecedor')
  `;

      const valores = {
        usuarioId: usuarioId,
        startDate: startDate,
        endDate: endDate,
      };

      const compraFornecedor = await Estoque.sequelize.query(query, {
        replacements: valores,
        type: QueryTypes.SELECT,
      });

      resultado.HttpConstruirRetorno(
        HttpStatusCode.SuccessOK,
        compraFornecedor
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
}
