import { Op, ValidationError } from "sequelize";
import { CategoriaProduto } from "../models/CategoriaProduto";
import HttpStatusCode from "../utils/HttpStatusCodes";
import { objetoDeComunicacao } from "../utils/ObjetoDeComunicacao";

interface ICategoriaProdutoRepo {
  adicionar(categoria: CategoriaProduto): Promise<objetoDeComunicacao>;
  atualizar(categoria: CategoriaProduto): Promise<objetoDeComunicacao>;
  excluir(categoriaId: number): Promise<objetoDeComunicacao>;
  obterPorId(categoriaId: number): Promise<objetoDeComunicacao>;
  listarTodos(usuarioId: string): Promise<objetoDeComunicacao>;
}

export class CategoriaProdutoRepo implements ICategoriaProdutoRepo {
  async adicionar(categoria: CategoriaProduto): Promise<objetoDeComunicacao> {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {
      await CategoriaProduto.create({
        nome: categoria.nome,
        usuario_id: categoria.usuario_id,
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

  async atualizar(categoria: CategoriaProduto): Promise<objetoDeComunicacao> {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {
      const categoriaExistente = await CategoriaProduto.findByPk(categoria.id);
      if (!categoriaExistente) {
        throw new objetoDeComunicacao(HttpStatusCode.ClientErrorNotFound);
      }
      categoriaExistente.nome = categoria.nome
        ? categoria.nome
        : categoriaExistente.nome;

      await categoriaExistente.save();

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

  async excluir(categoriaId: number): Promise<objetoDeComunicacao> {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {
      const categoria = await CategoriaProduto.findByPk(categoriaId);

      if (!categoria)
        throw new objetoDeComunicacao(HttpStatusCode.ClientErrorNotFound);

      await categoria.destroy();

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

  async obterPorId(categoriaId: number): Promise<objetoDeComunicacao> {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {
      const categoria = await CategoriaProduto.findByPk(categoriaId, {
        attributes: ["id", "nome"],
      });

      if (!categoria)
        throw new objetoDeComunicacao(HttpStatusCode.ClientErrorNotFound);

      resultado.HttpConstruirRetorno(
        HttpStatusCode.SuccessOK,
        categoria.dataValues
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
      const categorias = await CategoriaProduto.findAll({
        where: {
          [Op.or]: [{ usuario_id: usuarioId }, { usuario_id: null }],
        },
        attributes: ["id", "nome"],
      });
      resultado.HttpConstruirRetorno(
        HttpStatusCode.SuccessOK,
        categorias.map((data) => {
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
