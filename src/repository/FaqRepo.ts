import { ValidationError } from "sequelize";
import { Faq } from "../models/Faq";
import HttpStatusCode from "../utils/HttpStatusCodes";
import { objetoDeComunicacao } from "../utils/ObjetoDeComunicacao";

interface IFaqRepo {
  adicionar(faq: Faq): Promise<objetoDeComunicacao>;
  atualizar(faq: Faq): Promise<objetoDeComunicacao>;
  excluir(faqId: number): Promise<objetoDeComunicacao>;
  listarTodos(): Promise<objetoDeComunicacao>;
  listarUm(faqId: number): Promise<objetoDeComunicacao>;
}

export class FaqRepo implements IFaqRepo {
  async adicionar(faq: Faq): Promise<objetoDeComunicacao> {
    try {
      await Faq.create({
        pergunta: faq.pergunta,
        resposta: faq.resposta,
      });
      return new objetoDeComunicacao(HttpStatusCode.SuccessCreated);
    } catch (error: unknown) {
      console.log(error);
      let resultado: objetoDeComunicacao;

      if (error instanceof objetoDeComunicacao) resultado = error;
      else if (error instanceof ValidationError) {
        resultado = new objetoDeComunicacao(
          HttpStatusCode.ClientErrorBadRequest
        );
      } else
        resultado = new objetoDeComunicacao(HttpStatusCode.ServerErrorInternal);

      throw resultado;
    }
  }

  async atualizar(faq: Faq): Promise<objetoDeComunicacao> {
    try {
      const faqExistente = await Faq.findByPk(faq.id);
      if (!faqExistente) {
        throw new objetoDeComunicacao(HttpStatusCode.ClientErrorNotFound);
      }
      faqExistente.pergunta = faq.pergunta
        ? faq.pergunta
        : faqExistente.pergunta;
      faqExistente.resposta = faq.resposta
        ? faq.resposta
        : faqExistente.resposta;

      faqExistente.save();
      return new objetoDeComunicacao(HttpStatusCode.SuccessOK);
    } catch (error: unknown) {
      console.log(error);
      let resultado: objetoDeComunicacao;

      if (error instanceof objetoDeComunicacao) resultado = error;
      else if (error instanceof ValidationError) {
        resultado = new objetoDeComunicacao(
          HttpStatusCode.ClientErrorBadRequest
        );
      } else
        resultado = new objetoDeComunicacao(HttpStatusCode.ServerErrorInternal);

      throw resultado;
    }
  }

  async excluir(faqId: number): Promise<objetoDeComunicacao> {
    try {
      const faqExistente = await Faq.findByPk(faqId);
      if (!faqExistente) {
        throw new objetoDeComunicacao(HttpStatusCode.ClientErrorNotFound);
      }
      await faqExistente.destroy();
      return new objetoDeComunicacao(HttpStatusCode.SuccessOK);
    } catch (error: unknown) {
      console.log(error);
      let resultado: objetoDeComunicacao;

      if (error instanceof objetoDeComunicacao) resultado = error;
      else
        resultado = new objetoDeComunicacao(HttpStatusCode.ServerErrorInternal);

      throw resultado;
    }
  }

  async listarTodos(): Promise<objetoDeComunicacao> {
    try {
      const faqExistente = await Faq.findAll();
      if (!faqExistente)
        throw new objetoDeComunicacao(HttpStatusCode.ClientErrorNotFound);
      return new objetoDeComunicacao(HttpStatusCode.SuccessOK, faqExistente);
    } catch (error: unknown) {
      console.log(error);
      let resultado: objetoDeComunicacao;

      if (error instanceof objetoDeComunicacao) resultado = error;
      else
        resultado = new objetoDeComunicacao(HttpStatusCode.ServerErrorInternal);

      throw resultado;
    }
  }

  async listarUm(faqId: number): Promise<objetoDeComunicacao> {
    try {
      const faqExistente = await Faq.findByPk(faqId);
      if (!faqExistente) {
        throw new objetoDeComunicacao(HttpStatusCode.ClientErrorNotFound);
      }

      return new objetoDeComunicacao(
        HttpStatusCode.SuccessOK,
        faqExistente.dataValues
      );
    } catch (error: unknown) {
      console.log(error);
      let resultado: objetoDeComunicacao;
      if (error instanceof objetoDeComunicacao) resultado = error;
      else
        resultado = new objetoDeComunicacao(HttpStatusCode.ServerErrorInternal);

      throw resultado;
    }
  }
}
