import { Request, Response } from "express";
import { Receita } from "../models/Receita";
import { ReceitaRepo } from "../repository/ReceitaRepo";
import { objetoDeComunicacao } from "../utils/ObjetoDeComunicacao";
import HttpStatusCode from "../utils/HttpStatusCodes";
import FileController from "./FilesController";
import { validacaoBuscasOpcionaisReceitaEDespesa } from "../utils/FuncoesUteis";
import { CategoriaReceitaRepo } from "../repository/CategoriaReceitaRepo";

class ReceitaController {
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

      // console.log("tipo");
      // console.log(typeof req.body.efetuado);
      // console.log(req.body.efetuado);
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

      const novaReceita: Receita = req.body;
      novaReceita.usuario_id = usuarioId;

      resultado = await new ReceitaRepo().adicionar(novaReceita);
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

      const receitaId = parseInt(req.params["id"]);

      if (!receitaId)
        throw new objetoDeComunicacao(HttpStatusCode.ClientErrorNotFound);

      resultado = await new ReceitaRepo().obterPorId(receitaId);

      if (resultado.data.usuario_id !== usuarioId)
        throw new objetoDeComunicacao(HttpStatusCode.ClientErrorForbidden);

      const anexo = resultado.data.anexo;

      resultado = await new ReceitaRepo().excluir(receitaId);
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

      const receitaId = parseInt(req.params["id"]);

      if (!receitaId)
        throw new objetoDeComunicacao(HttpStatusCode.ClientErrorNotFound);

      resultado = await new ReceitaRepo().obterPorId(receitaId);

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

      // let efetuado: string;
      // if ((req.query.efetuado as string) === undefined)
      //   efetuado = "undefined"; //efetuado = "undefined";
      // else if ((req.query.efetuado as string).toLocaleUpperCase() === "SIM")
      //   efetuado = "true";
      // else if ((req.query.efetuado as string).toLocaleUpperCase() === "NAO")
      //   efetuado = "false";
      // else
      //   throw new objetoDeComunicacao(
      //     HttpStatusCode.ClientErrorBadRequest,
      //     {},
      //     "Efetuado invalido."
      //   );

      // let inicio: string;
      // if ((req.query.inicio as string) === undefined)
      //   inicio = "undefined"; //efetuado = "undefined";
      // else if (
      //   RegExp(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/).test(req.query.inicio as string)
      // )
      //   inicio = req.query.inicio as string;
      // else
      //   throw new objetoDeComunicacao(
      //     HttpStatusCode.ClientErrorBadRequest,
      //     {},
      //     "Data inicio invalido."
      //   );

      // let fim: string;
      // if ((req.query.fim as string) === undefined)
      //   fim = "undefined"; //efetuado = "undefined";
      // else if (
      //   RegExp(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/).test(req.query.fim as string)
      // )
      //   fim = req.query.fim as string;
      // else
      //   throw new objetoDeComunicacao(
      //     HttpStatusCode.ClientErrorBadRequest,
      //     {},
      //     "Data fim invalida."
      //   );

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

      resultado = await new ReceitaRepo().listarTodas(
        usuarioId,
        // {
        //   dataInicio: resultado.data.dataInicio,
        //   dataFim: resultado.data.dataFim,
        // }
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
      const quantidade: number = parseInt(req.params["quantidade"]);
      const pagina: number = parseInt(req.params["pagina"]);

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

      resultado = await new ReceitaRepo().paginacao(
        quantidade,
        pagina,
        // { dataInicio: inicio, dataFim: fim },
        resultado.data,
        usuarioId
      );

      resultado.mensagemTexto = `${quantidade * pagina + 1} ate ${
        quantidade * pagina + quantidade
      } de ${resultado.mensagemTexto}`;
      /*res.status(200).json({
        status: 200,
        message: `Receitas de ${quantidade * pagina} ate ${
          quantidade * pagina + quantidade
        }`,
        data: receitas,
      });*/
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

      const receitaId = parseInt(req.params["id"]);
      if (!receitaId)
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

      // console.log(req.body.efetuado);

      const dadosReceita: Receita = req.body;
      dadosReceita.id = receitaId;

      console.log(req.body);
      resultado = await new ReceitaRepo().atualizar(dadosReceita);
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

      let dados: objetoDeComunicacao = await new ReceitaRepo().listarTodas(
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
      let receitas: any = {};

      for (let i = 0; i < totalMeses; i++) {
        if (receitas[anoInicio] == undefined) receitas[anoInicio] = {};

        receitas[anoInicio][mesInicio.toString().padStart(2, "0")] = 0;

        mesInicio++;
        if (mesInicio === 13) {
          mesInicio = 1;
          anoInicio += 1;
        }
      }

      dados.data.forEach((dados: any) => {
        receitas[dados.data.split("-")[0]][dados.data.split("-")[1]] +=
          +dados.valor;
      });

      resultado.HttpConstruirRetorno(
        HttpStatusCode.SuccessOK,
        receitas,
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

      let dados: objetoDeComunicacao = await new ReceitaRepo().listarTodas(
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
      let receitas: any = {};

      for (let i = 0; i < totalDias; i++) {
        console.log(receitas);

        if (receitas[anoInicio] == undefined) receitas[anoInicio] = {};
        if (
          receitas[anoInicio][mesInicio.toString().padStart(2, "0")] ==
          undefined
        )
          receitas[anoInicio][mesInicio.toString().padStart(2, "0")] = {};

        console.log(receitas);
        receitas[anoInicio][mesInicio.toString().padStart(2, "0")][
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
        receitas[dados.data.split("-")[0]][dados.data.split("-")[1]][
          dados.data.split("-")[2]
        ] += +dados.valor;
      });

      resultado.HttpConstruirRetorno(
        HttpStatusCode.SuccessOK,
        receitas,
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

      let dados: objetoDeComunicacao = await new ReceitaRepo().listarTodas(
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
      let receitas: any = {};

      for (let i = 0; i < totalDias; i++) {
        console.log(receitas);

        receitas[
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
        receitas[dados.data] += +dados.valor;
      });

      let dadosRetorno: Array<number> = [];
      for (let receita in receitas) {
        dadosRetorno.push(+receitas[receita]);
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

      resultado.data.vendas = !req.query.vendas
        ? "undefined"
        : req.query.vendas;

      if (resultado.header != HttpStatusCode.SuccessOK) throw resultado;

      resultado = await new ReceitaRepo().listarTodas(
        usuarioId,
        resultado.data
      );

      let dados: {
        [categoria_id: number]: { quantidade: number; valorTotal: number };
      } = {};

      resultado.data.forEach(
        (receita: {
          categoria_receita_id: number;
          estoque_id: number;
          valor: number;
          efetuado: Boolean;
        }) => {
          const { categoria_receita_id, valor, efetuado, estoque_id } = receita;

          if (efetuado && !estoque_id) {
            if (!dados[categoria_receita_id]) {
              dados[categoria_receita_id] = { quantidade: 0, valorTotal: 0 };
            }

            dados[categoria_receita_id].quantidade += 1;
            dados[categoria_receita_id].valorTotal += +valor;
          }
        }
      );

      let arrayRetorno: Array<{
        nome: string;
        quantidade: number;
        valor: number;
      }> = [];

      for (const [
        categoria_receita_id,
        { quantidade, valorTotal },
      ] of Object.entries(dados)) {
        let categoria_nome: string;

        if (categoria_receita_id === "null") {
          categoria_nome = "Despesas sem categoria";
        } else {
          resultado = await new CategoriaReceitaRepo().obterPorId(
            parseInt(categoria_receita_id)
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
        "Busca relatorio categoria receita com sucesso."
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

export default new ReceitaController();
