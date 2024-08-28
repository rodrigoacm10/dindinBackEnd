import { Request, Response } from "express";
import { Servico } from "../models/Servico";
import { ServicoRepo } from "../repository/ServicoRepo";
import { objetoDeComunicacao } from "../utils/ObjetoDeComunicacao";
import HttpStatusCode from "../utils/HttpStatusCodes";

class ServicoController {
  async adicionar(req: Request, res: Response) {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {
      let usuarioId = req.body.token;
      delete req.body.token;
      usuarioId = usuarioId["usuario_id"];

      const novoServico: Servico = req.body;
      novoServico.usuario_id = usuarioId;

      resultado = await new ServicoRepo().adicionar(novoServico);
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
      const servicoId = parseInt(req.params["id"]);
      if (!servicoId)
        throw new objetoDeComunicacao(HttpStatusCode.ClientErrorNotFound);
      resultado = await new ServicoRepo().excluir(servicoId);
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

      resultado = await new ServicoRepo().listarTodos(usuarioId);
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
      const servicoId = parseInt(req.params["id"]);

      if (!servicoId)
        throw new objetoDeComunicacao(HttpStatusCode.ClientErrorBadRequest);

      const dadosServico: Servico = req.body;
      dadosServico.id = servicoId;

      resultado = await new ServicoRepo().atualizar(dadosServico);
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
      const servicoId = parseInt(req.params["id"]);

      if (!servicoId)
        throw new objetoDeComunicacao(HttpStatusCode.ClientErrorBadRequest);

      resultado = await new ServicoRepo().obterPorId(servicoId);
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

export default new ServicoController();
