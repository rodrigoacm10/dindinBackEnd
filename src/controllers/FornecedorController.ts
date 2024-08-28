import { Request, Response } from "express";
import { Fornecedor } from "../models/Fornecedor";
import { FornecedorRepo } from "../repository/FornecedorRepo";

import { objetoDeComunicacao } from "../utils/ObjetoDeComunicacao";
import HttpStatusCode from "../utils/HttpStatusCodes";

class FornecedorController {
  async adicionar(req: Request, res: Response) {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {
      let usuarioId = req.body.token;
      delete req.body.token;
      usuarioId = usuarioId["usuario_id"];

      const fornecedor: Fornecedor = req.body;
      fornecedor.usuario_id = usuarioId;

      resultado = await new FornecedorRepo().adicionar(fornecedor);
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
      const fornecedorId = parseInt(req.params["id"]);

      if (!fornecedorId)
        throw new objetoDeComunicacao(HttpStatusCode.ClientErrorBadRequest);

      resultado = await new FornecedorRepo().excluir(fornecedorId);
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
      const fornecedorId = parseInt(req.params["id"]);
      console.log(fornecedorId);
      if (!fornecedorId)
        throw new objetoDeComunicacao(HttpStatusCode.ClientErrorBadRequest);

      resultado = await new FornecedorRepo().obterPorId(fornecedorId);
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

      resultado = await new FornecedorRepo().listarTodos(usuarioId);
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
      const fornecedorId = parseInt(req.params["id"]);

      if (!fornecedorId)
        throw new objetoDeComunicacao(HttpStatusCode.ClientErrorBadRequest);

      const dadosFornecedor: Fornecedor = req.body;
      dadosFornecedor.id = fornecedorId;

      resultado = await new FornecedorRepo().atualizar(dadosFornecedor);
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

export default new FornecedorController();
