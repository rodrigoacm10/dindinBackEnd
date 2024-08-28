import { Request, Response } from "express";
import { Cliente } from "../models/Cliente";
import { ClienteRepo } from "../repository/ClienteRepo";

import { objetoDeComunicacao } from "../utils/ObjetoDeComunicacao";
import HttpStatusCode from "../utils/HttpStatusCodes";
class ClienteController {
  async adicionar(req: Request, res: Response) {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {
      let usuarioId = req.body.token;
      delete req.body.token;
      usuarioId = usuarioId["usuario_id"];

      const novoCliente: Cliente = req.body;
      novoCliente.usuario_id = usuarioId;

      resultado = await new ClienteRepo().adicionar(novoCliente);
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
      const ClienteId = parseInt(req.params["id"]);

      if (!ClienteId)
        throw new objetoDeComunicacao(HttpStatusCode.ClientErrorNotFound);

      resultado = await new ClienteRepo().excluir(ClienteId);
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

      resultado = await new ClienteRepo().listarTodos(usuarioId);
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
      const clienteId = parseInt(req.params["id"]);

      if (!clienteId)
        throw new objetoDeComunicacao(HttpStatusCode.ClientErrorBadRequest);

      const dadosCliente: Cliente = req.body;
      dadosCliente.id = clienteId;

      resultado = await new ClienteRepo().atualizar(dadosCliente);
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
      const clienteId = parseInt(req.params["id"]);

      if (!clienteId)
        throw new objetoDeComunicacao(HttpStatusCode.ClientErrorBadRequest);

      resultado = await new ClienteRepo().obterPorId(clienteId);
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

export default new ClienteController();
