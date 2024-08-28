import { ValidationError } from "sequelize";
import { Fornecedor } from "../models/Fornecedor";

import HttpStatusCode from "../utils/HttpStatusCodes";
import { objetoDeComunicacao } from "../utils/ObjetoDeComunicacao";

interface IFornecedorRepo {
  adicionar(fornecedor: Fornecedor): Promise<objetoDeComunicacao>;
  atualizar(fornecedor: Fornecedor): Promise<objetoDeComunicacao>;
  excluir(fornecedorId: number): Promise<objetoDeComunicacao>;
  obterPorId(fornecedorId: number): Promise<objetoDeComunicacao>;
  listarTodos(usuarioId: string): Promise<objetoDeComunicacao>;
}

export class FornecedorRepo implements IFornecedorRepo {
  async adicionar(fornecedor: Fornecedor): Promise<objetoDeComunicacao> {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {
      let retorno: Fornecedor = await Fornecedor.create({
        pessoa_fisica: fornecedor.pessoa_fisica,
        razao_social: fornecedor.razao_social,
        nome_fantasia: fornecedor.nome_fantasia,
        cnpj: fornecedor.cnpj,
        nome: fornecedor.nome,
        cpf: fornecedor.cpf,
        data_nascimento: fornecedor.data_nascimento,
        email: fornecedor.email,
        telefone: fornecedor.telefone,
        nome_contato: fornecedor.nome_contato,
        usuario_id: fornecedor.usuario_id,
      });

      resultado.HttpConstruirRetorno(HttpStatusCode.SuccessCreated, {
        fornecedor_id: retorno.dataValues.id,
      });
      return resultado;
    } catch (error: unknown) {
      if (error instanceof objetoDeComunicacao) resultado = error;
      else if (error instanceof ValidationError) {
        resultado.HttpConstruirRetorno(HttpStatusCode.ClientErrorBadRequest);
      } else {
        resultado = new objetoDeComunicacao(HttpStatusCode.ServerErrorInternal);
      }
      throw resultado;
    }
  }

  async atualizar(fornecedor: Fornecedor): Promise<objetoDeComunicacao> {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {
      const fornecedorExistente = await Fornecedor.findByPk(fornecedor.id);
      if (!fornecedorExistente) {
        throw new objetoDeComunicacao(HttpStatusCode.ClientErrorNotFound);
      }

      fornecedorExistente.pessoa_fisica =
        fornecedor.pessoa_fisica !== undefined
          ? fornecedor.pessoa_fisica
          : fornecedorExistente.pessoa_fisica;

      fornecedorExistente.razao_social =
        fornecedor.razao_social !== undefined
          ? fornecedor.razao_social
          : fornecedorExistente.razao_social;

      fornecedorExistente.nome_fantasia =
        fornecedor.nome_fantasia !== undefined
          ? fornecedor.nome_fantasia
          : fornecedorExistente.nome_fantasia;

      fornecedorExistente.cnpj =
        fornecedor.cnpj !== undefined
          ? fornecedor.cnpj
          : fornecedorExistente.cnpj;

      fornecedorExistente.nome =
        fornecedor.nome !== undefined
          ? fornecedor.nome
          : fornecedorExistente.nome;

      fornecedorExistente.cpf =
        fornecedor.cpf !== undefined ? fornecedor.cpf : fornecedorExistente.cpf;

      fornecedorExistente.data_nascimento =
        fornecedor.data_nascimento !== undefined
          ? fornecedor.data_nascimento
          : fornecedorExistente.data_nascimento;

      fornecedorExistente.email =
        fornecedor.email !== undefined
          ? fornecedor.email
          : fornecedorExistente.email;

      fornecedorExistente.telefone =
        fornecedor.telefone !== undefined
          ? fornecedor.telefone
          : fornecedorExistente.telefone;

      fornecedorExistente.nome_contato =
        fornecedor.nome_contato !== undefined
          ? fornecedor.nome_contato
          : fornecedorExistente.nome_contato;

      fornecedorExistente.usuario_id =
        fornecedor.usuario_id !== undefined
          ? fornecedor.usuario_id
          : fornecedorExistente.usuario_id;

      await fornecedorExistente.save();

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

  async excluir(fornecedorId: number): Promise<objetoDeComunicacao> {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {
      const fornecedorExistente = await Fornecedor.findByPk(fornecedorId);

      if (!fornecedorExistente) {
        throw new objetoDeComunicacao(HttpStatusCode.ClientErrorNotFound);
      }

      await fornecedorExistente.destroy();
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

  async obterPorId(fornecedorId: number): Promise<objetoDeComunicacao> {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {
      const fornecedor = await Fornecedor.findByPk(fornecedorId, {
        attributes: { exclude: ["usuario_id", "createdAt", "updatedAt"] },
      });

      if (!fornecedor)
        throw new objetoDeComunicacao(HttpStatusCode.ClientErrorNotFound);

      resultado.HttpConstruirRetorno(
        HttpStatusCode.SuccessOK,
        fornecedor.dataValues
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
      let fornecedor: Fornecedor[] = await Fornecedor.findAll({
        where: {
          usuario_id: usuarioId,
        },
        attributes: { exclude: ["usuario_id", "createdAt", "updatedAt"] },
      });
      resultado.HttpConstruirRetorno(
        HttpStatusCode.SuccessOK,
        fornecedor.map((data) => {
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
