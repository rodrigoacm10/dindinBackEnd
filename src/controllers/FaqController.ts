import { Request, Response } from "express";
import { Faq } from "../models/Faq";
import { FaqRepo } from "../repository/FaqRepo";
import { objetoDeComunicacao } from "../utils/ObjetoDeComunicacao";
import { ValidationError } from "sequelize";
import HttpStatusCode from "../utils/HttpStatusCodes";

class FaqController {
  async adicionar(req: Request, res: Response) {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {
      const novoFaq: Faq = req.body;

      await Faq.build({
        pergunta: novoFaq.pergunta,
        resposta: novoFaq.resposta,
      }).validate();

      resultado = await new FaqRepo().adicionar(novoFaq);
    } catch (error: unknown) {
      console.log(error);

      if (error instanceof objetoDeComunicacao) resultado = error;
      else if (error instanceof ValidationError) {
        resultado.HttpConstruirRetorno(HttpStatusCode.ClientErrorBadRequest);
      } else
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
      const faqId = parseInt(req.params["id"]);

      if (!faqId)
        throw new objetoDeComunicacao(HttpStatusCode.ClientErrorNotFound);
      resultado = await new FaqRepo().excluir(faqId);
    } catch (error: unknown) {
      console.log(error);

      if (error instanceof objetoDeComunicacao) resultado = error;
      else if (error instanceof ValidationError) {
        resultado.HttpConstruirRetorno(HttpStatusCode.ClientErrorBadRequest);
      } else
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
      const faq = await new FaqRepo().listarTodos();

      console.log(faq);
      if (!faq)
        throw new objetoDeComunicacao(HttpStatusCode.ClientErrorNotFound);

      resultado.HttpConstruirRetorno(HttpStatusCode.SuccessOK, faq.data);
    } catch (error: unknown) {
      console.log(error);

      if (error instanceof objetoDeComunicacao) resultado = error;
      else if (error instanceof ValidationError) {
        resultado.HttpConstruirRetorno(HttpStatusCode.ClientErrorBadRequest);
      } else
        resultado = new objetoDeComunicacao(HttpStatusCode.ServerErrorInternal);

      resultado;
    } finally {
      return res.status(resultado.message).json(resultado.toJSON());
    }
  }

  async atualizar(req: Request, res: Response) {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {
      const faqId = parseInt(req.params["id"]);
      if (!faqId)
        throw new objetoDeComunicacao(HttpStatusCode.ClientErrorNotFound);

      const dadosFaq: Faq = req.body;
      dadosFaq.id = faqId;

      await Faq.build({
        pergunta: dadosFaq.pergunta,
        resposta: dadosFaq.resposta,
      }).validate();

      resultado = await new FaqRepo().atualizar(dadosFaq);
    } catch (error: unknown) {
      console.log(error);

      if (error instanceof objetoDeComunicacao) resultado = error;
      else if (error instanceof ValidationError) {
        resultado.HttpConstruirRetorno(HttpStatusCode.ClientErrorBadRequest);
      } else
        resultado = new objetoDeComunicacao(HttpStatusCode.ServerErrorInternal);
    } finally {
      return res.status(resultado.message).json(resultado.toJSON());
    }
  }

  async listarUm(req: Request, res: Response) {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {
      const faqId = parseInt(req.params["id"]);
      if (!faqId)
        throw new objetoDeComunicacao(HttpStatusCode.ClientErrorNotFound);

      resultado = await new FaqRepo().listarUm(faqId);
    } catch (error: unknown) {
      console.log(error);

      if (error instanceof objetoDeComunicacao) resultado = error;
      else if (error instanceof ValidationError) {
        resultado.HttpConstruirRetorno(HttpStatusCode.ClientErrorBadRequest);
      } else
        resultado = new objetoDeComunicacao(HttpStatusCode.ServerErrorInternal);

      resultado;
    } finally {
      return res.status(resultado.message).json(resultado.toJSON());
    }
  }
}

export default new FaqController();
