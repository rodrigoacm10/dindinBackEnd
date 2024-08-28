import { ValidationError } from "sequelize";
import { Servico } from "../models/Servico";
import HttpStatusCode from "../utils/HttpStatusCodes";
import { objetoDeComunicacao } from "../utils/ObjetoDeComunicacao";

interface IServicoRepo {
  adicionar(servico: Servico): Promise<objetoDeComunicacao>;
  atualizar(servico: Servico): Promise<objetoDeComunicacao>;
  excluir(servicoId: number): Promise<objetoDeComunicacao>;
  obterPorId(servicoId: number): Promise<objetoDeComunicacao>;
  listarTodos(usuarioId: string): Promise<objetoDeComunicacao>;
}

export class ServicoRepo implements IServicoRepo {
  async adicionar(servico: Servico): Promise<objetoDeComunicacao> {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {
      await Servico.create({
        nome: servico.nome,
        usuario_id: servico.usuario_id,
      });
      resultado.HttpConstruirRetorno(HttpStatusCode.SuccessCreated);
      return resultado;
    } catch (error: unknown) {
      console.log(error);
      if (error instanceof objetoDeComunicacao) resultado = error;
      else if (error instanceof ValidationError) {
        resultado.HttpConstruirRetorno(HttpStatusCode.ClientErrorBadRequest);
      } else
        resultado = new objetoDeComunicacao(HttpStatusCode.ServerErrorInternal);
      throw resultado;
    }
  }

  async atualizar(servico: Servico): Promise<objetoDeComunicacao> {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {
      const servicoExistente = await Servico.findByPk(servico.id);
      if (!servicoExistente) {
        throw new objetoDeComunicacao(HttpStatusCode.ClientErrorNotFound);
      }

      servicoExistente.nome = servico.nome
        ? servico.nome
        : servicoExistente.nome;

      await servicoExistente.save();
      resultado.HttpConstruirRetorno(HttpStatusCode.SuccessOK);
      return resultado;
    } catch (error: unknown) {
      console.log(error);
      if (error instanceof objetoDeComunicacao) resultado = error;
      else if (error instanceof ValidationError) {
        resultado.HttpConstruirRetorno(HttpStatusCode.ClientErrorBadRequest);
      } else
        resultado = new objetoDeComunicacao(HttpStatusCode.ServerErrorInternal);
      throw resultado;
    }
  }

  async excluir(servicoId: number): Promise<objetoDeComunicacao> {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {
      const servicoExistente = await Servico.findByPk(servicoId);
      if (!servicoExistente) {
        throw new objetoDeComunicacao(HttpStatusCode.ClientErrorNotFound);
      }
      await servicoExistente.destroy();

      resultado.HttpConstruirRetorno(HttpStatusCode.SuccessOK);
      return resultado;
    } catch (error: unknown) {
      console.log(error);
      if (error instanceof objetoDeComunicacao) resultado = error;
      else if (error instanceof ValidationError) {
        resultado.HttpConstruirRetorno(HttpStatusCode.ClientErrorBadRequest);
      } else
        resultado = new objetoDeComunicacao(HttpStatusCode.ServerErrorInternal);
      throw resultado;
    }
  }

  async obterPorId(servicoId: number): Promise<objetoDeComunicacao> {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {
      const servico = await Servico.findByPk(servicoId);
      if (!servico) {
        throw new objetoDeComunicacao(HttpStatusCode.ClientErrorNotFound);
      }

      resultado.HttpConstruirRetorno(
        HttpStatusCode.SuccessOK,
        servico.dataValues
      );
      return resultado;
    } catch (error: unknown) {
      console.log(error);
      if (error instanceof objetoDeComunicacao) resultado = error;
      else if (error instanceof ValidationError) {
        resultado.HttpConstruirRetorno(HttpStatusCode.ClientErrorBadRequest);
      } else
        resultado = new objetoDeComunicacao(HttpStatusCode.ServerErrorInternal);
      throw resultado;
    }
  }

  async listarTodos(usuarioId: string): Promise<objetoDeComunicacao> {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {
      let servico: Servico[] = await Servico.findAll({
        where: {
          usuario_id: usuarioId,
        },
      });

      resultado.HttpConstruirRetorno(
        HttpStatusCode.SuccessOK,
        servico.map((data) => {
          return data.dataValues;
        })
      );

      return resultado;
    } catch (error: unknown) {
      console.log(error);
      if (error instanceof objetoDeComunicacao) resultado = error;
      else if (error instanceof ValidationError) {
        resultado.HttpConstruirRetorno(HttpStatusCode.ClientErrorBadRequest);
      } else
        resultado = new objetoDeComunicacao(HttpStatusCode.ServerErrorInternal);
      throw resultado;
    }
  }
}
