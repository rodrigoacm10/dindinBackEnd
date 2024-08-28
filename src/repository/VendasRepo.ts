import { Model, Sequelize, Transaction, ValidationError, fn, literal } from "sequelize";
import { Produto } from "../models/Produto";
const { Op } = require('sequelize');
import { Cliente } from "../models/Cliente"
import HttpStatusCode from "../utils/HttpStatusCodes";
import { objetoDeComunicacao } from "../utils/ObjetoDeComunicacao";
import { Vendas } from "../models/Vendas";
import { VendasProdutos } from "../models/VendasProdutos";
import { getFirstDayOfMonth, getTodayDate } from "../utils/Date";
const { QueryTypes } = require('sequelize');


interface IVendasRepo {
  adicionar(
    vendas: Vendas,
    produtos: Array<VendasProdutos>,
    transaction: Transaction | null
  ): Promise<objetoDeComunicacao>;
  atualizar(
    vendas: Vendas,
    transaction: Transaction | null
  ): Promise<objetoDeComunicacao>;
  excluir(
    produtoId: number,
    usuarioId: string,
    transaction: Transaction | null
  ): Promise<objetoDeComunicacao>;
  obterPorId(vendasId: number): Promise<objetoDeComunicacao>;
  listarTodos(usuarioId: string): Promise<objetoDeComunicacao>;
}

export class VendasRepo implements IVendasRepo {
  async adicionar(
    vendas: Vendas,
    produtos: Array<VendasProdutos>,
    transaction: Transaction | null = null
  ): Promise<objetoDeComunicacao> {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {
      let vendaCriada = await Vendas.create(
        {
          data: vendas.data,
          tipo_pagamento: vendas.tipo_pagamento,
          valor_entrada: vendas.valor_entrada,
          parcelas: vendas.parcelas,
          valor_parcelas: vendas.valor_parcelas,
          preco_total: vendas.preco_total,
          observacao: vendas.observacao,
          anexo: vendas.anexo,
          cancelado: false,
          entregue: vendas.entregue,
          cliente_id: vendas.cliente_id,
          usuario_id: vendas.usuario_id,
        },
        { transaction }
      );

      for (let produto of produtos) {
        await VendasProdutos.create(
          {
            preco_venda: produto.preco_venda,
            quantidade: produto.quantidade,
            produto_id: produto.produto_id,
            vendas_id: vendaCriada.dataValues.id,
          },
          { transaction }
        );
      }

      resultado.HttpConstruirRetorno(HttpStatusCode.SuccessCreated, {
        vendas_id: vendaCriada.dataValues.id,
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

  async obterPorId(vendasId: number): Promise<objetoDeComunicacao> {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {
      const venda = await Vendas.findByPk(vendasId);

      if (!venda)
        throw new objetoDeComunicacao(HttpStatusCode.ClientErrorNotFound);

      const produtos = await VendasProdutos.findAll({
        where: {
          vendas_id: vendasId,
        },
        attributes: { exclude: ["createdAt", "updatedAt"] },
      });
      if (!produtos)
        throw new objetoDeComunicacao(HttpStatusCode.ClientErrorNotFound);

      let vendaData = venda.dataValues;
      vendaData.produtos = produtos.map((produto) => produto.dataValues);

      resultado.HttpConstruirRetorno(
        HttpStatusCode.SuccessOK,
        venda.dataValues
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
  async listarTodos(usuarioId: string): Promise<objetoDeComunicacao> {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {
      let vendas: Vendas[] = await Vendas.findAll({
        where: {
          usuario_id: usuarioId,
        },
        attributes: { exclude: ["usuario_id", "createdAt", "updatedAt"] },
      });

      const vendas_Produtos = [];
      for (const venda of vendas) {
        const vendaData = venda.toJSON();
        const produtos = await VendasProdutos.findAll({
          where: {
            vendas_id: venda.id,
          },
          attributes: { exclude: ["createdAt", "updatedAt"] },
        });
        vendaData.produtos = produtos.map((produto) => produto.toJSON());
        vendas_Produtos.push(vendaData);
      }

      resultado.HttpConstruirRetorno(HttpStatusCode.SuccessOK, vendas_Produtos);

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
    vendas: Vendas,
    transaction: Transaction | null = null
  ): Promise<objetoDeComunicacao> {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    const options = transaction ? { transaction } : {};
    try {
      const vendaExistente = await Vendas.findByPk(vendas.id, options);
      if (!vendaExistente) {
        throw new objetoDeComunicacao(HttpStatusCode.ClientErrorNotFound);
      }

      vendaExistente.entregue =
        vendas.entregue !== undefined
          ? vendas.entregue
          : vendaExistente.entregue;

      await vendaExistente.save(options);
      resultado.HttpConstruirRetorno(HttpStatusCode.SuccessOK);
      return resultado;
    } catch (error: unknown) {
      console.log(error);
      // if (transaction) await transaction.rollback();
      if (error instanceof objetoDeComunicacao) resultado = error;
      else if (error instanceof ValidationError) {
        resultado.HttpConstruirRetorno(HttpStatusCode.ClientErrorBadRequest);
      } else
        resultado = new objetoDeComunicacao(HttpStatusCode.ServerErrorInternal);
      throw resultado;
    }
  }

  async excluir(
    vendasId: number,
    usuarioId: string,
    transaction: Transaction | null = null
  ): Promise<objetoDeComunicacao> {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    const options = transaction ? { transaction } : {};
    try {
      const vendaExistente = await Vendas.findByPk(vendasId);
      if (!vendaExistente) {
        throw new objetoDeComunicacao(HttpStatusCode.ClientErrorNotFound);
      }

      if (!(vendaExistente.usuario_id == usuarioId))
        throw new objetoDeComunicacao(HttpStatusCode.ClientErrorForbidden);

      // Todos os campos seguem a mesma ideia. Se o usuario não especificou o valor (undefined), ele atribui
      // o valor salvo no banco, caso contrario ele atribui o valor que o usuario enviou.
      vendaExistente.cancelado = true;

      await vendaExistente.save(options);
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

  async lucroBrutoTotal( startDate : any, endDate : any, usuarioId: string ): Promise<objetoDeComunicacao> {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {

      if (!VendasProdutos.sequelize) {
        throw new Error('Sequelize não está definido em Estoque');
    }

        const query = `
          SELECT ROUND(SUM(vp.preco_venda - p.valor_custo), 2) AS lucro_bruto_total
          FROM "vendasProdutos" vp
          JOIN produto p ON vp.produto_id = p.id
          JOIN vendas v ON vp.vendas_id = v.id
          WHERE v.cancelado = false 
            AND v.data BETWEEN :startDate AND :endDate
            AND v.usuario_id = :usuarioId
        `;

        const valores = { startDate, endDate, usuarioId };

        const lucro : any = await VendasProdutos.sequelize.query(query, {
          replacements: valores,
          type: QueryTypes.SELECT
      });
      const lucroTotal = lucro.length > 0 ? parseFloat(lucro[0].lucro_bruto_total) : 0;

      resultado.HttpConstruirRetorno(HttpStatusCode.SuccessOK, lucroTotal);
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

  async devolucoes( startDate : any, endDate : any, usuarioId: string ): Promise<objetoDeComunicacao> {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {
      const vendasCanceladas = await Vendas.count({
        where: {
          usuario_id: usuarioId, 
          cancelado: true,
          data: {
            [Op.between]: [startDate, endDate]
          }
        }
      });
      resultado.HttpConstruirRetorno(HttpStatusCode.SuccessOK, vendasCanceladas);
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

  async totalVendas( startDate: any, endDate : any, usuarioId: string ): Promise<objetoDeComunicacao> {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {
      console.log("A merda aconteceu aqui no repo")
      const totalVendas = await Vendas.count({
        where: {
          usuario_id: usuarioId, 
          cancelado: false,
          data: {
            [Op.between]: [startDate, endDate]
          }
        }
      });
      resultado.HttpConstruirRetorno(HttpStatusCode.SuccessOK, totalVendas);
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

  async vendasValorTotal( startDate: any, endDate : any, usuarioId: string ): Promise<objetoDeComunicacao> {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {
      const vendasValorTotal = await Vendas.sum('preco_total', {
        where: {
          usuario_id: usuarioId, 
          cancelado: false,
          data: {
            [Op.between]: [startDate, endDate]
          }
        }
      })
      resultado.HttpConstruirRetorno(HttpStatusCode.SuccessOK, vendasValorTotal);
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

  async vendasNoPeriodoSemPaginacao( startDate: any, endDate : any, usuarioId: string ): Promise<objetoDeComunicacao> {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {

      let vendas: Vendas[] = await Vendas.findAll({
        where: {
          usuario_id: usuarioId,
          data: { [Op.between]: [startDate, endDate] }
        },
        attributes: { exclude: ["usuario_id", "createdAt", "updatedAt"] },
      });

      const vendas_Produtos = [];
      for (const venda of vendas) {
        const vendaData = venda.toJSON();
        const produtos = await VendasProdutos.findAll({
          where: {
            vendas_id: venda.id,
          },
          attributes: { exclude: ["createdAt", "updatedAt"] },
        });
        vendaData.produtos = produtos.map((produto) => produto.toJSON());
        vendas_Produtos.push(vendaData);
      }

      resultado.HttpConstruirRetorno(HttpStatusCode.SuccessOK, vendas_Produtos);
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

  async vendasNoPeriodoComPaginacao( startDate: any, endDate : any, page : number, limit : number,  usuarioId: string ): Promise<objetoDeComunicacao> {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {


      let vendas = await Vendas.findAndCountAll({
        where: {
          usuario_id: usuarioId,
          data: { [Op.between]: [startDate, endDate] }
        },
        attributes: { exclude: ["usuario_id", "createdAt", "updatedAt"] },
        limit: limit,
        offset: (page - 1) * limit
      });

      const vendas_Produtos = [];
      for (const venda of vendas.rows) {
        const vendaData = venda.toJSON();
        const produtos = await VendasProdutos.findAll({
          where: {
            vendas_id: venda.id,
          },
          attributes: { exclude: ["createdAt", "updatedAt"] },
        });
        vendaData.produtos = produtos.map((produto) => produto.toJSON());
        vendas_Produtos.push(vendaData);
      }
      
      const totalPages = Math.ceil(vendas.count / limit);

      const resultadoFinal = {
        count: vendas.count,
        totalPages: totalPages,
        currentPage: page,
        rows: vendas_Produtos
      };

      resultado.HttpConstruirRetorno(HttpStatusCode.SuccessOK, resultadoFinal);
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

  async ranqueamentoDeProdutoPorCliente( startDate: any, endDate : any, usuarioId: string ): Promise<objetoDeComunicacao> {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {

      if (!VendasProdutos.sequelize) {
        throw new Error('Sequelize não está definido em Estoque');
    }

        interface TotalVendasResultado {
          produto_id: number;
          produto_nome: string;
          total_quantidade: number;
          preco_total: number;
      }
      
      interface MaiorCompradorResultado {
          produto_id: number;
          produto_nome: string;
          cliente_id: number;
          cliente_nome: string;
          max_quantidade: number;
  }
  
      const totalVendasQuery = `
        SELECT
            vp.produto_id,
            p.nome AS produto_nome,
            SUM(vp.quantidade) AS total_quantidade,
            SUM(vp.preco_venda) AS preco_total
        FROM
            "vendasProdutos" vp
        INNER JOIN
            vendas v ON vp.vendas_id = v.id
        INNER JOIN
            produto p ON vp.produto_id = p.id
        WHERE
            v.data BETWEEN :startDate AND :endDate AND
            v.usuario_id = :usuarioId AND
            v.cancelado = false
        GROUP BY
            vp.produto_id, p.nome;
    `;

    const totalVendasValores = { startDate, endDate, usuarioId };

    const totalVendasResultado = await VendasProdutos.sequelize.query<TotalVendasResultado>(totalVendasQuery, {
      replacements: totalVendasValores,
      type: QueryTypes.SELECT
    });

    const maiorCompradorQuery = `
        SELECT
            ranked.produto_id,
            ranked.produto_nome,
            ranked.cliente_id,
            COALESCE(ranked.cliente_nome, 'balcão') AS cliente_nome,
            ranked.max_quantidade
        FROM (
            SELECT
                vp.produto_id,
                p.nome AS produto_nome,
                v.cliente_id,
                c.nome AS cliente_nome,
                SUM(vp.quantidade) AS max_quantidade,
                ROW_NUMBER() OVER (PARTITION BY vp.produto_id ORDER BY SUM(vp.quantidade) DESC) AS row_number
            FROM
                "vendasProdutos" vp
            INNER JOIN
                vendas v ON vp.vendas_id = v.id
            LEFT JOIN
                cliente c ON v.cliente_id = c.id
            INNER JOIN
                produto p ON vp.produto_id = p.id
            WHERE
                v.data BETWEEN :startDate AND :endDate AND
                v.usuario_id = :usuarioId AND
                v.cancelado = false
            GROUP BY
                vp.produto_id, p.nome, v.cliente_id, c.nome
        ) ranked
        WHERE ranked.row_number = 1;
    `;
          
    const maiorCompradorValores = { startDate, endDate, usuarioId };

    const maiorCompradorResultado  = await VendasProdutos.sequelize.query<MaiorCompradorResultado>(maiorCompradorQuery, {
        replacements: maiorCompradorValores,
        type: QueryTypes.SELECT
    });

    console.log(maiorCompradorResultado)
    console.log(totalVendasResultado)
    const resultadoFinal = totalVendasResultado.map(total => {
      const comprador = maiorCompradorResultado.find(m => m.produto_id === total?.produto_id);
      return {
          produto_id: total.produto_id,
          produto_nome: total.produto_nome,
          total_quantidade: total.total_quantidade,
          preco_total: total.preco_total,
          cliente_id: comprador ? comprador.cliente_id : null,
          cliente_nome: comprador ? comprador.cliente_nome : null,
          max_quantidade: comprador ? comprador.max_quantidade : null
      };
  });

      resultado.HttpConstruirRetorno(HttpStatusCode.SuccessOK, resultadoFinal);
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

  async ranqueamentoDeClientePorProduto( startDate: any, endDate : any, usuarioId: string ): Promise<objetoDeComunicacao> {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {

      if (!VendasProdutos.sequelize) {
        throw new Error('Sequelize não está definido em Estoque');
    }

    const totalComprasClienteQuery = `
    SELECT
        v.cliente_id,
        COALESCE(c.nome, 'balcão') AS cliente_nome,
        SUM(vp.quantidade) AS total_quantidade,
        SUM(vp.preco_venda) AS total_valor
    FROM
        "vendasProdutos" vp
    INNER JOIN
        vendas v ON vp.vendas_id = v.id
    LEFT JOIN
        cliente c ON v.cliente_id = c.id
    WHERE
        v.data BETWEEN :startDate AND :endDate AND
        v.usuario_id = :usuarioId AND
        v.cancelado = false
    GROUP BY
        v.cliente_id, c.nome;
`;

    const totalComprasClienteValores = { startDate, endDate, usuarioId };

    const totalComprasClienteResultado = await VendasProdutos.sequelize.query<TotalComprasClienteResultado>(totalComprasClienteQuery, {
        replacements: totalComprasClienteValores,
        type: QueryTypes.SELECT
    });

    const produtoMaisCompradoQuery = `
    SELECT
        ranked.cliente_id,
        COALESCE(ranked.cliente_nome, 'balcão') AS cliente_nome,
        ranked.produto_id,
        ranked.produto_nome,
        ranked.max_quantidade
    FROM (
        SELECT
            v.cliente_id,
            c.nome AS cliente_nome,
            vp.produto_id,
            p.nome AS produto_nome,
            SUM(vp.quantidade) AS max_quantidade,
            ROW_NUMBER() OVER (PARTITION BY v.cliente_id ORDER BY SUM(vp.quantidade) DESC) AS row_number
        FROM
            "vendasProdutos" vp
        INNER JOIN
            vendas v ON vp.vendas_id = v.id
        LEFT JOIN
            cliente c ON v.cliente_id = c.id
        INNER JOIN
            produto p ON vp.produto_id = p.id
        WHERE
            v.data BETWEEN :startDate AND :endDate AND
            v.usuario_id = :usuarioId AND
            v.cancelado = false
        GROUP BY
            v.cliente_id, c.nome, vp.produto_id, p.nome
    ) ranked
    WHERE ranked.row_number = 1;
`;

    const produtoMaisCompradoValores = { startDate, endDate, usuarioId };

    const produtoMaisCompradoResultado = await VendasProdutos.sequelize.query<ProdutoMaisCompradoResultado>(produtoMaisCompradoQuery, {
        replacements: produtoMaisCompradoValores,
        type: QueryTypes.SELECT
    });


    interface TotalComprasClienteResultado {
      cliente_id: number;
      cliente_nome: string;
      total_quantidade: number;
      total_valor: number;
    }

    interface ProdutoMaisCompradoResultado {
      cliente_id: number;
      cliente_nome: string;
      produto_id: number;
      produto_nome: string;
      max_quantidade: number;
    }

    const resultadoFinal = totalComprasClienteResultado.map((total: TotalComprasClienteResultado) => {
      const produto = produtoMaisCompradoResultado.find((p: ProdutoMaisCompradoResultado) => p.cliente_id === total.cliente_id);
      return {
          cliente_id: total.cliente_id,
          cliente_nome: total.cliente_nome,
          total_quantidade: total.total_quantidade,
          total_valor: total.total_valor,
          produto_id: produto ? produto.produto_id : null,
          produto_nome: produto ? produto.produto_nome : null,
          max_quantidade: produto ? produto.max_quantidade : null
      };
    });

    resultado.HttpConstruirRetorno(HttpStatusCode.SuccessOK, resultadoFinal);

            
      
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

  async totalComprasClienteBalcao( startDate: any, endDate : any,  usuarioId: string): Promise<objetoDeComunicacao> {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {

      if (!VendasProdutos.sequelize) {
        throw new Error('Sequelize não está definido em Estoque');
    }

      const query = `
            SELECT
                vp.produto_id,
                p.nome AS produto,
                p.marca_id as marca,
                p.fornecedor_id as fornecedor,
                p.categoria_produto_id as categoria,
                SUM(vp.quantidade) AS total_quantidade_comprada,
                SUM(vp.preco_venda) AS preco_total
            FROM
                "vendasProdutos" vp
            INNER JOIN
                vendas v ON vp.vendas_id = v.id
            INNER JOIN
                produto p ON vp.produto_id = p.id
            WHERE
                v.data BETWEEN :startDate AND :endDate AND
                v.usuario_id = :usuarioId AND
                v.cliente_id IS NULL AND
                v.cancelado = false
            GROUP BY
                vp.produto_id, p.nome, p.marca_id, p.fornecedor_id, p.categoria_produto_id
            ORDER BY
                total_quantidade_comprada DESC;
              `;
      
      const valores = { startDate, endDate, usuarioId};

      const resultadoQuery = await VendasProdutos.sequelize.query(query, {
          replacements: valores,
          type: QueryTypes.SELECT
      });

      resultado.HttpConstruirRetorno(HttpStatusCode.SuccessOK, [resultadoQuery]);
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

  async totalComprasCliente( startDate: any, endDate : any,  usuarioId: string, clienteId: number): Promise<objetoDeComunicacao> {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {

      if (!VendasProdutos.sequelize) {
        throw new Error('Sequelize não está definido em Estoque');
    }

      const query = `
            SELECT
                vp.produto_id,
                p.nome AS produto,
                p.marca_id as marca,
                p.fornecedor_id as fornecedor,
                p.categoria_produto_id as categoria,
                SUM(vp.quantidade) AS total_quantidade_comprada,
                SUM(vp.preco_venda) AS preco_total
            FROM
                "vendasProdutos" vp
            INNER JOIN
                vendas v ON vp.vendas_id = v.id
            INNER JOIN
                produto p ON vp.produto_id = p.id
            WHERE
                v.data BETWEEN :startDate AND :endDate AND
                v.usuario_id = :usuarioId AND
                v.cliente_id = :clienteId AND
                v.cancelado = false
            GROUP BY
                vp.produto_id, p.nome, p.marca_id, p.fornecedor_id, p.categoria_produto_id
            ORDER BY
                total_quantidade_comprada DESC;
              `;
      
      const valores = { startDate, endDate, usuarioId, clienteId};

      const resultadoQuery = await VendasProdutos.sequelize.query(query, {
          replacements: valores,
          type: QueryTypes.SELECT
      });

      resultado.HttpConstruirRetorno(HttpStatusCode.SuccessOK, [resultadoQuery]);
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

  async totalDeClientesPorProduto( startDate: any, endDate : any,  usuarioId: string, produtoId: number): Promise<objetoDeComunicacao> {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {

      if (!VendasProdutos.sequelize) {
        throw new Error('Sequelize não está definido em Estoque');
    }

      const query = `
            SELECT
                v.cliente_id,
                COALESCE( c.nome, 'balcão') AS cliente_nome,
                SUM(vp.quantidade) AS total_quantidade_comprada
            FROM
                "vendasProdutos" vp
            INNER JOIN
                vendas v ON vp.vendas_id = v.id
            LEFT JOIN
                cliente c ON v.cliente_id = c.id
            INNER JOIN
                produto p ON vp.produto_id = p.id
            WHERE
                v.data BETWEEN :startDate AND :endDate AND
                v.usuario_id = :usuarioId AND
                vp.produto_id = :produtoId AND
                v.cancelado = false
            GROUP BY
                v.cliente_id, c.nome
            ORDER BY
                v.cliente_id, total_quantidade_comprada DESC;
                `;
      
      const valores = { startDate, endDate, usuarioId, produtoId};

      const resultadoQuery = await VendasProdutos.sequelize.query(query, {
          replacements: valores,
          type: QueryTypes.SELECT
      });

      resultado.HttpConstruirRetorno(HttpStatusCode.SuccessOK, [resultadoQuery]);
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

}
