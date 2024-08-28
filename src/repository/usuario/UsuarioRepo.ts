import { Sequelize, UniqueConstraintError } from "sequelize";
import { Usuario } from "../../models/Usuario";
import HttpStatusCode from "../../utils/HttpStatusCodes";
import { objetoDeComunicacao } from "../../utils/ObjetoDeComunicacao";

interface IUsuarioRepo {
  adicionar(usuario: Usuario): Promise<objetoDeComunicacao>;
  atualizar(usuario: Usuario): Promise<objetoDeComunicacao>;
  excluir(usuarioId: string): Promise<objetoDeComunicacao>;
  obterPorId(usuarioId: string): Promise<objetoDeComunicacao>;
  obterPorLogin(usuarioLogin: string): Promise<objetoDeComunicacao>;
  //listarTodos(): Promise<Usuario[]>;
}

export class UsuarioRepo implements IUsuarioRepo {
  async adicionar(usuario: Usuario): Promise<objetoDeComunicacao> {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {
      let retorno: Usuario = await Usuario.create({
        nome: usuario.nome,
        email: usuario.email,
        senha: usuario.senha,
        anexo: usuario.anexo,
        categoria_conta: usuario.categoria_conta,
        nivel_acesso: usuario.nivel_acesso,
      });
      resultado.HttpConstruirRetorno(
        HttpStatusCode.SuccessOK,
        retorno.dataValues
      );
      return resultado;
    } catch (error: unknown) {
      console.log(error);
      if (error instanceof objetoDeComunicacao) resultado = error;
      else if (error instanceof UniqueConstraintError)
        resultado = new objetoDeComunicacao(
          HttpStatusCode.ClientErrorNotAcceptable,
          {},
          "Usuario ja cadastrado"
        );
      else
        resultado = new objetoDeComunicacao(HttpStatusCode.ServerErrorInternal);
      throw resultado;
    }
  }

  async atualizar(usuario: Usuario): Promise<objetoDeComunicacao> {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {
      /*let user: Usuario | null = await Usuario.findOne({
        where: { usuario_id: a },
        include: UsuarioMEI,
      });*/

      let user: Usuario | null = await Usuario.findByPk(usuario.usuario_id);

      if (!user)
        throw new objetoDeComunicacao(HttpStatusCode.ClientErrorNotFound);

      user.nome = usuario.nome ? usuario.nome : user.nome;
      user.email = user.email;
      user.senha = usuario.senha ? usuario.senha : user.senha;
      user.anexo = usuario.anexo ? usuario.anexo : user.anexo;
      user.categoria_conta = usuario.categoria_conta
        ? usuario.categoria_conta
        : user.categoria_conta;
      user.nivel_acesso = user.nivel_acesso;
      user.usuario_id = usuario.usuario_id;

      await user.save();
      resultado.HttpConstruirRetorno(
        HttpStatusCode.SuccessOK,
        {},
        "Usuario de Usuario atualizado."
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
      const user = await Usuario.findByPk(usuarioId);
      if (!user) {
        throw new objetoDeComunicacao(HttpStatusCode.ClientErrorNotFound);
      }
      await user.destroy();
      resultado.HttpConstruirRetorno(
        HttpStatusCode.SuccessOK,
        {},
        "Usuario deletado com sucesso."
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
      const user = await Usuario.findByPk(usuarioId);

      if (!user)
        throw new objetoDeComunicacao(
          HttpStatusCode.ClientErrorNotFound,
          {},
          "Usuario não encontrado."
        );

      resultado.HttpConstruirRetorno(
        HttpStatusCode.SuccessOK,
        user.dataValues,
        "Usuario encontrado."
      );

      return resultado;
    } catch (error: unknown) {
      console.log(error);
      if (error instanceof objetoDeComunicacao) {
        resultado = error;
      } else
        resultado = new objetoDeComunicacao(HttpStatusCode.ServerErrorInternal);
      throw resultado;
    }
  }

  async obterPorLogin(usuarioEmail: string): Promise<objetoDeComunicacao> {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {
      const user = await Usuario.findOne({ where: { email: usuarioEmail } });

      if (!user) {
        resultado.HttpConstruirRetorno(
          HttpStatusCode.ClientErrorNotFound,
          {},
          "Email não encontrado."
        );
        throw resultado;
      } else
        resultado.HttpConstruirRetorno(
          HttpStatusCode.SuccessOK,
          user.dataValues,
          "Usuario encontrado"
        );
      return resultado;
    } catch (error: unknown) {
      console.log(error);
      if (error instanceof objetoDeComunicacao) {
        resultado = error;
      } else
        resultado = new objetoDeComunicacao(HttpStatusCode.ServerErrorInternal);
      throw resultado;
    }
  }
}
