import { Request, Response } from "express";
import { CategoriaProduto } from "../models/CategoriaProduto";
import { CategoriaProdutoRepo } from "../repository/CategoriaProdutoRepo";

import { objetoDeComunicacao } from "../utils/ObjetoDeComunicacao";
import HttpStatusCode from "../utils/HttpStatusCodes";

class CategoriaProdutoController {
  async adicionar(req: Request, res: Response) {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {
      let usuarioId = req.body.token;
      delete req.body.token;
      usuarioId = usuarioId["usuario_id"];

      const novaCategoriaProd: CategoriaProduto = req.body;
      novaCategoriaProd.usuario_id = usuarioId;
     
      resultado = await new CategoriaProdutoRepo().adicionar(novaCategoriaProd);
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
      const categoriaId = parseInt(req.params["id"]);

      if (!categoriaId)
        throw new objetoDeComunicacao(HttpStatusCode.ClientErrorBadRequest);

      resultado = await new CategoriaProdutoRepo().excluir(categoriaId);
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
      const categoriaId = parseInt(req.params["id"]);

      if (!categoriaId)
        throw new objetoDeComunicacao(HttpStatusCode.ClientErrorBadRequest);

      resultado = await new CategoriaProdutoRepo().obterPorId(categoriaId);
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

      resultado = await new CategoriaProdutoRepo().listarTodos(usuarioId);
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
      const categoriaId = parseInt(req.params["id"]);

      if (!categoriaId)
        throw new objetoDeComunicacao(HttpStatusCode.ClientErrorBadRequest);

      const dadosCategoria: CategoriaProduto = req.body;
      dadosCategoria.id= categoriaId;

      resultado = await new CategoriaProdutoRepo().atualizar(dadosCategoria);
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

export default new CategoriaProdutoController();
