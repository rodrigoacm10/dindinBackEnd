import { ValidationError } from "sequelize";
import { UsuarioCNPJ } from "../../models/UsuarioCNPJ";
import HttpStatusCode from "../../utils/HttpStatusCodes";
import { objetoDeComunicacao } from "../../utils/ObjetoDeComunicacao";

interface IUsuarioRepo {
  adicionar(usuario: UsuarioCNPJ): Promise<objetoDeComunicacao>;
  atualizar(usuario: UsuarioCNPJ): Promise<objetoDeComunicacao>;
  excluir(usuarioId: string): Promise<objetoDeComunicacao>;
  obterPorId(usuarioId: string): Promise<objetoDeComunicacao>;
  // obterPorLogin(usuarioLogin: string): Promise<UsuarioMEI | null>;
  // listarTodos(): Promise<UsuarioMEI[]>;
}

export class UsuarioCNPJRepo implements IUsuarioRepo {
  async adicionar(usuario: UsuarioCNPJ): Promise<objetoDeComunicacao> {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {
      await UsuarioCNPJ.create({
        usuario_id: usuario.usuario_id,
        cnpj: usuario.cnpj,
      });
      resultado.HttpConstruirRetorno(
        HttpStatusCode.SuccessOK,
        {},
        "Usuario CNPJ cadastrado com sucesso"
      );
      return resultado;
    } catch (error: unknown) {
      console.log(error);
      if (error instanceof objetoDeComunicacao) resultado = error;
      else
        resultado = new objetoDeComunicacao(HttpStatusCode.ServerErrorInternal);

      throw resultado;
    }
  }

  async atualizar(usuario: UsuarioCNPJ): Promise<objetoDeComunicacao> {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {
      const user = await UsuarioCNPJ.findByPk(usuario.usuario_id);

      if (!user)
        throw new objetoDeComunicacao(HttpStatusCode.ClientErrorNotFound);

      user.cnpj = usuario.cnpj ? usuario.cnpj : user.cnpj;

      await user.save();
      resultado.HttpConstruirRetorno(
        HttpStatusCode.SuccessOK,
        {},
        "UsuarioCNPJ final atualizado com sucesso."
      );

      return resultado;
    } catch (error: unknown) {
      console.log(error);
      if (error instanceof objetoDeComunicacao) resultado = error;
      else
        resultado = new objetoDeComunicacao(HttpStatusCode.ServerErrorInternal);

      throw resultado;
    }
  }

  async obterPorId(usuarioId: string): Promise<objetoDeComunicacao> {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {
      const user: UsuarioCNPJ | null = await UsuarioCNPJ.findByPk(usuarioId);
      if (!user)
        throw new objetoDeComunicacao(HttpStatusCode.ClientErrorNotFound);

      resultado.HttpConstruirRetorno(
        HttpStatusCode.SuccessOK,
        user.dataValues,
        "Usuario CNPJ encontrado por ID."
      );
      return resultado;
    } catch (error: unknown) {
      console.log(error);
      if (error instanceof objetoDeComunicacao) resultado = error;
      else
        resultado = new objetoDeComunicacao(HttpStatusCode.ServerErrorInternal);
      throw resultado;
    }
  }

  async excluir(usuarioId: string): Promise<objetoDeComunicacao> {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {
      const user = await UsuarioCNPJ.findByPk(usuarioId);
      if (!user) {
        throw new objetoDeComunicacao(HttpStatusCode.ClientErrorNotFound);
      }
      await user.destroy();
      return resultado;
    } catch (error: unknown) {
      console.log(error);
      if (error instanceof objetoDeComunicacao) resultado = error;
      else
        resultado = new objetoDeComunicacao(HttpStatusCode.ServerErrorInternal);
      throw resultado;
    }
  }

  /*
  async obterPorLogin(usuarioEmail: string): Promise<UsuarioMEI | null> {
    try {
      const user = await UsuarioMEI.findOne({ where: { email: usuarioEmail } });
      return user;
    } catch (error) {
      throw new Error("Falha ao obter o usuário!");
    }
  }

  async listarTodos(): Promise<UsuarioMEI[]> {
    try {
      return await UsuarioMEI.findAll();
    } catch (error) {
      throw new Error("Falha ao listar os usuários!");
    }
  }
}
*/
}
