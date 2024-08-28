import { Op, ValidationError } from "sequelize";
import { Marca } from "../models/Marca";
import HttpStatusCode from "../utils/HttpStatusCodes";
import { objetoDeComunicacao } from "../utils/ObjetoDeComunicacao";

interface IMarcaRepo {
  adicionar(marca: Marca): Promise<objetoDeComunicacao>;
  atualizar(marca: Marca): Promise<objetoDeComunicacao>;
  excluir(marcaId: number): Promise<objetoDeComunicacao>;
  obterPorId(marcaId: number): Promise<objetoDeComunicacao>;
  listarTodos(usuarioId: string): Promise<objetoDeComunicacao>;
}

export class MarcaRepo implements IMarcaRepo {
  async adicionar(marca: Marca): Promise<objetoDeComunicacao> {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {
      await Marca.create({
        nome: marca.nome,
        usuario_id: marca.usuario_id,
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

  async atualizar(marca: Marca): Promise<objetoDeComunicacao> {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {
      const marcaExistente = await Marca.findByPk(marca.id);
      if (!marcaExistente) {
        throw new objetoDeComunicacao(HttpStatusCode.ClientErrorNotFound);
      }
      marcaExistente.nome =
        marca.nome !== undefined ? marca.nome : marcaExistente.nome;

      await marcaExistente.save();

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

  async excluir(marcaId: number): Promise<objetoDeComunicacao> {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {
      const marca = await Marca.findByPk(marcaId);

      if (!marca)
        throw new objetoDeComunicacao(HttpStatusCode.ClientErrorNotFound);

      await marca.destroy();

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

  async obterPorId(marcaId: number): Promise<objetoDeComunicacao> {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {
      const marca = await Marca.findByPk(marcaId, {
        attributes: ["id", "nome"],
      });

      if (!marca)
        throw new objetoDeComunicacao(HttpStatusCode.ClientErrorNotFound);

      resultado.HttpConstruirRetorno(
        HttpStatusCode.SuccessOK,
        marca.dataValues
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
      const marcas = await Marca.findAll({
        where: {
          [Op.or]: [{ usuario_id: usuarioId }, { usuario_id: null }],
        },
        attributes: ["id", "nome"],
      });
      resultado.HttpConstruirRetorno(
        HttpStatusCode.SuccessOK,
        marcas.map((data) => {
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
