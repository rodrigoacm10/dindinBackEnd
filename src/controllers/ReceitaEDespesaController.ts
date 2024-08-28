import { Request, Response } from "express";
import { ReceitaRepo } from "../repository/ReceitaRepo";
import { objetoDeComunicacao } from "../utils/ObjetoDeComunicacao";
import HttpStatusCode from "../utils/HttpStatusCodes";
import { DespesaRepo } from "../repository/DespesaRepo";
import { validacaoBuscasOpcionaisReceitaEDespesa } from "../utils/FuncoesUteis";

class ReceitaEDespesaController {
  async listarTodos(req: Request, res: Response) {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {
      let usuarioId = req.body.token;
      delete req.body.token;
      usuarioId = usuarioId["usuario_id"];

      //console.log((req.query.efetuado as string).toLocaleUpperCase());

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

      let receita: objetoDeComunicacao = await new ReceitaRepo().listarTodas(
        usuarioId,
        resultado.data
      );

      receita.data.map((data: { typeMov: string }) => {
        data.typeMov = "receita";
      });

      let despesa: objetoDeComunicacao = await new DespesaRepo().listarTodas(
        usuarioId,
        resultado.data
      );

      despesa.data.map((data: { typeMov: string }) => {
        data.typeMov = "despesa";
      });

      resultado.HttpConstruirRetorno(
        HttpStatusCode.SuccessOK,
        receita.data.concat(despesa.data)
      );

      resultado.data = resultado.data.sort(function (
        a: { data: any },
        b: { data: any }
      ) {
        let x = a.data;
        let y = b.data;

        if (x > y) return -1;
        if (y > x) return 1;
        return 0;
      });

      //   console.log(receita);
      //  console.log(despesa);
      console.log(resultado);
      return resultado;
    } catch (error: unknown) {
      //console.log(error);
      if (error instanceof objetoDeComunicacao) resultado = error;
      else
        resultado = new objetoDeComunicacao(HttpStatusCode.ServerErrorInternal);
    } finally {
      return res.status(resultado.message).json(resultado.toJSON());
    }
  }

  async listarTodosComValores(req: Request, res: Response) {
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

      let receita: objetoDeComunicacao = await new ReceitaRepo().listarTodas(
        usuarioId,
        resultado.data
      );

      let receitaTotal: number = 0;
      receita.data.forEach((dados: any) => {
        receitaTotal += parseFloat(dados.valor);
      });

      let despesa: objetoDeComunicacao = await new DespesaRepo().listarTodas(
        usuarioId,
        resultado.data
      );

      let despesaTotal: number = 0;
      despesa.data.forEach((dados: any) => {
        despesaTotal += parseFloat(dados.valor);
      });
      resultado.HttpConstruirRetorno(HttpStatusCode.SuccessOK, {
        resultado: receitaTotal - despesaTotal,
        receita: receitaTotal,
        despesa: despesaTotal,
      });

      console.log(resultado);
      return resultado;
    } catch (error: unknown) {
      //console.log(error);
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
      let dadosRetorno: any = {};

      for (let i = 0; i < totalMeses; i++) {
        if (dadosRetorno[anoInicio] == undefined) dadosRetorno[anoInicio] = {};

        dadosRetorno[anoInicio][mesInicio.toString().padStart(2, "0")] = {
          resultado: 0,
          receita: 0,
          despesa: 0,
        };

        mesInicio++;
        if (mesInicio === 13) {
          mesInicio = 1;
          anoInicio += 1;
        }
      }

      let dadosReceita: objetoDeComunicacao =
        await new ReceitaRepo().listarTodas(usuarioId, resultado.data);

      let dadosDespesa: objetoDeComunicacao =
        await new DespesaRepo().listarTodas(usuarioId, resultado.data);

      dadosReceita.data.forEach((dados: any) => {
        dadosRetorno[dados.data.split("-")[0]][dados.data.split("-")[1]][
          "resultado"
        ] += +dados.valor;
        dadosRetorno[dados.data.split("-")[0]][dados.data.split("-")[1]][
          "receita"
        ] += +dados.valor;
      });

      dadosDespesa.data.forEach((dados: any) => {
        dadosRetorno[dados.data.split("-")[0]][dados.data.split("-")[1]][
          "resultado"
        ] -= +dados.valor;
        dadosRetorno[dados.data.split("-")[0]][dados.data.split("-")[1]][
          "despesa"
        ] += +dados.valor;
      });

      resultado.HttpConstruirRetorno(
        HttpStatusCode.SuccessOK,
        dadosRetorno,
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
      let dadosRetorno: any = {};

      for (let i = 0; i < totalDias; i++) {
        console.log(dadosRetorno);

        if (dadosRetorno[anoInicio] == undefined) dadosRetorno[anoInicio] = {};
        if (
          dadosRetorno[anoInicio][mesInicio.toString().padStart(2, "0")] ==
          undefined
        )
          dadosRetorno[anoInicio][mesInicio.toString().padStart(2, "0")] = {};

        console.log(dadosRetorno);
        dadosRetorno[anoInicio][mesInicio.toString().padStart(2, "0")][
          diaInicio.toString().padStart(2, "0")
        ] = {
          resultado: 0,
          receita: 0,
          despesa: 0,
        };

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

      let dadosReceita: objetoDeComunicacao =
        await new ReceitaRepo().listarTodas(usuarioId, resultado.data);

      let dadosDespesa: objetoDeComunicacao =
        await new DespesaRepo().listarTodas(usuarioId, resultado.data);

      dadosReceita.data.forEach((dados: any) => {
        dadosRetorno[dados.data.split("-")[0]][dados.data.split("-")[1]][
          dados.data.split("-")[2]
        ]["resultado"] += +dados.valor;
        dadosRetorno[dados.data.split("-")[0]][dados.data.split("-")[1]][
          dados.data.split("-")[2]
        ]["receita"] += +dados.valor;
      });

      dadosDespesa.data.forEach((dados: any) => {
        dadosRetorno[dados.data.split("-")[0]][dados.data.split("-")[1]][
          dados.data.split("-")[2]
        ]["resultado"] -= +dados.valor;
        dadosRetorno[dados.data.split("-")[0]][dados.data.split("-")[1]][
          dados.data.split("-")[2]
        ]["despesa"] += +dados.valor;
      });

      resultado.HttpConstruirRetorno(
        HttpStatusCode.SuccessOK,
        dadosRetorno,
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
      let dados: any = {};

      for (let i = 0; i < totalDias; i++) {
        console.log(dados);

        dados[
          `${anoInicio}-${mesInicio.toString().padStart(2, "0")}-${diaInicio
            .toString()
            .padStart(2, "0")}`
        ] = {
          resultado: 0,
          receita: 0,
          despesa: 0,
        };

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

      let dadosReceita: objetoDeComunicacao =
        await new ReceitaRepo().listarTodas(usuarioId, resultado.data);

      let dadosDespesa: objetoDeComunicacao =
        await new DespesaRepo().listarTodas(usuarioId, resultado.data);

      dadosReceita.data.forEach((receita: any) => {
        dados[receita.data].resultado += +receita.valor;
        dados[receita.data].receita += +receita.valor;
      });

      dadosDespesa.data.forEach((despesa: any) => {
        dados[despesa.data].resultado -= +despesa.valor;
        dados[despesa.data].despesa += +despesa.valor;
      });

      let dadosRetorno: Array<any> = [];

      for (let informacao of Object.keys(dados)) {
        dadosRetorno.push(dados[informacao]);
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
}

export default new ReceitaEDespesaController();
