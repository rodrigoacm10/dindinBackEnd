import { ValidationError } from "sequelize";
import { Endereco } from "../models/Endereco";

import HttpStatusCode from "../utils/HttpStatusCodes";
import { objetoDeComunicacao } from "../utils/ObjetoDeComunicacao";

interface IEnderecoRepo {
  adicionar(endereco: Endereco): Promise<objetoDeComunicacao>;
  atualizar(endereco: Endereco): Promise<objetoDeComunicacao>;
  excluir(enderecoId: number): Promise<objetoDeComunicacao>;
  obterPorFornecedor(fornecedorId: number): Promise<objetoDeComunicacao>;
}

export class EnderecoRepo implements IEnderecoRepo {
  async adicionar(endereco: Endereco): Promise<objetoDeComunicacao> {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {
      await Endereco.create({
        cep: endereco.cep,
        rua: endereco.rua,
        numero: endereco.numero,
        complemento: endereco.complemento,
        bairro: endereco.bairro,
        cidade: endereco.cidade,
        uf: endereco.uf,
        observacao: endereco.observacao,
        fornecedor_id: endereco.fornecedor_id,
      });
      resultado.HttpConstruirRetorno(HttpStatusCode.SuccessCreated);
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

  async atualizar(endereco: Endereco): Promise<objetoDeComunicacao> {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {
      const enderecoExistente = await Endereco.findByPk(endereco.id);
      if (!enderecoExistente) {
        throw new objetoDeComunicacao(HttpStatusCode.ClientErrorNotFound);
      }
      enderecoExistente.cep =
        endereco.cep !== undefined ? endereco.cep : enderecoExistente.cep;

      enderecoExistente.rua =
        endereco.rua !== undefined ? endereco.rua : enderecoExistente.rua;

      enderecoExistente.complemento =
        endereco.complemento !== undefined
          ? endereco.complemento
          : enderecoExistente.complemento;

      enderecoExistente.bairro =
        endereco.bairro !== undefined
          ? endereco.bairro
          : enderecoExistente.bairro;

      enderecoExistente.cidade =
        endereco.cidade !== undefined
          ? endereco.cidade
          : enderecoExistente.cidade;

      enderecoExistente.uf =
        endereco.uf !== undefined ? endereco.uf : enderecoExistente.uf;

      enderecoExistente.observacao =
        endereco.observacao !== undefined
          ? endereco.observacao
          : enderecoExistente.observacao;

      enderecoExistente.fornecedor_id =
        endereco.fornecedor_id !== undefined
          ? endereco.fornecedor_id
          : enderecoExistente.fornecedor_id;

      await enderecoExistente.save();

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

  async excluir(enderecoId: number): Promise<objetoDeComunicacao> {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {
      const enderecoExistente = await Endereco.findByPk(enderecoId);

      if (!enderecoExistente) {
        throw new objetoDeComunicacao(HttpStatusCode.ClientErrorNotFound);
      }

      await enderecoExistente.destroy();
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

  async obterPorFornecedor(fornecedorId: number): Promise<objetoDeComunicacao> {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {
      let endereco: Endereco[] = await Endereco.findAll({
        where: {
          fornecedor_id: fornecedorId,
        },
        attributes: { exclude: ["createdAt", "updatedAt"] },
      });
      if (!endereco)
        throw new objetoDeComunicacao(HttpStatusCode.ClientErrorNotFound);

      resultado.HttpConstruirRetorno(
        HttpStatusCode.SuccessOK,
        endereco.map((data) => {
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
