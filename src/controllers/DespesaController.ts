import { Request, Response } from "express";
import { Despesa } from "../models/Despesa";
import { DespesaRepo } from "../repository/DespesaRepo";
import FileController from "./FilesController";

import { objetoDeComunicacao } from "../utils/ObjetoDeComunicacao";
import HttpStatusCode from "../utils/HttpStatusCodes";
import { validacaoBuscasOpcionaisReceitaEDespesa } from "../utils/FuncoesUteis";
import { CategoriaDespesaRepo } from "../repository/CategoriaDespesaRepo";

class DespesaController {
  async adicionar(req: Request, res: Response) {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
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

        // req.body.data = Date.parse(req.body.data);
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

      if (
        typeof req.body.efetuado == "string" &&
        req.body.efetuado.toLocaleUpperCase() === "SIM"
      )
        req.body.efetuado = true;
      else if (
        typeof req.body.efetuado == "string" &&
        req.body.efetuado.toLocaleUpperCase() === "NAO"
      )
        req.body.efetuado = false;
      else
        throw new objetoDeComunicacao(
          HttpStatusCode.ClientErrorBadRequest,
          {},
          "Efetuado Invalido."
        );

      const novaDespesa: Despesa = req.body;
      novaDespesa.usuario_id = usuarioId;

      resultado = await new DespesaRepo().adicionar(novaDespesa);
    } catch (error: unknown) {
      console.log(error);
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
    try {
      let usuarioId = req.body.token;
      delete req.body.token;
      usuarioId = usuarioId["usuario_id"];

      const despesaId = parseInt(req.params["id"]);

      if (!despesaId)
        throw new objetoDeComunicacao(HttpStatusCode.ClientErrorNotFound);

      resultado = await new DespesaRepo().obterPorId(despesaId);

      if (resultado.data.usuario_id !== usuarioId)
        throw new objetoDeComunicacao(HttpStatusCode.ClientErrorForbidden);

      const anexo = resultado.data.anexo;

      resultado = await new DespesaRepo().excluir(despesaId);

      if (anexo) {
        await FileController.removeFileByName(anexo);
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

  async obterPorId(req: Request, res: Response) {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {
      let usuarioId = req.body.token;
      delete req.body.token;
      usuarioId = usuarioId["usuario_id"];

      const despesaId = parseInt(req.params["id"]);

      if (!despesaId)
        throw new objetoDeComunicacao(HttpStatusCode.ClientErrorNotFound);

      resultado = await new DespesaRepo().obterPorId(despesaId);

      if (resultado.data.usuario_id !== usuarioId)
        throw new objetoDeComunicacao(HttpStatusCode.ClientErrorForbidden);
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

      resultado = validacaoBuscasOpcionaisReceitaEDespesa(
        req.query.efetuado as string,
        {
          dataInicio: req.query.inicio as string,
          dataFim: req.query.fim as string,
          cliente: req.query.cliente as string,
          produto: req.query.produto as string,
          servico: req.query.servico as string,
          categoria: req.query.categoria as string,
        }
      );
      if (resultado.header != HttpStatusCode.SuccessOK) throw resultado;

      resultado.data.estoque = "undefined";
      resultado = await new DespesaRepo().listarTodas(
        usuarioId,
        resultado.data
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

  async paginacao(req: Request, res: Response) {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {
      const quantidade = parseInt(req.params["quantidade"]);
      const pagina = parseInt(req.params["pagina"]);

      if (isNaN(quantidade) || isNaN(pagina) || quantidade <= 0 || pagina < 0)
        throw new objetoDeComunicacao(
          HttpStatusCode.ClientErrorBadRequest,
          {},
          "Valor de pagina ou quantidade de paginas invalido."
        );

      resultado = validacaoBuscasOpcionaisReceitaEDespesa(
        req.query.efetuado as string,
        {
          dataInicio: req.query.inicio as string,
          dataFim: req.query.fim as string,
          cliente: req.query.cliente as string,
          produto: req.query.produto as string,
          servico: req.query.servico as string,
          categoria: req.query.categoria as string,
        }
      );

      if (resultado.header != HttpStatusCode.SuccessOK) throw resultado;

      let usuarioId = req.body.token;
      delete req.body.token;
      usuarioId = usuarioId["usuario_id"];

      resultado = await new DespesaRepo().paginacao(
        quantidade,
        pagina,
        resultado.data,
        usuarioId
      );

      resultado.mensagemTexto = `${quantidade * pagina + 1} ate ${
        quantidade * pagina + quantidade
      } de ${resultado.mensagemTexto}`;
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
      req.body.usuario_id = usuarioId["usuario_id"];

      const despesaId = parseInt(req.params["id"]);
      if (!despesaId)
        throw new objetoDeComunicacao(
          HttpStatusCode.ClientErrorBadRequest,
          {},
          "ID da operação invalido."
        );

      if (req.body.data)
        if (RegExp(/^[0-9]{2}\/[0-9]{2}\/[0-9]{4}$/).test(req.body.data)) {
          req.body.data = req.body.data.split("/").reverse().join("/");
          req.body.data = req.body.data.replaceAll("/", "-");

          // req.body.data = Date.parse(req.body.data);
        } else if (RegExp(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/).test(req.body.data)) {
          //pass #faz nada. So valida
        } else {
          throw new objetoDeComunicacao(
            HttpStatusCode.ClientErrorBadRequest,
            {},
            "Data invalida."
          );
        }
      else req.body.data = "";

      if (
        typeof req.body.efetuado == "string" &&
        req.body.efetuado.toLocaleUpperCase() === "SIM"
      )
        req.body.efetuado = true;
      else if (
        typeof req.body.efetuado == "string" &&
        req.body.efetuado.toLocaleUpperCase() === "NAO"
      )
        req.body.efetuado = false;
      else req.body.efetuado = undefined;

      const dadosDespesa: Despesa = req.body;
      dadosDespesa.id = despesaId;

      resultado = await new DespesaRepo().atualizar(dadosDespesa);
    } catch (error: unknown) {
      console.log(error);
      if (error instanceof objetoDeComunicacao) resultado = error;
      else
        resultado = new objetoDeComunicacao(HttpStatusCode.ServerErrorInternal);
    } finally {
      return res.status(resultado.message).json(resultado.toJSON());
    }
  }

  async relatoriosPorMes(req: Request, res: Response) {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {
      let usuarioId = req.body.token;
      delete req.body.token;
      usuarioId = usuarioId["usuario_id"];

      resultado = validacaoBuscasOpcionaisReceitaEDespesa(
        req.query.efetuado as string,
        {
          dataInicio: req.query.inicio as string,
          dataFim: req.query.fim as string,
          cliente: req.query.cliente as string,
          produto: req.query.produto as string,
          servico: req.query.servico as string,
          categoria: req.query.categoria as string,
        }
      );

      if (resultado.header != HttpStatusCode.SuccessOK) throw resultado;

      resultado.data.dataInicio = resultado.data.dataInicio
        .slice(0, -2)
        .concat("01");
      resultado.data.dataFim = resultado.data.dataFim
        .slice(0, -2)
        .concat(
          new Date(
            resultado.data.dataFim.split("-")[0],
            resultado.data.dataFim.split("-")[1],
            0
          ).getDate()
        );

      let dados: objetoDeComunicacao = await new DespesaRepo().listarTodas(
        usuarioId,
        resultado.data
      );

      //bloco de codigo para criar uma variavel com os anos e meses do pedido requerido pelo usuario
      let totalMeses: number =
        (+resultado.data.dataFim.split("-")[0] -
          +resultado.data.dataInicio.split("-")[0]) *
          12 +
        (+resultado.data.dataFim.split("-")[1] -
          +resultado.data.dataInicio.split("-")[1]) +
        1;

      if (totalMeses < 1)
        throw new objetoDeComunicacao(HttpStatusCode.ClientErrorBadRequest);

      let mesInicio: number = +resultado.data.dataInicio.split("-")[1];
      let anoInicio: number = +resultado.data.dataInicio.split("-")[0];
      let despesas: any = {};

      for (let i = 0; i < totalMeses; i++) {
        if (despesas[anoInicio] == undefined) despesas[anoInicio] = {};

        despesas[anoInicio][mesInicio.toString().padStart(2, "0")] = 0;

        mesInicio++;
        if (mesInicio === 13) {
          mesInicio = 1;
          anoInicio += 1;
        }
      }

      dados.data.forEach((dados: any) => {
        despesas[dados.data.split("-")[0]][dados.data.split("-")[1]] +=
          +dados.valor;
      });

      resultado.HttpConstruirRetorno(
        HttpStatusCode.SuccessOK,
        despesas,
        "Busca realizada com sucesso."
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

  async relatoriosPorDia(req: Request, res: Response) {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {
      let usuarioId = req.body.token;
      delete req.body.token;
      usuarioId = usuarioId["usuario_id"];

      resultado = validacaoBuscasOpcionaisReceitaEDespesa(
        req.query.efetuado as string,
        {
          dataInicio: req.query.inicio as string,
          dataFim: req.query.fim as string,
          cliente: req.query.cliente as string,
          produto: req.query.produto as string,
          servico: req.query.servico as string,
          categoria: req.query.categoria as string,
        }
      );

      if (resultado.header != HttpStatusCode.SuccessOK) throw resultado;

      let dados: objetoDeComunicacao = await new DespesaRepo().listarTodas(
        usuarioId,
        resultado.data
      );

      //bloco de codigo para criar uma variavel com os anos e meses do pedido requerido pelo usuario

      let dataFim: Date = new Date(
        resultado.data.dataFim.split("-")[0],
        resultado.data.dataFim.split("-")[1] - 1, //os meses vao de 0 até 11, por isso subtrair 1
        resultado.data.dataFim.split("-")[2]
      );
      let dataInicio: Date = new Date(
        resultado.data.dataInicio.split("-")[0],
        resultado.data.dataInicio.split("-")[1] - 1,
        resultado.data.dataInicio.split("-")[2]
      );
      let totalDias: number =
        Math.round(
          (dataFim.getTime() - dataInicio.getTime()) / (1000 * 3600 * 24)
        ) + 1;
      if (totalDias < 1)
        throw new objetoDeComunicacao(HttpStatusCode.ClientErrorBadRequest);

      let diaInicio: number = +resultado.data.dataInicio.split("-")[2];
      let mesInicio: number = +resultado.data.dataInicio.split("-")[1];
      let anoInicio: number = +resultado.data.dataInicio.split("-")[0];
      let despesas: any = {};

      for (let i = 0; i < totalDias; i++) {
        console.log(despesas);

        if (despesas[anoInicio] == undefined) despesas[anoInicio] = {};
        if (
          despesas[anoInicio][mesInicio.toString().padStart(2, "0")] ==
          undefined
        )
          despesas[anoInicio][mesInicio.toString().padStart(2, "0")] = {};

        console.log(despesas);
        despesas[anoInicio][mesInicio.toString().padStart(2, "0")][
          diaInicio.toString().padStart(2, "0")
        ] = 0;

        diaInicio++;

        if (diaInicio > new Date(anoInicio, mesInicio, 0).getDate()) {
          diaInicio = 1;
          mesInicio += 1;
        }

        if (mesInicio > 12) {
          mesInicio = 1;
          anoInicio += 1;
        }
      }

      dados.data.forEach((dados: any) => {
        // console.log("aaaa");
        // console.log(dados);
        despesas[dados.data.split("-")[0]][dados.data.split("-")[1]][
          dados.data.split("-")[2]
        ] += +dados.valor;
      });

      resultado.HttpConstruirRetorno(
        HttpStatusCode.SuccessOK,
        despesas,
        "Busca realizada com sucesso."
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

  async relatorios7Dias(req: Request, res: Response) {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {
      let usuarioId = req.body.token;
      delete req.body.token;
      usuarioId = usuarioId["usuario_id"];

      resultado = validacaoBuscasOpcionaisReceitaEDespesa(
        req.query.efetuado as string,
        {
          dataInicio: req.query.inicio as string,
          dataFim: req.query.fim as string,
          cliente: req.query.cliente as string,
          produto: req.query.produto as string,
          servico: req.query.servico as string,
          categoria: req.query.categoria as string,
        }
      );

      if (resultado.header != HttpStatusCode.SuccessOK) throw resultado;

      let dados: objetoDeComunicacao = await new DespesaRepo().listarTodas(
        usuarioId,
        resultado.data
      );

      //bloco de codigo para criar uma variavel com os anos e meses do pedido requerido pelo usuario

      let dataFim: Date = new Date(
        resultado.data.dataFim.split("-")[0],
        resultado.data.dataFim.split("-")[1] - 1, //os meses vao de 0 até 11, por isso subtrair 1
        resultado.data.dataFim.split("-")[2]
      );
      let dataInicio: Date = new Date(
        resultado.data.dataInicio.split("-")[0],
        resultado.data.dataInicio.split("-")[1] - 1,
        resultado.data.dataInicio.split("-")[2]
      );
      let totalDias: number =
        Math.round(
          (dataFim.getTime() - dataInicio.getTime()) / (1000 * 3600 * 24)
        ) + 1;
      if (totalDias < 1)
        throw new objetoDeComunicacao(HttpStatusCode.ClientErrorBadRequest);

      let diaInicio: number = +resultado.data.dataInicio.split("-")[2];
      let mesInicio: number = +resultado.data.dataInicio.split("-")[1];
      let anoInicio: number = +resultado.data.dataInicio.split("-")[0];
      let despesas: any = {};

      for (let i = 0; i < totalDias; i++) {
        console.log(despesas);

        despesas[
          `${anoInicio}-${mesInicio.toString().padStart(2, "0")}-${diaInicio
            .toString()
            .padStart(2, "0")}`
        ] = 0;

        diaInicio++;

        if (diaInicio > new Date(anoInicio, mesInicio, 0).getDate()) {
          diaInicio = 1;
          mesInicio += 1;
        }

        if (mesInicio > 12) {
          mesInicio = 1;
          anoInicio += 1;
        }
      }

      dados.data.forEach((dados: any) => {
        despesas[dados.data] += +dados.valor;
      });

      let dadosRetorno: Array<number> = [];
      for (let despesa in despesas) {
        dadosRetorno.push(+despesas[despesa]);
      }

      resultado.HttpConstruirRetorno(
        HttpStatusCode.SuccessOK,
        dadosRetorno.reverse(),
        "Busca realizada com sucesso."
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

  async parcelasValores(req: Request, res: Response) {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {
      let usuarioId = req.body.token;
      delete req.body.token;
      usuarioId = usuarioId["usuario_id"];

      resultado = await new DespesaRepo().parcelasValores(usuarioId);
    } catch (error: unknown) {
      console.log(error);
      if (error instanceof objetoDeComunicacao) resultado = error;
      else
        resultado = new objetoDeComunicacao(HttpStatusCode.ServerErrorInternal);
    } finally {
      return res.status(resultado.message).json(resultado.toJSON());
    }
  }

  async relatoriosCategoria(req: Request, res: Response) {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {
      let usuarioId = req.body.token;
      delete req.body.token;
      usuarioId = usuarioId["usuario_id"];

      resultado = validacaoBuscasOpcionaisReceitaEDespesa(
        req.query.efetuado as string,
        {
          dataInicio: req.query.inicio as string,
          dataFim: req.query.fim as string,
          cliente: req.query.cliente as string,
          produto: req.query.produto as string,
          servico: req.query.servico as string,
          categoria: req.query.categoria as string,
        }
      );

      if (resultado.header != HttpStatusCode.SuccessOK) throw resultado;

      resultado.data.estoque = !req.query.estoque
        ? "undefined"
        : req.query.estoque;

      resultado = await new DespesaRepo().listarTodas(
        usuarioId,
        resultado.data
      );

      let dados: {
        [categoria_id: number]: { quantidade: number; valorTotal: number };
      } = {};

      resultado.data.forEach(
        (despesa: {
          categoria_despesa_id: number;
          estoque_id: number;
          valor: number;
          efetuado: Boolean;
        }) => {
          const { categoria_despesa_id, valor, efetuado, estoque_id } = despesa;

          if (efetuado && !estoque_id) {
            if (!dados[categoria_despesa_id]) {
              dados[categoria_despesa_id] = { quantidade: 0, valorTotal: 0 };
            }

            dados[categoria_despesa_id].quantidade += 1;
            dados[categoria_despesa_id].valorTotal += +valor;
          }
        }
      );

      let arrayRetorno: Array<{
        nome: string;
        quantidade: number;
        valor: number;
      }> = [];

      for (const [
        categoria_despesa_id,
        { quantidade, valorTotal },
      ] of Object.entries(dados)) {
        let categoria_nome: string;

        if (categoria_despesa_id === "null") {
          categoria_nome = "Despesas sem categoria";
        } else {
          resultado = await new CategoriaDespesaRepo().obterPorId(
            parseInt(categoria_despesa_id)
          );
          categoria_nome = resultado.data.nome;
        }

        arrayRetorno.push({
          nome: categoria_nome,
          quantidade: quantidade,
          valor: valorTotal,
        });
      }

      arrayRetorno.sort((a, b) => b.valor - a.valor);

      resultado.HttpConstruirRetorno(
        HttpStatusCode.SuccessOK,
        arrayRetorno,
        "Busca relatorio categoria despesa com sucesso."
      );
    } catch (error: unknown) {
      console.log(error);
      console.log("errouuu");
      if (error instanceof objetoDeComunicacao) resultado = error;
      else
        resultado = new objetoDeComunicacao(HttpStatusCode.ServerErrorInternal);
    } finally {
      return res.status(resultado.message).json(resultado.toJSON());
    }
  }
}

export default new DespesaController();
