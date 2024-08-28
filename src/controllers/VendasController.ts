import { Request, Response } from "express";
import { objetoDeComunicacao } from "../utils/ObjetoDeComunicacao";
import HttpStatusCode from "../utils/HttpStatusCodes";
import FileController from "./FilesController";
import { Produto } from "../models/Produto";
import { Vendas } from "../models/Vendas";
import { VendasProdutos } from "../models/VendasProdutos";
import { VendasRepo } from "../repository/VendasRepo";
import Database from "../config/database";
import { ProdutoRepo } from "../repository/ProdutoRepo";
import { Receita } from "../models/Receita";
import { ReceitaRepo } from "../repository/ReceitaRepo";
import { Estoque } from "../models/Estoque";
import { EstoqueRepo } from "../repository/EstoqueRepo";
import { validacaoBuscasOpcionaisReceitaEDespesa } from "../utils/FuncoesUteis";
import { start } from "repl";
import { getFirstDayOfMonth, getTodayDate, formatDate } from "../utils/Date";

class VendasController {
  async adicionar(req: Request, res: Response) {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    let ConexaoBD = await new Database().sequelize?.transaction();
    try {
      let usuarioId = req.body.token;
      delete req.body.token;
      usuarioId = usuarioId["usuario_id"];

      // Validando dados de entrada na Venda
      if (
        req.body.data &&
        RegExp(/^[0-9]{2}\/[0-9]{2}\/[0-9]{4}$/).test(req.body.data)
      ) {
        req.body.data = req.body.data.split("/").reverse().join("/");
        req.body.data = req.body.data.replaceAll("/", "-");
      } else if (
        req.body.data &&
        RegExp(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/).test(req.body.data)
      ) {
        //pass
      } else
        throw new objetoDeComunicacao(
          HttpStatusCode.ClientErrorBadRequest,
          {},
          "Data invalida."
        );

      if (typeof req.body.preco_total !== "number" || req.body.preco_total <= 0)
        throw new objetoDeComunicacao(
          HttpStatusCode.ClientErrorBadRequest,
          {},
          "Preço Invalida."
        );

      //if (req.body.tipo_pagamento === "vista") {
      if (
        req.body.tipo_pagamento === "pix" ||
        req.body.tipo_pagamento === "dinheiro" ||
        req.body.tipo_pagamento === "cartao_debito"
      ) {
        //pass
        //} else if (req.body.tipo_pagamento === "prazo") {
      } else if (
        req.body.tipo_pagamento === "boleto" ||
        req.body.tipo_pagamento === "crediario" ||
        req.body.tipo_pagamento === "cartao_credito"
      ) {
        const { data_pagamento, valor_parcelas, parcelas } = req.body;

        if (
          isNaN(Date.parse(data_pagamento)) === true ||
          typeof valor_parcelas !== "number" ||
          valor_parcelas <= 0 ||
          typeof parcelas !== "number" ||
          parcelas <= 0
        ) {
          throw new objetoDeComunicacao(
            HttpStatusCode.ClientErrorBadRequest,
            {},
            "Dados do tipo de pagamento a prazo inválidos."
          );
        }
      } else if (req.body.tipo_pagamento === "vista+prazo") {
        const { data_pagamento, valor_parcelas, parcelas, valor_entrada } =
          req.body;
        if (
          isNaN(Date.parse(data_pagamento)) === true ||
          typeof valor_parcelas !== "number" ||
          valor_parcelas <= 0 ||
          typeof parcelas !== "number" ||
          parcelas <= 0 ||
          typeof valor_entrada !== "number" ||
          valor_entrada < 0
        ) {
          throw new objetoDeComunicacao(
            HttpStatusCode.ClientErrorBadRequest,
            {},
            "Dados do tipo de pagamento vista+prazo inválidos."
          );
        }
      } else {
        throw new objetoDeComunicacao(
          HttpStatusCode.ClientErrorBadRequest,
          {},
          "Tipo de pagamento não reconhecido."
        );
      }

      const novaVenda: Vendas = req.body;
      novaVenda.usuario_id = usuarioId;

      let produtos: Array<VendasProdutos> = [];
      for (let i = 0; i < req.body.produtos.length; i++) {
        const produto: VendasProdutos = req.body.produtos[i];
        produtos.push(produto);

        const produtoExistente = await new ProdutoRepo().obterPorId(
          produto.produto_id
        );

        if (!produtoExistente || usuarioId !== produtoExistente.data.usuario_id)
          throw new objetoDeComunicacao(
            HttpStatusCode.ClientErrorBadRequest,
            {},
            "Produto ID invalido."
          );
      }

      let vendaAdicionada = await new VendasRepo().adicionar(
        novaVenda,
        produtos,
        ConexaoBD
      );

      // Parte de adição da receita de cada produto
      let nomeProdutos: Array<String> = [];
      for (let i = 0; i < req.body.produtos.length; i++) {
        const vendasProduto: VendasProdutos = req.body.produtos[i];

        const removerEstoque: Estoque = req.body;
        removerEstoque.preco_total = vendasProduto.preco_venda;
        removerEstoque.quantidade = vendasProduto.quantidade;
        removerEstoque.produto_id = vendasProduto.produto_id;
        removerEstoque.recebido = true;
        removerEstoque.entrada = false;

        resultado = await new EstoqueRepo().adicionar(
          removerEstoque,
          ConexaoBD
        );

        const produtoExistente = await new ProdutoRepo().obterPorId(
          vendasProduto.produto_id,
          ConexaoBD
        );

        nomeProdutos[
          i
        ] = `${produtoExistente.data.nome} (${vendasProduto.quantidade})`;
        //nomeProdutos[i][1] = vendasProduto.quantidade;

        produtoExistente.data.estoque_atual -= vendasProduto.quantidade;

        if (produtoExistente.data.estoque_atual < 0) {
          throw new objetoDeComunicacao(
            HttpStatusCode.ClientErrorBadRequest,
            {},
            "Quantidade de produtos invalidas no estoque."
          );
        }

        resultado = await new ProdutoRepo().atualizar(
          produtoExistente.data,
          ConexaoBD
        );
      }

      //if (req.body.tipo_pagamento === "vista") {
      if (
        req.body.tipo_pagamento === "pix" ||
        req.body.tipo_pagamento === "dinheiro" ||
        req.body.tipo_pagamento === "cartao_debito"
      ) {
        let receita: Receita = new Receita();
        receita.usuario_id = usuarioId;

        receita.descricao = `Venda a vista de `;
        for (let i = 0; i < req.body.produtos.length; i++) {
          receita.descricao += ` ${nomeProdutos[i]},`;
        }
        receita.descricao = receita.descricao.slice(0, -1);
        receita.descricao += `. Valor total de R$${novaVenda.preco_total}.`;

        receita.data = novaVenda.data;
        receita.anexo = novaVenda.anexo;
        receita.valor = novaVenda.preco_total;
        receita.cliente_id = novaVenda.cliente_id;
        receita.vendas_id = vendaAdicionada.data.vendas_id;
        receita.efetuado = true;

        await new ReceitaRepo().adicionar(receita, ConexaoBD);
      } else if (req.body.tipo_pagamento === "vista+prazo") {
        let receitaVista: Receita = new Receita();
        receitaVista.usuario_id = usuarioId;

        receitaVista.descricao = `Venda a vista e prazo de`;
        for (let i = 0; i < req.body.produtos.length; i++) {
          receitaVista.descricao += ` ${nomeProdutos[i]},`;
        }
        receitaVista.descricao = receitaVista.descricao.slice(0, -1);
        receitaVista.descricao += `.`;
        receitaVista.descricao += `. Valor total de R$${novaVenda.preco_total}. Valor a vista de R$${novaVenda.valor_entrada} com ${novaVenda.parcelas} parcelas de R$${novaVenda.valor_parcelas}`;

        // receitaVista.descricao = `Valor do pagamento a vista R$${
        //   novoEstoque.valor_entrada
        // }.Foram removidos no estoque ${novoEstoque.quantidade} unidades de ${
        //   produto.data.nome
        // } na data ${novoEstoque.data.getDay}/${
        //   +novoEstoque.data.getMonth + 1
        // }/${novoEstoque.data.getFullYear}.`;
        receitaVista.data = novaVenda.data;
        receitaVista.anexo = novaVenda.anexo;
        receitaVista.valor = novaVenda.valor_entrada;
        receitaVista.cliente_id = novaVenda.cliente_id;
        receitaVista.vendas_id = vendaAdicionada.data.vendas_id;
        receitaVista.efetuado = true;
        await new ReceitaRepo().adicionar(receitaVista, ConexaoBD);

        let dataParcela = new Date(req.body.data_pagamento);
        let dataEntrada = novaVenda.data.toString();
        for (let i = 0; i < novaVenda.parcelas; i++) {
          let receitaPrazo: Receita = new Receita();
          receitaPrazo.usuario_id = usuarioId;

          receitaPrazo.descricao = `Valor do recebimento dessa parcela R$${
            novaVenda.valor_parcelas
          }. Venda realizada na data ${dataEntrada.split("-")[2]}/${
            dataEntrada.split("-")[1]
          }/${dataEntrada.split("-")[0]} no estoque. Parcela ${i + 1}/${
            novaVenda.parcelas
          }.`;

          if (i !== 0) {
            let novaData = dataParcela.getDate();
            dataParcela.setMonth(dataParcela.getMonth() + 1);
            if (dataParcela.getDate() != novaData) {
              dataParcela.setDate(0);
            }
            receitaPrazo.data = dataParcela;
          } else {
            receitaPrazo.data = dataParcela;
          }
          receitaPrazo.anexo = novaVenda.anexo;
          receitaPrazo.valor = novaVenda.valor_parcelas;
          receitaPrazo.cliente_id = novaVenda.cliente_id;
          receitaPrazo.vendas_id = vendaAdicionada.data.vendas_id;
          receitaPrazo.efetuado = false;
          await new ReceitaRepo().adicionar(receitaPrazo, ConexaoBD);
        }
      } else {
        //somente a prazo
        let dataParcela = new Date(req.body.data_pagamento);
        let dataEntrada = novaVenda.data.toString();
        for (let i = 0; i < novaVenda.parcelas; i++) {
          let receitaPrazo: Receita = new Receita();
          receitaPrazo.usuario_id = usuarioId;

          receitaPrazo.descricao = `Valor do recebimento dessa parcela R$${
            novaVenda.valor_parcelas
          }. Venda realizada na data ${dataEntrada.split("-")[2]}/${
            dataEntrada.split("-")[1]
          }/${dataEntrada.split("-")[0]} no estoque.`;

          if (i !== 0) {
            let novaData = dataParcela.getDate();
            dataParcela.setMonth(dataParcela.getMonth() + 1);
            if (dataParcela.getDate() != novaData) {
              dataParcela.setDate(0);
            }
            receitaPrazo.data = dataParcela;
          } else {
            receitaPrazo.data = dataParcela;
          }
          receitaPrazo.anexo = novaVenda.anexo;
          receitaPrazo.valor = novaVenda.valor_parcelas;
          receitaPrazo.cliente_id = novaVenda.cliente_id;
          receitaPrazo.vendas_id = vendaAdicionada.data.vendas_id;
          receitaPrazo.efetuado = false;
          await new ReceitaRepo().adicionar(receitaPrazo, ConexaoBD);
        }
      }

      ConexaoBD?.commit();

      resultado.HttpConstruirRetorno(HttpStatusCode.SuccessCreated);
    } catch (error: unknown) {
      console.log(error);
      ConexaoBD?.rollback();
      if (error instanceof objetoDeComunicacao) resultado = error;
      else
        resultado = new objetoDeComunicacao(HttpStatusCode.ServerErrorInternal);
    } finally {
      return res.status(resultado.message).json(resultado.toJSON());
    }
  }

  async obterPorId(req: Request, res: Response) {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {
      let usuarioId = req.body.token;
      delete req.body.token;
      usuarioId = usuarioId["usuario_id"];

      const vendaId = parseInt(req.params["id"]);

      if (!vendaId)
        throw new objetoDeComunicacao(HttpStatusCode.ClientErrorBadRequest);

      const resultadoVenda = await new VendasRepo().obterPorId(vendaId);
      if (!resultadoVenda || resultadoVenda.data.usuario_id !== usuarioId)
        throw new objetoDeComunicacao(HttpStatusCode.ClientErrorNotFound);

      console.log(resultadoVenda);
      resultado.HttpConstruirRetorno(
        HttpStatusCode.SuccessOK,
        resultadoVenda.data
      );
    } catch (error: unknown) {
      console.log(error);
      if (error instanceof objetoDeComunicacao) resultado = error;
      else
        resultado = new objetoDeComunicacao(HttpStatusCode.ServerErrorInternal);
    } finally {
      return res.status(resultado.message).json(resultado.toJSON());
    }
  }

  async listarTodos(req: Request, res: Response) {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {
      let usuarioId = req.body.token;
      delete req.body.token;
      usuarioId = usuarioId["usuario_id"];

      resultado = await new VendasRepo().listarTodos(usuarioId);
    } catch (error: unknown) {
      console.log(error);
      if (error instanceof objetoDeComunicacao) resultado = error;
      else
        resultado = new objetoDeComunicacao(HttpStatusCode.ServerErrorInternal);
    } finally {
      return res.status(resultado.message).json(resultado.toJSON());
    }
  }

  async atualizar(req: Request, res: Response) {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    let ConexaoBD = await new Database().sequelize?.transaction();
    try {
      let usuarioId = req.body.token;
      delete req.body.token;
      usuarioId = usuarioId["usuario_id"];

      const vendaId = parseInt(req.params["id"]);

      if (!vendaId)
        throw new objetoDeComunicacao(HttpStatusCode.ClientErrorBadRequest);

      let dadosVenda: Vendas = req.body;
      dadosVenda.id = vendaId;

      const vendaExistente = await new VendasRepo().obterPorId(vendaId);

      if (
        !vendaExistente.data ||
        vendaExistente.data.usuario_id !== usuarioId ||
        vendaExistente.data.cancelado === true
      )
        throw new objetoDeComunicacao(
          HttpStatusCode.ClientErrorNotFound,
          {},
          "Venda ID invalido."
        );

      resultado = await new VendasRepo().atualizar(dadosVenda, ConexaoBD);

      ConexaoBD?.commit();
    } catch (error: unknown) {
      console.log(error);
      ConexaoBD?.rollback();
      if (error instanceof objetoDeComunicacao) resultado = error;
      else
        resultado = new objetoDeComunicacao(HttpStatusCode.ServerErrorInternal);
    } finally {
      return res.status(resultado.message).json(resultado.toJSON());
    }
  }

  async excluir(req: Request, res: Response) {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    let ConexaoBD = await new Database().sequelize?.transaction();
    try {
      let usuarioId = req.body.token;
      delete req.body.token;
      usuarioId = usuarioId["usuario_id"];

      const vendasId = parseInt(req.params["id"]);
      if (!vendasId)
        throw new objetoDeComunicacao(HttpStatusCode.ClientErrorBadRequest);

      const resultadoVendas = await new VendasRepo().obterPorId(vendasId);
      if (!resultadoVendas || resultadoVendas.data.cancelado == true)
        throw new objetoDeComunicacao(HttpStatusCode.ClientErrorNotFound);

      let validado = validacaoBuscasOpcionaisReceitaEDespesa("", {});

      validado.data.vendas = !resultadoVendas.data.id
        ? "undefined"
        : resultadoVendas.data.id;

      const resultadoExclusaoReceitas = await new ReceitaRepo().listarTodas(
        usuarioId,
        validado.data
      );

      if (
        resultadoExclusaoReceitas.data.length == 0 ||
        //resultadoExclusaoReceitas.data.usuario_id !== usuarioId

        // resultadoExclusaoReceitas.data.map(
        //   (receita: { usuario_id: number }) => {
        //     return receita.usuario_id !== usuarioId ? true : false;
        //   }
        // )

        resultadoExclusaoReceitas.data.every(
          (receita: { usuario_id: number }) =>
            receita.usuario_id !== usuarioId ? true : false
        )
      )
        throw new objetoDeComunicacao(HttpStatusCode.ClientErrorForbidden);

      resultadoExclusaoReceitas.data.map(async (receita: { id: number }) => {
        await new ReceitaRepo().excluir(receita.id, ConexaoBD);
      });

      for (let i = 0; i < resultadoVendas.data.produtos.length; i++) {
        let produtoResultado = await new ProdutoRepo().obterPorId(
          resultadoVendas.data.produtos[i].produto_id,
          ConexaoBD
        );
        produtoResultado.data.estoque_atual +=
          +resultadoVendas.data.produtos[i].quantidade;

        await new ProdutoRepo().atualizar(produtoResultado.data, ConexaoBD);

        let adicionarEstoque: Estoque = new Estoque();
        const date = new Date();
        // const year = date.getUTCFullYear();
        // const month = String(date.getUTCMonth() + 1).padStart(2, "0");
        // const day = String(date.getUTCDate()).padStart(2, "0");

        // let data_hoje = `${year}-${month}-${day}`;

        adicionarEstoque.data = date;
        adicionarEstoque.tipo_pagamento = "vista";
        adicionarEstoque.preco_total =
          +resultadoVendas.data.produtos[i].preco_venda * 1;
        adicionarEstoque.quantidade =
          +resultadoVendas.data.produtos[i].quantidade;
        adicionarEstoque.produto_id =
          resultadoVendas.data.produtos[i].produto_id;
        adicionarEstoque.descricao = `Extorno do produto de uma venda cancelada.`;
        adicionarEstoque.recebido = true;
        adicionarEstoque.entrada = true;

        resultado = await new EstoqueRepo().adicionar(
          adicionarEstoque,
          ConexaoBD
        );
      }

      let vendaExcluida = await new VendasRepo().excluir(
        vendasId,
        usuarioId,
        ConexaoBD
      );

      resultado = vendaExcluida;
      ConexaoBD?.commit();
    } catch (error: unknown) {
      console.log(error);
      ConexaoBD?.rollback();
      if (error instanceof objetoDeComunicacao) resultado = error;
      else
        resultado = new objetoDeComunicacao(HttpStatusCode.ServerErrorInternal);
    } finally {
      return res.status(resultado.message).json(resultado.toJSON());
    }
  }

  async indicadores(req: Request, res: Response) {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {
      let usuarioId = req.body.token;
      delete req.body.token;
      usuarioId = usuarioId["usuario_id"];

      let { startDate, endDate } = req.query;

      startDate = startDate || getFirstDayOfMonth();
      endDate = endDate || getTodayDate();

      const totalVendas = await new VendasRepo().totalVendas(
        startDate,
        endDate,
        usuarioId
      );
      const vendasValorTotal = await new VendasRepo().vendasValorTotal(
        startDate,
        endDate,
        usuarioId
      );
      const devolucoes = await new VendasRepo().devolucoes(
        startDate,
        endDate,
        usuarioId
      );
      const lucro = await new VendasRepo().lucroBrutoTotal(
        startDate,
        endDate,
        usuarioId
      );
      resultado.HttpConstruirRetorno(HttpStatusCode.SuccessOK);
      resultado.data = {
        totalVendas: totalVendas.data,
        vendasValorTotal: vendasValorTotal.data,
        devolucoes: devolucoes.data,
        lucro: lucro.data,
      };
    } catch (error: unknown) {
      console.log(error);
      if (error instanceof objetoDeComunicacao) resultado = error;
      else
        resultado = new objetoDeComunicacao(HttpStatusCode.ServerErrorInternal);
    } finally {
      return res.status(resultado.message).json(resultado.toJSON());
    }
  }

  async vendasNoPeriodoSemPaginacao(req: Request, res: Response) {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {
      let usuarioId = req.body.token;
      delete req.body.token;
      usuarioId = usuarioId["usuario_id"];

      let { startDate, endDate } = req.query;

      startDate = startDate || getFirstDayOfMonth();
      endDate = endDate || getTodayDate();

      resultado = await new VendasRepo().vendasNoPeriodoSemPaginacao(
        startDate,
        endDate,
        usuarioId
      );
    } catch (error: unknown) {
      console.log(error);
      if (error instanceof objetoDeComunicacao) resultado = error;
      else
        resultado = new objetoDeComunicacao(HttpStatusCode.ServerErrorInternal);
    } finally {
      return res.status(resultado.message).json(resultado.toJSON());
    }
  }

  async vendasNoPeriodoComPaginacao(req: Request, res: Response) {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {
      let usuarioId = req.body.token;
      delete req.body.token;
      usuarioId = usuarioId["usuario_id"];

      let { startDate, endDate, page, limit } = req.query;

      startDate = startDate || getFirstDayOfMonth();
      endDate = endDate || getTodayDate();
      const pageNum: number = page ? parseInt(page as string) : 1;
      const limitNum: number = limit ? parseInt(limit as string) : 10;

      resultado = await new VendasRepo().vendasNoPeriodoComPaginacao(
        startDate,
        endDate,
        pageNum,
        limitNum,
        usuarioId
      );
    } catch (error: unknown) {
      console.log(error);
      if (error instanceof objetoDeComunicacao) resultado = error;
      else
        resultado = new objetoDeComunicacao(HttpStatusCode.ServerErrorInternal);
    } finally {
      return res.status(resultado.message).json(resultado.toJSON());
    }
  }

  async ranqueamentoDeProdutoPorCliente(req: Request, res: Response) {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {
      let usuarioId = req.body.token;
      delete req.body.token;
      usuarioId = usuarioId["usuario_id"];

      let { startDate, endDate } = req.query;

      startDate = startDate || getFirstDayOfMonth();
      endDate = endDate || getTodayDate();

      resultado = await new VendasRepo().ranqueamentoDeProdutoPorCliente(
        startDate,
        endDate,
        usuarioId
      );
    } catch (error: unknown) {
      console.log(error);
      if (error instanceof objetoDeComunicacao) resultado = error;
      else
        resultado = new objetoDeComunicacao(HttpStatusCode.ServerErrorInternal);
    } finally {
      return res.status(resultado.message).json(resultado.toJSON());
    }
  }

  async ranqueamentoDeClientePorProduto(req: Request, res: Response) {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {
      let usuarioId = req.body.token;
      delete req.body.token;
      usuarioId = usuarioId["usuario_id"];

      let { startDate, endDate } = req.query;

      startDate = startDate || getFirstDayOfMonth();
      endDate = endDate || getTodayDate();

      resultado = await new VendasRepo().ranqueamentoDeClientePorProduto(
        startDate,
        endDate,
        usuarioId
      );
    } catch (error: unknown) {
      console.log(error);
      if (error instanceof objetoDeComunicacao) resultado = error;
      else
        resultado = new objetoDeComunicacao(HttpStatusCode.ServerErrorInternal);
    } finally {
      return res.status(resultado.message).json(resultado.toJSON());
    }
  }

  async totalComprasCliente(req: Request, res: Response) {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {
      let usuarioId = req.body.token;
      delete req.body.token;
      usuarioId = usuarioId["usuario_id"];

      let { startDate, endDate, clienteId } = req.query;

      startDate = startDate || getFirstDayOfMonth();
      endDate = endDate || getTodayDate();
      const id_cliente: number = parseInt(clienteId as string);

      if (id_cliente) {
        resultado = await new VendasRepo().totalComprasCliente(
          startDate,
          endDate,
          usuarioId,
          id_cliente
        );
      } else {
        resultado = await new VendasRepo().totalComprasClienteBalcao(
          startDate,
          endDate,
          usuarioId
        );
      }
    } catch (error: unknown) {
      console.log(error);
      if (error instanceof objetoDeComunicacao) resultado = error;
      else
        resultado = new objetoDeComunicacao(HttpStatusCode.ServerErrorInternal);
    } finally {
      return res.status(resultado.message).json(resultado.toJSON());
    }
  }

  async totalDeClientesPorProduto(req: Request, res: Response) {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {
      let usuarioId = req.body.token;
      delete req.body.token;
      usuarioId = usuarioId["usuario_id"];

      let { startDate, endDate, produtoId } = req.query;

      startDate = startDate || getFirstDayOfMonth();
      endDate = endDate || getTodayDate();
      const id_produto: number = parseInt(produtoId as string);

      resultado = await new VendasRepo().totalDeClientesPorProduto(
        startDate,
        endDate,
        usuarioId,
        id_produto
      );
    } catch (error: unknown) {
      console.log(error);
      if (error instanceof objetoDeComunicacao) resultado = error;
      else
        resultado = new objetoDeComunicacao(HttpStatusCode.ServerErrorInternal);
    } finally {
      return res.status(resultado.message).json(resultado.toJSON());
    }
  }

  async unidadesVendidasPeriodo(req: Request, res: Response) {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {
      let usuarioId = req.body.token;
      delete req.body.token;
      usuarioId = usuarioId["usuario_id"];

      const dataHoje = getTodayDate();

      const dataMesPassado = formatDate(
        new Date(new Date().setDate(new Date().getDate() - 30))
      );
      const dataAnoPassado = formatDate(
        new Date(new Date().setDate(new Date().getDate() - 365))
      );
      const vendasMes = await new VendasRepo().vendasNoPeriodoSemPaginacao(
        dataMesPassado,
        dataHoje,
        usuarioId
      );

      const vendasAno = await new VendasRepo().vendasNoPeriodoSemPaginacao(
        dataAnoPassado,
        dataHoje,
        usuarioId
      );

      let unidadesMesPassado = 0;
      let unidadesAnoPassado = 0;

      console.log(vendasMes);
      console.log(vendasAno);
      for (const vendaMes of vendasMes.data)
        for (const produto of vendaMes.produtos)
          unidadesMesPassado += +produto.quantidade;

      for (const vendaAno of vendasAno.data)
        for (const produto of vendaAno.produtos)
          unidadesAnoPassado += +produto.quantidade;

      resultado.HttpConstruirRetorno(HttpStatusCode.SuccessOK, {
        vendasMesPassado: unidadesMesPassado,
        vendasAnoPassado: unidadesAnoPassado,
      });
    } catch (error: unknown) {
      console.log(error);
      if (error instanceof objetoDeComunicacao) resultado = error;
      else
        resultado = new objetoDeComunicacao(HttpStatusCode.ServerErrorInternal);
    } finally {
      return res.status(resultado.message).json(resultado.toJSON());
    }
  }
}

export default new VendasController();
