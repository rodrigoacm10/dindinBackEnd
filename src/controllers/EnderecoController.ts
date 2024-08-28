import { Request, Response } from "express";
import { Endereco } from "../models/Endereco";
import { EnderecoRepo } from "../repository/EnderecoRepo";

import { objetoDeComunicacao } from "../utils/ObjetoDeComunicacao";
import HttpStatusCode from "../utils/HttpStatusCodes";

class EnderecoController {
  async adicionar(req: Request, res: Response) {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {
      const endereco: Endereco = req.body;
      resultado = await new EnderecoRepo().adicionar(endereco);
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
      const enderecoId = parseInt(req.params["id"]);

      if (!enderecoId)
        throw new objetoDeComunicacao(HttpStatusCode.ClientErrorBadRequest);

      resultado = await new EnderecoRepo().excluir(enderecoId);
    } catch (error: unknown) {
      console.log(error);
      if (error instanceof objetoDeComunicacao) resultado = error;
      else
        resultado = new objetoDeComunicacao(HttpStatusCode.ServerErrorInternal);
    } finally {
      return res.status(resultado.message).json(resultado.toJSON());
    }
  }

  async obterPorFornecedor(req: Request, res: Response) {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {
      const fornecedorId = parseInt(req.params["id"]);

      if (!fornecedorId)
        throw new objetoDeComunicacao(HttpStatusCode.ClientErrorBadRequest);

      resultado = await new EnderecoRepo().obterPorFornecedor(fornecedorId);
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
      const enderecoId = parseInt(req.params["id"]);

      if (!enderecoId)
        throw new objetoDeComunicacao(HttpStatusCode.ClientErrorBadRequest);

      const dadosEndereco: Endereco = req.body;
      dadosEndereco.id = enderecoId;

      resultado = await new EnderecoRepo().atualizar(dadosEndereco);
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

export default new EnderecoController();
