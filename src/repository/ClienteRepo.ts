import { ValidationError } from "sequelize";
import { Cliente } from "../models/Cliente";
import HttpStatusCode from "../utils/HttpStatusCodes";
import { objetoDeComunicacao } from "../utils/ObjetoDeComunicacao";

interface IClienteRepo {
  adicionar(cliente: Cliente): Promise<objetoDeComunicacao>;
  atualizar(cliente: Cliente): Promise<objetoDeComunicacao>;
  excluir(clienteId: number): Promise<objetoDeComunicacao>;
  obterPorId(clienteId: number): Promise<objetoDeComunicacao>;
  listarTodos(usuarioId: string): Promise<objetoDeComunicacao>;
}

export class ClienteRepo implements IClienteRepo {
  async adicionar(cliente: Cliente): Promise<objetoDeComunicacao> {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {
      await Cliente.create({
        nome: cliente.nome,
        telefone: cliente.telefone,
        usuario_id: cliente.usuario_id,
        email: cliente.email,
        whatsapp: cliente.whatsapp ? cliente.whatsapp : false,
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

  async atualizar(cliente: Cliente): Promise<objetoDeComunicacao> {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {
      const clienteExistente = await Cliente.findByPk(cliente.id);
      if (!clienteExistente) {
        throw new objetoDeComunicacao(HttpStatusCode.ClientErrorNotFound);
      }

      clienteExistente.nome = cliente.nome
        ? cliente.nome
        : clienteExistente.nome;
      clienteExistente.telefone =
        cliente.telefone !== undefined
          ? cliente.telefone
          : clienteExistente.telefone;
      clienteExistente.email =
        cliente.email !== undefined ? cliente.email : clienteExistente.email;
      clienteExistente.whatsapp =
        cliente.whatsapp !== undefined
          ? cliente.whatsapp
          : clienteExistente.whatsapp;

      await clienteExistente.save();
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

  async excluir(clienteId: number): Promise<objetoDeComunicacao> {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {
      const clienteExistente = await Cliente.findByPk(clienteId);
      if (!clienteExistente) {
        throw new objetoDeComunicacao(HttpStatusCode.ClientErrorNotFound);
      }
      await clienteExistente.destroy();
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

  async obterPorId(clienteId: number): Promise<objetoDeComunicacao> {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {
      const cliente = await Cliente.findByPk(clienteId);

      if (!cliente)
        throw new objetoDeComunicacao(HttpStatusCode.ClientErrorNotFound);

      resultado.HttpConstruirRetorno(
        HttpStatusCode.SuccessOK,
        cliente.dataValues
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
      let cliente: Cliente[] = await Cliente.findAll({
        where: {
          usuario_id: usuarioId,
        },
      });
      resultado.HttpConstruirRetorno(
        HttpStatusCode.SuccessOK,
        cliente.map((data) => {
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
