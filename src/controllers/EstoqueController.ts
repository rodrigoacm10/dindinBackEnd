import { Request, Response } from "express";
import { Estoque } from "../models/Estoque";
import { EstoqueRepo } from "../repository/EstoqueRepo";
import { objetoDeComunicacao } from "../utils/ObjetoDeComunicacao";
import HttpStatusCode from "../utils/HttpStatusCodes";
import FileController from "./FilesController";
import { validacaoBuscasOpcionaisReceitaEDespesa } from "../utils/FuncoesUteis";
import { Produto } from "../models/Produto";
import { ProdutoRepo } from "../repository/ProdutoRepo";
import { Despesa } from "../models/Despesa";
import { Receita } from "../models/Receita";
import { DespesaRepo } from "../repository/DespesaRepo";
import { ReceitaRepo } from "../repository/ReceitaRepo";
import { getFirstDayOfMonth, getTodayDate, formatDate } from "../utils/Date";
import Database from "../config/database";

class EstoqueController {
  async adicionar(req: Request, res: Response) {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    let ConexaoBD = await new Database().sequelize?.transaction();
    try {
      let usuarioId = req.body.token;
      delete req.body.token;
      usuarioId = usuarioId["usuario_id"];

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

      if (typeof req.body.quantidade !== "number" || req.body.quantidade <= 0)
        throw new objetoDeComunicacao(
          HttpStatusCode.ClientErrorBadRequest,
          {},
          "Quantidade Invalida."
        );

      if (typeof req.body.preco_total !== "number" || req.body.preco_total <= 0)
        throw new objetoDeComunicacao(
          HttpStatusCode.ClientErrorBadRequest,
          {},
          "Preço Invalida."
        );

      if (typeof req.body.entrada !== "boolean")
        throw new objetoDeComunicacao(
          HttpStatusCode.ClientErrorBadRequest,
          {},
          "Tipo de entrada Invalida."
        );

      if (req.body.tipo_pagamento === "vista") {
        //pass
      } else if (req.body.tipo_pagamento === "prazo") {
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

      const novoEstoque: Estoque = req.body;

      const produto = await new ProdutoRepo().obterPorId(
        novoEstoque.produto_id
      );

      if (!produto || usuarioId !== produto.data.usuario_id)
        throw new objetoDeComunicacao(
          HttpStatusCode.ClientErrorBadRequest,
          {},
          "Produto ID invalido."
        );

      let estoqueCriado = await new EstoqueRepo().adicionar(
        novoEstoque,
        ConexaoBD
      );

      if (novoEstoque.entrada) {
        if (req.body.tipo_pagamento === "vista") {
          let despesa: Despesa = new Despesa();
          despesa.usuario_id = usuarioId;
          despesa.produto_id = novoEstoque.produto_id;
          despesa.descricao = `Foram adicionados no estoque ${novoEstoque.quantidade} unidades de ${produto.data.nome}`;
          despesa.data = novoEstoque.data;
          despesa.anexo = novoEstoque.anexo;
          despesa.valor = novoEstoque.preco_total;
          despesa.efetuado = true;
          despesa.estoque_id = estoqueCriado.data.id;

          await new DespesaRepo().adicionar(despesa, ConexaoBD);
        } else if (req.body.tipo_pagamento === "vista+prazo") {
          let despesaVista: Despesa = new Despesa();

          despesaVista.usuario_id = usuarioId;
          despesaVista.produto_id = novoEstoque.produto_id;
          despesaVista.descricao = `Valor do pagamento a vista R$${
            novoEstoque.valor_entrada
          }.Foram adicionados no estoque ${
            novoEstoque.quantidade
          } unidades de ${produto.data.nome} na data ${
            novoEstoque.data.getDay
          }/${+novoEstoque.data.getMonth + 1}/${novoEstoque.data.getFullYear}.`;
          despesaVista.data = novoEstoque.data;
          despesaVista.anexo = novoEstoque.anexo;
          despesaVista.valor = novoEstoque.valor_entrada;
          despesaVista.efetuado = true;
          despesaVista.estoque_id = estoqueCriado.data.id;
          await new DespesaRepo().adicionar(despesaVista, ConexaoBD);

          let dataParcela = new Date(req.body.data_pagamento);
          let dataEntrada = novoEstoque.data.toString();
          for (let i = 0; i < novoEstoque.parcelas; i++) {
            let despesaPrazo: Despesa = new Despesa();
            despesaPrazo.usuario_id = usuarioId;
            despesaPrazo.produto_id = novoEstoque.produto_id;

            despesaPrazo.descricao = `Valor do pagamento dessa parcela R$${
              novoEstoque.valor_parcelas
            }. Houve uma adição de ${novoEstoque.quantidade} unidade(s) de ${
              produto.data.nome
            } na data ${dataEntrada.split("-")[2]}/${
              dataEntrada.split("-")[1]
            }/${dataEntrada.split("-")[0]} no estoque.`;

            if (i !== 0) {
              let novaData = dataParcela.getDate();
              dataParcela.setMonth(dataParcela.getMonth() + 1);
              if (dataParcela.getDate() != novaData) {
                dataParcela.setDate(0);
              }
              despesaPrazo.data = dataParcela;
            } else {
              despesaPrazo.data = dataParcela;
            }
            despesaPrazo.anexo = novoEstoque.anexo;
            despesaPrazo.valor = novoEstoque.valor_parcelas;
            despesaPrazo.efetuado = false;
            despesaPrazo.estoque_id = estoqueCriado.data.id;
            await new DespesaRepo().adicionar(despesaPrazo, ConexaoBD);
          }
        } else {
          //somente a prazo
          let dataParcela = new Date(req.body.data_pagamento);
          let dataEntrada = novoEstoque.data.toString();
          for (let i = 0; i < novoEstoque.parcelas; i++) {
            let despesaPrazo: Despesa = new Despesa();
            despesaPrazo.usuario_id = usuarioId;
            despesaPrazo.produto_id = novoEstoque.produto_id;

            despesaPrazo.descricao = `Valor do pagamento dessa parcela R$${
              novoEstoque.valor_parcelas
            }. Houve uma adição de ${novoEstoque.quantidade} unidade(s) de ${
              produto.data.nome
            } na data ${dataEntrada.split("-")[2]}/${
              dataEntrada.split("-")[1]
            }/${dataEntrada.split("-")[0]} no estoque.`;

            if (i !== 0) {
              let novaData = dataParcela.getDate();
              dataParcela.setMonth(dataParcela.getMonth() + 1);
              if (dataParcela.getDate() != novaData) {
                dataParcela.setDate(0);
              }
              despesaPrazo.data = dataParcela;
            } else {
              despesaPrazo.data = dataParcela;
            }
            despesaPrazo.anexo = novoEstoque.anexo;
            despesaPrazo.valor = novoEstoque.valor_parcelas;
            despesaPrazo.efetuado = false;
            despesaPrazo.estoque_id = estoqueCriado.data.id;
            await new DespesaRepo().adicionar(despesaPrazo, ConexaoBD);
          }
        }
      }
      // } else {
      //   if (req.body.tipo_pagamento === "vista") {
      //     let receita: Receita = new Receita();
      //     receita.usuario_id = usuarioId;
      //     receita.produto_id = novoEstoque.produto_id;
      //     receita.descricao = `Foram removidos no estoque ${novoEstoque.quantidade} unidades de ${produto.data.nome}`;
      //     receita.data = novoEstoque.data;
      //     receita.anexo = novoEstoque.anexo;
      //     receita.valor = novoEstoque.preco_total;
      //     receita.efetuado = true;
      //     receita.is_estoque = true;

      //     await new ReceitaRepo().adicionar(receita, ConexaoBD);
      //   } else if (req.body.tipo_pagamento === "vista+prazo") {
      //     let receitaVista: Receita = new Receita();

      //     receitaVista.usuario_id = usuarioId;
      //     receitaVista.produto_id = novoEstoque.produto_id;
      //     receitaVista.descricao = `Valor do pagamento a vista R$${
      //       novoEstoque.valor_entrada
      //     }.Foram removidos no estoque ${novoEstoque.quantidade} unidades de ${
      //       produto.data.nome
      //     } na data ${novoEstoque.data.getDay}/${
      //       +novoEstoque.data.getMonth + 1
      //     }/${novoEstoque.data.getFullYear}.`;
      //     receitaVista.data = novoEstoque.data;
      //     receitaVista.anexo = novoEstoque.anexo;
      //     receitaVista.valor = novoEstoque.valor_entrada;
      //     receitaVista.efetuado = true;
      //     receitaVista.is_estoque = true;
      //     await new ReceitaRepo().adicionar(receitaVista, ConexaoBD);

      //     let dataParcela = new Date(req.body.data_pagamento);
      //     let dataEntrada = novoEstoque.data.toString();
      //     for (let i = 0; i < novoEstoque.parcelas; i++) {
      //       let receitaPrazo: Receita = new Receita();
      //       receitaPrazo.usuario_id = usuarioId;
      //       receitaPrazo.produto_id = novoEstoque.produto_id;

      //       receitaPrazo.descricao = `Valor do recebimento dessa parcela R$${
      //         novoEstoque.valor_parcelas
      //       }. Houve uma adição de ${novoEstoque.quantidade} unidade(s) de ${
      //         produto.data.nome
      //       } na data ${dataEntrada.split("-")[2]}/${
      //         dataEntrada.split("-")[1]
      //       }/${dataEntrada.split("-")[0]} no estoque.`;

      //       if (i !== 0) {
      //         let novaData = dataParcela.getDate();
      //         dataParcela.setMonth(dataParcela.getMonth() + 1);
      //         if (dataParcela.getDate() != novaData) {
      //           dataParcela.setDate(0);
      //         }
      //         receitaPrazo.data = dataParcela;
      //       } else {
      //         receitaPrazo.data = dataParcela;
      //       }
      //       receitaPrazo.anexo = novoEstoque.anexo;
      //       receitaPrazo.valor = novoEstoque.valor_parcelas;
      //       receitaPrazo.efetuado = false;
      //       receitaPrazo.is_estoque = true;
      //       await new ReceitaRepo().adicionar(receitaPrazo, ConexaoBD);
      //     }
      //   } else {
      //     //somente a prazo
      //     let dataParcela = new Date(req.body.data_pagamento);
      //     let dataEntrada = novoEstoque.data.toString();
      //     for (let i = 0; i < novoEstoque.parcelas; i++) {
      //       let receitaPrazo: Receita = new Receita();
      //       receitaPrazo.usuario_id = usuarioId;
      //       receitaPrazo.produto_id = novoEstoque.produto_id;

      //       receitaPrazo.descricao = `Valor do recebimento dessa parcela R$${
      //         novoEstoque.valor_parcelas
      //       }. Houve uma adição de ${novoEstoque.quantidade} unidade(s) de ${
      //         produto.data.nome
      //       } na data ${dataEntrada.split("-")[2]}/${
      //         dataEntrada.split("-")[1]
      //       }/${dataEntrada.split("-")[0]} no estoque.`;

      //       if (i !== 0) {
      //         let novaData = dataParcela.getDate();
      //         dataParcela.setMonth(dataParcela.getMonth() + 1);
      //         if (dataParcela.getDate() != novaData) {
      //           dataParcela.setDate(0);
      //         }
      //         receitaPrazo.data = dataParcela;
      //       } else {
      //         receitaPrazo.data = dataParcela;
      //       }
      //       receitaPrazo.anexo = novoEstoque.anexo;
      //       receitaPrazo.valor = novoEstoque.valor_parcelas;
      //       receitaPrazo.efetuado = false;
      //       receitaPrazo.is_estoque = true;
      //       await new ReceitaRepo().adicionar(receitaPrazo, ConexaoBD);
      //     }
      //   }
      // }

      // Atualizando a quantidade do produto no estoque
      if (novoEstoque.entrada) {
        produto.data.estoque_atual += novoEstoque.quantidade;
      } else {
        if (produto.data.estoque_atual - novoEstoque.quantidade < 0) {
          throw new objetoDeComunicacao(
            HttpStatusCode.ClientErrorBadRequest,
            {},
            "Quantidade de retirada excede o estoque."
          );
        }
        produto.data.estoque_atual -= novoEstoque.quantidade;
      }

      resultado = await new ProdutoRepo().atualizar(produto.data, ConexaoBD);

      resultado.HttpConstruirRetorno(HttpStatusCode.SuccessCreated);
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

      const estoqueId = parseInt(req.params["id"]);
      if (!estoqueId)
        throw new objetoDeComunicacao(HttpStatusCode.ClientErrorBadRequest);

      const resultadoEstoque = await new EstoqueRepo().obterPorId(estoqueId);
      if (!resultadoEstoque || resultadoEstoque.data.cancelado == true)
        throw new objetoDeComunicacao(HttpStatusCode.ClientErrorNotFound);

      const resultadoProduto = await new ProdutoRepo().obterPorId(
        resultadoEstoque.data.produto_id
      );
      if (!resultadoProduto || resultadoProduto.data.usuario_id !== usuarioId)
        throw new objetoDeComunicacao(HttpStatusCode.ClientErrorForbidden);

      const anexo = resultadoEstoque.data.anexo;

      resultado = await new EstoqueRepo().excluir(estoqueId, ConexaoBD);

      if (resultadoEstoque.data.entrada)
        resultadoProduto.data.estoque_atual -= resultadoEstoque.data.quantidade;
      else
        resultadoProduto.data.estoque_atual += resultadoEstoque.data.quantidade;

      await new ProdutoRepo().atualizar(resultadoProduto.data, ConexaoBD);

      /////
      const resultadoExclusaoDespesas = await new DespesaRepo().listarTodas(
        usuarioId,
        {
          estoque: estoqueId.toString(),
          efetuado: "undefined",
          dataInicio: "undefined",
          dataFim: "undefined",
          cliente: "undefined",
          produto: "undefined",
          servico: "undefined",
          categoria: "undefined",
        }
      );

      if (
        // resultadoExclusaoDespesas.data.length == 0 ||
        resultadoExclusaoDespesas.data.every(
          (despesa: { usuario_id: number }) =>
            despesa.usuario_id !== usuarioId ? true : false
        )
      ) {
        throw new objetoDeComunicacao(HttpStatusCode.ClientErrorForbidden);
      }

      // await resultadoExclusaoDespesas.data.map(
      //   async (despesa: { id: number }) => {
      //     await new DespesaRepo().excluir(despesa.id, ConexaoBD);
      //   }
      // );
      for (const despesa of resultadoExclusaoDespesas.data) {
        await new DespesaRepo().excluir(despesa.id, ConexaoBD);
      }

      ///

      ConexaoBD?.commit();
      if (anexo) {
        await FileController.removeFileByName(anexo);
      }
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

      const estoqueId = parseInt(req.params["id"]);

      if (!estoqueId)
        throw new objetoDeComunicacao(HttpStatusCode.ClientErrorBadRequest);

      const resultadoEstoque = await new EstoqueRepo().obterPorId(estoqueId);
      if (!resultadoEstoque)
        throw new objetoDeComunicacao(HttpStatusCode.ClientErrorNotFound);

      const resultadoProduto = await new ProdutoRepo().obterPorId(
        resultadoEstoque.data.produto_id
      );
      if (resultadoProduto.data.usuario_id !== usuarioId)
        throw new objetoDeComunicacao(HttpStatusCode.ClientErrorForbidden);

      resultado = resultadoEstoque;
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
    try {
      let usuarioId = req.body.token;
      delete req.body.token;
      usuarioId = usuarioId["usuario_id"];

      const estoqueId = parseInt(req.params["id"]);
      if (!estoqueId)
        throw new objetoDeComunicacao(
          HttpStatusCode.ClientErrorBadRequest,
          {},
          "ID da estoque invalido."
        );

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

      if (typeof req.body.quantidade !== "number" || req.body.quantidade <= 0)
        throw new objetoDeComunicacao(
          HttpStatusCode.ClientErrorBadRequest,
          {},
          "Quantidade Invalida."
        );

      if (typeof req.body.preco_total !== "number" || req.body.preco_total <= 0)
        throw new objetoDeComunicacao(
          HttpStatusCode.ClientErrorBadRequest,
          {},
          "Preço Invalida."
        );

      if (typeof req.body.entrada !== "boolean")
        throw new objetoDeComunicacao(
          HttpStatusCode.ClientErrorBadRequest,
          {},
          "Tipo de entrada Invalida."
        );

      const novoEstoque: Estoque = req.body;
      novoEstoque.id = estoqueId;

      const estoqueExistente = await new EstoqueRepo().obterPorId(estoqueId);

      if (!estoqueExistente)
        throw new objetoDeComunicacao(
          HttpStatusCode.ClientErrorNotFound,
          {},
          "Estoque ID inexistente."
        );

      const produtoExistente = await new ProdutoRepo().obterPorId(
        estoqueExistente.data.produto_id
      );

      if (!produtoExistente || usuarioId !== produtoExistente.data.usuario_id)
        throw new objetoDeComunicacao(
          HttpStatusCode.ClientErrorBadRequest,
          {},
          "Produto ID invalido."
        );

      let novoProdutoId: objetoDeComunicacao = new objetoDeComunicacao(
        HttpStatusCode.SuccessAccepted
      );
      if (novoEstoque.produto_id !== undefined) {
        novoProdutoId = await new ProdutoRepo().obterPorId(
          novoEstoque.produto_id
        );
        if (!novoProdutoId || usuarioId !== novoProdutoId.data.usuario_id)
          throw new objetoDeComunicacao(
            HttpStatusCode.ClientErrorBadRequest,
            {},
            "Produto ID invalido."
          );
      }

      resultado = await new EstoqueRepo().atualizar(novoEstoque);

      if (novoEstoque.produto_id === produtoExistente.data.id) {
        //caso na atualização o tipo de entrada e a quantidade sejam diferentes, faz o calculo pra saber em quanto o estoque atual vai ser alterado
        if (estoqueExistente.data.entrada === novoEstoque.entrada) {
          if (estoqueExistente.data.quantidade !== novoEstoque.quantidade)
            produtoExistente.data.quantidade +=
              novoEstoque.quantidade - estoqueExistente.data.quantidade;
        } else if (estoqueExistente.data.entrada === true) {
          if (estoqueExistente.data.quantidade === novoEstoque.quantidade)
            produtoExistente.data.quantidade -=
              2 * estoqueExistente.data.quantidade;
          else
            produtoExistente.data.quantidade -=
              estoqueExistente.data.quantidade + novoEstoque.quantidade;
        } else {
          if (estoqueExistente.data.quantidade === novoEstoque.quantidade)
            produtoExistente.data.quantidade +=
              2 * estoqueExistente.data.quantidade;
          else
            produtoExistente.data.quantidade +=
              estoqueExistente.data.quantidade + novoEstoque.quantidade;
        }
        new ProdutoRepo().atualizar(produtoExistente.data);
      }
      // Caso alem da mudança de entrada e valor, o numero do ID tambem mude, ocorre o caso abaixo
      else {
        if (produtoExistente.data.entrada)
          if (novoProdutoId.data.entrada) {
            produtoExistente.data.quantidade -= novoEstoque.quantidade;
            novoProdutoId.data.quantidade += novoEstoque.quantidade;
          } else {
            produtoExistente.data.quantidade -= novoEstoque.quantidade;
            novoProdutoId.data.quantidade -= novoEstoque.quantidade;
          }
        else if (novoProdutoId.data.entrada) {
          produtoExistente.data.quantidade += novoEstoque.quantidade;
          novoProdutoId.data.quantidade += novoEstoque.quantidade;
        } else {
          produtoExistente.data.quantidade += novoEstoque.quantidade;
          novoProdutoId.data.quantidade -= novoEstoque.quantidade;
        }
        await new ProdutoRepo().atualizar(produtoExistente.data);
        await new ProdutoRepo().atualizar(novoProdutoId.data);
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

  async listarTodos(req: Request, res: Response) {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {
      let usuarioId = req.body.token;
      delete req.body.token;
      usuarioId = usuarioId["usuario_id"];

      if (req.query.produto !== undefined) {
        resultado = await new EstoqueRepo().listarTodosPorProduto(
          ~~req.query.produto
        );
      } else {
        resultado = await new EstoqueRepo().listarTodosPorUsuario(usuarioId);
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

  async entradaUltimosSeteDias(req: Request, res: Response) {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {
      let usuarioId = req.body.token;
      delete req.body.token;
      usuarioId = usuarioId["usuario_id"];

      resultado = await new EstoqueRepo().entradaUltimosSeteDias(usuarioId);
    } catch (error: unknown) {
      console.log(error);
      if (error instanceof objetoDeComunicacao) resultado = error;
      else
        resultado = new objetoDeComunicacao(HttpStatusCode.ServerErrorInternal);
    } finally {
      return res.status(resultado.message).json(resultado.toJSON());
    }
  }

  async totalNaoRecebido(req: Request, res: Response) {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {
      let usuarioId = req.body.token;
      delete req.body.token;
      usuarioId = usuarioId["usuario_id"];

      resultado = await new EstoqueRepo().totalNaoRecebido(usuarioId);
    } catch (error: unknown) {
      console.log(error);
      if (error instanceof objetoDeComunicacao) resultado = error;
      else
        resultado = new objetoDeComunicacao(HttpStatusCode.ServerErrorInternal);
    } finally {
      return res.status(resultado.message).json(resultado.toJSON());
    }
  }

  async indicadoresEstoque(req: Request, res: Response) {
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

      const totalEntrada = await new EstoqueRepo().totalEntradaPeriodo(
        startDate,
        endDate,
        usuarioId
      );
      const totalSaida = await new EstoqueRepo().totalSaidaPeriodo(
        startDate,
        endDate,
        usuarioId
      );
      resultado.HttpConstruirRetorno(HttpStatusCode.SuccessOK);

      resultado.data = {
        totalEntrada: totalEntrada.data[0]?.totalEntrada || 0,
        totalSaida: totalSaida.data[0]?.totalSaida || 0,
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

  async entradaEstoquePeriodo(req: Request, res: Response) {
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

      resultado = await new EstoqueRepo().entradasEstoquePeriodo(
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

  async comprasFornecedorPeriodo(req: Request, res: Response) {
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

      resultado = await new EstoqueRepo().compraFornecedorPeriodo(
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

  async marcaProdutoPeriodo(req: Request, res: Response) {
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

      resultado = await new EstoqueRepo().marcaProdutoPeriodo(
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

  async entradaProdutoPeriodo(req: Request, res: Response) {
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

      resultado = await new EstoqueRepo().entradaProdutoPeriodo(
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

  async entradaCategoriaProdutoPeriodo(req: Request, res: Response) {
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

      resultado = await new EstoqueRepo().entradaCategoriaProdutoPeriodo(
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

  async entradaSaidaProdutosPeriodo(req: Request, res: Response) {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {
      let usuarioId = req.body.token;
      delete req.body.token;
      usuarioId = usuarioId["usuario_id"];

      let { startDate, endDate, entrada, produtoId } = req.query;

      startDate = startDate || getFirstDayOfMonth();
      endDate = endDate || getTodayDate();
      const id_produto: number = parseInt(produtoId as string);
      const condicao = entrada == "true";

      resultado = await new EstoqueRepo().entradaSaidaProdutoPeriodo(
        startDate,
        endDate,
        usuarioId,
        condicao,
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

  async estoquePorFornecedorPeriodo(req: Request, res: Response) {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {
      let usuarioId = req.body.token;
      delete req.body.token;
      usuarioId = usuarioId["usuario_id"];

      let { startDate, endDate, fornecedorId } = req.query;

      startDate = startDate || getFirstDayOfMonth();
      endDate = endDate || getTodayDate();
      const id_fornecedor: number = parseInt(fornecedorId as string);

      if (id_fornecedor) {
        resultado = await new EstoqueRepo().estoquePorFornecedorPeriodo(
          startDate,
          endDate,
          usuarioId,
          id_fornecedor
        );
      } else {
        resultado =
          await new EstoqueRepo().estoquePorFornecedorPeriodoSemFornecedor(
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
}

export default new EstoqueController();
