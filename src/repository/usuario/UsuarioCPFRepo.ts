import { UsuarioCPF } from "../../models/UsuarioCPF";
import HttpStatusCode from "../../utils/HttpStatusCodes";
import { objetoDeComunicacao } from "../../utils/ObjetoDeComunicacao";

interface IUsuarioRepo {
  adicionar(usuario: UsuarioCPF): Promise<objetoDeComunicacao>;
  atualizar(usuario: UsuarioCPF): Promise<objetoDeComunicacao>;
  excluir(usuarioId: string): Promise<objetoDeComunicacao>;
  obterPorId(usuarioId: string): Promise<objetoDeComunicacao>;
  // obterPorLogin(usuarioLogin: string): Promise<UsuarioMEI | null>;
  // listarTodos(): Promise<UsuarioMEI[]>;
}

export class UsuarioCPFRepo implements IUsuarioRepo {
  async adicionar(usuario: UsuarioCPF): Promise<objetoDeComunicacao> {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {
      await UsuarioCPF.create({
        usuario_id: usuario.usuario_id,
        cpf: usuario.cpf,
      });
      resultado.HttpConstruirRetorno(
        HttpStatusCode.SuccessOK,
        {},
        "Usuario CPF cadastrado com sucesso"
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

  async atualizar(usuario: UsuarioCPF): Promise<objetoDeComunicacao> {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {
      const user = await UsuarioCPF.findByPk(usuario.usuario_id);

      if (!user)
        throw new objetoDeComunicacao(HttpStatusCode.ClientErrorNotFound);

      user.cpf = usuario.cpf ? usuario.cpf : user.cpf;

      await user.save();
      resultado.HttpConstruirRetorno(
        HttpStatusCode.SuccessOK,
        {},
        "UsuarioCPF final atualizado com sucesso."
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
      const user: UsuarioCPF | null = await UsuarioCPF.findByPk(usuarioId);
      if (!user)
        throw new objetoDeComunicacao(HttpStatusCode.ClientErrorNotFound);

      resultado.HttpConstruirRetorno(
        HttpStatusCode.SuccessOK,
        user.dataValues,
        "Usuario CPF encontrado por ID."
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
      const user = await UsuarioCPF.findByPk(usuarioId);
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
